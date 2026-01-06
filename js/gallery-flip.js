/**
 * Фотогалерея с эффектом перелистывания книги
 * Использует библиотеку StPageFlip (page-flip)
 */

class PhotoFlipbook {
    constructor(photos) {
        this.photos = photos;
        this.pageFlip = null;
        this.currentPage = 0;
        this.totalPages = photos.length;
        this.isRotated = false; // Состояние поворота книги

        // Маппинг страниц к оригинальным разворотам из папки "новые сканы"
        this.createSpreadMapping();

        // Специальные индексы для эффекта hover страниц 27/28
        this.page27LeftIndex = null;
        this.page27RightIndex = null;
        this.page28Images = { left: null, right: null }; // Предзагруженные изображения
        this.findPage27Indices();

        // Режим увеличения
        this.zoomModeActive = false;
        this.currentZoomLevel = 1;
        this.zoomStep = 0.25;
        this.minZoom = 1;
        this.maxZoom = 3;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.imageOffsetX = 0;
        this.imageOffsetY = 0;
        this.imageRotation = 0; // Угол поворота изображения в градусах

        // Флаг для отслеживания анимации страниц 27/28
        this.page27AnimationTriggered = false;

        // DOM элементы
        this.bookContainer = document.getElementById('book');
        this.bookWrapper = document.querySelector('.book-wrapper');
        this.zoomOverlay = document.getElementById('zoomOverlay');
        this.currentPhotoSpan = document.getElementById('currentPhoto');
        this.totalPhotosSpan = document.getElementById('totalPhotos');
        this.progressSlider = document.getElementById('progressSlider');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.gridBtn = document.getElementById('gridBtn');
        this.rotateBtn = document.getElementById('rotateBtn');
        this.zoomBtn = document.getElementById('zoomBtn');
        this.gridModal = document.getElementById('gridModal');
        this.gridContainer = document.getElementById('gridContainer');
        this.closeGridBtn = document.getElementById('closeGrid');

        // Элементы модального окна увеличения
        this.zoomModal = document.getElementById('zoomModal');
        this.zoomContainer = document.getElementById('zoomContainer');
        this.zoomImage = document.getElementById('zoomImage');
        this.closeZoomBtn = document.getElementById('closeZoom');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.rotateImageBtn = document.getElementById('rotateImageBtn');
        this.zoomResetBtn = document.getElementById('zoomResetBtn');
        this.zoomLevelSpan = document.getElementById('zoomLevel');

        this.init();
    }

