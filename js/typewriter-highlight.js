/**
 * Typewriter Highlight Effect
 * Поглощает текст стилем черного фона и зеленых символов побуквенно
 */

class TypewriterHighlight {
    constructor(elementId, speed = 100, pauseAfterComma = 1000) {
        this.element = document.getElementById(elementId);
        this.speed = speed;
        this.pauseAfterComma = pauseAfterComma;
        this.currentIndex = 0;
        this.isRunning = false;
        this.charSpans = [];
    }

    wrapText() {
        // Получаем текст и оборачиваем каждый символ в span
        const text = this.element.textContent;
        this.element.textContent = '';

        this.charSpans = [];
        for (let i = 0; i < text.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'highlight-char';
            charSpan.textContent = text.charAt(i);
            this.element.appendChild(charSpan);
            this.charSpans.push(charSpan);
        }
    }

    highlight() {
        if (this.currentIndex < this.charSpans.length) {
            const charSpan = this.charSpans[this.currentIndex];
            const char = charSpan.textContent;

            // Добавляем класс для подсветки (черный фон, зеленый текст)
            charSpan.classList.add('highlight-active');

            this.currentIndex++;

            // Если символ - запятая, делаем паузу
            if (char === ',') {
                setTimeout(() => this.highlight(), this.pauseAfterComma);
            } else {
                setTimeout(() => this.highlight(), this.speed);
            }
        } else {
            // Анимация завершена, убираем все подсветки и перезапускаем через паузу
            setTimeout(() => {
                if (this.isRunning) {
                    this.restart();
                }
            }, 3000);
        }
    }

    restart() {
        // Убираем подсветку со всех символов
        this.charSpans.forEach(span => {
            span.classList.remove('highlight-active');
        });
        this.currentIndex = 0;
        this.highlight();
    }

    start() {
        this.isRunning = true;
        this.wrapText();
        this.currentIndex = 0;
        this.highlight();
    }

    stop() {
        this.isRunning = false;
    }
}

// Запускаем эффект при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const highlightTypewriter = new TypewriterHighlight(
        'highlightText',
        120,
        800
    );
    highlightTypewriter.start();
});
