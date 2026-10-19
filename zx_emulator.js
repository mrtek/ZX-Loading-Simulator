/**
 * ZX Spectrum Loading Simulation Engine
 * 
 * Supports arbitrary image resolutions and aspect ratios (e.g. 1024x546, 16:9, etc.)
 * - Zero blur: 100% pixel-perfect nearest-neighbor rendering
 * - Zero scanline noise / CRT filters: pure, clean, vibrant, solid colors
 * - Large, crisp, highly legible Sinclair text rendering
 * - Dynamic aspect ratio matching the loaded image
 * - Authentic 3-thirds interleaved scanlines loading
 */

class ZXLoadingTimeline {
    constructor(duration = 15, options = {}) {
        this.duration = Math.max(1, duration);
        this.skipIntro = !!options.skipIntro;
        this.programTitle = (options.programTitle || "SCREEN").toUpperCase().slice(0, 10);
        this.buildPhases();
    }

    setDuration(d) {
        this.duration = Math.max(1, d);
        this.buildPhases();
    }

    setSkipIntro(skip) {
        this.skipIntro = !!skip;
        this.buildPhases();
    }

    setProgramTitle(title) {
        this.programTitle = (title || "SCREEN").toUpperCase().slice(0, 10);
    }

    buildPhases() {
        const d = this.duration;

        // ROM constants:
        // Header data (19 bytes) takes exactly 0.18s at standard ROM baud rate.
        // Sync pulses (667 T + 735 T) take ~0.0004s (0.4ms).
        const tHdrData = 0.18;
        const tSync = 0.005;
        const tBeep = 0.35;

        let tBoot, tTyping, tHdrPilot, tPause, tDatPilot, tScreen;

        if (d >= 40) {
            // Authentic cassette tape mode (~42 - 50 seconds, exactly matching real ZX Spectrum 48K ROM tape load)
            tBoot = !this.skipIntro ? 1.2 : 0;
            tTyping = !this.skipIntro ? 1.8 : 0;
            tHdrPilot = 5.0; // 8063 pulses @ 807 Hz = 4.995s
            tPause = 1.0;
            tDatPilot = 2.0; // 3223 pulses @ 807 Hz = 1.996s
            const tPre = tBoot + tTyping + tHdrPilot + tSync + tHdrData + tPause + tDatPilot + tSync + tBeep;
            tScreen = Math.max(1.0, d - tPre);
        } else {
            // Adaptive mode for faster previews (e.g. 15s) while keeping authentic header chirp and proportions
            tBoot = !this.skipIntro ? Math.max(0.3, Math.min(1.2, d * 0.05)) : 0;
            tTyping = !this.skipIntro ? Math.max(0.5, Math.min(1.8, d * 0.09)) : 0;
            const tFixed = tBoot + tTyping + tHdrData + tSync * 2 + tBeep;
            const tRem = Math.max(2.0, d - tFixed);

            tHdrPilot = Math.max(0.8, Math.min(5.0, tRem * 0.15));
            tPause = Math.max(0.4, Math.min(1.0, tRem * 0.06));
            tDatPilot = Math.max(0.8, Math.min(2.0, tRem * 0.12));
            tScreen = Math.max(1.0, tRem - (tHdrPilot + tPause + tDatPilot));
        }

        // Screen payload: 6144 bytes bitmap (88.9%), 768 bytes attributes (11.1%)
        const tBitmap = tScreen * (6144 / 6912);
        const tAttr = tScreen * (768 / 6912);

        let t = 0;
        const p = [];

        if (tBoot > 0) {
            p.push({ id: 'boot', start: t, end: t + tBoot, type: 'boot', border: 'solid' });
            t += tBoot;
        }
        if (tTyping > 0) {
            p.push({ id: 'typing', start: t, end: t + tTyping, type: 'typing', border: 'solid' });
            t += tTyping;
        }

        p.push({ id: 'hdr_pilot', start: t, end: t + tHdrPilot, type: 'pilot', border: 'pilot' });
        t += tHdrPilot;

        p.push({ id: 'hdr_sync', start: t, end: t + tSync, type: 'sync', border: 'pilot' });
        t += tSync;

        p.push({ id: 'hdr_data', start: t, end: t + tHdrData, type: 'data', border: 'data' });
        t += tHdrData;

        p.push({ id: 'pause', start: t, end: t + tPause, type: 'pause', border: 'solid' });
        t += tPause;

        p.push({ id: 'dat_pilot', start: t, end: t + tDatPilot, type: 'pilot', border: 'pilot' });
        t += tDatPilot;

        p.push({ id: 'dat_sync', start: t, end: t + tSync, type: 'sync', border: 'pilot' });
        t += tSync;

        p.push({ id: 'bitmap', start: t, end: t + tBitmap, type: 'data', border: 'data' });
        t += tBitmap;

        p.push({ id: 'attr', start: t, end: t + tAttr, type: 'data', border: 'data' });
        t += tAttr;

        p.push({ id: 'complete', start: t, end: Math.max(t + tBeep, d), type: 'beep', border: 'solid' });

        this.phases = p;
    }