    /**
     * Создание маппинга страниц к оригинальным разворотам
     */
    createSpreadMapping() {
        // Маппинг: индекс страницы -> путь к оригинальному развороту
        this.spreadMapping = {
            0: 'новые сканы/01 обложка.jpg',
            1: 'новые сканы/02 new.jpg', 2: 'новые сканы/02 new.jpg',
            3: 'новые сканы/03 new.jpg', 4: 'новые сканы/03 new.jpg',
            5: 'новые сканы/04.jpg', 6: 'новые сканы/04.jpg',
            7: 'новые сканы/04аЗЕЛ.jpg', 8: 'новые сканы/04аЗЕЛ.jpg',
            9: 'новые сканы/05 БУДЕТ МЕН.jpg', 10: 'новые сканы/05 БУДЕТ МЕН.jpg',
            11: 'новые сканы/07-а ЗЕЛ КАЛЬКА.jpg', 12: 'новые сканы/07-а ЗЕЛ КАЛЬКА.jpg',
            13: 'новые сканы/08.jpg', 14: 'новые сканы/08.jpg',
            15: 'новые сканы/9без.jpg', 16: 'новые сканы/9без.jpg',
            17: 'новые сканы/9 ДО.jpg', 18: 'новые сканы/9 ДО.jpg',
            19: 'новые сканы/11 .jpg', 20: 'новые сканы/11 .jpg',
            21: 'новые сканы/11а.jpg', 22: 'новые сканы/11а.jpg',
            23: 'новые сканы/11б.jpg', 24: 'новые сканы/11б.jpg',
            25: 'новые сканы/12 ЗЕЛ КАЛЬКА.jpg', 26: 'новые сканы/12 ЗЕЛ КАЛЬКА.jpg',
            27: 'новые сканы/13 new.jpg', 28: 'новые сканы/13 new.jpg',
            29: 'новые сканы/14 new.jpg', 30: 'новые сканы/14 new.jpg',
            31: 'новые сканы/15 new.jpg', 32: 'новые сканы/15 new.jpg',
            33: 'новые сканы/20без.jpg', 34: 'новые сканы/20без.jpg',
            35: 'новые сканы/21.jpg', 36: 'новые сканы/21.jpg',
            37: 'новые сканы/22 new.jpg', 38: 'новые сканы/22 new.jpg',
            39: 'новые сканы/23 ЗЕЛ ВСЕ.jpg', 40: 'новые сканы/23 ЗЕЛ ВСЕ.jpg',
            41: 'новые сканы/24.jpg', 42: 'новые сканы/24.jpg',
            43: 'новые сканы/25.jpg', 44: 'новые сканы/25.jpg',
            45: 'новые сканы/26.jpg', 46: 'новые сканы/26.jpg',
            47: 'новые сканы/27.jpg', 48: 'новые сканы/27.jpg',
            49: 'новые сканы/28а.jpg', 50: 'новые сканы/28а.jpg',
            51: 'новые сканы/28б.jpg', 52: 'новые сканы/28б.jpg',
            53: 'новые сканы/29.jpg', 54: 'новые сканы/29.jpg',
            55: 'новые сканы/30аБ ЗЕЛ КАЛЬК.jpg', 56: 'новые сканы/30аБ ЗЕЛ КАЛЬК.jpg',
            57: 'новые сканы/30бЗЕЛ ВСЕ.jpg', 58: 'новые сканы/30бЗЕЛ ВСЕ.jpg',
            59: 'новые сканы/30г.jpg', 60: 'новые сканы/30г.jpg',
            61: 'новые сканы/36.jpg', 62: 'новые сканы/36.jpg',
            63: 'новые сканы/37.jpg', 64: 'новые сканы/37.jpg',
            65: 'новые сканы/38 без.jpg', 66: 'новые сканы/38 без.jpg',
            67: 'новые сканы/39 new.jpg', 68: 'новые сканы/39 new.jpg',
            69: 'новые сканы/40.jpg', 70: 'новые сканы/40.jpg',
            71: 'новые сканы/41.jpg', 72: 'новые сканы/41.jpg',
            73: 'новые сканы/42.jpg', 74: 'новые сканы/42.jpg',
            75: 'новые сканы/43 без ЗЕЛ КАЛЬК.jpg', 76: 'новые сканы/43 без ЗЕЛ КАЛЬК.jpg',
            77: 'новые сканы/43 без.jpg', 78: 'новые сканы/43 без.jpg',
            79: 'новые сканы/45 посл этот.jpg', 80: 'новые сканы/45 посл этот.jpg',
            81: 'новые сканы/46 обложка2.jpg'
        };
    }

    /**
     * Поиск индексов страниц 27_left и 27_right в массиве photos
     */
    findPage27Indices() {
        this.photos.forEach((path, index) => {
            if (path.includes('27_left.jpg')) {
                this.page27LeftIndex = index;
            } else if (path.includes('27_right.jpg')) {
                this.page27RightIndex = index;
            }
        });
        console.log('Индексы страниц 27:', this.page27LeftIndex, this.page27RightIndex);
    }

    /**
     * Предзагрузка изображений 28_left и 28_right для мгновенного показа
     */
    preloadPage28Images() {
        this.page28Images.left = new Image();
        this.page28Images.left.src = 'img/glava1/28_left.jpg';

        this.page28Images.right = new Image();
        this.page28Images.right.src = 'img/glava1/28_right.jpg';

        console.log('Изображения страницы 28 предзагружены');
    }

    /**
     * Инициализация flipbook
     */
    async init() {
        try {
            // Создание HTML страниц для книги
            this.createBookPages();

            // Инициализация PageFlip
            this.initPageFlip();

            // Установка начальных значений
            this.totalPhotosSpan.textContent = this.totalPages;
            this.progressSlider.max = this.totalPages - 1;

            // Создание сетки миниатюр
            this.createThumbnailGrid();

            // Предзагрузка изображений для эффекта 27/28
            this.preloadPage28Images();

            // Инициализация событий
            this.initEvents();

            console.log('PhotoFlipbook инициализирован:', this.totalPages, 'фото');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        }
    }

    /**
     * Создание HTML-страниц для книги
     */
    createBookPages() {
        this.bookContainer.innerHTML = '';

        // Список страниц с эффектом зеленения
        const greenPages = [
            '05_left.jpg', '05_right.jpg',
            '07_right.jpg',
            '14_right.jpg',
            '21_left.jpg', '21_right.jpg',
            '29_right.jpg',
            '30_left.jpg', '30_right.jpg',
            '39_left.jpg'
        ];

        this.photos.forEach((photo, index) => {
            const page = document.createElement('div');
            page.className = 'page';
            page.dataset.density = 'hard';

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `Фото ${index + 1}`;
            img.draggable = false;

            page.appendChild(img);

            // Добавляем зеленый overlay если страница в списке
            const shouldBeGreen = greenPages.some(greenPage => photo.includes(greenPage));
            if (shouldBeGreen) {
                const greenOverlay = document.createElement('div');
                greenOverlay.className = 'green-page-overlay';
                page.appendChild(greenOverlay);
                console.log('Добавлен зеленый overlay для:', photo);
            }

            this.bookContainer.appendChild(page);
        });
    }

