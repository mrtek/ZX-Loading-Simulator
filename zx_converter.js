/**
 * ZX Spectrum Image Converter & Scanline Engine
 * 
 * Supports arbitrary image resolutions and aspect ratios (e.g. 1024x546, 16:9, 4:3, etc.)
 * - Zero blur: 100% pixel-perfect nearest-neighbor rendering
 * - Safe on all protocols (http, https, and file:///) with zero SecurityError crashes
 * - Generates exact 3-thirds interleaved ZX Spectrum scanline order for any height H
 */

const ZX_PALETTE = [
    // Standard intensity (BRIGHT 0)
    { r: 0,   g: 0,   b: 0,   name: "Black",   hex: "#000000", code: 0 },
    { r: 0,   g: 0,   b: 205, name: "Blue",    hex: "#0000cd", code: 1 },
    { r: 205, g: 0,   b: 0,   name: "Red",     hex: "#cd0000", code: 2 },
    { r: 205, g: 0,   b: 205, name: "Magenta", hex: "#cd00cd", code: 3 },
    { r: 0,   g: 205, b: 0,   name: "Green",   hex: "#00cd00", code: 4 },
    { r: 0,   g: 205, b: 205, name: "Cyan",    hex: "#00cdcd", code: 5 },
    { r: 205, g: 205, b: 0,   name: "Yellow",  hex: "#cdcd00", code: 6 },
    { r: 205, g: 205, b: 205, name: "White",   hex: "#cdcdcd", code: 7 },
    
    // High intensity (BRIGHT 1)
    { r: 0,   g: 0,   b: 0,   name: "Bright Black",   hex: "#000000", code: 8 },
    { r: 0,   g: 0,   b: 255, name: "Bright Blue",    hex: "#0000ff", code: 9 },
    { r: 255, g: 0,   b: 0,   name: "Bright Red",     hex: "#ff0000", code: 10 },
    { r: 255, g: 0,   b: 255, name: "Bright Magenta", hex: "#ff00ff", code: 11 },
    { r: 0,   g: 255, b: 0,   name: "Bright Green",   hex: "#00ff00", code: 12 },
    { r: 0,   g: 255, b: 255, name: "Bright Cyan",    hex: "#00ffff", code: 13 },
    { r: 255, g: 255, b: 0,   name: "Bright Yellow",  hex: "#ffff00", code: 14 },
    { r: 255, g: 255, b: 255, name: "Bright White",   hex: "#ffffff", code: 15 }
];

/**
 * Computes exact ZX Spectrum 3-thirds interleaved scanline order for any height H.
 */
function generateZXScanlineOrder(H) {
    const order = [];
    const thirdH = Math.floor(H / 3);

    for (let third = 0; third < 3; third++) {
        const startY = third * thirdH;
        const endY = (third === 2) ? H : (third + 1) * thirdH;
        const count = endY - startY;
        const numBlocks = Math.ceil(count / 8);

        for (let row = 0; row < 8; row++) {
            for (let block = 0; block < numBlocks; block++) {
                const y = startY + block * 8 + row;
                if (y < endY) {
                    order.push(y);
                }
            }
        }
    }
    return order;
}

class ZXImageConverter {
    constructor() {}

