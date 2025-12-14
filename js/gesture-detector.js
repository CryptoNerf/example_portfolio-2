/**
 * Gesture Detector using MediaPipe Hands
 * Определяет жест щипка (соединение большого и указательного пальца)
 */

class GestureDetector {
    constructor() {
        this.video = document.getElementById('gestureVideo');
        this.canvas = document.getElementById('gestureCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusElement = document.getElementById('gestureStatus');

        this.isDetecting = false;
        this.pinchDetected = false;
        this.onPinchCallback = null;

        this.hands = null;
        this.camera = null;
    }

    async init() {
        try {
            // Инициализация MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));

            // Запуск камеры
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;

            // Ждем загрузки видео
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    // Устанавливаем размеры canvas
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });

            this.updateStatus('Camera ready. Show your hand!');

            // Запускаем детекцию
            this.startDetection();

            return true;
        } catch (error) {
            console.error('Error initializing gesture detector:', error);
            this.updateStatus('Camera access denied. Please allow camera access.');
            return false;
        }
    }

    startDetection() {
        this.isDetecting = true;
        this.detectFrame();
    }

    async detectFrame() {
        if (!this.isDetecting) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            await this.hands.send({ image: this.video });
        }

        requestAnimationFrame(() => this.detectFrame());
    }

    onResults(results) {
        // Очищаем canvas
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Отрисовываем результаты
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Рисуем соединения
            drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                color: '#4A4237',
                lineWidth: 2
            });

            // Рисуем точки
            drawLandmarks(this.ctx, landmarks, {
                color: '#E5DCC5',
                fillColor: '#D9CDB0',
                lineWidth: 1,
                radius: 3
            });

            // Проверяем жест щипка
            const isPinching = this.detectPinch(landmarks);

            if (isPinching && !this.pinchDetected) {
                this.pinchDetected = true;
                this.updateStatus('Pinch detected!', 'success');

                // Вызываем callback через небольшую задержку
                setTimeout(() => {
                    if (this.onPinchCallback) {
                        this.onPinchCallback();
                    }
                }, 300);
            } else if (isPinching) {
                this.updateStatus('Hold the pinch...', 'detecting');
            } else {
                this.pinchDetected = false;
                this.updateStatus('Make a pinch gesture');
            }
        } else {
            this.updateStatus('Show your hand to the camera');
        }

        this.ctx.restore();
    }

    detectPinch(landmarks) {
        // Получаем координаты большого пальца (кончик - точка 4)
        const thumb = landmarks[4];
        // Получаем координаты указательного пальца (кончик - точка 8)
        const indexFinger = landmarks[8];

        // Вычисляем расстояние между кончиками пальцев
        const distance = Math.sqrt(
            Math.pow(thumb.x - indexFinger.x, 2) +
            Math.pow(thumb.y - indexFinger.y, 2) +
            Math.pow(thumb.z - indexFinger.z, 2)
        );

        // Если расстояние меньше порога, это щипок
        const PINCH_THRESHOLD = 0.05; // Экспериментальное значение
        return distance < PINCH_THRESHOLD;
    }

    updateStatus(message, type = '') {
        this.statusElement.textContent = message;
        this.statusElement.className = 'gesture-status';

        if (type === 'detecting') {
            this.statusElement.classList.add('detecting');
        } else if (type === 'success') {
            this.statusElement.classList.add('success');
        }
    }

    onPinch(callback) {
        this.onPinchCallback = callback;
    }

    stop() {
        this.isDetecting = false;

        // Останавливаем видео поток
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }

        // Закрываем MediaPipe
        if (this.hands) {
            this.hands.close();
        }
    }
}

// Экспортируем класс для использования в intro.js
window.GestureDetector = GestureDetector;
