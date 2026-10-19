/**
 * ZX Spectrum GIF Exporter (100% Pure Client-Side & Offline)
 * 
 * Generates animated GIF of ZX Spectrum loading simulation directly in browser.
 * Works completely offline without any servers, Python, Node.js, or external tools.
 * Powered by bundled gifenc (fast pure JS LZW GIF encoder).
 */

class ZXGifExporter {
    constructor(simulation) {
        this.sim = simulation;
        this.isExporting = false;
        this.abortController = null;
    }

    /**
     * Main export method: records canvas frames to animated GIF
     */
    async exportGif(options = {}) {
        if (this.isExporting) return;
        this.isExporting = true;
        this.abortController = new AbortController();

        const duration = options.duration || this.sim.timeline.duration;
        const fps = options.fps || 15;
        const width = options.width || 512;
        const holdLastFrame = options.holdLastFrame !== undefined ? !!options.holdLastFrame : true;
        const holdLastFrameSec = options.holdLastFrameSec !== undefined ? Math.max(0, Number(options.holdLastFrameSec)) : 5;
        const askSaveLocation = !!options.askSaveLocation;
        const onProgress = options.onProgress || (() => {});
        const onComplete = options.onComplete || (() => {});
        const onError = options.onError || (() => {});

        const title = (this.sim.timeline.programTitle || 'ZX_IMAGE').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `zx_${title}_${duration}s.gif`;

        // 1. If "Ask where to save" is enabled and supported, prompt the user immediately
        let fileHandle = null;
        let pickerCancelled = false;
        if (askSaveLocation && window.showSaveFilePicker) {
            try {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'GIF Animation',
                        accept: {
                            'image/gif': ['.gif']
                        }
                    }]
                });
            } catch (pickerErr) {
                if (pickerErr.name === 'AbortError') {
                    pickerCancelled = true;
                    console.log('showSaveFilePicker was cancelled or restricted path (e.g. drive root D:\\) selected. Falling back to direct browser download.');
                } else {
                    console.warn('showSaveFilePicker failed, will fallback to download:', pickerErr);
                }
                fileHandle = null;
            }
        }

        const origWidth = this.sim.canvas.width;
        const origHeight = this.sim.canvas.height;

        try {
            if (!window.gifenc || !window.gifenc.GIFEncoder) {
                throw new Error('Модуль GIF-кодировщика (gifenc) не загружен');
            }

            onProgress({ percent: 0, status: 'Подготовка кадров GIF...' });

            const currentAR = origWidth / origHeight;
            const targetW = Math.max(64, Math.round(width / 2) * 2);
            const targetH = Math.max(64, Math.round((width / currentAR) / 2) * 2);

            this.sim.canvas.width = targetW;
            this.sim.canvas.height = targetH;

            const totalFrames = Math.max(1, Math.round(duration * fps));
            const frameDelayMs = Math.round(1000 / fps);
            const dt = duration / totalFrames;

            const encoder = window.gifenc.GIFEncoder();
            const maxColors = (this.sim.renderMode === 'authentic') ? 32 : 128;

            for (let f = 0; f < totalFrames; f++) {
                if (this.abortController && this.abortController.signal.aborted) {
                    throw new Error('Экспорт отменен');
                }

                const isLastFrame = (f === totalFrames - 1);
                // For the last frame, render exactly at duration (finished state)
                const currentTimeSec = isLastFrame ? duration : f * dt;
                this.sim.renderAtTime(currentTimeSec);

                const imgData = this.sim.ctx.getImageData(0, 0, targetW, targetH);
                const palette = window.gifenc.quantize(imgData.data, maxColors);
                const index = window.gifenc.applyPalette(imgData.data, palette);

                // If holdLastFrame is enabled and holdLastFrameSec > 0, set long delay on the final frame
                const currentFrameDelayMs = (isLastFrame && holdLastFrame && holdLastFrameSec > 0)
                    ? Math.round(holdLastFrameSec * 1000)
                    : frameDelayMs;

                encoder.writeFrame(index, targetW, targetH, {
                    palette,
                    delay: currentFrameDelayMs,
                    repeat: 0 // Loop forever
                });

                const progress = (f + 1) / totalFrames;
                onProgress({
                    percent: Math.round(progress * 90),
                    currentFrame: f + 1,
                    totalFrames,
                    elapsed: currentTimeSec.toFixed(1),
                    total: duration.toFixed(1),
                    status: `${currentTimeSec.toFixed(1)}s / ${duration.toFixed(1)}s (${f + 1}/${totalFrames})`
                });

                // Yield to UI thread every few frames
                if (f % 3 === 0 || f === totalFrames - 1) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            onProgress({ percent: 93, status: 'Финализация GIF файла...' });
            await new Promise(resolve => setTimeout(resolve, 10));

            encoder.finish();
            const bytes = encoder.bytes();
            const finalBlob = new Blob([bytes], { type: 'image/gif' });

            onProgress({ percent: 97, status: 'Сохранение файла...' });

            let savedViaPicker = false;
            if (fileHandle) {
                try {
                    const writableStream = await fileHandle.createWritable();
                    await writableStream.write(finalBlob);
                    await writableStream.close();
                    savedViaPicker = true;
                } catch (writeErr) {
                    console.warn('Failed writing to fileHandle, falling back to download:', writeErr);
                }
            }

            if (!savedViaPicker) {
                this.downloadBlob(finalBlob, filename);
            }

            onProgress({ percent: 100, status: 'Готово!' });

            const result = {
                filename,
                blob: finalBlob,
                size: bytes.length,
                savedViaPicker,
                pickerCancelled,
                format: 'gif'
            };

            onComplete(result);
            return result;
        } catch (err) {
            console.error('GIF Export Error:', err);
            onError(err);
        } finally {
            this.sim.canvas.width = origWidth;
            this.sim.canvas.height = origHeight;
            this.sim.renderAtTime(this.sim.currentTime);
            this.isExporting = false;
            this.abortController = null;
        }
    }

    cancel() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.isExporting = false;
    }

    downloadBlob(blob, filename) {
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (a.parentNode) {
                    document.body.removeChild(a);
                }
                URL.revokeObjectURL(url);
            }, 10000);
        } catch (e) {
            console.error('downloadBlob error:', e);
        }
    }
}

if (typeof window !== 'undefined') {
    window.ZXGifExporter = ZXGifExporter;
}