    /**
     * Processes an image preserving its exact resolution and aspect ratio with 100% sharpness
     * Safe on all protocols (handles file:/// without throwing SecurityError)
     */
    processImage(sourceImg, options = {}) {
        const srcW = sourceImg.naturalWidth || sourceImg.videoWidth || sourceImg.width || 256;
        const srcH = sourceImg.naturalHeight || sourceImg.videoHeight || sourceImg.height || 192;

        const width = Math.max(1, Math.round(srcW));
        const height = Math.max(1, Math.round(srcH));
        const aspectRatio = width / height;

        // 1. Full-color canvas
        const fullColorCanvas = document.createElement('canvas');
        fullColorCanvas.width = width;
        fullColorCanvas.height = height;
        const fcCtx = fullColorCanvas.getContext('2d', { willReadFrequently: true });
        fcCtx.imageSmoothingEnabled = false;
        fcCtx.drawImage(sourceImg, 0, 0, width, height);

        // 2. Monochrome canvas for the initial luminance loading phase
        const monoCanvas = document.createElement('canvas');
        monoCanvas.width = width;
        monoCanvas.height = height;
        const mCtx = monoCanvas.getContext('2d', { willReadFrequently: true });
        mCtx.imageSmoothingEnabled = false;

        let hasPixels = false;
        try {
            const fullColorImageData = fcCtx.getImageData(0, 0, width, height);
            const originalPixels = fullColorImageData.data;

            const monoImageData = mCtx.createImageData(width, height);
            const monoData = monoImageData.data;

            let totalLum = 0;
            const numPixels = width * height;
            for (let i = 0; i < originalPixels.length; i += 4) {
                totalLum += 0.299 * originalPixels[i] + 0.587 * originalPixels[i + 1] + 0.114 * originalPixels[i + 2];
            }
            const avgLum = Math.max(40, Math.min(200, totalLum / numPixels));

            for (let i = 0; i < originalPixels.length; i += 4) {
                const lum = 0.299 * originalPixels[i] + 0.587 * originalPixels[i + 1] + 0.114 * originalPixels[i + 2];
                const val = (lum < avgLum) ? 0 : 255;
                monoData[i] = val;
                monoData[i + 1] = val;
                monoData[i + 2] = val;
                monoData[i + 3] = 255;
            }
            mCtx.putImageData(monoImageData, 0, 0);
            hasPixels = true;
        } catch (secErr) {
            // Tainted canvas fallback on file:/// protocol: draw using CSS filter
            console.warn('Canvas pixel read restricted (file:/// protocol), using visual filter fallback:', secErr);
            try {
                mCtx.filter = 'grayscale(100%) contrast(150%)';
                mCtx.drawImage(sourceImg, 0, 0, width, height);
                mCtx.filter = 'none';
            } catch (e) {
                mCtx.drawImage(sourceImg, 0, 0, width, height);
            }
        }

        // 3. Authentic 16-color canvas (ZX Spectrum palette mapping)
        const authenticColorCanvas = document.createElement('canvas');
        authenticColorCanvas.width = width;
        authenticColorCanvas.height = height;
        const acCtx = authenticColorCanvas.getContext('2d', { willReadFrequently: true });
        acCtx.imageSmoothingEnabled = false;

        if (hasPixels) {
            try {
                const fullColorImageData = fcCtx.getImageData(0, 0, width, height);
                const originalPixels = fullColorImageData.data;
                const authImageData = acCtx.createImageData(width, height);
                const authData = authImageData.data;

                for (let i = 0; i < originalPixels.length; i += 4) {
                    const r = originalPixels[i];
                    const g = originalPixels[i + 1];
                    const b = originalPixels[i + 2];
                    const a = originalPixels[i + 3];

                    if (a < 128) {
                        authData[i] = 255; authData[i+1] = 255; authData[i+2] = 255; authData[i+3] = 255;
                        continue;
                    }

                    // Find closest ZX Spectrum palette color
                    let minDist = Infinity;
                    let bestColor = ZX_PALETTE[0];
                    for (let c = 0; c < ZX_PALETTE.length; c++) {
                        const pal = ZX_PALETTE[c];
                        const dr = r - pal.r;
                        const dg = g - pal.g;
                        const db = b - pal.b;
                        const dist = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
                        if (dist < minDist) {
                            minDist = dist;
                            bestColor = pal;
                        }
                    }

                    authData[i] = bestColor.r;
                    authData[i + 1] = bestColor.g;
                    authData[i + 2] = bestColor.b;
                    authData[i + 3] = 255;
                }
                acCtx.putImageData(authImageData, 0, 0);
            } catch (e) {
                acCtx.drawImage(fullColorCanvas, 0, 0);
            }
        } else {
            acCtx.drawImage(fullColorCanvas, 0, 0);
        }

        const scanlineOrder = generateZXScanlineOrder(height);

        return {
            width,
            height,
            aspectRatio,
            fullColorCanvas,
            authenticColorCanvas,
            monoCanvas,
            scanlineOrder
        };
    }
}

if (typeof window !== 'undefined') {
    window.ZXImageConverter = ZXImageConverter;
    window.ZX_PALETTE = ZX_PALETTE;
    window.generateZXScanlineOrder = generateZXScanlineOrder;
}
