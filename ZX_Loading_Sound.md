# ZX Spectrum Tape Loading Sound — Implementation Specification

**Target:** `ZX-Loading-Simulator` (`https://github.com/mrtek/ZX-Loading-Simulator`), file `zx_audio.js` (class `ZXAudioEngine`).
**Goal:** Make the simulated `LOAD ""` audio bit-exact with a real ZX Spectrum 48K loading a `SCREEN$`. The current implementation sounds wrong; this spec defines the correct signal.

---

## 1. Signal model

The tape signal is a **1-bit square wave** produced by toggling port `#FE` bit 4 (EAR output). There is no sine, no envelope, no filter — only two levels alternating.

- One **pulse** = one half-period at a fixed level.
- Two equal pulses = one full period.
- All durations are given in **Z80 T-states**. Reference clock: **3,500,000 Hz**.

Conversions:
```
seconds      = T_states / 3_500_000
frequency_Hz = 3_500_000 / (2 × T_states)     // full period = 2 × half-period
```

---

## 2. Timing constants

Exact values from the ZX Spectrum 48K ROM. Never round, never approximate.

| Name | T-states (half-period) | Frequency (Hz) | Meaning |
|---|---|---|---|
| `PILOT` | **2168** | ≈ 807.2 | Pilot tone pulse |
| `SYNC1` | **667** | ≈ 2623.7 | First sync pulse |
| `SYNC2` | **735** | ≈ 2380.9 | Second sync pulse |
| `BIT0` | **855** | ≈ 2046.8 | Half of bit `0` |
| `BIT1` | **1710** | ≈ 1023.4 | Half of bit `1` |

Pilot pulse counts:

| Block | Pilot pulses |
|---|---|
| Header | **8063** (~5.0 s) |
| Data | **3223** (~2.0 s) |

---

## 3. Full structure of a `LOAD ""`

The audio is a concatenation of **two blocks** separated by ~1 s of silence, followed by a short confirmation beep.

```
[HEADER BLOCK] [~1 s silence] [DATA BLOCK] [Sinclair beep]
```

Each block has the same internal structure:

```
[PILOT × N] [SYNC1] [SYNC2] [BYTE 1] [BYTE 2] … [BYTE M]
```

### 3.1 Header block

- Pilot: **8063** pulses of **2168 T**
- Sync: **667 T**, then **735 T**
- Data: **19 bytes**
  - `byte[0]`  = `0x00` (flag: header)
  - `byte[1]`  = type (`0x00` = program, `0x03` = bytes, etc.)
  - `byte[2..11]` = filename, 10 ASCII chars, space-padded
  - `byte[12..13]` = length, little-endian
  - `byte[14..15]` = param1, little-endian
  - `byte[16..17]` = param2, little-endian
  - `byte[18]` = XOR checksum of bytes 0..17

### 3.2 Data block

- Pilot: **3223** pulses of **2168 T**
- Sync: **667 T**, then **735 T**
- Data: `1 + N + 1` bytes
  - `byte[0]` = `0xFF` (flag: data)
  - `byte[1..N]` = payload (N = 6912 for `SCREEN$`)
  - `byte[N+1]` = XOR checksum of bytes 0..N

### 3.3 Sinclair beep (optional)

After the last data bit, the ROM emits a short square-wave beep: ~1 kHz, ~0.5 s, same toggling logic. Include it if the sim should signal "load complete".

**Total duration** for a `SCREEN$`: ~48 s (header pilot 5 s + header bits + 1 s gap + data pilot 2 s + data bits).

---

## 4. Bit encoding

Bytes are sent **MSB-first**. Each bit is **two equal-length pulses in a row** (one full square-wave period):

| Bit | Pulse 1 | Pulse 2 | Bit duration |
|---|---|---|---|
| `0` | 855 T | 855 T | 1710 T |
| `1` | 1710 T | 1710 T | 3420 T |

Rules:

- The **first pulse of each bit continues from the current signal level** — no gap, no reset.
- Polarity (which level is "high") does not matter; only the transition instants do.
- **No silence between bits.** The toggles simply continue.
- `SYNC1` and `SYNC2` are **single pulses** (one transition each), unlike data bits.

---

## 5. Implementation rules

**Must:**
- Output a **square wave** (`+1 / -1` samples, or `±amplitude`), never sine/triangle/saw.
- Use exact T-state values from §2 for every edge.
- Generate at **sample rate ≥ 48 kHz**. Shortest pulse is `SYNC1 = 667 T ≈ 190 µs`; at 44.1 kHz that's only ~8 samples — acceptable but tight. Prefer 48 kHz or 96 kHz, or generate offline at full precision and resample.
- Emit pilot as a **discrete pulse train** (8063 / 3223 pulses), not as an oscillator running for N seconds — the total phase length must be exact so animations can sync to audio time.
- Respect block order: header → silence → data → beep.

**Must not:**
- Use `OscillatorNode` with `type: 'sine'` or `'triangle'`.
- Use "2400 Hz" for the pilot (this is a common myth — see §7).
- Merge the two halves of a bit into one longer pulse (this doubles frequency and destroys the timbre).
- Add fades, envelopes, lowpass, or gain changes between phases — real loading audio is uniform and raw.
- Skip the sync pulses — they produce the audible "click" at each block start.
- Round the T-state constants.

---

## 6. Reference algorithm (pseudo-code)