    /**
     * Вычисление размеров книги
     * Использует процентный подход для адаптации к любым экранам
     */
    calculateBookDimensions() {
        let vw = window.innerWidth;
        let vh = window.innerHeight;

        // Если книга повёрнута, меняем местами ширину и высоту для расчётов
        // Так как CSS поворачивает контейнер, нужно думать в системе координат повёрнутой книги
        if (this.isRotated) {
            [vw, vh] = [vh, vw];
        }

        // Высота элементов UI (кнопка назад + панель управления + отступы)
        const topOffset = 80;    // Кнопка назад + отступ сверху
        const bottomOffset = 140; // Панель управления + отступ снизу
        const availableHeight = vh - topOffset - bottomOffset;

        let pageWidth, pageHeight;

        // Определяем тип устройства на основе минимальной стороны экрана
        // Это гарантирует что вертикальный телефон останется "мобильным" даже при повороте
        const originalWidth = Math.min(window.innerWidth, window.innerHeight);

        console.log('Тип устройства: originalWidth=', originalWidth, 'isRotated=', this.isRotated);

        // Мобильные устройства (до 768px по минимальной стороне)
        if (originalWidth <= 768) {
            if (this.isRotated) {
                // Для повёрнутой книги - используем реальные размеры экрана
                // vw и vh уже поменяны местами выше
                // vw = высота экрана, vh = ширина экрана

                console.log('ПОВОРОТ: vw=', vw, 'vh=', vh, 'realWidth=', window.innerWidth, 'realHeight=', window.innerHeight);

                // После поворота на -90°:
                // pageWidth станет вертикальным размером (используем высоту экрана - vw)
                // pageHeight станет горизонтальным размером (используем ширину экрана - vh)

                // После поворота на -90°:
                // pageWidth станет ВЕРТИКАЛЬНЫМ размером (высота книги на экране)
                // pageHeight станет ГОРИЗОНТАЛЬНЫМ размером (ширина книги на экране)

                const topSpace = 80;     // Кнопка назад + отступ сверху
                const bottomSpace = 200; // Панель управления + большой отступ снизу
                const totalUISpace = topSpace + bottomSpace; // 280px

                // Для горизонтальных фото нужно соотношение pageHeight:pageWidth ≈ 1.5:1
                // Чтобы после поворота на -90° получилось 1:1.5 (горизонтально)

                // Начинаем с горизонтального размера (станет шириной после поворота)
                pageHeight = Math.floor(vh * 0.70);

                // Вычисляем вертикальный размер из соотношения 1.5:1
                // pageHeight / pageWidth = 1.5, значит pageWidth = pageHeight / 1.5
                pageWidth = Math.floor(pageHeight / 1.5);

                // Проверяем что разворот помещается по вертикали
                const spreadHeight = pageWidth * 2;
                if (spreadHeight > (vw - totalUISpace)) {
                    // Если не помещается, пересчитываем от доступной высоты
                    pageWidth = Math.floor((vw - totalUISpace) * 0.47);
                    pageHeight = Math.floor(pageWidth * 1.5);
                }

                console.log('РАСЧЁТ: pageWidth=', pageWidth, 'pageHeight=', pageHeight, 'разворот=', pageWidth * 2, 'ratio=', (pageHeight/pageWidth).toFixed(2));
            } else {
                // Обычная ориентация
                const mobileBottomOffset = 180;
                const mobileAvailableHeight = vh - topOffset - mobileBottomOffset;

                // Используем 85% доступной высоты
                pageHeight = Math.floor(mobileAvailableHeight * 0.85);

                // Соотношение сторон 1:1.4 (портрет)
                pageWidth = Math.floor(pageHeight / 1.4);

                // Но не больше 42% ширины экрана
                const maxWidth = Math.floor(vw * 0.42);
                if (pageWidth > maxWidth) {
                    pageWidth = maxWidth;
                    pageHeight = Math.floor(pageWidth * 1.4);
                }
            }
        }
        // Планшеты (769-1024px по исходной ширине)
        else if (originalWidth <= 1024) {
            console.log('ПЛАНШЕТ: vw=', vw, 'vh=', vh, 'availableHeight=', availableHeight);

            // Если книга повёрнута, используем больше пространства
            const heightPercent = this.isRotated ? 0.95 : 0.95;
            const maxWidthPercent = this.isRotated ? 0.44 : 0.45;

            // Используем 95% доступной высоты
            pageHeight = Math.floor(availableHeight * heightPercent);

            // Соотношение сторон 1:1.4
            pageWidth = Math.floor(pageHeight / 1.4);

            console.log('РАСЧЁТ ОТ ВЫСОТЫ: pageWidth=', pageWidth, 'pageHeight=', pageHeight);

            // Ограничение по ширине: не больше 45-48% экрана на одну страницу
            const maxWidth = Math.floor(vw * maxWidthPercent);
            console.log('maxWidth=', maxWidth, 'maxWidthPercent=', maxWidthPercent);

            if (pageWidth > maxWidth) {
                pageWidth = maxWidth;
                pageHeight = Math.floor(pageWidth * 1.4);
                console.log('ОГРАНИЧЕНО ПО ШИРИНЕ: pageWidth=', pageWidth, 'pageHeight=', pageHeight);
            }

            console.log('ИТОГО ПЛАНШЕТ: pageWidth=', pageWidth, 'pageHeight=', pageHeight, 'разворот=', pageWidth * 2);
        }
        // Десктоп (> 1024px по исходной ширине)
        else {
            console.log('ДЕСКТОП: vw=', vw, 'vh=', vh, 'availableHeight=', availableHeight);

            // Если книга повёрнута, используем больше пространства
            const heightPercent = this.isRotated ? 0.98 : 0.98;
            const maxWidthPercent = this.isRotated ? 0.45 : 0.48;

            // Используем 98% доступной высоты
            pageHeight = Math.floor(availableHeight * heightPercent);

            // Соотношение сторон 1:1.4
            pageWidth = Math.floor(pageHeight / 1.4);

            console.log('РАСЧЁТ ОТ ВЫСОТЫ: pageWidth=', pageWidth, 'pageHeight=', pageHeight);

            // Ограничение: одна страница не больше 48-49% ширины экрана
            const maxWidth = Math.floor(vw * maxWidthPercent);
            console.log('maxWidth=', maxWidth, 'maxWidthPercent=', maxWidthPercent);

            if (pageWidth > maxWidth) {
                pageWidth = maxWidth;
                pageHeight = Math.floor(pageWidth * 1.4);
                console.log('ОГРАНИЧЕНО ПО ШИРИНЕ: pageWidth=', pageWidth, 'pageHeight=', pageHeight);
            }

            // Минимальные размеры для десктопа
            if (pageWidth < 500) pageWidth = 500;
            if (pageHeight < 700) pageHeight = 700;

            console.log('ИТОГО ДЕСКТОП: pageWidth=', pageWidth, 'pageHeight=', pageHeight, 'разворот=', pageWidth * 2);
        }

        return {
            width: pageWidth,
            height: pageHeight
        };
    }

