/**
 * ZX Spectrum Loading Simulation & Video Studio - Main Application Controller
 * Bilingual (RU / EN) with save folder management and "Save As" support.
 */

const I18N = {
    ru: {
        brandSubtitle: "Tape Loading Simulator & Video Studio",
        btnStart: "Старт",
        btnPause: "Пауза",
        btnReset: "⏹ Сброс",
        btnExport: "🎬 Экспорт Видео",
        btnExportGif: "🎞️ Экспорт GIF",
        tapeDrive: "TAPE DRIVE",
        cardUploadTitle: "Загрузка изображения",
        lblBtnUpload: "Загрузить своё изображение...",
        dropText: "Перетащите картинку сюда",
        dropHint: "или нажмите для выбора файла (PNG, JPG, WEBP, SCR)",
        btnPresetJetpac: "Jetpac",
        btnPresetHobbit: "📜 The Hobbit (.SCR)",
        alertInvalidFile: "Пожалуйста, выберите файл изображения (PNG, JPG, WEBP) или экран ZX Spectrum (.SCR).",
        lblExportHint: "Видео: 15 сек. со звуком • GIF: быстрый экспорт анимации",
        lblGifResolution: "Разрешение GIF:",
        mp4NotSupported: "Формат MP4 (H.264) не поддерживается вашим браузером",
        cardDurationTitle: "Длительность видео",
        lblTotalDuration: "Общая длительность:",
        secSuffix: "сек",
        lblSkipIntro: "Пропустить ввод команды (сразу загрузка с ленты)",
        cardStyleTitle: "Стиль, Рамка и Пропорции",
        lblProgramTitle: "Название программы (Header):",
        lblAspectRatio: "Соотношение сторон:",
        aspectAuto: "★ Как у картинки",
        lblBorderStyle: "Бордюр (рамка):",
        borderStd: "Классический",
        borderThin: "Тонкий",
        borderNone: "Без бордюра",
        lblColorMode: "Режим цвета:",
        modeTruecolor: "Оригинал (Четкий)",
        modeAuthentic: "ZX 16 цветов",
        cardAudioTitle: "Звук магнитофона",
        lblEnableSound: "Включить звук загрузки",
        lblVolume: "Громкость воспроизведения:",
        cardExportTitle: "Параметры экспорта и сохранения",
        lblResolution: "Разрешение видео:",
        lblFormat: "Формат файла:",
        lblAskSave: "Спрашивать, куда сохранить («Сохранить как...»)",
        lblAskSaveHint: "Сохраняйте в любую подпапку (в корень диска D:\\ браузер не дает сохранять из соображений безопасности Chrome).",
        modalTitle: "ЭКСПОРТ ВИДЕО",
        modalTitleGif: "ЭКСПОРТ GIF",
        btnCancelText: "Отмена",
        modalInit: "Инициализация записи...",
        modalInitGif: "Подготовка кадров GIF...",
        modalDone: "Готово! Видео успешно создано и сохранено.",
        modalDoneGif: "Готово! GIF успешно создан и сохранен.",
        aspectRatioRatio: "соотношение",
        phases: {
            boot: "Sinclair Prompt",
            typing: 'Ввод команды LOAD ""',
            hdr_pilot: "Пилот-сигнал заголовка",
            hdr_sync: "Синхроимпульс заголовка",
            hdr_data: "Заголовок: Program ",
            pause: "Пауза ленты (Gap)",
            dat_pilot: "Пилот-сигнал данных экрана",
            dat_sync: "Синхроимпульс данных",
            bitmap: "Загрузка линий: ",
            attr: "Загрузка цвета: ",
            complete: "Загрузка завершена! (0 OK)",
            idle: "Ожидание"
        }
    },
    en: {
        brandSubtitle: "Tape Loading Simulator & Video Studio",
        btnStart: "Start",
        btnPause: "Pause",
        btnReset: "⏹ Reset",
        btnExport: "🎬 Export Video",
        btnExportGif: "🎞️ Export GIF",
        tapeDrive: "TAPE DRIVE",
        cardUploadTitle: "Image Upload",
        lblBtnUpload: "Upload custom image...",
        dropText: "Drag & drop image here",
        dropHint: "or click to select file (PNG, JPG, WEBP, SCR)",
        btnPresetJetpac: "Jetpac",
        btnPresetHobbit: "📜 The Hobbit (.SCR)",
        alertInvalidFile: "Please select an image file (PNG, JPG, WEBP) or ZX Spectrum screen (.SCR).",
        lblExportHint: "Video: 15s with sound • GIF: fast offline export",
        lblGifResolution: "GIF Resolution:",
        mp4NotSupported: "MP4 (H.264) format is not supported by your browser",
        cardDurationTitle: "Video Duration",
        lblTotalDuration: "Total duration:",
        secSuffix: "sec",
        lblSkipIntro: "Skip command typing (start tape immediately)",
        cardStyleTitle: "Style, Frame & Aspect Ratio",
        lblProgramTitle: "Program Title (Header):",
        lblAspectRatio: "Aspect Ratio:",
        aspectAuto: "★ Match image",
        lblBorderStyle: "Border (Frame):",
        borderStd: "Classic",
        borderThin: "Thin",
        borderNone: "No border",
        lblColorMode: "Color Mode:",
        modeTruecolor: "Original (Sharp)",
        modeAuthentic: "ZX 16 colors",
        cardAudioTitle: "Tape Audio",
        lblEnableSound: "Enable loading sound",
        lblVolume: "Playback volume:",
        cardExportTitle: "Export & Save Settings",
        lblResolution: "Video resolution:",
        lblAskSave: "Ask where to save (\"Save As...\" dialog)",
        lblAskSaveHint: "Save into any subfolder (Chrome prevents saving directly to root D:\\ for security reasons).",
        modalTitle: "VIDEO EXPORT",
        modalTitleGif: "GIF EXPORT",
        btnCancelText: "Cancel",
        modalInit: "Initializing recording...",
        modalInitGif: "Preparing GIF frames...",
        modalDone: "Done! Video created and saved.",
        modalDoneGif: "Done! GIF created and saved.",
        aspectRatioRatio: "ratio",
        phases: {
            boot: "Sinclair Prompt",
            typing: 'Typing command LOAD ""',
            hdr_pilot: "Header pilot tone",
            hdr_sync: "Header sync pulse",
            hdr_data: "Header: Program ",
            pause: "Tape gap pause",
            dat_pilot: "Screen data pilot tone",
            dat_sync: "Data sync pulse",
            bitmap: "Loading scanlines: ",
            attr: "Color attributes: ",
            complete: "Loading complete! (0 OK)",
            idle: "Ready"
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. References to DOM Elements
    const canvas = document.getElementById('zx-canvas');
    const timelineSlider = document.getElementById('timeline-slider');
    const timeDisplay = document.getElementById('time-display');
    const phasePill = document.getElementById('phase-pill');
    const btnPlay = document.getElementById('btn-play');
    const playIcon = document.getElementById('play-icon');
    const playText = document.getElementById('play-text');
    const btnReset = document.getElementById('btn-reset');
    const btnResetText = document.getElementById('btn-reset-text');
    const btnExportTrigger = document.getElementById('btn-export-trigger');
    const btnExportText = document.getElementById('btn-export-text');
    const btnExportGif = document.getElementById('btn-export-gif');
    const btnExportGifText = document.getElementById('btn-export-gif-text');

    const wheelLeft = document.getElementById('wheel-left');
    const wheelRight = document.getElementById('wheel-right');
    const oscCanvas = document.getElementById('oscilloscope-canvas');
    const oscCtx = oscCanvas.getContext('2d');

    // Initialize oscilloscope canvas size once and update only on resize
    oscCanvas.width = oscCanvas.clientWidth || 200;
    oscCanvas.height = oscCanvas.clientHeight || 24;
    const oscResizeObserver = new ResizeObserver(() => {
        oscCanvas.width = oscCanvas.clientWidth || 200;
        oscCanvas.height = oscCanvas.clientHeight || 24;
    });
    oscResizeObserver.observe(oscCanvas);
    const tapeDriveLabel = document.getElementById('tape-drive-label');

    const cardUploadHeader = document.getElementById('card-upload-header');
    const btnUploadFile = document.getElementById('btn-upload-file');
    const lblBtnUpload = document.getElementById('lbl-btn-upload');
    const dropZone = document.getElementById('drop-zone');
    const dropZoneText = document.getElementById('drop-zone-text');
    const dropZoneHint = document.getElementById('drop-zone-hint');
    const fileInput = document.getElementById('file-input');
    const btnPresetJetpac = document.getElementById('btn-preset-jetpac');
    const btnPresetHobbit = document.getElementById('btn-preset-hobbit');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageThumb = document.getElementById('image-thumb');
    const imageFilename = document.getElementById('image-filename');
    const imageDimensions = document.getElementById('image-dimensions');
    const lblExportHint = document.getElementById('lbl-export-hint');

    const durationSlider = document.getElementById('duration-slider');
    const durationVal = document.getElementById('duration-val');
    const skipIntroCheckbox = document.getElementById('skip-intro-checkbox');
    const programTitleInput = document.getElementById('program-title-input');

    const aspectAuto = document.getElementById('aspect-auto');
    const aspect16x9 = document.getElementById('aspect-16x9');
    const aspect4x3 = document.getElementById('aspect-4x3');

    const borderStd = document.getElementById('border-std');
    const borderThin = document.getElementById('border-thin');
    const borderNone = document.getElementById('border-none');

    const modeTruecolor = document.getElementById('mode-truecolor');
    const modeAuthentic = document.getElementById('mode-authentic');

    const soundEnabledCheckbox = document.getElementById('sound-enabled-checkbox');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeVal = document.getElementById('volume-val');

    const res1080p = document.getElementById('res-1080p');
    const res720p = document.getElementById('res-720p');
    const res4x3 = document.getElementById('res-4x3');
    const fmtMp4 = document.getElementById('fmt-mp4');
    const fmtWebm = document.getElementById('fmt-webm');
    const gifRes512 = document.getElementById('gif-res-512');
    const gifRes384 = document.getElementById('gif-res-384');
    const gifResOrig = document.getElementById('gif-res-orig');
    const askSaveLocationCheckbox = document.getElementById('ask-save-location-checkbox');

    const exportModal = document.getElementById('export-modal');
    const modalPercent = document.getElementById('modal-percent');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const modalStatus = document.getElementById('modal-status');
    const modalSavedPath = document.getElementById('modal-saved-path');
    const btnCancelExport = document.getElementById('btn-cancel-export');

    const langRu = document.getElementById('lang-ru');
    const langEn = document.getElementById('lang-en');

    // 2. Application State
    const state = {
        lang: localStorage.getItem('zx_lang') || 'ru',
        duration: 15,
        skipIntro: false,
        programTitle: 'JETPAC',
        renderMode: 'truecolor',
        aspectMode: 'auto',
        borderStyle: 'standard',
        soundEnabled: true,
        volume: 0.5,
        exportResolution: '1080p',
        exportFormat: 'mp4',
        gifResolution: 512,
        askSaveLocation: true,
        isPlaying: false,
        currentTime: 0,
        currentImage: null,
        currentImageName: 'jetpac.png'
    };

    // 3. Initialize Core Engines
    const converter = new ZXImageConverter();
    const audioEngine = new ZXAudioEngine();
    const simulation = new ZXLoadingSimulation(canvas, {
        duration: state.duration,
        skipIntro: state.skipIntro,
        programTitle: state.programTitle,
        renderMode: state.renderMode,
        borderStyle: state.borderStyle
    });
    const exporter = new ZXVideoExporter(simulation, audioEngine);
    const gifExporter = new ZXGifExporter(simulation);

    // 4. Preload Font
    try {
        const font = new FontFace("ZX Spectrum-7 Regular", "url('./assets/fonts/zx_spectrum-7.woff')");
        await font.load();
        document.fonts.add(font);
    } catch (e) {
        console.warn('Font load error:', e);
    }

    // 5. Language Switching Function
    function setLanguage(lang) {
        state.lang = lang;
        localStorage.setItem('zx_lang', lang);
        const t = I18N[lang];

        if (lang === 'ru') {
            langRu.classList.add('active');
            langEn.classList.remove('active');
            document.documentElement.lang = 'ru';
        } else {
            langEn.classList.add('active');
            langRu.classList.remove('active');
            document.documentElement.lang = 'en';
        }

        document.getElementById('card-upload-title').textContent = t.cardUploadTitle;
        if (lblBtnUpload) lblBtnUpload.textContent = t.lblBtnUpload;
        dropZoneText.textContent = t.dropText;
        dropZoneHint.textContent = t.dropHint;
        btnPresetJetpac.textContent = t.btnPresetJetpac;
        if (btnPresetHobbit) btnPresetHobbit.textContent = t.btnPresetHobbit;

        document.getElementById('card-duration-title').textContent = t.cardDurationTitle;
        document.getElementById('lbl-total-duration').textContent = t.lblTotalDuration;
        durationVal.textContent = `${state.duration} ${t.secSuffix}`;
        document.getElementById('lbl-skip-intro').textContent = t.lblSkipIntro;

        document.getElementById('card-style-title').textContent = t.cardStyleTitle;
        document.getElementById('lbl-program-title').textContent = t.lblProgramTitle;
        document.getElementById('lbl-aspect-ratio').textContent = t.lblAspectRatio;
        if (state.currentImage) {
            const nw = state.currentImage.naturalWidth || state.currentImage.width;
            const nh = state.currentImage.naturalHeight || state.currentImage.height;
            aspectAuto.textContent = `${t.aspectAuto} (${nw}×${nh})`;
        } else {
            aspectAuto.textContent = t.aspectAuto;
        }

        document.getElementById('lbl-border-style').textContent = t.lblBorderStyle;
        borderStd.textContent = t.borderStd;
        borderThin.textContent = t.borderThin;
        borderNone.textContent = t.borderNone;

        document.getElementById('lbl-color-mode').textContent = t.lblColorMode;
        modeTruecolor.textContent = t.modeTruecolor;
        modeAuthentic.textContent = t.modeAuthentic;

        document.getElementById('card-audio-title').textContent = t.cardAudioTitle;
        document.getElementById('lbl-enable-sound').textContent = t.lblEnableSound;
        document.getElementById('lbl-volume').textContent = t.lblVolume;

        document.getElementById('card-export-title').textContent = t.cardExportTitle;
        document.getElementById('lbl-resolution').textContent = t.lblResolution;
        document.getElementById('lbl-format').textContent = t.lblFormat;
        document.getElementById('lbl-ask-save').textContent = t.lblAskSave;
        const lblAskSaveHint = document.getElementById('lbl-ask-save-hint');
        if (lblAskSaveHint) lblAskSaveHint.textContent = t.lblAskSaveHint;
        btnResetText.textContent = t.btnReset;
        btnExportText.textContent = t.btnExport;
        if (btnExportGifText) btnExportGifText.textContent = t.btnExportGif;
        const lblGifRes = document.getElementById('lbl-gif-resolution');
        if (lblGifRes) lblGifRes.textContent = t.lblGifResolution;
        playText.textContent = state.isPlaying ? t.btnPause : t.btnStart;

        document.getElementById('modal-title').textContent = t.modalTitle;
        document.getElementById('btn-cancel-text').textContent = t.btnCancelText;
        if (fmtMp4 && fmtMp4.classList.contains('disabled')) {
            fmtMp4.title = t.mp4NotSupported;
        }
        updateUI();
    }

    langRu.addEventListener('click', () => setLanguage('ru'));
    langEn.addEventListener('click', () => setLanguage('en'));

    // 7. Adjust Canvas Size based on Aspect Mode & Image Dimensions
    function updateCanvasDimensions() {
        if (!state.currentImage) return;

        const imgW = state.currentImage.naturalWidth || state.currentImage.width;
        const imgH = state.currentImage.naturalHeight || state.currentImage.height;
        const imgAR = imgW / imgH;

        let targetAR = imgAR;
        if (state.aspectMode === '16:9') targetAR = 16 / 9;
        else if (state.aspectMode === '4:3') targetAR = 4 / 3;

        const baseW = 1024;
        const baseH = Math.round(baseW / targetAR);

        canvas.width = baseW;
        canvas.height = baseH;

        simulation.renderAtTime(state.currentTime);
    }

    // 8. Image Processing Function
    function processAndLoadImage(img, filename) {
        state.currentImage = img;
        const t = I18N[state.lang];

        if (filename) {
            state.currentImageName = filename;
            imageFilename.textContent = filename;
            const base = filename.replace(/\.[^/.]+$/, '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 10);
            if (base) {
                state.programTitle = base;
                programTitleInput.value = base;
                simulation.timeline.setProgramTitle(base);
            }
        }

        const nw = Math.max(1, img.naturalWidth || img.width || 1024);
        const nh = Math.max(1, img.naturalHeight || img.height || 546);
        imageDimensions.textContent = `${nw} × ${nh} px (${t.aspectRatioRatio} ${(nw/nh).toFixed(2)}:1)`;
        imageThumb.src = img.src;
        imagePreviewContainer.style.display = 'flex';
        dropZone.style.display = 'none';

        aspectAuto.textContent = `${t.aspectAuto} (${nw}×${nh})`;

        let processed = null;
        try {
            processed = converter.processImage(img);
        } catch (convErr) {
            console.warn('ZXImageConverter encountered issue, applying canvas fallback:', convErr);
            const fc = document.createElement('canvas');
            fc.width = nw;
            fc.height = nh;
            const fcCtx = fc.getContext('2d');
            fcCtx.drawImage(img, 0, 0, nw, nh);
            processed = {
                width: nw,
                height: nh,
                aspectRatio: nw / nh,
                fullColorCanvas: fc,
                authenticColorCanvas: fc,
                monoCanvas: fc,
                scanlineOrder: generateZXScanlineOrder(nh)
            };
        }

        simulation.setImageData(processed);
        updateCanvasDimensions();
        updateUI();
    }

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function processAndLoadScr(scrData, filename = 'loading.scr') {
        const t = I18N[state.lang];
        let processed = null;
        try {
            processed = converter.processScr(scrData);
        } catch (err) {
            console.error('Failed to parse SCR:', err);
            alert('Ошибка загрузки .SCR: ' + err.message);
            return;
        }

        const scrImg = new Image();
        scrImg.src = processed.previewUrl;
        scrImg.width = 256;
        scrImg.height = 192;
        state.currentImage = scrImg;

        if (filename) {
            state.currentImageName = filename;
            imageFilename.textContent = filename;
            let base = filename.replace(/\.[^/.]+$/, '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 10);
            if (base === 'LOADING' && (filename.toLowerCase().includes('hobbit') || filename.toLowerCase() === 'loading.scr')) {
                base = 'HOBBIT';
            }
            if (base) {
                state.programTitle = base;
                programTitleInput.value = base;
                simulation.timeline.setProgramTitle(base);
            }
        }

        imageDimensions.textContent = '256 × 192 px (.SCR)';
        imageThumb.src = processed.previewUrl;
        imagePreviewContainer.style.display = 'flex';
        dropZone.style.display = 'none';

        aspectAuto.textContent = `${t.aspectAuto} (256×192)`;

        simulation.setImageData(processed);
        updateCanvasDimensions();
        updateUI();
    }

    // Load default image (Jetpac)
    function loadDefaultImage() {
        const defaultImg = new Image();
        defaultImg.onload = () => {
            processAndLoadImage(defaultImg, 'jetpac.png');
        };
        defaultImg.onerror = () => {
            if (window.DEFAULT_HOBBIT_SCR_BASE64) {
                const bytes = base64ToUint8Array(window.DEFAULT_HOBBIT_SCR_BASE64);
                processAndLoadScr(bytes, 'the_hobbit.scr');
            }
        };
        defaultImg.src = window.DEFAULT_JETPAC_DATA || './assets/img/jet-pac-zx-spectrum-loading-screen.png';
    }
    loadDefaultImage();

    // 9. Playback Loop
    let animFrameId = null;
    let lastTimestamp = 0;

    function startPlayback() {
        if (state.isPlaying) return;
        state.isPlaying = true;

        if (state.currentTime >= state.duration) {
            state.currentTime = 0;
        }

        btnPlay.classList.add('playing');
        playIcon.textContent = '⏸';
        playText.textContent = I18N[state.lang].btnPause;

        wheelLeft.classList.add('spinning');
        wheelRight.classList.add('spinning');

        if (state.soundEnabled) {
            audioEngine.setVolume(state.volume);
            audioEngine.playTimeline(state.duration, simulation.timeline, state.currentTime);
        }

        lastTimestamp = performance.now();
        animFrameId = requestAnimationFrame(playbackLoop);
    }

    function pausePlayback() {
        if (!state.isPlaying) return;
        state.isPlaying = false;

        btnPlay.classList.remove('playing');
        playIcon.textContent = '▶';
        playText.textContent = I18N[state.lang].btnStart;

        wheelLeft.classList.remove('spinning');
        wheelRight.classList.remove('spinning');

        audioEngine.stop();
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    function resetPlayback() {
        pausePlayback();
        state.currentTime = 0;
        simulation.renderAtTime(0);
        updateUI();
    }

    function playbackLoop(timestamp) {
        if (!state.isPlaying) return;

        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        state.currentTime += delta;
        if (state.currentTime >= state.duration) {
            state.currentTime = state.duration;
            simulation.renderAtTime(state.currentTime);
            updateUI();
            pausePlayback();
            return;
        }

        simulation.renderAtTime(state.currentTime);
        updateUI();
        drawOscilloscope();

        animFrameId = requestAnimationFrame(playbackLoop);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function getPhaseDescription(phase) {
        const t = I18N[state.lang].phases;
        const totalLines = simulation.processedData ? simulation.processedData.height : 192;
        switch (phase.id) {
            case 'boot': return t.boot;
            case 'typing': return t.typing;
            case 'hdr_pilot': return t.hdr_pilot;
            case 'hdr_sync': return t.hdr_sync;
            case 'hdr_data': return `${t.hdr_data}${simulation.timeline.programTitle}`;
            case 'pause': return t.pause;
            case 'dat_pilot': return t.dat_pilot;
            case 'dat_sync': return t.dat_sync;
            case 'bitmap': return `${t.bitmap}${Math.round(phase.progressInPhase * totalLines)} / ${totalLines}`;
            case 'attr': return `${t.attr}${Math.round(phase.progressInPhase * 100)}%`;
            case 'complete': return t.complete;
            default: return t.idle;
        }
    }

    function updateUI() {
        timelineSlider.max = state.duration;
        timelineSlider.value = state.currentTime;
        timeDisplay.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;

        const phase = simulation.timeline.getPhaseAt(state.currentTime);
        phasePill.textContent = getPhaseDescription(phase);

        if (lblExportHint) {
            lblExportHint.textContent = (state.lang === 'ru') 
                ? `Видео: ${state.duration} сек. со звуком • GIF: быстрый оффлайн-экспорт` 
                : `Video: ${state.duration}s with sound • GIF: fast offline export`;
        }
    }

    function drawOscilloscope() {
        const w = oscCanvas.width;
        const h = oscCanvas.height;
        oscCtx.clearRect(0, 0, w, h);

        if (!state.isPlaying || !state.soundEnabled) {
            oscCtx.strokeStyle = '#2b3040';
            oscCtx.beginPath();
            oscCtx.moveTo(0, h / 2);
            oscCtx.lineTo(w, h / 2);
            oscCtx.stroke();
            return;
        }

        const phase = simulation.timeline.getPhaseAt(state.currentTime);
        oscCtx.strokeStyle = phase.border === 'pilot' ? '#00cdcd' : phase.border === 'data' ? '#cdcd00' : '#44ffaa';
        oscCtx.lineWidth = 1.5;
        oscCtx.beginPath();

        const step = 2;
        const t = performance.now() / 100;
        const freq = phase.border === 'pilot' ? 0.3 : 0.8;
        const amp = (h / 2) * 0.7 * state.volume;

        for (let x = 0; x < w; x += step) {
            const y = (h / 2) + Math.sin(x * freq + t) * amp * (phase.border === 'data' ? ((x % 4 === 0) ? -1 : 1) : 1);
            if (x === 0) oscCtx.moveTo(x, y);
            else oscCtx.lineTo(x, y);
        }
        oscCtx.stroke();
    }

    // 10. Playback & Seek Listeners
    btnPlay.addEventListener('click', () => {
        if (state.isPlaying) pausePlayback();
        else startPlayback();
    });

    btnReset.addEventListener('click', resetPlayback);

    const handleSliderSeek = (e) => {
        const t = parseFloat(e.target.value);
        pausePlayback();
        state.currentTime = t;
        simulation.renderAtTime(t);
        updateUI();
    };
    timelineSlider.addEventListener('input', handleSliderSeek);
    timelineSlider.addEventListener('change', handleSliderSeek);

    // 11. Image Upload Listeners
    const triggerFileSelect = () => fileInput.click();

    if (btnUploadFile) btnUploadFile.addEventListener('click', triggerFileSelect);
    if (cardUploadHeader) cardUploadHeader.addEventListener('click', triggerFileSelect);
    dropZone.addEventListener('click', triggerFileSelect);
    imagePreviewContainer.addEventListener('click', triggerFileSelect);

    // Drop zone drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Also support dropping image directly onto image-preview-row
    imagePreviewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreviewContainer.style.borderColor = 'var(--accent-cyan)';
    });
    imagePreviewContainer.addEventListener('dragleave', () => {
        imagePreviewContainer.style.borderColor = '';
    });
    imagePreviewContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreviewContainer.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Global drag and drop support anywhere on the page/window
    window.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    window.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const isScr = file.name.toLowerCase().endsWith('.scr') || file.size === 6912;
            if (isScr || (file.type && file.type.startsWith('image/')) || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) {
                e.preventDefault();
                handleFile(file);
            }
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
        fileInput.value = ''; // Reset so re-selecting the same file triggers change
    });

    btnPresetJetpac.addEventListener('click', () => {
        const img = new Image();
        img.onload = () => processAndLoadImage(img, 'jetpac.png');
        img.src = window.DEFAULT_JETPAC_DATA || './assets/img/jet-pac-zx-spectrum-loading-screen.png';
    });

    if (btnPresetHobbit) {
        btnPresetHobbit.addEventListener('click', () => {
            if (window.DEFAULT_HOBBIT_SCR_BASE64) {
                const bytes = base64ToUint8Array(window.DEFAULT_HOBBIT_SCR_BASE64);
                processAndLoadScr(bytes, 'the_hobbit.scr');
            } else {
                fetch('./assets/img/loading.scr')
                    .then(r => r.arrayBuffer())
                    .then(buf => processAndLoadScr(buf, 'the_hobbit.scr'))
                    .catch(err => {
                        console.error('Fetch loading.scr failed:', err);
                    });
            }
        });
    }

    function handleFile(file) {
        const isScr = file.name.toLowerCase().endsWith('.scr') || file.size === 6912;
        if (isScr) {
            const reader = new FileReader();
            reader.onload = (event) => {
                processAndLoadScr(event.target.result, file.name);
            };
            reader.readAsArrayBuffer(file);
            return;
        }

        if ((file.type && file.type.startsWith('image/')) || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    processAndLoadImage(img, file.name);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            return;
        }

        alert(I18N[state.lang].alertInvalidFile || 'Пожалуйста, выберите файл изображения (PNG, JPG, WEBP) или экран ZX Spectrum (.SCR).');
    }

    // 12. Settings Event Listeners
    durationSlider.addEventListener('input', (e) => {
        const d = parseInt(e.target.value, 10);
        state.duration = d;
        durationVal.textContent = `${d} ${I18N[state.lang].secSuffix}`;
        simulation.timeline.setDuration(d);
        if (state.currentTime > d) state.currentTime = d;
        simulation.renderAtTime(state.currentTime);
        updateUI();
    });

    skipIntroCheckbox.addEventListener('change', (e) => {
        state.skipIntro = e.target.checked;
        simulation.timeline.setSkipIntro(state.skipIntro);
        simulation.renderAtTime(state.currentTime);
        updateUI();
    });

    programTitleInput.addEventListener('input', (e) => {
        const title = e.target.value.toUpperCase().slice(0, 10);
        state.programTitle = title;
        simulation.timeline.setProgramTitle(title);
        simulation.renderAtTime(state.currentTime);
        updateUI();
    });

    // Aspect Ratio Toggles
    aspectAuto.addEventListener('click', () => {
        state.aspectMode = 'auto';
        aspectAuto.classList.add('active');
        aspect16x9.classList.remove('active');
        aspect4x3.classList.remove('active');
        updateCanvasDimensions();
    });

    aspect16x9.addEventListener('click', () => {
        state.aspectMode = '16:9';
        aspect16x9.classList.add('active');
        aspectAuto.classList.remove('active');
        aspect4x3.classList.remove('active');
        updateCanvasDimensions();
    });

    aspect4x3.addEventListener('click', () => {
        state.aspectMode = '4:3';
        aspect4x3.classList.add('active');
        aspectAuto.classList.remove('active');
        aspect16x9.classList.remove('active');
        updateCanvasDimensions();
    });

    // Border Style Toggles
    borderStd.addEventListener('click', () => {
        state.borderStyle = 'standard';
        simulation.setBorderStyle('standard');
        borderStd.classList.add('active');
        borderThin.classList.remove('active');
        borderNone.classList.remove('active');
        simulation.renderAtTime(state.currentTime);
    });

    borderThin.addEventListener('click', () => {
        state.borderStyle = 'thin';
        simulation.setBorderStyle('thin');
        borderThin.classList.add('active');
        borderStd.classList.remove('active');
        borderNone.classList.remove('active');
        simulation.renderAtTime(state.currentTime);
    });

    borderNone.addEventListener('click', () => {
        state.borderStyle = 'none';
        simulation.setBorderStyle('none');
        borderNone.classList.add('active');
        borderStd.classList.remove('active');
        borderThin.classList.remove('active');
        simulation.renderAtTime(state.currentTime);
    });

    // Render Mode Toggles
    modeTruecolor.addEventListener('click', () => {
        state.renderMode = 'truecolor';
        simulation.renderMode = 'truecolor';
        modeTruecolor.classList.add('active');
        modeAuthentic.classList.remove('active');
        simulation.renderAtTime(state.currentTime);
    });

    modeAuthentic.addEventListener('click', () => {
        state.renderMode = 'authentic';
        simulation.renderMode = 'authentic';
        modeAuthentic.classList.add('active');
        modeTruecolor.classList.remove('active');
        simulation.renderAtTime(state.currentTime);
    });

    // Audio Controls
    soundEnabledCheckbox.addEventListener('change', (e) => {
        state.soundEnabled = e.target.checked;
        audioEngine.setMuted(!state.soundEnabled);
    });

    volumeSlider.addEventListener('input', (e) => {
        const v = parseInt(e.target.value, 10) / 100;
        state.volume = v;
        volumeVal.textContent = `${Math.round(v * 100)}%`;
        audioEngine.setVolume(v);
    });

    // Export Options
    res1080p.addEventListener('click', () => {
        state.exportResolution = '1080p';
        res1080p.classList.add('active');
        res720p.classList.remove('active');
        res4x3.classList.remove('active');
    });

    res720p.addEventListener('click', () => {
        state.exportResolution = '720p';
        res720p.classList.add('active');
        res1080p.classList.remove('active');
        res4x3.classList.remove('active');
    });

    res4x3.addEventListener('click', () => {
        state.exportResolution = '4x3';
        res4x3.classList.add('active');
        res1080p.classList.remove('active');
        res720p.classList.remove('active');
    });

    // Check browser MP4 support
    const isMp4Supported = (typeof ZXVideoExporter !== 'undefined' && ZXVideoExporter.isMp4Supported) ? ZXVideoExporter.isMp4Supported() : false;
    if (!isMp4Supported) {
        fmtMp4.classList.add('disabled');
        fmtMp4.title = I18N[state.lang].mp4NotSupported;
        state.exportFormat = 'webm';
        fmtWebm.classList.add('active');
        fmtMp4.classList.remove('active');
    }

    fmtMp4.addEventListener('click', () => {
        if (fmtMp4.classList.contains('disabled')) return;
        state.exportFormat = 'mp4';
        fmtMp4.classList.add('active');
        fmtWebm.classList.remove('active');
    });

    fmtWebm.addEventListener('click', () => {
        state.exportFormat = 'webm';
        fmtWebm.classList.add('active');
        fmtMp4.classList.remove('active');
    });

    // GIF Resolution Options
    if (gifRes512) {
        gifRes512.addEventListener('click', () => {
            state.gifResolution = 512;
            gifRes512.classList.add('active');
            gifRes384.classList.remove('active');
            gifResOrig.classList.remove('active');
        });
    }

    if (gifRes384) {
        gifRes384.addEventListener('click', () => {
            state.gifResolution = 384;
            gifRes384.classList.add('active');
            gifRes512.classList.remove('active');
            gifResOrig.classList.remove('active');
        });
    }

    if (gifResOrig) {
        gifResOrig.addEventListener('click', () => {
            state.gifResolution = 256;
            gifResOrig.classList.add('active');
            gifRes512.classList.remove('active');
            gifRes384.classList.remove('active');
        });
    }

    askSaveLocationCheckbox.addEventListener('change', (e) => {
        state.askSaveLocation = e.target.checked;
    });

    // Toast notification function
    function showNotification(text, duration = 3500) {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'app-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), duration);
    }

    // 13. Video Export Trigger & Modal
    btnExportTrigger.addEventListener('click', async () => {
        pausePlayback();

        const origWidth = canvas.width;
        const origHeight = canvas.height;
        const currentAR = canvas.width / canvas.height;

        if (state.exportResolution === '1080p') {
            canvas.width = 1920;
            canvas.height = Math.round(1920 / currentAR);
        } else if (state.exportResolution === '720p') {
            canvas.width = 1280;
            canvas.height = Math.round(1280 / currentAR);
        } else if (state.exportResolution === '4x3') {
            canvas.width = 960;
            canvas.height = 720;
        }

        canvas.width = Math.round(canvas.width / 2) * 2;
        canvas.height = Math.round(canvas.height / 2) * 2;

        const t = I18N[state.lang];
        exportModal.classList.add('active');
        document.getElementById('modal-title').textContent = t.modalTitle;
        modalPercent.textContent = '0%';
        progressBarFill.style.width = '0%';
        modalStatus.textContent = t.modalInit;
        modalSavedPath.style.display = 'none';
        btnCancelExport.textContent = t.btnCancelText;

        const res = await exporter.exportVideo({
            duration: state.duration,
            fps: 50,
            format: state.exportFormat,
            askSaveLocation: state.askSaveLocation,
            onProgress: (p) => {
                modalPercent.textContent = `${p.percent}%`;
                progressBarFill.style.width = `${p.percent}%`;
                modalStatus.textContent = p.status || '...';
            },
            onComplete: (r) => {
                modalStatus.textContent = t.modalDone;
                modalSavedPath.style.display = 'flex';
                const fallbackMsg = (state.lang === 'ru')
                    ? '⚠️ Внимание: Браузер блокирует сохранение напрямую в корень диска (D:\\, C:\\). Файл сохранен через стандартную загрузку браузера (в папку «Загрузки»), либо сохраняйте в любую подпапку.'
                    : '⚠️ Note: Browser blocks saving directly to root drive (D:\\, C:\\). File was saved via standard browser download.';

                modalSavedPath.innerHTML = `
                    <div class="saved-file-info">💾 ${r.filename}</div>
                    ${r.pickerCancelled ? `<div class="picker-fallback-note">${fallbackMsg}</div>` : ''}
                    <button id="btn-download-video-again" class="btn btn-primary" style="margin-top: 6px; font-size: 11px; padding: 4px 12px; width: auto;">
                        ⬇️ ${(state.lang === 'ru') ? 'Скачать видео еще раз' : 'Download video again'}
                    </button>
                `;
                const btnAgain = document.getElementById('btn-download-video-again');
                if (btnAgain) {
                    btnAgain.onclick = () => exporter.downloadBlob(r.blob, r.filename);
                }
                btnCancelExport.textContent = (state.lang === 'ru') ? 'Закрыть' : 'Close';

                setTimeout(() => {
                    canvas.width = origWidth;
                    canvas.height = origHeight;
                    simulation.renderAtTime(state.currentTime);
                }, 1000);
            },
            onError: (err) => {
                // Only show error and restore if modal is still active (not already closed by cancel button)
                if (!exportModal.classList.contains('active')) return;
                modalStatus.textContent = `Error: ${err.message}`;
                setTimeout(() => {
                    exportModal.classList.remove('active');
                    canvas.width = origWidth;
                    canvas.height = origHeight;
                    simulation.renderAtTime(state.currentTime);
                }, 3000);
            }
        });

        if (res && res.cancelled) {
            exportModal.classList.remove('active');
            canvas.width = origWidth;
            canvas.height = origHeight;
            simulation.renderAtTime(state.currentTime);
            return;
        }
    });

    // 14. GIF Export Trigger
    if (btnExportGif) {
        btnExportGif.addEventListener('click', async () => {
            pausePlayback();

            const t = I18N[state.lang];
            exportModal.classList.add('active');
            document.getElementById('modal-title').textContent = t.modalTitleGif;
            modalPercent.textContent = '0%';
            progressBarFill.style.width = '0%';
            modalStatus.textContent = t.modalInitGif;
            modalSavedPath.style.display = 'none';
            btnCancelExport.textContent = t.btnCancelText;

            const res = await gifExporter.exportGif({
                duration: state.duration,
                fps: 15,
                width: state.gifResolution,
                askSaveLocation: state.askSaveLocation,
                onProgress: (p) => {
                    modalPercent.textContent = `${p.percent}%`;
                    progressBarFill.style.width = `${p.percent}%`;
                    modalStatus.textContent = p.status || '...';
                },
                onComplete: (r) => {
                    modalStatus.textContent = t.modalDoneGif;
                    modalSavedPath.style.display = 'flex';
                    const fallbackMsg = (state.lang === 'ru')
                        ? '⚠️ Внимание: Браузер блокирует сохранение напрямую в корень диска (D:\\, C:\\). Файл сохранен через стандартную загрузку браузера (в папку «Загрузки»), либо сохраняйте в любую подпапку.'
                        : '⚠️ Note: Browser blocks saving directly to root drive (D:\\, C:\\). File was saved via standard browser download.';

                    modalSavedPath.innerHTML = `
                        <div class="saved-file-info">💾 ${r.filename} (${(r.size / 1024).toFixed(0)} KB)</div>
                        ${r.pickerCancelled ? `<div class="picker-fallback-note">${fallbackMsg}</div>` : ''}
                        <button id="btn-download-gif-again" class="btn btn-primary" style="margin-top: 6px; font-size: 11px; padding: 4px 12px; width: auto;">
                            ⬇️ ${(state.lang === 'ru') ? 'Скачать файл еще раз' : 'Download file again'}
                        </button>
                    `;
                    const btnAgain = document.getElementById('btn-download-gif-again');
                    if (btnAgain) {
                        btnAgain.onclick = () => gifExporter.downloadBlob(r.blob, r.filename);
                    }
                    btnCancelExport.textContent = (state.lang === 'ru') ? 'Закрыть' : 'Close';
                },
                onError: (err) => {
                    if (!exportModal.classList.contains('active')) return;
                    modalStatus.textContent = `Error: ${err.message}`;
                    setTimeout(() => {
                        exportModal.classList.remove('active');
                    }, 3000);
                }
            });

            if (res && res.cancelled) {
                exportModal.classList.remove('active');
            }
        });
    }

    btnCancelExport.addEventListener('click', () => {
        exporter.cancel();
        if (typeof gifExporter !== 'undefined') {
            gifExporter.cancel();
        }
        exportModal.classList.remove('active');
        updateCanvasDimensions(); // Restores correct canvas size based on current aspect mode
        simulation.renderAtTime(state.currentTime);
    });

    // Initial render & apply language
    setLanguage(state.lang);
    simulation.renderAtTime(0);
    updateUI();
});
