/**
 * Фотогалерея - JavaScript
 * Просмотр фотографий с навигацией и сеткой
 */

class PhotoGallery {
    constructor(photos) {
        this.photos = photos;
        this.currentIndex = 0;
        this.totalPhotos = photos.length;

        // DOM элементы
        this.mainImage = document.getElementById('mainImage');
        this.currentPhotoSpan = document.getElementById('currentPhoto');
        this.totalPhotosSpan = document.getElementById('totalPhotos');
        this.progressSlider = document.getElementById('progressSlider');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.gridBtn = document.getElementById('gridBtn');
        this.gridModal = document.getElementById('gridModal');
        this.gridContainer = document.getElementById('gridContainer');
        this.closeGridBtn = document.getElementById('closeGrid');

        this.init();
    }

    /**
     * Инициализация галереи
     */
    init() {
        // Установка начальных значений
        this.totalPhotosSpan.textContent = this.totalPhotos;
        this.progressSlider.max = this.totalPhotos;
        this.updateDisplay();

        // Создание сетки миниатюр
        this.createThumbnailGrid();

        // События
        this.initEvents();

        // Предзагрузка изображений
        this.preloadImages();
    }

    /**
     * Инициализация событий
     */
    initEvents() {
        // Навигация по кнопкам
        this.prevBtn.addEventListener('click', () => this.previousPhoto());
        this.nextBtn.addEventListener('click', () => this.nextPhoto());

        // Слайдер прогресса
        this.progressSlider.addEventListener('input', (e) => {
            this.goToPhoto(parseInt(e.target.value) - 1);
        });

        // Открытие/закрытие сетки
        this.gridBtn.addEventListener('click', () => this.openGrid());
        this.closeGridBtn.addEventListener('click', () => this.closeGrid());

        // Закрытие сетки по клику вне её
        this.gridModal.addEventListener('click', (e) => {
            if (e.target === this.gridModal) {
                this.closeGrid();
            }
        });

        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => {
            if (this.gridModal.classList.contains('active')) return;

            switch(e.key) {
                case 'ArrowLeft':
                    this.previousPhoto();
                    break;
                case 'ArrowRight':
                    this.nextPhoto();
                    break;
                case 'Escape':
                    this.closeGrid();
                    break;
                case 'g':
                case 'G':
                    this.openGrid();
                    break;
            }
        });

        // Touch-события для свайпов
        this.initTouchEvents();
    }

    /**
     * Touch-события для мобильных устройств
     */
    initTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const container = document.querySelector('.main-image-container');

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Определяем направление свайпа
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Горизонтальный свайп
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.nextPhoto();
                    } else {
                        this.previousPhoto();
                    }
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }

    /**
     * Переход к следующему фото
     */
    nextPhoto() {
        if (this.currentIndex < this.totalPhotos - 1) {
            this.animateTransition('next', () => {
                this.currentIndex++;
                this.updateDisplay();
            });
        }
    }

    /**
     * Переход к предыдущему фото
     */
    previousPhoto() {
        if (this.currentIndex > 0) {
            this.animateTransition('prev', () => {
                this.currentIndex--;
                this.updateDisplay();
            });
        }
    }

    /**
     * Переход к конкретному фото
     */
    goToPhoto(index) {
        if (index >= 0 && index < this.totalPhotos) {
            const direction = index > this.currentIndex ? 'next' : 'prev';
            this.animateTransition(direction, () => {
                this.currentIndex = index;
                this.updateDisplay();
            });
        }
    }

    /**
     * Анимация перехода между фото
     */
    animateTransition(direction, callback) {
        // Удаляем все классы анимации
        this.mainImage.classList.remove('flip-out-left', 'flip-out-right', 'flip-in-left', 'flip-in-right');

        // Добавляем класс выхода в зависимости от направления
        if (direction === 'next') {
            this.mainImage.classList.add('flip-out-left');
        } else {
            this.mainImage.classList.add('flip-out-right');
        }

        // После завершения анимации выхода (900ms)
        setTimeout(() => {
            // Выполняем callback (обновление индекса)
            callback();

            // Убираем класс выхода
            this.mainImage.classList.remove('flip-out-left', 'flip-out-right');

            // Добавляем класс входа
            if (direction === 'next') {
                this.mainImage.classList.add('flip-in-right');
            } else {
                this.mainImage.classList.add('flip-in-left');
            }

            // Убираем класс входа после завершения анимации (900ms)
            setTimeout(() => {
                this.mainImage.classList.remove('flip-in-left', 'flip-in-right');
            }, 900);
        }, 900);
    }

    /**
     * Обновление отображения
     */
    updateDisplay() {
        // Обновление источника изображения
        const newImage = new Image();
        newImage.src = this.photos[this.currentIndex];

        newImage.onload = () => {
            this.mainImage.src = newImage.src;
        };

        // Обновление счетчика
        this.currentPhotoSpan.textContent = this.currentIndex + 1;
        this.progressSlider.value = this.currentIndex + 1;

        // Обновление кнопок
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.totalPhotos - 1;

        // Обновление активной миниатюры в сетке
        this.updateActiveThumbnail();
    }

    /**
     * Создание сетки миниатюр
     */
    createThumbnailGrid() {
        this.gridContainer.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            if (index === this.currentIndex) {
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
                this.goToPhoto(index);
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
            if (index === this.currentIndex) {
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
     * Предзагрузка изображений
     */
    preloadImages() {
        // Предзагрузка следующих 3 изображений
        const preloadCount = 3;
        for (let i = 1; i <= preloadCount; i++) {
            const nextIndex = this.currentIndex + i;
            if (nextIndex < this.totalPhotos) {
                const img = new Image();
                img.src = this.photos[nextIndex];
            }
        }
    }
}

// ==========================================
// Инициализация галереи
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Массив путей к фотографиям
    const photos = [
        'img/DSC_6232.JPG',
        'img/DSC_6295.JPG',
        'img/DSC_6313.JPG',
        'img/DSC_6335.JPG',
        'img/DSC_6344.JPG',
        'img/DSC_6366.JPG',
        'img/DSC_6412.JPG'
    ];

    // Создание экземпляра галереи
    const gallery = new PhotoGallery(photos);

    console.log('Фотогалерея инициализирована:', photos.length, 'фото');
});