    /**
     * Инициализация библиотеки PageFlip
     */
    initPageFlip() {
        const { width, height } = this.calculateBookDimensions();

        console.log('Инициализация книги:', width, 'x', height);

        this.pageFlip = new St.PageFlip(this.bookContainer, {
            width: width,
            height: height,
            size: 'fixed',
            showCover: true,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            usePortrait: false,
            startPage: 0,
            drawShadow: false,
            flippingTime: 1000,
            useMouseEvents: true,
            maxShadowOpacity: 0,
            showPageCorners: true,
            disableFlipByClick: false
        });

        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // События перелистывания
        this.pageFlip.on('flip', (e) => {
            this.currentPage = e.data;
            this.updateControls();
            this.adjustBookWrapper();
            // Триггер анимации страниц 27/28 - ОТКЛЮЧЕНО
            // this.checkAndTriggerPage27Animation();
        });

        this.pageFlip.on('changeState', () => {
            // Обработка изменения состояния
        });

        // Устанавливаем начальный размер для обложки
        setTimeout(() => this.adjustBookWrapper(), 100);
    }

    /**
     * Обновление элементов управления
     */
    updateControls() {
        this.currentPhotoSpan.textContent = this.currentPage + 1;
        this.progressSlider.value = this.currentPage;

        // Обновление кнопок
        this.prevPageBtn.disabled = this.currentPage === 0;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages - 1;

        // Обновление цвета кнопки поворота
        this.updateRotateButtonColor();

        // Обновление активной миниатюры
        this.updateActiveThumbnail();
    }

