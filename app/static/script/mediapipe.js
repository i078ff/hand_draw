window.addEventListener(
    'DOMContentLoaded', () => {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const operationCanvasElement = document.getElementsByClassName('operation_canvas')[0];
        const operationCanvasCtx = operationCanvasElement.getContext('2d');
        const drawCanvasElement = document.getElementById('draw_canvas');
        const drawCanvasCtx = drawCanvasElement.getContext('2d');
        drawCanvasElement.width = 900;
        drawCanvasElement.height = 600;
        init();

        function init() {
            operationCanvasElement.width = window.innerWidth;
            operationCanvasElement.height = window.innerHeight;
            operationCanvasCtx.scale(-1, 1);
            operationCanvasCtx.translate(-operationCanvasElement.width, 0);
            drawCanvasCtx.scale(-1, 1);
            drawCanvasCtx.translate(-drawCanvasElement.width, 0);
        }

        function onResults(results) {
            operationCanvasCtx.clearRect(0, 0, operationCanvasElement.width, operationCanvasElement.height);
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    const w = results.image.width;
                    const h = results.image.height;
                    const drawRect = drawCanvasElement.getBoundingClientRect();
                    const indexRegion = { 'x': landmarks[8]['x'] * operationCanvasElement.width, 'y': landmarks[8]['y'] * operationCanvasElement.height };
                    const [dx, dy, dw, dh] = getHandRegion(landmarks);
                    drawLine(indexRegion, drawRect);
                    operationCanvasCtx.drawImage(
                        results.image, w * dx, h * dy, w * dw, h * dh,
                        operationCanvasElement.width * dx, operationCanvasElement.height * dy, operationCanvasElement.width * dw, operationCanvasElement.height * dh);
                    // drawConnectors(operationCanvasCtx, landmarks, HAND_CONNECTIONS,
                    //     { color: '#00FF00', lineWidth: 5 });
                    // drawLandmarks(operationCanvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
                }
            }
        }

        function drawLine(indexRegion, drawRect) {
            if ((drawRect.left < indexRegion.x) && (indexRegion.x < drawRect.right) && (drawRect.top < indexRegion.y) && (indexRegion.y < drawRect.bottom)) {
                drawCanvasCtx.lineWidth = 5;
                drawCanvasCtx.lineTo(indexRegion.x - drawRect.left, indexRegion.y - drawRect.top);
                drawCanvasCtx.stroke();
            }
        }

        function getHandRegion(landmarks) {
            const xList = [];
            const yList = [];
            for (let i = 0; i < landmarks.length; i++) {
                xList.push(landmarks[i]['x']);
                yList.push(landmarks[i]['y']);
            }
            let x = Math.min(...xList);
            let y = Math.min(...yList);
            let w = Math.max(...xList) - x;
            let h = Math.max(...yList) - y;

            // このままのx, y, w, hだと手が見切れるので上下左右10%ずつ領域を広げる
            x = x - w / 10;
            y = y - h / 10;
            w = w * 1.2;
            h = h * 1.2;
            return [x, y, w, h];
        }

        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        hands.setOptions({
            maxNumHands: 2,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        hands.onResults(onResults);

        let camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: window.innerWidth,
            height: window.innerHeight
        });
        camera.start();

        window.addEventListener('resize', () => {
            init();
        }, false);
    }, false);