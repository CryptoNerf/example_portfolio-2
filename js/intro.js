/**
 * Intro Animation Controller
 * Управляет последовательностью intro-анимации
 */

class IntroAnimation {
    constructor() {
        this.overlay = document.getElementById('introOverlay');
        this.clickText = document.getElementById('clickText');
        this.ghostPagesContainer = document.getElementById('ghostPages');
        this.finalPage = document.getElementById('finalPage');
        this.greenOverlay = document.getElementById('greenOverlay');

        this.init();
    }

    init() {
        // Проверяем, показывали ли уже интро в этой сессии
        const introShown = sessionStorage.getItem('introShown');

        if (introShown) {
            // Если уже показывали, сразу скрываем оверлей
            this.overlay.classList.add('hidden');
            return;
        }

        // Запускаем последовательность анимаций
        this.startSequence();
    }

    startSequence() {
        // Шаг 1: Призрачное движение страниц (бесконечное)
        // Анимация запускается автоматически через CSS и продолжается бесконечно

        // Шаг 2: После 5 секунд дрожания, резко появляется зеленый экран
        setTimeout(() => {
            this.greenOverlay.classList.add('greening');
        }, 5000);

        // Шаг 3: После появления зеленого экрана показываем текст "CLICK HERE"
        setTimeout(() => {
            this.clickText.classList.add('visible');
            this.setupClickHandler();
        }, 5100); // 5000 + 100ms (резкое появление зеленого)
    }

    setupClickHandler() {
        // Обработчик клика на текст
        this.clickText.addEventListener('click', () => {
            this.hideIntro();
        });

        // Также можно кликнуть в любое место оверлея
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target === this.clickText) {
                this.hideIntro();
            }
        });
    }

    hideIntro() {
        // Скрываем оверлей с плавным fade-out
        this.overlay.style.transition = 'opacity 0.5s ease';
        this.overlay.style.opacity = '0';

        setTimeout(() => {
            this.overlay.classList.add('hidden');
            // Сохраняем в sessionStorage что интро показано
            sessionStorage.setItem('introShown', 'true');
        }, 500);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new IntroAnimation();
});