    /**
     * Обновление цвета кнопки поворота (зелёная на разворотах требующих поворота)
     */
    updateRotateButtonColor() {
        // Страницы, которые требуют поворота: 15, 16, 17, 33 (left и right)
        // Индексы в массиве photos:
        // 15_left=27, 15_right=28, 16_left=29, 16_right=30, 17_left=31, 17_right=32, 33_left=63, 33_right=64
        const rotationRequiredPages = [27, 28, 29, 30, 31, 32, 63, 64];

        if (rotationRequiredPages.includes(this.currentPage)) {
            this.rotateBtn.classList.add('green');
        } else {
            this.rotateBtn.classList.remove('green');
        }
    }

    /**
     * Подстройка размера book-wrapper под обложку или разворот
     */
    adjustBookWrapper() {
        const stfWrapper = this.bookContainer.querySelector('.stf__wrapper');
        if (!stfWrapper) return;

        const { width } = this.calculateBookDimensions();

        // Если первая страница (передняя обложка)
        if (this.currentPage === 0) {
            // Сдвигаем wrapper влево на половину ширины страницы
            stfWrapper.style.transform = `translateX(-${width / 2}px)`;
        }
        // Если последняя страница (задняя обложка)
        else if (this.currentPage === this.totalPages - 1) {
            // Сдвигаем wrapper вправо на половину ширины страницы
            stfWrapper.style.transform = `translateX(${width / 2}px)`;
        }
        else {
            // Разворот - возвращаем на место
            stfWrapper.style.transform = 'translateX(0)';
        }
    }