    getPhaseAt(time) {
        const t = Math.max(0, Math.min(this.duration, time));
        for (let i = 0; i < this.phases.length; i++) {
            const p = this.phases[i];
            if (t >= p.start && (t < p.end || i === this.phases.length - 1)) {
                const phaseDuration = p.end - p.start;
                const progressInPhase = phaseDuration > 0 ? (t - p.start) / phaseDuration : 1;
                return {
                    ...p,
                    progressInPhase: Math.min(1, Math.max(0, progressInPhase)),
                    currentTime: t,
                    totalDuration: this.duration
                };
            }
        }
        return { ...this.phases[this.phases.length - 1], progressInPhase: 1, currentTime: t, totalDuration: this.duration };
    }
}

class ZXLoadingSimulation {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.ctx.imageSmoothingEnabled = false;

        this.timeline = new ZXLoadingTimeline(options.duration || 15, options);
        this.renderMode = options.renderMode || 'truecolor'; // 'truecolor' or 'authentic'
        this.borderStyle = options.borderStyle || 'standard'; // 'standard', 'thin', 'none'
        this.borderBaseColor = '#ffffff'; // Crisp Sinclair white/light border

        this.processedData = null; // Output from ZXImageConverter
        this.currentTime = 0;

        // Visual stripes state
        this.pilotColors = ['#00cdcd', '#cd0000']; // Cyan & Red
        this.dataColors = ['#0000cd', '#cdcd00'];  // Blue & Yellow
        this.stripeOffset = 0;

