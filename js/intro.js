/**
 * Intro Animation Controller
 * Управляет последовательностью intro-анимации с детекцией жестов
 */

class IntroAnimation {
    constructor() {
        this.overlay = document.getElementById('introOverlay');
        this.welcomeWindow = document.getElementById('welcomeWindow');
        this.gestureWindow = document.getElementById('gestureWindow');
        this.gestureContent = document.getElementById('gestureContent');
        this.successMessage = document.getElementById('successMessage');
        this.readyButton = document.getElementById('readyButton');
        this.ghostPagesContainer = document.getElementById('ghostPages');
        this.finalPage = document.getElementById('finalPage');
        this.greenOverlay = document.getElementById('greenOverlay');

        this.gestureDetector = null;

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

        // Шаг 2: После 2.5 секунд дрожания, резко появляется зеленый экран
        setTimeout(() => {
            this.greenOverlay.classList.add('greening');
        }, 2500);

        // Шаг 3: После завершения зеленения (2s) показываем приветственное окно
        setTimeout(() => {
            this.showWelcomeWindow();
        }, 4600); // 2500 + 2000ms (длительность анимации зеленения) + 100ms буфер
    }

    showWelcomeWindow() {
        // Показываем приветственное окно
        this.welcomeWindow.classList.add('visible');

        // Обработчик кнопки "I'm ready"
        this.readyButton.addEventListener('click', () => {
            this.onReadyClick();
        });
    }

    onReadyClick() {
        // Скрываем приветственное окно
        this.welcomeWindow.classList.remove('visible');

        // Через небольшую задержку показываем окно с жестом
        setTimeout(() => {
            this.showGestureWindow();
        }, 300);
    }

    async showGestureWindow() {
        // Показываем окно
        this.gestureWindow.classList.add('visible');

        // Инициализируем детектор жестов
        this.gestureDetector = new GestureDetector();
        const initialized = await this.gestureDetector.init();

        if (!initialized) {
            // Если камера недоступна, показываем запасной вариант
            setTimeout(() => {
                this.showFallbackOption();
            }, 3000);
            return;
        }

        // Устанавливаем обработчик для детекции щипка
        this.gestureDetector.onPinch(() => {
            this.onGestureDetected();
        });
    }

    onGestureDetected() {
        // Останавливаем детектор
        if (this.gestureDetector) {
            this.gestureDetector.stop();
        }

        // Скрываем контент с камерой
        this.gestureContent.classList.add('hidden');

        // Показываем благодарственное сообщение
        this.successMessage.classList.add('visible');

        // Через 4 секунды скрываем всё интро
        setTimeout(() => {
            this.hideIntro();
        }, 4000);
    }

    showFallbackOption() {
        // Если камера недоступна, делаем окно кликабельным
        const statusElement = document.getElementById('gestureStatus');
        statusElement.textContent = 'Click anywhere to continue';
        statusElement.classList.add('success');

        this.gestureWindow.style.cursor = 'pointer';
        this.gestureWindow.addEventListener('click', () => {
            this.onGestureDetected();
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