    /**
     * Инициализация событий
     */
    initEvents() {
        // Навигация по кнопкам
        this.prevPageBtn.addEventListener('click', () => this.flipToPrevious());
        this.nextPageBtn.addEventListener('click', () => this.flipToNext());

        // Слайдер
        this.progressSlider.addEventListener('input', (e) => {
            const page = parseInt(e.target.value);
            this.flipToPage(page);
        });

        // Сетка
        this.gridBtn.addEventListener('click', () => this.openGrid());
        this.closeGridBtn.addEventListener('click', () => this.closeGrid());
        this.gridModal.addEventListener('click', (e) => {
            if (e.target === this.gridModal) {
                this.closeGrid();
            }
        });

        // Поворот книги
        this.rotateBtn.addEventListener('click', () => this.toggleRotation());

        // Режим увеличения
        this.zoomBtn.addEventListener('click', () => this.toggleZoomMode());

        // Клик по overlay в режиме увеличения
        this.zoomOverlay.addEventListener('click', (e) => this.handleOverlayClick(e));

        // Управление модальным окном увеличения
        this.closeZoomBtn.addEventListener('click', () => this.closeZoomModal());
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.rotateImageBtn.addEventListener('click', () => this.rotateImage());
        this.zoomResetBtn.addEventListener('click', () => this.resetZoom());

        // Перетаскивание изображения в модальном окне
        this.zoomContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        this.zoomContainer.addEventListener('mousemove', (e) => this.drag(e));
        this.zoomContainer.addEventListener('mouseup', () => this.endDrag());
        this.zoomContainer.addEventListener('mouseleave', () => this.endDrag());

        // Зум колесиком мыши
        this.zoomContainer.addEventListener('wheel', (e) => this.handleWheel(e));

        // Закрытие по клику на фон
        this.zoomModal.addEventListener('click', (e) => {
            if (e.target === this.zoomModal) {
                this.closeZoomModal();
            }
        });

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (this.zoomModal.classList.contains('active')) {
                if (e.key === 'Escape') this.closeZoomModal();
                return;
            }

            if (this.gridModal.classList.contains('active')) {
                if (e.key === 'Escape') this.closeGrid();
                return;
            }

            switch(e.key) {
                case 'ArrowLeft':
                    this.flipToPrevious();
                    break;
                case 'ArrowRight':
                    this.flipToNext();
                    break;
                case 'g':
                case 'G':
                    this.openGrid();
                    break;
                case 'z':
                case 'Z':
                    this.toggleZoomMode();
                    break;
            }
        });

        // Resize с debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 300);
        });
    }

    /**
     * Перелистнуть на следующую страницу
     */
    flipToNext() {
        if (this.currentPage < this.totalPages - 1) {
            this.pageFlip.flipNext();
        }
    }

    /**
     * Перелистнуть на предыдущую страницу
     */
    flipToPrevious() {
        if (this.currentPage > 0) {
            this.pageFlip.flipPrev();
        }
    }

    /**
     * Перелистнуть на конкретную страницу
     */
    flipToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.totalPages) {
            this.pageFlip.flip(pageIndex);
        }
    }

    /**
     * Создание сетки миниатюр
     */
    createThumbnailGrid() {
        this.gridContainer.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            if (index === this.currentPage) {
                gridItem.classList.add('active');
            }

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `Фото ${index + 1}`;
            img.loading = 'lazy';

            const photoNumber = document.createElement('div');
            photoNumber.className = 'photo-number';
            photoNumber.textContent = index + 1;

            gridItem.appendChild(img);
            gridItem.appendChild(photoNumber);

            gridItem.addEventListener('click', () => {
                this.flipToPage(index);
                this.closeGrid();
            });

            this.gridContainer.appendChild(gridItem);
        });
    }

    /**
     * Обновление активной миниатюры
     */
    updateActiveThumbnail() {
        const items = this.gridContainer.querySelectorAll('.grid-item');
        items.forEach((item, index) => {
            if (index === this.currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Открыть сетку
     */
    openGrid() {
        this.gridModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Прокрутка к активному элементу
        const activeItem = this.gridContainer.querySelector('.grid-item.active');
        if (activeItem) {
            setTimeout(() => {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    /**
     * Закрыть сетку
     */
    closeGrid() {
        this.gridModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Проверка и запуск анимации для страниц 27/28
     * Автоматически запускается при перелистывании на разворот 27
     */
    checkAndTriggerPage27Animation() {
        // Проверяем, находимся ли мы на развороте 27
        if (this.currentPage === this.page27LeftIndex &&
            this.page27LeftIndex !== null &&
            this.page27RightIndex !== null &&
            !this.page27AnimationTriggered) {

            // Запускаем анимацию через небольшую задержку для плавности
            setTimeout(() => {
                this.triggerPage27FadeIn();
            }, 300);
        }

        // Сбрасываем флаг если ушли со страницы 27
        if (this.currentPage !== this.page27LeftIndex) {
            this.page27AnimationTriggered = false;
            this.removePage27Overlays();
        }
    }

    /**
     * Запуск анимации появления страниц 28 поверх страниц 27
     */
    triggerPage27FadeIn() {
        // Получаем DOM элементы страниц 27
        const pages = this.bookContainer.querySelectorAll('.page');
        const page27Left = pages[this.page27LeftIndex];
        const page27Right = pages[this.page27RightIndex];

        if (!page27Left || !page27Right) return;

        // Создаем оверлеи для левой и правой страниц
        const overlayLeft = document.createElement('div');
        overlayLeft.className = 'page-overlay page-overlay-left';
        overlayLeft.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 3s ease-in-out;
            z-index: 10;
            pointer-events: none;
        `;

        const overlayRight = document.createElement('div');
        overlayRight.className = 'page-overlay page-overlay-right';
        overlayRight.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 3s ease-in-out;
            z-index: 10;
            pointer-events: none;
        `;

        // Создаем изображения для оверлеев
        const imgLeft = document.createElement('img');
        imgLeft.src = 'img/glava1/28_left.jpg';
        imgLeft.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;

        const imgRight = document.createElement('img');
        imgRight.src = 'img/glava1/28_right.jpg';
        imgRight.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;

        overlayLeft.appendChild(imgLeft);
        overlayRight.appendChild(imgRight);

        // Устанавливаем position: relative для родительских элементов
        page27Left.style.position = 'relative';
        page27Right.style.position = 'relative';

        // Добавляем оверлеи на страницы
        page27Left.appendChild(overlayLeft);
        page27Right.appendChild(overlayRight);

        // Запускаем анимацию через небольшую задержку
        setTimeout(() => {
            overlayLeft.style.opacity = '1';
            overlayRight.style.opacity = '1';
        }, 50);

        this.page27AnimationTriggered = true;
    }

    /**
     * Удаление оверлеев со страниц 27
     */
    removePage27Overlays() {
        const overlays = this.bookContainer.querySelectorAll('.page-overlay');
        overlays.forEach(overlay => overlay.remove());
    }

    /**
     * Переключение режима увеличения
     */
    toggleZoomMode() {
        this.zoomModeActive = !this.zoomModeActive;

        if (this.zoomModeActive) {
            this.zoomBtn.classList.add('active');
            this.bookWrapper.classList.add('zoom-mode');
            this.zoomBtn.title = 'Выключить режим увеличения';
        } else {
            this.zoomBtn.classList.remove('active');
            this.bookWrapper.classList.remove('zoom-mode');
            this.zoomBtn.title = 'Увеличить страницу';
        }
    }

    /**
     * Обработка клика по overlay в режиме увеличения
     * Открывает модальное окно с оригинальным разворотом
     */
    handleOverlayClick(e) {
        // Предотвращаем любое взаимодействие с книгой
        e.preventDefault();
        e.stopPropagation();

        console.log('Клик по overlay в режиме увеличения');

        // Определяем, по какой стороне книги кликнули
        const bookRect = this.bookWrapper.getBoundingClientRect();
        const bookCenterX = bookRect.left + bookRect.width / 2;
        const clickX = e.clientX;

        console.log('Клик X:', clickX, 'Центр книги X:', bookCenterX);

        let pageIndex;

        // Если первая страница (обложка) - всегда открываем её
        if (this.currentPage === 0) {
            pageIndex = 0;
        }
        // Если последняя страница (задняя обложка) - всегда открываем её
        else if (this.currentPage === this.totalPages - 1) {
            pageIndex = this.currentPage;
        }
        // Разворот - определяем левую или правую страницу
        else {
            if (clickX < bookCenterX) {
                // Клик по левой стороне - левая страница
                pageIndex = this.currentPage;
                console.log('Левая страница:', pageIndex);
            } else {
                // Клик по правой стороне - правая страница
                pageIndex = this.currentPage + 1;
                console.log('Правая страница:', pageIndex);
            }
        }

        // Проверяем что индекс корректный и есть маппинг к оригинальному развороту
        if (pageIndex >= 0 && pageIndex < this.photos.length && this.spreadMapping[pageIndex]) {
            const spreadPath = this.spreadMapping[pageIndex];
            console.log('Открываем оригинальный разворот:', spreadPath);
            this.openZoomModal(spreadPath);
            this.toggleZoomMode();
        }
    }

    /**
     * Открыть модальное окно увеличения
     */
    openZoomModal(imageSrc) {
        this.zoomImage.src = imageSrc;
        this.zoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetZoom();
    }

    /**
     * Закрыть модальное окно увеличения
     */
    closeZoomModal() {
        this.zoomModal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetZoom();
    }

    /**
     * Увеличить масштаб
     */
    zoomIn() {
        if (this.currentZoomLevel < this.maxZoom) {
            this.currentZoomLevel += this.zoomStep;
            this.applyZoom();
        }
    }

    /**
     * Уменьшить масштаб
     */
    zoomOut() {
        if (this.currentZoomLevel > this.minZoom) {
            this.currentZoomLevel -= this.zoomStep;
            if (this.currentZoomLevel < this.minZoom) {
                this.currentZoomLevel = this.minZoom;
            }
            this.applyZoom();
        }
    }

    /**
     * Сбросить масштаб
     */
    resetZoom() {
        this.currentZoomLevel = this.minZoom;
        this.imageOffsetX = 0;
        this.imageOffsetY = 0;
        this.imageRotation = 0;
        this.applyZoom();
    }

    /**
     * Повернуть изображение на 90 градусов
     */
    rotateImage() {
        this.imageRotation = (this.imageRotation + 90) % 360;
        this.applyZoom();
    }

    /**
     * Применить масштаб к изображению
     */
    applyZoom() {
        // Применяем трансформацию: сдвиг, масштабирование, поворот
        this.zoomImage.style.transform = `translate(${this.imageOffsetX}px, ${this.imageOffsetY}px) scale(${this.currentZoomLevel}) rotate(${this.imageRotation}deg)`;
        this.zoomLevelSpan.textContent = `${Math.round(this.currentZoomLevel * 100)}%`;

        // Добавляем класс для вертикальной ориентации при повороте на 90/270 градусов
        if (this.imageRotation === 90 || this.imageRotation === 270) {
            this.zoomImage.classList.add('rotated-vertical');
        } else {
            this.zoomImage.classList.remove('rotated-vertical');
        }

        // Всегда показываем курсор grab
        this.zoomContainer.style.cursor = 'grab';
    }

    /**
     * Начать перетаскивание изображения
     */
    startDrag(e) {
        // Игнорируем клики по кнопкам
        if (e.target.closest('button')) return;

        e.preventDefault();
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.zoomContainer.style.cursor = 'grabbing';
    }

    /**
     * Перетаскивание изображения
     */
    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        this.imageOffsetX += deltaX;
        this.imageOffsetY += deltaY;

        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        this.applyZoom();
    }

    /**
     * Завершить перетаскивание изображения
     */
    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.zoomContainer.style.cursor = 'grab';
        }
    }

    /**
     * Обработка колесика мыши для зума
     */
    handleWheel(e) {
        e.preventDefault();

        if (e.deltaY < 0) {
            // Прокрутка вверх - увеличение
            this.zoomIn();
        } else {
            // Прокрутка вниз - уменьшение
            this.zoomOut();
        }
    }

    /**
     * Переключение поворота книги
     */
    toggleRotation() {
        this.isRotated = !this.isRotated;

        if (this.isRotated) {
            this.bookWrapper.classList.add('rotated');
            this.rotateBtn.classList.add('active');
        } else {
            this.bookWrapper.classList.remove('rotated');
            this.rotateBtn.classList.remove('active');
        }

        // Пересоздаём книгу с новыми размерами
        this.recreateBook();
    }

    /**
     * Пересоздание книги (используется при resize и rotate)
     */
    recreateBook() {
        if (!this.pageFlip) return;

        const currentPage = this.currentPage;
        const { width, height } = this.calculateBookDimensions();

        console.log('Пересоздание книги:', width, 'x', height, this.isRotated ? '(повёрнута)' : '');

        // Очищаем старые обработчики событий
        try {
            if (this.pageFlip.off) {
                this.pageFlip.off('flip');
                this.pageFlip.off('changeState');
            }
        } catch (e) {
            console.warn('Не удалось очистить обработчики:', e);
        }

        // Полностью очищаем контейнер
        this.bookContainer.innerHTML = '';

        // Пересоздаём страницы
        this.createBookPages();

        // Создаём новый экземпляр PageFlip
        this.pageFlip = new St.PageFlip(this.bookContainer, {
            width: width,
            height: height,
            size: 'fixed',
            showCover: true,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            usePortrait: false,
            startPage: 0,
            drawShadow: false,
            flippingTime: 1000,
            useMouseEvents: true,
            maxShadowOpacity: 0,
            showPageCorners: true,
            disableFlipByClick: false
        });

        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Восстанавливаем события
        this.pageFlip.on('flip', (e) => {
            this.currentPage = e.data;
            this.updateControls();
            this.adjustBookWrapper();
            // Триггер анимации страниц 27/28 - ОТКЛЮЧЕНО
            // this.checkAndTriggerPage27Animation();
        });

        // Переходим на сохраненную страницу
        if (currentPage > 0) {
            setTimeout(() => {
                this.pageFlip.flip(currentPage);
            }, 100);
        }

        this.updateControls();

        // Подстраиваем wrapper через небольшую задержку
        setTimeout(() => {
            this.adjustBookWrapper();
        }, 150);

        console.log('Книга пересоздана:', width, 'x', height, this.isRotated ? '(повёрнута)' : '');
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize() {
        this.recreateBook();
    }
}

// ==========================================
// Инициализация
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Массив путей к фотографиям для разворотов книги
    const photos = [];

    // Передняя обложка
    photos.push('img/glava1/01_cover.jpg');

    // Добавляем развороты: левые и правые страницы
    for (let i = 2; i <= 41; i++) {
        const num = i.toString().padStart(2, '0');

        // Левая страница
        const leftPath = `img/glava1/${num}_left.jpg`;
        photos.push(leftPath);

        // Правая страница
        const rightPath = `img/glava1/${num}_right.jpg`;
        photos.push(rightPath);
    }

    // Задняя обложка
    photos.push('img/glava1/last_cover.jpg');

    console.log('Всего страниц в книге:', photos.length);

    // Создание экземпляра flipbook
    const flipbook = new PhotoFlipbook(photos);

    // Показ подсказки для поворота на развороте 27
    const rotateHint = document.getElementById('rotateHint');
    const rotateBtn = document.getElementById('rotateBtn');

    // Функция для позиционирования подсказки над кнопкой поворота
    function positionHintAboveRotateButton() {
        if (rotateBtn && rotateHint) {
            const btnRect = rotateBtn.getBoundingClientRect();
            const hintRect = rotateHint.getBoundingClientRect();

            // Вычисляем позицию: центр кнопки минус половина ширины подсказки
            const leftPosition = btnRect.left + (btnRect.width / 2) - (hintRect.width / 2);

            rotateHint.style.left = leftPosition + 'px';
            rotateHint.style.transform = 'none';
        }
    }

    if (rotateHint) {
        let hintShown = false;

        console.log('Инициализация подсказки. page27LeftIndex:', flipbook.page27LeftIndex);

        // Отслеживаем перелистывание страниц
        flipbook.pageFlip.on('flip', (e) => {
            const currentPage = e.data;

            console.log('Перелистывание на страницу:', currentPage, 'page27LeftIndex:', flipbook.page27LeftIndex);

            // Проверяем на 27 (номер страницы в книге, где появляется анимация 27/28)
            if (!hintShown && currentPage === 27) {
                console.log('Показываем подсказку для поворота!');

                // Показываем подсказку через небольшую задержку
                setTimeout(() => {
                    positionHintAboveRotateButton(); // Позиционируем перед показом
                    rotateHint.classList.add('visible');
                }, 500);

                // Скрываем через 5 секунд
                setTimeout(() => {
                    rotateHint.classList.remove('visible');
                    hintShown = true; // Показываем только один раз
                }, 5500);
            }
        });

        // Обновляем позицию при ресайзе окна
        window.addEventListener('resize', () => {
            if (rotateHint.classList.contains('visible')) {
                positionHintAboveRotateButton();
            }
        });
    }
});
