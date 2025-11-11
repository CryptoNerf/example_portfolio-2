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

        // DOM элементы
        this.bookContainer = document.getElementById('book');
        this.bookWrapper = document.querySelector('.book-wrapper');
        this.currentPhotoSpan = document.getElementById('currentPhoto');
        this.totalPhotosSpan = document.getElementById('totalPhotos');
        this.progressSlider = document.getElementById('progressSlider');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.gridBtn = document.getElementById('gridBtn');
        this.rotateBtn = document.getElementById('rotateBtn');
        this.gridModal = document.getElementById('gridModal');
        this.gridContainer = document.getElementById('gridContainer');
        this.closeGridBtn = document.getElementById('closeGrid');

        this.init();
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

        this.photos.forEach((photo, index) => {
            const page = document.createElement('div');
            page.className = 'page';
            page.dataset.density = 'hard';

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `Фото ${index + 1}`;
            img.draggable = false;

            page.appendChild(img);
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

        // Обновление активной миниатюры
        this.updateActiveThumbnail();
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

        // Клавиатура
        document.addEventListener('keydown', (e) => {
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
    photos.push('img/glava1/1.jpg');

    // Добавляем развороты: левые и правые страницы
    for (let i = 2; i <= 48; i++) {
        const num = i.toString().padStart(2, '0');

        // Левая страница (если существует)
        const leftPath = `img/glava1/${num}_left.jpg`;
        photos.push(leftPath);

        // Правая страница
        const rightPath = `img/glava1/${num}_right.jpg`;
        photos.push(rightPath);
    }

    // Задняя обложка (дублируем обложку)
    photos.push('img/glava1/1.jpg');

    console.log('Всего страниц в книге:', photos.length);

    // Создание экземпляра flipbook
    const flipbook = new PhotoFlipbook(photos);
});