        // Offscreen canvas for assembling progressive loading frame
        this.frameCanvas = document.createElement('canvas');
        this.frameCtx = this.frameCanvas.getContext('2d', { willReadFrequently: true });
        this.frameCtx.imageSmoothingEnabled = false;
    }

    setImageData(processedData) {
        this.processedData = processedData;
        if (processedData) {
            this.frameCanvas.width = processedData.width;
            this.frameCanvas.height = processedData.height;
            this.frameCtx.imageSmoothingEnabled = false;
        }
    }

    setBorderStyle(style) {
        this.borderStyle = style || 'standard';
    }

    setTime(time) {
        this.currentTime = Math.max(0, Math.min(this.timeline.duration, time));
    }

    /**
     * Calculates the screen display rectangle based on image aspect ratio and border style
     */
    getGeometry(cw, ch) {
        const imgAspect = this.processedData ? this.processedData.aspectRatio : (4 / 3);

        if (this.borderStyle === 'none') {
            return {
                screenX: 0,
                screenY: 0,
                screenW: cw,
                screenH: ch,
                borderSize: 0
            };
        }

        // Border ratio: standard ~ 12% border, thin ~ 5% border
        const marginFactor = this.borderStyle === 'thin' ? 0.94 : 0.82;
        let screenW = Math.round(cw * marginFactor);
        let screenH = Math.round(screenW / imgAspect);

        if (screenH > ch * marginFactor) {
            screenH = Math.round(ch * marginFactor);
            screenW = Math.round(screenH * imgAspect);
        }

        const screenX = Math.round((cw - screenW) / 2);
        const screenY = Math.round((ch - screenH) / 2);

        return { screenX, screenY, screenW, screenH, borderSize: (cw - screenW) / 2 };
    }

    /**
     * Renders a complete simulation frame at the given timestamp
     */
    renderAtTime(timestamp) {
        this.setTime(timestamp);
        const phase = this.timeline.getPhaseAt(this.currentTime);

        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const ctx = this.ctx;
        ctx.imageSmoothingEnabled = false;

        const geom = this.getGeometry(cw, ch);

        // 1. Draw Border (Stripes or pure solid background)
        this.renderBorder(ctx, cw, ch, phase, geom);

        // 2. Draw Screen Area (Clean white background + text / image scanlines)
        this.renderScreenArea(ctx, geom, phase);
    }

    /**
     * Render the animated border stripes
     */
    renderBorder(ctx, cw, ch, phase, geom) {
        if (geom.borderSize <= 0 && (phase.id === 'bitmap' || phase.id === 'attr' || phase.id === 'complete')) {
            // If no border is selected and we are displaying image, image fills everything
            return;
        }

        if (phase.border === 'pilot') {
            // Pilot tone: Clean alternating horizontal Cyan & Red bands moving down
            const bandHeight = Math.max(16, Math.round(ch / 20));
            this.stripeOffset = (this.stripeOffset + 4) % (bandHeight * 2);

            for (let y = -bandHeight * 2; y < ch + bandHeight * 2; y += bandHeight) {
                const colorIdx = Math.floor((y - this.stripeOffset) / bandHeight) % 2;
                ctx.fillStyle = this.pilotColors[Math.abs(colorIdx)];
                ctx.fillRect(0, y, cw, bandHeight);
            }
        } else if (phase.border === 'data') {
            // Data signal: Jittery, thin, rapid Yellow & Blue stripes
            const bandHeight = Math.max(4, Math.round(ch / 80));
            const seed = Math.floor(this.currentTime * 60) * 17;
            let curY = 0;
            let colIdx = 0;

            while (curY < ch) {
                const thickness = bandHeight * (1 + ((seed + curY * 7) % 3));
                ctx.fillStyle = this.dataColors[colIdx % 2];
                ctx.fillRect(0, curY, cw, thickness);
                curY += thickness;
                colIdx++;
            }
        } else {
            // Pure, clean solid border
            ctx.fillStyle = this.borderBaseColor;
            ctx.fillRect(0, 0, cw, ch);
        }
    }

    /**
     * Render active screen area (white paper with text or scanlines)
     */
    renderScreenArea(ctx, geom, phase) {
        const { screenX, screenY, screenW, screenH } = geom;

        if (phase.id === 'bitmap' || phase.id === 'attr' || phase.id === 'complete') {
            // Progressive image loading with 100% pixel sharpness!
            this.renderProgressiveImage(ctx, geom, phase);
            return;
        }

        // Initialize 256x192 offscreen buffer matching authentic Sinclair screen dimensions
        const width = 256;
        const height = 192;
        if (!this.frameCanvas || this.frameCanvas.width !== width || this.frameCanvas.height !== height) {
            this.frameCanvas = document.createElement('canvas');
            this.frameCanvas.width = width;
            this.frameCanvas.height = height;
            this.frameCtx = this.frameCanvas.getContext('2d');
            this.frameCtx.imageSmoothingEnabled = false;
        }
        const fCtx = this.frameCtx;

        // All non-image phases start with a clean, solid white paper background
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 0, width, height);
        fCtx.fillStyle = '#000000';
        fCtx.font = '20px "ZX Spectrum-7 Regular", monospace';
        fCtx.textBaseline = 'top';

        if (phase.id === 'boot') {
            // Sinclair Copyright screen at power-on / reset
            // Line 23 (bottom line, row 23: y = 184..191): © 1982 Sinclair Research Ltd
            fCtx.fillText('© 1982 Sinclair Research Ltd', 0, 176);
        } else if (phase.id === 'typing') {
            // As soon as a key is pressed, copyright notice DISAPPEARS!
            // Typing takes place on that exact same bottom line (row 23: y = 184..191)
            const progress = phase.progressInPhase;
            let typedText = 'LOAD ';
            let cursorCol = 5;

            if (progress >= 0.55) {
                typedText = 'LOAD ""';
                cursorCol = 7;
            } else if (progress >= 0.35) {
                typedText = 'LOAD "';
                cursorCol = 6;
            }

            fCtx.fillText(typedText, 0, 176);

            // Flashing inverted 8x8 character cell [L] immediately following the typed text
            const isCursorVisible = (progress < 0.92) ? (Math.floor(this.currentTime * 3.5) % 2 === 0) : true;
            if (isCursorVisible) {
                this.drawCrisp8x8Cursor(fCtx, cursorCol * 8, 184, 'L');
            }
        } else if (phase.id === 'hdr_pilot' || phase.id === 'hdr_sync') {
            // Header pilot and sync: pure clean white screen while tape pilot tone plays
            // (Screen paper is visible in the center, animated stripes only in the border)
        } else if (phase.id === 'hdr_data' || phase.id === 'pause' || phase.id === 'dat_pilot' || phase.id === 'dat_sync') {
            // Header loaded: Program: <TITLE> remains displayed on screen during pause and data pilot
            fCtx.fillText(`Program: ${this.timeline.programTitle}`, 16, 0);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.frameCanvas, 0, 0, width, height, screenX, screenY, screenW, screenH);
    }

    /**
     * Renders progressive scanlines from the native image
     */
    renderProgressiveImage(ctx, geom, phase) {
        const { screenX, screenY, screenW, screenH } = geom;

        if (!this.processedData) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(screenX, screenY, screenW, screenH);
            ctx.fillStyle = '#000000';
            ctx.font = '22px "ZX Spectrum-7 Regular", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LOADING IMAGE...', screenX + screenW / 2, screenY + screenH / 2);
            ctx.textAlign = 'start';
            return;
        }

        const { width, height, fullColorCanvas, authenticColorCanvas, monoCanvas, scanlineOrder } = this.processedData;

        if (this.frameCanvas.width !== width || this.frameCanvas.height !== height) {
            this.frameCanvas.width = width;
            this.frameCanvas.height = height;
        }

        const fCtx = this.frameCtx;
        fCtx.imageSmoothingEnabled = false;

        // Clear frame to solid white paper (initial state of screen memory in Spectrum)
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 0, width, height);

        if (phase.id === 'bitmap') {
            // In real ZX Spectrum, Program: <TITLE> was printed in screen memory (row 1) and gets overwritten as scanlines load!
            fCtx.fillStyle = '#000000';
            fCtx.font = '20px "ZX Spectrum-7 Regular", monospace';
            fCtx.textBaseline = 'top';
            fCtx.fillText(`Program: ${this.timeline.programTitle}`, 16, 0);
        }

        const colorCanvas = (this.renderMode === 'authentic' && authenticColorCanvas)
            ? authenticColorCanvas
            : fullColorCanvas;

        const totalScanlines = height;

        if (phase.id === 'bitmap') {
            // CANONICAL ZX SPECTRUM BITMAP PHASE:
            // The image ALWAYS loads strictly MONOCHROME (black & white on white paper) scanline by scanline!
            const scanlinesToLoad = Math.min(totalScanlines, Math.floor(phase.progressInPhase * totalScanlines));
            for (let i = 0; i < scanlinesToLoad; i++) {
                const y = scanlineOrder[i];
                fCtx.drawImage(monoCanvas, 0, y, width, 1, 0, y, width, 1);
            }
        } else if (phase.id === 'attr') {
            // CANONICAL ZX SPECTRUM ATTRIBUTE PHASE:
            // 1. All scanlines are loaded -> base is 100% monochrome
            fCtx.drawImage(monoCanvas, 0, 0);

            // 2. Color attributes pour in row by row (in 8-pixel character block rows) from top to bottom
            const blockHeight = 8;
            const totalBlockRows = Math.ceil(height / blockHeight);
            const currentBlockRows = Math.min(totalBlockRows, Math.floor(phase.progressInPhase * (totalBlockRows + 1)));
            const coloredH = Math.min(height, currentBlockRows * blockHeight);

            if (coloredH > 0) {
                fCtx.drawImage(colorCanvas, 0, 0, width, coloredH, 0, 0, width, coloredH);
            }
        } else if (phase.id === 'complete') {
            // Full color display
            fCtx.drawImage(colorCanvas, 0, 0);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.frameCanvas, 0, 0, width, height, screenX, screenY, screenW, screenH);
    }

    /**
     * Draw authentic ZX Spectrum inverted 8x8 character cell cursor ([L] or [K])
     */
    drawCrisp8x8Cursor(fCtx, x, y, letter = 'L') {
        // 1. Draw solid black 8x8 character box
        fCtx.fillStyle = '#000000';
        fCtx.fillRect(x, y, 8, 8);

        // 2. Draw white character glyph using authentic ZX Spectrum ROM 8x8 bitmap
        fCtx.fillStyle = '#ffffff';
        const glyph = (letter === 'K') ? [
            0x00, 0x44, 0x48, 0x50, 0x60, 0x50, 0x48, 0x44
        ] : [
            0x00, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7E, 0x00
        ];

        for (let py = 0; py < 8; py++) {
            const row = glyph[py];
            for (let px = 0; px < 8; px++) {
                if ((row >> (7 - px)) & 1) {
                    fCtx.fillRect(x + px, y + py, 1, 1);
                }
            }
        }
    }

    drawCrispCursor(ctx, x, y, size, letter = 'K') {
        this.drawCrisp8x8Cursor(this.frameCtx || ctx, x, y, letter);
    }
}

if (typeof window !== 'undefined') {
    window.ZXLoadingTimeline = ZXLoadingTimeline;
    window.ZXLoadingSimulation = ZXLoadingSimulation;
}
