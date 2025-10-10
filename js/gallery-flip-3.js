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

        // DOM элементы
        this.bookContainer = document.getElementById('book');
        this.currentPhotoSpan = document.getElementById('currentPhoto');
        this.totalPhotosSpan = document.getElementById('totalPhotos');
        this.progressSlider = document.getElementById('progressSlider');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.gridBtn = document.getElementById('gridBtn');
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
     * Инициализация библиотеки PageFlip
     */
    initPageFlip() {
        const isMobile = window.innerWidth <= 768;

        // Простой расчет размера
        let width, height;

        if (isMobile) {
            // На мобильных - одна страница
            width = Math.min(window.innerWidth - 40, 400);
            height = Math.min(window.innerHeight - 200, width * 1.4);
        } else {
            // На десктопе - разворот
            height = Math.min(window.innerHeight - 200, 700);
            width = Math.min((window.innerWidth - 100) / 2, height * 0.7);
        }

        this.pageFlip = new St.PageFlip(this.bookContainer, {
            width: Math.floor(width),
            height: Math.floor(height),
            size: 'fixed',
            minWidth: 200,
            maxWidth: 1000,
            minHeight: 250,
            maxHeight: 1000,
            showCover: true,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            usePortrait: isMobile,
            startPage: 0,
            drawShadow: true,
            flippingTime: 1000,
            useMouseEvents: true,
            autoSize: false,
            maxShadowOpacity: 0.5,
            showPageCorners: true,
            disableFlipByClick: false
        });

        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // События перелистывания
        this.pageFlip.on('flip', (e) => {
            this.currentPage = e.data;
            this.updateControls();
        });

        this.pageFlip.on('changeOrientation', () => {
            this.pageFlip.updateFromHtml();
        });

        this.pageFlip.on('changeState', () => {
            // Обработка изменения состояния
        });
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
     * Обработка изменения размера окна
     */
    handleResize() {
        if (!this.pageFlip) return;

        const isMobile = window.innerWidth <= 768;
        let width, height;

        if (isMobile) {
            width = Math.min(window.innerWidth - 40, 400);
            height = Math.min(window.innerHeight - 200, width * 1.4);
        } else {
            height = Math.min(window.innerHeight - 200, 700);
            width = Math.min((window.innerWidth - 100) / 2, height * 0.7);
        }

        const currentPage = this.currentPage;
        this.pageFlip.destroy();

        this.pageFlip = new St.PageFlip(this.bookContainer, {
            width: Math.floor(width),
            height: Math.floor(height),
            size: 'fixed',
            minWidth: 200,
            maxWidth: 1000,
            minHeight: 250,
            maxHeight: 1000,
            showCover: true,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            usePortrait: isMobile,
            startPage: currentPage,
            drawShadow: true,
            flippingTime: 1000,
            useMouseEvents: true,
            autoSize: false,
            maxShadowOpacity: 0.5,
            showPageCorners: true,
            disableFlipByClick: false
        });

        this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        this.pageFlip.on('flip', (e) => {
            this.currentPage = e.data;
            this.updateControls();
        });

        this.pageFlip.on('changeOrientation', () => {
            this.pageFlip.updateFromHtml();
        });

        this.updateControls();
    }
}

// ==========================================
// Инициализация
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Массив путей к фотографиям для Главы 3
    // Первая картинка - передняя обложка, последняя - задняя обложка
    const photos = [
        'img/1.png',   // Передняя обложка
        'img/1.png'    // Задняя обложка (дублируем первую картинку)
    ];

    // Создание экземпляра flipbook
    new PhotoFlipbook(photos);
});
