/**
 * PDF Flipbook Viewer
 * Компонент для просмотра PDF с эффектом перелистывания страниц
 */

class PDFFlipbook {
    constructor(pdfUrl) {
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.pageCache = new Map(); // Кэш отрисованных страниц
        this.isFlipping = false; // Флаг анимации
        this.isMobile = window.innerWidth <= 768;

        // DOM элементы
        this.elements = {
            book: document.getElementById('book'),
            pageLeft: document.getElementById('pageLeft'),
            pageRight: document.getElementById('pageRight'),
            pageInfo: document.getElementById('pageInfo'),
            loader: document.getElementById('loader'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            fullscreen: document.getElementById('fullscreen'),
            leftWrapper: document.querySelector('.page-wrapper.left'),
            rightWrapper: document.querySelector('.page-wrapper.right')
        };

        this.init();
    }

    /**
     * Инициализация компонента
     */
    async init() {
        try {
            // Настройка PDF.js Worker
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            console.log('Загрузка PDF:', this.pdfUrl);

            // Загрузка PDF документа
            await this.loadPDF();

            // Отрисовка первого разворота
            await this.renderSpread();

            // Инициализация элементов управления
            this.initControls();

            // Touch-события для мобильных устройств
            this.initTouchEvents();

            // Обработка изменения размера окна
            this.initResizeHandler();

            // Скрыть прелоадер
            this.elements.loader.classList.add('hidden');

            console.log('PDF Flipbook инициализирован успешно');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Не удалось загрузить PDF документ');
        }
    }

    /**
     * Загрузка PDF документа
     */
    async loadPDF() {
        try {
            const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            console.log(`PDF загружен успешно: ${this.totalPages} страниц`);
        } catch (error) {
            console.error('Ошибка загрузки PDF:', error);
            throw new Error('Не удалось загрузить PDF файл');
        }
    }

    /**
     * Отрисовка одной страницы
     */
    async renderPage(pageNum, canvas) {
        // Проверка валидности номера страницы
        if (pageNum < 1 || pageNum > this.totalPages) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Проверка кэша
        const cacheKey = `${pageNum}_${this.scale}`;
        if (this.pageCache.has(cacheKey)) {
            const cached = this.pageCache.get(cacheKey);
            const ctx = canvas.getContext('2d');
            canvas.width = cached.width;
            canvas.height = cached.height;
            ctx.drawImage(cached, 0, 0);
            return;
        }

        try {
            // Получение страницы из PDF
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });

            // Настройка canvas
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const ctx = canvas.getContext('2d');
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            // Рендеринг страницы
            await page.render(renderContext).promise;

            // Кэширование отрисованной страницы
            try {
                const imageBitmap = await createImageBitmap(canvas);
                this.pageCache.set(cacheKey, imageBitmap);

                // Ограничение размера кэша (максимум 15 страниц)
                if (this.pageCache.size > 15) {
                    const firstKey = this.pageCache.keys().next().value;
                    this.pageCache.delete(firstKey);
                }
            } catch (e) {
                console.warn('Кэширование недоступно:', e);
            }

            // Предзагрузка следующих страниц
            this.prefetchPages(pageNum);

        } catch (error) {
            console.error(`Ошибка рендеринга страницы ${pageNum}:`, error);
        }
    }

    /**
     * Отрисовка разворота (две страницы)
     */
    async renderSpread() {
        const leftPage = this.currentPage;
        const rightPage = this.isMobile ? leftPage : leftPage + 1;

        try {
            await Promise.all([
                this.renderPage(leftPage, this.elements.pageLeft),
                !this.isMobile && this.renderPage(rightPage, this.elements.pageRight)
            ]);

            this.updatePageInfo();
        } catch (error) {
            console.error('Ошибка отрисовки разворота:', error);
        }
    }

    /**
     * Предзагрузка следующих страниц (lazy loading)
     */
    prefetchPages(currentPage) {
        // Предзагружаем 3 страницы вперед
        const pagesToPrefetch = 3;

        for (let i = 1; i <= pagesToPrefetch; i++) {
            const nextPage = currentPage + i;
            const cacheKey = `${nextPage}_${this.scale}`;

            if (nextPage <= this.totalPages && !this.pageCache.has(cacheKey)) {
                const tempCanvas = document.createElement('canvas');
                this.renderPage(nextPage, tempCanvas);
            }
        }
    }

    /**
     * Переход на следующую страницу
     */
    async nextPage() {
        if (this.isFlipping) return;

        const increment = this.isMobile ? 1 : 2;
        if (this.currentPage + increment > this.totalPages) return;

        this.isFlipping = true;

        // Анимация перелистывания
        const wrapper = this.isMobile ? this.elements.leftWrapper : this.elements.rightWrapper;
        wrapper.classList.add('flipping-right');

        setTimeout(async () => {
            this.currentPage += increment;
            await this.renderSpread();
            wrapper.classList.remove('flipping-right');
            this.isFlipping = false;
        }, 900);
    }

    /**
     * Переход на предыдущую страницу
     */
    async prevPage() {
        if (this.isFlipping) return;

        const increment = this.isMobile ? 1 : 2;
        if (this.currentPage <= 1) return;

        this.isFlipping = true;

        // Анимация перелистывания
        const wrapper = this.isMobile ? this.elements.rightWrapper : this.elements.leftWrapper;
        wrapper.classList.add('flipping-left');

        setTimeout(async () => {
            this.currentPage = Math.max(1, this.currentPage - increment);
            await this.renderSpread();
            wrapper.classList.remove('flipping-left');
            this.isFlipping = false;
        }, 900);
    }

    /**
     * Обновление информации о текущей странице
     */
    updatePageInfo() {
        const displayPage = this.isMobile
            ? `${this.currentPage} / ${this.totalPages}`
            : `${this.currentPage}-${Math.min(this.currentPage + 1, this.totalPages)} / ${this.totalPages}`;

        this.elements.pageInfo.textContent = displayPage;
    }

    /**
     * Масштабирование
     */
    async zoom(delta) {
        const newScale = this.scale + delta;

        // Ограничение масштаба от 0.5x до 3x
        if (newScale < 0.5 || newScale > 3) return;

        this.scale = newScale;
        this.pageCache.clear(); // Очистка кэша при изменении масштаба

        await this.renderSpread();

        console.log('Масштаб изменен:', this.scale.toFixed(2));
    }

    /**
     * Переключение полноэкранного режима
     */
    toggleFullscreen() {
        const container = document.querySelector('.flipbook-container');

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Ошибка входа в полноэкранный режим:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Инициализация элементов управления
     */
    initControls() {
        // Кнопки навигации
        this.elements.nextBtn.addEventListener('click', () => this.nextPage());
        this.elements.prevBtn.addEventListener('click', () => this.prevPage());

        // Масштабирование
        this.elements.zoomIn.addEventListener('click', () => this.zoom(0.2));
        this.elements.zoomOut.addEventListener('click', () => this.zoom(-0.2));

        // Полноэкранный режим
        this.elements.fullscreen.addEventListener('click', () => this.toggleFullscreen());

        // Клавиатурные shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isFlipping) return;

            switch(e.key) {
                case 'ArrowRight':
                    this.nextPage();
                    break;
                case 'ArrowLeft':
                    this.prevPage();
                    break;
                case '+':
                case '=':
                    this.zoom(0.2);
                    break;
                case '-':
                case '_':
                    this.zoom(-0.2);
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
            }
        });
    }

    /**
     * Touch-события для мобильных устройств
     */
    initTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;

        // Touch start
        this.elements.book.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // Touch end - свайп навигация
        this.elements.book.addEventListener('touchend', (e) => {
            if (this.isFlipping) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Определяем направление свайпа
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                // Горизонтальный свайп
                if (diffX > 0) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            }
        }, { passive: true });

        // Pinch-to-zoom
        let lastDistance = 0;

        this.elements.book.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();

                const distance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                if (lastDistance > 0) {
                    const delta = distance > lastDistance ? 0.05 : -0.05;
                    this.zoom(delta);
                }

                lastDistance = distance;
            }
        }, { passive: false });

        this.elements.book.addEventListener('touchend', () => {
            lastDistance = 0;
        }, { passive: true });
    }

    /**
     * Обработка изменения размера окна
     */
    initResizeHandler() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth <= 768;

                // Перерисовка при переходе между режимами
                if (wasMobile !== this.isMobile) {
                    this.pageCache.clear();
                    this.renderSpread();
                }
            }, 250);
        });
    }

    /**
     * Отображение ошибки
     */
    showError(message) {
        const loader = this.elements.loader;
        loader.innerHTML = `
            <div style="color: #ff6b6b; font-size: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <div>${message}</div>
                <div style="margin-top: 20px; font-size: 16px;">
                    <a href="index.html" style="color: white; text-decoration: underline;">
                        Вернуться на главную
                    </a>
                </div>
            </div>
        `;
        loader.classList.remove('hidden');
    }
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFFlipbook;
}
