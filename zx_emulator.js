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

        if (!this.skipIntro) {
            // Standard loading sequence with Sinclair prompt and command typing
            this.phases = [
                { id: 'boot',       start: 0,        end: 0.05 * d, type: 'boot',   border: 'solid' },
                { id: 'typing',     start: 0.05 * d, end: 0.14 * d, type: 'typing', border: 'solid' },
                { id: 'hdr_pilot',  start: 0.14 * d, end: 0.25 * d, type: 'pilot',  border: 'pilot' },
                { id: 'hdr_sync',   start: 0.25 * d, end: 0.26 * d, type: 'sync',   border: 'pilot' },
                { id: 'hdr_data',   start: 0.26 * d, end: 0.34 * d, type: 'data',   border: 'data'  },
                { id: 'pause',      start: 0.34 * d, end: 0.38 * d, type: 'pause',  border: 'solid' },
                { id: 'dat_pilot',  start: 0.38 * d, end: 0.50 * d, type: 'pilot',  border: 'pilot' },
                { id: 'dat_sync',   start: 0.50 * d, end: 0.51 * d, type: 'sync',   border: 'pilot' },
                { id: 'bitmap',     start: 0.51 * d, end: 0.88 * d, type: 'data',   border: 'data'  },
                { id: 'attr',       start: 0.88 * d, end: 0.96 * d, type: 'data',   border: 'data'  },
                { id: 'complete',   start: 0.96 * d, end: 1.00 * d, type: 'beep',   border: 'solid' }
            ];
        } else {
            // Fast loading sequence skipping Sinclair prompt typing
            this.phases = [
                { id: 'hdr_pilot',  start: 0,        end: 0.14 * d, type: 'pilot',  border: 'pilot' },
                { id: 'hdr_sync',   start: 0.14 * d, end: 0.15 * d, type: 'sync',   border: 'pilot' },
                { id: 'hdr_data',   start: 0.15 * d, end: 0.25 * d, type: 'data',   border: 'data'  },
                { id: 'pause',      start: 0.25 * d, end: 0.29 * d, type: 'pause',  border: 'solid' },
                { id: 'dat_pilot',  start: 0.29 * d, end: 0.44 * d, type: 'pilot',  border: 'pilot' },
                { id: 'dat_sync',   start: 0.44 * d, end: 0.45 * d, type: 'sync',   border: 'pilot' },
                { id: 'bitmap',     start: 0.45 * d, end: 0.88 * d, type: 'data',   border: 'data'  },
                { id: 'attr',       start: 0.88 * d, end: 0.96 * d, type: 'data',   border: 'data'  },
                { id: 'complete',   start: 0.96 * d, end: 1.00 * d, type: 'beep',   border: 'solid' }
            ];
        }
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

        // Draw solid, pure white paper background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX, screenY, screenW, screenH);

        // High-resolution scalable font size: perfectly crisp, large and readable!
        const fontSize = Math.max(26, Math.round(screenH * 0.065));
        const fontStr = `${fontSize}px "ZX Spectrum-7 Regular", "Courier New", monospace`;

        if (phase.id === 'boot') {
            // Sinclair Copyright screen: Large, clear, bold, high contrast
            ctx.fillStyle = '#000000';
            ctx.font = fontStr;
            ctx.textBaseline = 'bottom';
            const textY1 = screenY + screenH - Math.round(fontSize * 2.6);
            const textY2 = screenY + screenH - Math.round(fontSize * 1.0);
            const textX = screenX + Math.round(screenW * 0.06);

            ctx.fillText('© 1982 Sinclair Research Ltd', textX, textY1);

            // Flashing [K] cursor on the command line below
            if (Math.floor(this.currentTime * 3) % 2 === 0) {
                this.drawCrispCursor(ctx, textX, textY2, fontSize, 'K');
            }
        } else if (phase.id === 'typing') {
            // Command typing simulation: LOAD ""
            ctx.fillStyle = '#000000';
            ctx.font = fontStr;
            ctx.textBaseline = 'bottom';
            const textY1 = screenY + screenH - Math.round(fontSize * 2.6);
            const textY2 = screenY + screenH - Math.round(fontSize * 1.0);
            const textX = screenX + Math.round(screenW * 0.06);

            ctx.fillText('© 1982 Sinclair Research Ltd', textX, textY1);

            const fullCommand = 'LOAD ""';
            const progress = phase.progressInPhase;
            const charsToShow = Math.min(fullCommand.length, Math.floor(progress * (fullCommand.length + 2)));
            const typedText = fullCommand.slice(0, charsToShow);

            ctx.fillText(typedText, textX, textY2);

            // Cursor [L] right after the typed text
            const cursorChar = charsToShow < 4 ? 'K' : 'L';
            const textWidth = ctx.measureText(typedText).width;
            if (charsToShow < fullCommand.length || Math.floor(this.currentTime * 4) % 2 === 0) {
                this.drawCrispCursor(ctx, textX + textWidth + 3, textY2, fontSize, cursorChar);
            }
        } else if (phase.id === 'hdr_data') {
            // Header: Program: <TITLE>
            ctx.fillStyle = '#000000';
            ctx.font = fontStr;
            ctx.textBaseline = 'top';
            const titleX = screenX + Math.round(screenW * 0.06);
            const titleY = screenY + Math.round(screenH * 0.08);
            ctx.fillText(`Program: ${this.timeline.programTitle}`, titleX, titleY);
        } else if (phase.id === 'bitmap' || phase.id === 'attr' || phase.id === 'complete') {
            // Progressive image loading with 100% pixel sharpness!
            this.renderProgressiveImage(ctx, geom, phase);
        }
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
     * Draw clean crisp flashing inverse cursor
     */
    drawCrispCursor(ctx, x, y, size, letter = 'K') {
        const boxW = Math.round(size * 0.75);
        const boxH = Math.round(size * 0.95);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y - boxH + 2, boxW, boxH);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(size * 0.82)}px "ZX Spectrum-7 Regular", "Courier New", monospace`;
        ctx.textBaseline = 'top';
        ctx.fillText(letter, x + Math.round(size * 0.08), y - boxH + 3);
    }
}

if (typeof window !== 'undefined') {
    window.ZXLoadingTimeline = ZXLoadingTimeline;
    window.ZXLoadingSimulation = ZXLoadingSimulation;
}
