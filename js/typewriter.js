/**
 * Typewriter Effect
 * Печатает текст побуквенно с цикличным повторением
 */

class Typewriter {
    constructor(elementId, text, speed = 100) {
        this.element = document.getElementById(elementId);
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        this.isRunning = false;
    }

    type() {
        if (this.currentIndex < this.text.length) {
            const char = this.text.charAt(this.currentIndex);

            // Если это последний символ (точка)
            if (this.currentIndex === this.text.length - 1 && char === '.') {
                // Добавляем точку с классом для мигания
                const dotSpan = document.createElement('span');
                dotSpan.className = 'typewriter-dot';
                dotSpan.textContent = '.';
                this.element.appendChild(dotSpan);

                // Мигание точки и перезапуск анимации
                this.blinkDot(dotSpan);
            } else {
                // Обычный символ
                this.element.textContent += char;
                this.currentIndex++;
                setTimeout(() => this.type(), this.speed);
            }
        }
    }

    blinkDot(dotElement) {
        let blinkCount = 0;
        const maxBlinks = 6; // 3 полных мигания (вкл-выкл)

        const blinkInterval = setInterval(() => {
            dotElement.classList.toggle('blink');
            blinkCount++;

            if (blinkCount >= maxBlinks) {
                clearInterval(blinkInterval);
                // Ждем немного и перезапускаем анимацию
                setTimeout(() => {
                    if (this.isRunning) {
                        this.restart();
                    }
                }, 1000);
            }
        }, 500);
    }

    restart() {
        this.element.textContent = '';
        this.currentIndex = 0;
        this.type();
    }

    start() {
        this.isRunning = true;
        this.element.textContent = '';
        this.currentIndex = 0;
        this.type();
    }

    stop() {
        this.isRunning = false;
    }
}

// Запускаем эффект при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, был ли показан intro
    const introShown = sessionStorage.getItem('introShown');

    if (introShown) {
        // Если intro уже был показан, запускаем сразу
        const typewriter = new Typewriter('typewriterText', 'Hello, stranger.', 130);
        typewriter.start();
    } else {
        // Если intro не был показан, ждем его завершения
        // Подписываемся на событие скрытия intro
        const checkIntroHidden = setInterval(() => {
            const overlay = document.getElementById('introOverlay');
            if (overlay && overlay.classList.contains('hidden')) {
                clearInterval(checkIntroHidden);
                const typewriter = new Typewriter('typewriterText', 'Hello, stranger.', 130);
                typewriter.start();
            }
        }, 100);
    }
});
