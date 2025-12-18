/**
 * Logo Ink Effect
 * Создает эффект растворения чернил для логотипа
 */

class LogoInkEffect {
    constructor() {
        this.filterId = 'inkEffect';
        this.feGauss = document.querySelector(`#${this.filterId}>feGaussianBlur`);
        this.logo = document.querySelector('.logo');

        this.currentBlur = 0;
        this.targetBlur = 0;
        this.isAnimating = false;

        this.init();
    }

    init() {
        if (!this.feGauss || !this.logo) return;

        // Запускаем циклическую анимацию
        this.startCyclicAnimation();

        // Также добавляем эффект при наведении мыши
        this.logo.addEventListener('mouseenter', () => {
            this.targetBlur = 15;
            if (!this.isAnimating) {
                this.animate();
            }
        });

        this.logo.addEventListener('mouseleave', () => {
            this.targetBlur = 0;
            if (!this.isAnimating) {
                this.animate();
            }
        });
    }

    startCyclicAnimation() {
        // Каждые 8 секунд запускаем эффект растворения
        setInterval(() => {
            this.dissolveAndReturn();
        }, 8000);
    }

    dissolveAndReturn() {
        // Растворяем
        this.targetBlur = 20;
        this.animate(() => {
            // Через 1 секунду возвращаем обратно
            setTimeout(() => {
                this.targetBlur = 0;
                this.animate();
            }, 1000);
        });
    }

    animate(callback) {
        this.isAnimating = true;

        const animateStep = () => {
            const diff = this.targetBlur - this.currentBlur;

            if (Math.abs(diff) < 0.1) {
                this.currentBlur = this.targetBlur;
                this.feGauss.setAttribute('stdDeviation', this.currentBlur);
                this.isAnimating = false;
                if (callback) callback();
                return;
            }

            this.currentBlur += diff * 0.1;
            this.feGauss.setAttribute('stdDeviation', this.currentBlur);

            requestAnimationFrame(animateStep);
        };

        animateStep();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LogoInkEffect();
});
