/**
 * Typewriter Effect
 * Печатает текст побуквенно
 */

class Typewriter {
    constructor(elementId, text, speed = 100) {
        this.element = document.getElementById(elementId);
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
    }

    type() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text.charAt(this.currentIndex);
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
        }
    }

    start() {
        this.element.textContent = '';
        this.currentIndex = 0;
        this.type();
    }
}

// Запускаем эффект при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, был ли показан intro
    const introShown = sessionStorage.getItem('introShown');

    if (introShown) {
        // Если intro уже был показан, запускаем сразу
        const typewriter = new Typewriter('typewriterText', 'Hello, stranger.', 80);
        typewriter.start();
    } else {
        // Если intro не был показан, ждем его завершения
        // Подписываемся на событие скрытия intro
        const checkIntroHidden = setInterval(() => {
            const overlay = document.getElementById('introOverlay');
            if (overlay && overlay.classList.contains('hidden')) {
                clearInterval(checkIntroHidden);
                const typewriter = new Typewriter('typewriterText', 'Hello, stranger.', 80);
                typewriter.start();
            }
        }, 100);
    }
});
