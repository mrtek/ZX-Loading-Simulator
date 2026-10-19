/**
 * ZX Spectrum Video Exporter (100% Pure Client-Side)
 * 
 * Works completely in the browser without any servers, Python, Node.js, or external tools.
 * Compatible with Google Chrome, Microsoft Edge, Mozilla Firefox, Opera, and Apple Safari.
 */

class ZXVideoExporter {
    constructor(simulation, audioEngine) {
        this.sim = simulation;
        this.audio = audioEngine;
        this.isExporting = false;
        this.abortController = null;
    }

    /**
     * Checks if the browser supports MP4 recording with H.264
     */
    static isMp4Supported() {
        if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
            return false;
        }
        const mp4Candidates = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/mp4;codecs=avc1',
            'video/mp4;codecs=h264,aac',
            'video/mp4'
        ];
        return mp4Candidates.some(type => {
            try {
                return MediaRecorder.isTypeSupported(type);
            } catch (e) {
                return false;
            }
        });
    }

    /**
     * Finds the best supported MIME type for the browser and preferred format.
     * Guaranteed to work across Chrome, Edge, Firefox, Opera, and Safari.
     */
    getBestMimeType(preferredFormat) {
        const mp4Candidates = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/mp4;codecs=avc1',
            'video/mp4;codecs=h264,aac',
            'video/mp4'
        ];

        const webmCandidates = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp8',
            'video/webm'
        ];

        const isMp4 = (preferredFormat === 'mp4');
        const primaryList = isMp4 ? mp4Candidates : webmCandidates;
        const fallbackList = isMp4 ? webmCandidates : mp4Candidates;

        if (typeof MediaRecorder !== 'undefined') {
            for (const type of primaryList) {
                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                    const cleanMime = type.split(';')[0];
                    return { mimeType: type, format: isMp4 ? 'mp4' : 'webm', cleanMime };
                }
            }
            for (const type of fallbackList) {
                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                    const cleanMime = type.split(';')[0];
                    return { mimeType: type, format: isMp4 ? 'webm' : 'mp4', cleanMime };
                }
            }
        }

        return { mimeType: 'video/webm', format: 'webm', cleanMime: 'video/webm' };
    }

    /**
     * Main export method: records canvas and audio to video file
     */
    async exportVideo(options = {}) {
        if (this.isExporting) return;
        this.isExporting = true;
        this.abortController = new AbortController();

        const duration = options.duration || this.sim.timeline.duration;
        const fps = options.fps || 50;
        const preferredFormat = options.format || 'mp4';
        const askSaveLocation = !!options.askSaveLocation;
        const onProgress = options.onProgress || (() => {});
        const onComplete = options.onComplete || (() => {});
        const onError = options.onError || (() => {});

        const { mimeType, format, cleanMime } = this.getBestMimeType(preferredFormat);
        const title = (this.sim.timeline.programTitle || 'ZX_IMAGE').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `zx_${title}_${duration}s.${format}`;

        // 1. If "Ask where to save" is enabled and supported, prompt the user IMMEDIATELY (within the click gesture context)
        let fileHandle = null;
        if (askSaveLocation && window.showSaveFilePicker) {
            try {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: (format === 'mp4') ? 'MP4 Video' : 'WebM Video',
                        accept: {
                            [cleanMime]: [`.${format}`]
                        }
                    }]
                });
            } catch (pickerErr) {
                if (pickerErr.name === 'AbortError') {
                    // User pressed Cancel in the file picker dialog
                    this.isExporting = false;
                    this.abortController = null;
                    return { cancelled: true };
                }
                console.warn('showSaveFilePicker prompt failed, will fallback to download:', pickerErr);
                fileHandle = null;
            }
        }

        try {
            onProgress({ percent: 0, status: 'Подготовка звуковой дорожки...' });

            this.audio.init();
            const audioBuffer = this.audio.generateAudioBuffer(duration, this.sim.timeline, 44100);

            const audioSource = this.audio.audioCtx.createBufferSource();
            audioSource.buffer = audioBuffer;
            const audioDest = this.audio.audioCtx.createMediaStreamDestination();
            audioSource.connect(audioDest);

            const videoStream = this.sim.canvas.captureStream(fps);
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioDest.stream.getAudioTracks()
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: 8000000
            });

            const recordedChunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            const recordingPromise = new Promise((resolve, reject) => {
                recorder.onstop = () => resolve(recordedChunks);
                recorder.onerror = (err) => reject(err);
            });

            recorder.start(100);
            audioSource.start(0);

            const startTime = performance.now();
            const totalDurationMs = duration * 1000;

            await new Promise((resolve, reject) => {
                const tick = () => {
                    if (this.abortController && this.abortController.signal.aborted) {
                        recorder.stop();
                        try { audioSource.stop(); } catch (e) {}
                        reject(new Error('Экспорт отменен'));
                        return;
                    }

                    const elapsedMs = performance.now() - startTime;
                    const currentTimeSec = elapsedMs / 1000;
                    const progress = Math.min(1, elapsedMs / totalDurationMs);

                    this.sim.renderAtTime(currentTimeSec);

                    const videoTrack = videoStream.getVideoTracks()[0];
                    if (videoTrack && typeof videoTrack.requestFrame === 'function') {
                        videoTrack.requestFrame();
                    }

                    onProgress({
                        percent: Math.round(progress * 90),
                        elapsed: currentTimeSec.toFixed(1),
                        total: duration.toFixed(1),
                        status: `${currentTimeSec.toFixed(1)}s / ${duration.toFixed(1)}s`
                    });

                    if (elapsedMs < totalDurationMs) {
                        requestAnimationFrame(tick);
                    } else {
                        setTimeout(() => {
                            recorder.stop();
                            try { audioSource.stop(); } catch (e) {}
                            resolve();
                        }, 200);
                    }
                };

                requestAnimationFrame(tick);
            });

            const chunks = await recordingPromise;
            const finalBlob = new Blob(chunks, { type: mimeType });

            onProgress({ percent: 95, status: 'Сохранение видео...' });

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

            // If not saved via direct fileHandle, trigger browser download
            if (!savedViaPicker) {
                this.downloadBlob(finalBlob, filename);
            }

            onProgress({ percent: 100, status: 'Готово!' });

            const result = {
                filename,
                blob: finalBlob,
                savedViaPicker,
                format,
                cleanMime
            };

            onComplete(result);
            return result;
        } catch (err) {
            console.error('Video Export Error:', err);
            onError(err);
        } finally {
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

    /**
     * Download blob via synthetic anchor click
     */
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

    /**
     * Helper to save blob using file picker on user demand (e.g. from modal button)
     */
    async saveAsWithPicker(blob, filename, format = 'mp4', cleanMime = 'video/mp4') {
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: (format === 'mp4') ? 'MP4 Video' : 'WebM Video',
                        accept: {
                            [cleanMime]: [`.${format}`]
                        }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return true;
            } catch (e) {
                if (e.name === 'AbortError') return false;
                console.warn('saveAsWithPicker fallback:', e);
            }
        }
        this.downloadBlob(blob, filename);
        return true;
    }
}

if (typeof window !== 'undefined') {
    window.ZXVideoExporter = ZXVideoExporter;
}