```js
const CPU_HZ = 3_500_000;
const T = { PILOT: 2168, SYNC1: 667, SYNC2: 735, BIT0: 855, BIT1: 1710 };
const PILOT_COUNT_HEADER = 8063;
const PILOT_COUNT_DATA   = 3223;
const PAUSE_MS_BETWEEN_BLOCKS = 1000;

// Emit one pulse at current level, flip level.
function emitPulse(samples, sampleRate, tStates, state) {
  const n = Math.round((tStates / CPU_HZ) * sampleRate);
  for (let i = 0; i < n; i++) samples.push(state.level);
  state.level = -state.level;
}

// Emit one byte, MSB-first, as 8 pulse-pairs.
function emitByte(samples, sampleRate, byte, state) {
  for (let b = 7; b >= 0; b--) {
    const half = ((byte >> b) & 1) ? T.BIT1 : T.BIT0;
    emitPulse(samples, sampleRate, half, state);
    emitPulse(samples, sampleRate, half, state);
  }
}

// Emit one block: pilot + 2 sync + bytes.
function emitBlock(samples, sampleRate, pilotCount, bytes, state) {
  for (let i = 0; i < pilotCount; i++) emitPulse(samples, sampleRate, T.PILOT, state);
  emitPulse(samples, sampleRate, T.SYNC1, state);
  emitPulse(samples, sampleRate, T.SYNC2, state);
  for (const b of bytes) emitByte(samples, sampleRate, b, state);
}

function emitSilence(samples, sampleRate, ms) {
  const n = Math.round((ms / 1000) * sampleRate);
  for (let i = 0; i < n; i++) samples.push(0);
}

function generateLoadBuffer(audioCtx, sampleRate, headerBytes, dataBytes) {
  const samples = [];
  const state = { level: 1 };

  emitBlock(samples, sampleRate, PILOT_COUNT_HEADER, headerBytes, state);
  emitSilence(samples, sampleRate, PAUSE_MS_BETWEEN_BLOCKS);
  emitBlock(samples, sampleRate, PILOT_COUNT_DATA, dataBytes, state);

  const buf = audioCtx.createBuffer(1, samples.length, sampleRate);
  buf.copyToChannel(new Float32Array(samples), 0);
  return buf;
}
```

Building the bytes:

```js
function xorChecksum(bytes) {
  return bytes.reduce((a, b) => a ^ b, 0);
}

// SCREEN$ header
const name = 'SCREEN$   ';                    // 10 chars, space-padded
const header = [
  0x00,                                       // flag: header
  0x00,                                       // type: program
  ...Array.from(name, c => c.charCodeAt(0)),  // 10 bytes
  6912 & 0xFF, 6912 >> 8,                     // length
  0x1B, 0x00,                                 // param1 = 0x001B
  0x00, 0x00,                                 // param2
];
header.push(xorChecksum(header));             // 19 bytes total

// SCREEN$ data block: 0xFF flag + 6912 payload + checksum
const payload = new Uint8Array(6912);         // or real screen bytes
const data = [0xFF, ...payload];
data.push(xorChecksum(data));                 // 6914 bytes total
```

---

## 7. Debug checklist

If the sound is wrong, verify in this order:

- [ ] Waveform is square (`+1 / -1`), not an oscillator.
- [ ] Pilot half-period = `2168 T = 619.4 µs` → full period `1238.9 µs` → **~807 Hz**. Not 2400 Hz, not 1200 Hz.
- [ ] Pilot pulse count: `8063` (header) / `3223` (data).
- [ ] Two sync pulses present: **667 T then 735 T**, between pilot and data of each block.
- [ ] Bit encoding: `0` → `855 + 855 T`, `1` → `1710 + 1710 T`, MSB-first.
- [ ] No gap between consecutive bits.
- [ ] Block order: header → ~1 s silence → data.
- [ ] Checksum byte present at end of each block.
- [ ] Sample rate ≥ 48 kHz.
- [ ] No envelope / fade / lowpass — flat amplitude throughout.
- [ ] Total `SCREEN$` load ≈ 48 s. If it's ~10 s or ~90 s, a constant is wrong.

---

## 8. Known pitfalls

1. **"Pilot = 2400 Hz" is a myth.** 2400 Hz is close to the sync-pulse frequency (~2624 Hz / ~2381 Hz), not the pilot. The pilot is ~807 Hz. Using 2400 Hz makes the "beeeeeep" too thin.
2. **Single-pulse bits.** Encoding a bit as one `855 T` pulse instead of two halves the bit duration and doubles its frequency — the data phase sounds metallic. Always emit **two equal pulses** per bit.
3. **Pilot as continuous tone.** Audibly similar, but breaks sync with the border animation. Emit as an exact pulse count.
4. **Missing sync pulses.** The two short pulses (667 T, 735 T) are the audible "click" at the start of each block; without them the block boundary sounds washed out.
5. **Skipped checksum.** Each block ends with one extra XOR byte. Missing it shortens the block and, in a real Spectrum, aborts the load.
6. **Border animation sync.** The famous loading stripes are driven by the same tape signal. If audio and animation share one `emitPulse` clock, they stay in lockstep for free.

---

## 9. Deliverable

A corrected `zx_audio.js` (or equivalent module) that:
- Implements §6 exactly,
- Uses the constants from §2 with no rounding,
- Produces a raw square-wave `AudioBuffer`,
- Passes every item in §7.

Sources for cross-checking: ZX Spectrum 48K ROM `LD-BYTES` routine (constants `0x0566`, `0x029B`, `0x02DF`, `0x0357`, `0x06AE` as 16-bit LE); World of Spectrum tape-format documentation; `speccy-bootcamp`.