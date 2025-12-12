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
        // Шаг 1: Призрачное движение страниц (3 секунды)
        // Анимация запускается автоматически через CSS

        // Шаг 2: После 3 секунд скрываем призрачные страницы и показываем финальную
        setTimeout(() => {
            this.ghostPagesContainer.style.display = 'none';
            this.finalPage.classList.add('visible');
        }, 3000);

        // Шаг 3: Пауза 2 секунды после объединения, затем начинаем зеленение экрана
        setTimeout(() => {
            this.greenOverlay.classList.add('greening');
        }, 5000); // 3 секунды движения + 2 секунды паузы

        // Шаг 4: После зеленения (еще 2 секунды) показываем текст "CLICK HERE"
        setTimeout(() => {
            this.clickText.classList.add('visible');
            this.setupClickHandler();
        }, 7000); // 5000 + 2000 (длительность зеленения)
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
