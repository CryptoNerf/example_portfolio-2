/**
 * Image Magnifier - Лупа для увеличения изображений
 */

class ImageMagnifier {
    constructor(img, zoom = 3) {
        this.img = img;
        this.zoom = zoom;
        this.glass = null;
        this.bw = 3; // Border width
        this.init();
    }

    init() {
        // Оборачиваем изображение в контейнер
        const wrapper = document.createElement('div');
        wrapper.className = 'magnifier-wrapper';
        this.img.parentNode.insertBefore(wrapper, this.img);
        wrapper.appendChild(this.img);

        // Создаем элемент лупы
        this.glass = document.createElement('div');
        this.glass.className = 'magnifier-glass';
        wrapper.appendChild(this.glass);

        // Устанавливаем фоновое изображение для лупы
        this.glass.style.backgroundImage = `url('${this.img.src}')`;

        // Добавляем обработчики событий
        this.img.addEventListener('mouseenter', () => this.showGlass());
        this.img.addEventListener('mousemove', (e) => this.moveMagnifier(e));
        this.img.addEventListener('mouseleave', () => this.hideGlass());

        // Для touch устройств
        this.img.addEventListener('touchstart', () => this.showGlass());
        this.img.addEventListener('touchmove', (e) => this.moveMagnifier(e));
        this.img.addEventListener('touchend', () => this.hideGlass());
    }

    showGlass() {
        // Обновляем размер фона при показе лупы
        const imgRect = this.img.getBoundingClientRect();
        this.glass.style.backgroundSize = `${imgRect.width * this.zoom}px ${imgRect.height * this.zoom}px`;

        this.glass.classList.add('active');
        this.img.classList.add('magnifier-enabled');
    }

    hideGlass() {
        this.glass.classList.remove('active');
        this.img.classList.remove('magnifier-enabled');
    }

    moveMagnifier(e) {
        e.preventDefault();

        // Получаем позицию курсора относительно изображения
        const pos = this.getCursorPos(e);
        let x = pos.x;
        let y = pos.y;

        // Получаем размеры изображения
        const imgRect = this.img.getBoundingClientRect();
        const imgWidth = imgRect.width;
        const imgHeight = imgRect.height;

        // Предотвращаем выход лупы за границы изображения
        const w = this.glass.offsetWidth / 2;
        const h = this.glass.offsetHeight / 2;

        if (x > imgWidth - w / this.zoom) x = imgWidth - w / this.zoom;
        if (x < w / this.zoom) x = w / this.zoom;
        if (y > imgHeight - h / this.zoom) y = imgHeight - h / this.zoom;
        if (y < h / this.zoom) y = h / this.zoom;

        // Устанавливаем позицию лупы
        this.glass.style.left = `${x - w}px`;
        this.glass.style.top = `${y - h}px`;

        // Устанавливаем позицию фона
        this.glass.style.backgroundPosition = `-${x * this.zoom - w + this.bw}px -${y * this.zoom - h + this.bw}px`;

        // Обновляем позицию курсора-крестика
        if (this.img.classList.contains('magnifier-enabled')) {
            this.img.style.setProperty('--cursor-x', `${x}px`);
            this.img.style.setProperty('--cursor-y', `${y}px`);
        }
    }

    getCursorPos(e) {
        const rect = this.img.getBoundingClientRect();
        let x, y;

        // Для touch событий
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        return { x, y };
    }
}

// Автоматическая инициализация для всех изображений с классом .fullscreen-image и .about-image
document.addEventListener('DOMContentLoaded', () => {
    // Для aboutdasha-full.html
    const fullscreenImages = document.querySelectorAll('.fullscreen-image');
    fullscreenImages.forEach(img => {
        if (img.complete) {
            new ImageMagnifier(img, 2.5);
        } else {
            img.addEventListener('load', () => {
                new ImageMagnifier(img, 2.5);
            });
        }
    });

    // Для philosophy.html
    const aboutImages = document.querySelectorAll('.about-image');
    aboutImages.forEach(img => {
        if (img.complete) {
            new ImageMagnifier(img, 2.5);
        } else {
            img.addEventListener('load', () => {
                new ImageMagnifier(img, 2.5);
            });
        }
    });
});
