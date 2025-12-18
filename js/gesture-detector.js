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

        // Счетчик стабильных кадров для подтверждения жеста
        this.stablePinchFrames = 0;
        this.REQUIRED_STABLE_FRAMES = 90; // Требуется ~3 секунды стабильного пинча
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
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
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

            // Если жест распознан, выделяем зелёным кончики пальцев
            if (isPinching) {
                this.drawGreenTips(landmarks);
            }

            if (isPinching) {
                this.stablePinchFrames++;

                // Показываем прогресс удержания
                const progress = Math.min(100, (this.stablePinchFrames / this.REQUIRED_STABLE_FRAMES) * 100);

                if (this.stablePinchFrames < this.REQUIRED_STABLE_FRAMES) {
                    this.updateStatus(`Hold the pinch... ${Math.floor(progress)}%`, 'detecting');
                } else if (!this.pinchDetected) {
                    // Жест подтвержден - требуемое количество стабильных кадров достигнуто
                    this.pinchDetected = true;
                    this.updateStatus('Success', 'success');

                    // Вызываем callback
                    setTimeout(() => {
                        if (this.onPinchCallback) {
                            this.onPinchCallback();
                        }
                    }, 1000);
                }
            } else {
                // Сбрасываем счетчик если жест прерван
                this.stablePinchFrames = 0;
                this.pinchDetected = false;
                this.updateStatus('Make a pinch gesture');
            }
        } else {
            // Сбрасываем счетчик если рука не видна
            this.stablePinchFrames = 0;
            this.pinchDetected = false;
            this.updateStatus('Show your hand to the camera');
        }

        this.ctx.restore();
    }

    detectPinch(landmarks) {
        // Получаем координаты большого пальца (кончик - точка 4)
        const thumb = landmarks[4];
        // Получаем координаты указательного пальца (кончик - точка 8)
        const indexFinger = landmarks[8];

        // Получаем координаты других пальцев для проверки что рука НЕ в кулаке
        const middleFinger = landmarks[12]; // Средний палец
        const ringFinger = landmarks[16];   // Безымянный палец
        const pinky = landmarks[20];        // Мизинец

        // Координаты основания ладони
        const wrist = landmarks[0];
        const palmBase = landmarks[9]; // Основание среднего пальца

        // 1. Проверка расстояния между большим и указательным пальцами
        const thumbIndexDistance = Math.sqrt(
            Math.pow(thumb.x - indexFinger.x, 2) +
            Math.pow(thumb.y - indexFinger.y, 2) +
            Math.pow(thumb.z - indexFinger.z, 2)
        );

        const PINCH_THRESHOLD = 0.065; // Порог для пинча (увеличен для лучшей детекции)
        const isPinching = thumbIndexDistance < PINCH_THRESHOLD;

        if (!isPinching) return false;

        // 2. Проверяем что остальные пальцы НЕ сжаты в кулак
        // Вычисляем расстояние от кончиков других пальцев до основания ладони
        const middleDistance = Math.sqrt(
            Math.pow(middleFinger.x - palmBase.x, 2) +
            Math.pow(middleFinger.y - palmBase.y, 2)
        );

        const ringDistance = Math.sqrt(
            Math.pow(ringFinger.x - palmBase.x, 2) +
            Math.pow(ringFinger.y - palmBase.y, 2)
        );

        const pinkyDistance = Math.sqrt(
            Math.pow(pinky.x - palmBase.x, 2) +
            Math.pow(pinky.y - palmBase.y, 2)
        );

        // Если хотя бы 2 из 3 пальцев достаточно вытянуты, значит это не кулак
        const EXTENDED_FINGER_THRESHOLD = 0.15; // Минимальное расстояние для "вытянутого" пальца
        const extendedFingers = [
            middleDistance > EXTENDED_FINGER_THRESHOLD,
            ringDistance > EXTENDED_FINGER_THRESHOLD,
            pinkyDistance > EXTENDED_FINGER_THRESHOLD
        ].filter(Boolean).length;

        // Требуем чтобы минимум 2 пальца были вытянуты (не кулак)
        return extendedFingers >= 2;
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

    drawGreenTips(landmarks) {
        // Точка 4 - кончик большого пальца
        const thumbTip = landmarks[4];
        // Точка 8 - кончик указательного пальца
        const indexTip = landmarks[8];

        // Рисуем зелёные точки на кончиках пальцев
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        this.ctx.fillStyle = '#00FF00';
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;

        // Большой палец
        this.ctx.beginPath();
        this.ctx.arc(
            thumbTip.x * canvasWidth,
            thumbTip.y * canvasHeight,
            6,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.stroke();

        // Указательный палец
        this.ctx.beginPath();
        this.ctx.arc(
            indexTip.x * canvasWidth,
            indexTip.y * canvasHeight,
            6,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.stroke();
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
