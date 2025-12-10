/**
 * Mockup Toggle
 * Переключение видимости макета для верстки
 * Нажмите клавишу 'M' чтобы включить/выключить трафарет
 */

document.addEventListener('DOMContentLoaded', () => {
    const mockupOverlay = document.getElementById('mockupOverlay');

    // Переключение по клавише 'M'
    document.addEventListener('keydown', (e) => {
        if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
            mockupOverlay.classList.toggle('active');

            // Выводим в консоль статус для удобства
            if (mockupOverlay.classList.contains('active')) {
                console.log('📐 Mockup overlay: ON');
            } else {
                console.log('📐 Mockup overlay: OFF');
            }
        }
    });
});
