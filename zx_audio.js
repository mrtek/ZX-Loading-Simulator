/**
 * ZX Spectrum Tape Loading Audio Synthesizer
 * 
 * Generates authentic Sinclair ZX Spectrum 48k cassette audio:
 * - Pilot Tone: ~806.3 Hz square wave (half-period = 2168 T-states @ 3.5MHz)
 * - Sync Pulses: ~2624 Hz & ~2381 Hz short pulses
 * - Data Screech: 0-bits (855 T-states = ~2047 Hz) and 1-bits (1710 T-states = ~1023 Hz)
 * - Beep Tone: ~930 Hz Sinclair completion beep
 * - Supports both real-time playback and offline AudioBuffer generation for video export!
 */

class ZXAudioEngine {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.destinationNode = null;
        this.mediaStreamDestination = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.5;

        // Current real-time nodes
        this.activeSource = null;

        // Audio buffer cache to avoid expensive regeneration on every Play press
        this._cachedBuffer = null;
        this._cacheKey = '';
    }

    init() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

            // Create media stream destination so MediaRecorder can tap into the exact audio!
            this.mediaStreamDestination = this.audioCtx.createMediaStreamDestination();

            // Connect masterGain to both speakers and media stream destination
            this.masterGain.connect(this.audioCtx.destination);
            this.masterGain.connect(this.mediaStreamDestination);
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.02);
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.audioCtx.currentTime, 0.02);
        }
    }

    getMediaStreamTrack() {
        this.init();
        return this.mediaStreamDestination.stream.getAudioTracks()[0];
    }

    /**
     * Invalidate the cached audio buffer (call when timeline parameters change)
     */
    invalidateCache() {
        this._cachedBuffer = null;
        this._cacheKey = '';
    }

    /**
     * Synthesizes audio buffer for a given timeline
     * Optimized O(N) single-pass generation
     * @param {number} totalDuration - total seconds
     * @param {Object} timeline - phase timing breakdown
     * @param {number} sampleRate - e.g. 44100
     */
    generateAudioBuffer(totalDuration, timeline, sampleRate = 44100) {
        const totalSamples = Math.ceil(totalDuration * sampleRate);
        const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
        const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        let lfsr = 0xACE1;
        const nextBit = () => {
            lfsr = ((lfsr >> 1) ^ (-(lfsr & 1) & 0xB400)) & 0xFFFF;
            return lfsr & 1;
        };

        const phases = timeline.phases;

        for (let pIdx = 0; pIdx < phases.length; pIdx++) {
            const phase = phases[pIdx];
            const startSample = Math.max(0, Math.floor(phase.start * sampleRate));
            const endSample = Math.min(totalSamples, Math.floor(phase.end * sampleRate));
            if (startSample >= endSample) continue;

            let currentVal = 0.5;
            let samplesUntilFlip = 0;

            if (phase.type === 'pilot') {
                const halfPeriod = Math.round(sampleRate / (806.3 * 2));
                for (let i = startSample; i < endSample; i++) {
                    if (samplesUntilFlip <= 0) {
                        currentVal = currentVal > 0 ? -0.5 : 0.5;
                        samplesUntilFlip = halfPeriod;
                    }
                    samplesUntilFlip--;
                    channelData[i] = currentVal;
                }
            } else if (phase.type === 'sync') {
                const halfPeriod = Math.round(sampleRate / (2400 * 2));
                for (let i = startSample; i < endSample; i++) {
                    if (samplesUntilFlip <= 0) {
                        currentVal = currentVal > 0 ? -0.5 : 0.5;
                        samplesUntilFlip = halfPeriod;
                    }
                    samplesUntilFlip--;
                    channelData[i] = currentVal;
                }
            } else if (phase.type === 'data') {
                for (let i = startSample; i < endSample; i++) {
                    if (samplesUntilFlip <= 0) {
                        currentVal = currentVal > 0 ? -0.55 : 0.55;
                        const bit = nextBit();
                        const freq = bit === 0 ? 2047 : 1023;
                        samplesUntilFlip = Math.round(sampleRate / (freq * 2));
                    }
                    samplesUntilFlip--;
                    const hiss = (Math.random() - 0.5) * 0.05;
                    channelData[i] = currentVal + hiss;
                }
            } else if (phase.type === 'beep') {
                const halfPeriod = Math.round(sampleRate / (930 * 2));
                for (let i = startSample; i < endSample; i++) {
                    if (samplesUntilFlip <= 0) {
                        currentVal = currentVal > 0 ? -0.4 : 0.4;
                        samplesUntilFlip = halfPeriod;
                    }
                    samplesUntilFlip--;
                    channelData[i] = currentVal;
                }
            } else {
                for (let i = startSample; i < endSample; i++) {
                    channelData[i] = (Math.random() - 0.5) * 0.005;
                }
            }
        }

        // Apply a gentle lowpass smoothing to prevent ear-piercing digital harshness
        for (let i = 1; i < totalSamples; i++) {
            channelData[i] = channelData[i - 1] * 0.25 + channelData[i] * 0.75;
        }

        return buffer;
    }

    /**
     * Start playing synthesized audio for the given timeline from startTime.
     * Uses cached buffer when timeline parameters haven't changed.
     */
    playTimeline(totalDuration, timeline, startTime = 0) {
        this.init();
        this.stop();

        // Build a cache key from timeline parameters that affect audio generation
        const cacheKey = `${totalDuration}_${timeline.skipIntro}_${timeline.phases.length}_${this.audioCtx.sampleRate}`;
        if (this._cacheKey !== cacheKey || !this._cachedBuffer) {
            this._cachedBuffer = this.generateAudioBuffer(totalDuration, timeline, this.audioCtx.sampleRate);
            this._cacheKey = cacheKey;
        }

        const source = this.audioCtx.createBufferSource();
        source.buffer = this._cachedBuffer;
        source.connect(this.masterGain);

        const offset = Math.max(0, Math.min(totalDuration, startTime));
        source.start(0, offset);

        this.activeSource = source;
        this.isPlaying = true;

        source.onended = () => {
            if (this.activeSource === source) {
                this.isPlaying = false;
                this.activeSource = null;
            }
        };
    }

    stop() {
        if (this.activeSource) {
            try {
                this.activeSource.stop();
                this.activeSource.disconnect();
            } catch (e) {}
            this.activeSource = null;
        }
        this.isPlaying = false;
    }
}

// Export for module or global browser script
if (typeof window !== 'undefined') {
    window.ZXAudioEngine = ZXAudioEngine;
}
