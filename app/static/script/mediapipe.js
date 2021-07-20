import { initModel, runModel } from './onnx.js';

window.addEventListener(
    'DOMContentLoaded', () => {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const operationCanvasElement = document.getElementsByClassName('operation_canvas')[0];
        const operationCanvasCtx = operationCanvasElement.getContext('2d');
        const drawCanvasElement = document.getElementById('draw_canvas');
        const drawCanvasCtx = drawCanvasElement.getContext('2d');
        const handCanvasElement = document.getElementById('hand_canvas');
        const handCanvasCtx = handCanvasElement.getContext('2d');
        drawCanvasElement.width = 900;
        drawCanvasElement.height = 600;
        handCanvasElement.width = 224;
        handCanvasElement.height = 224;
        let lineFlag = false;
        const modelFile = './static/squeezenet1_1_224_886.onnx';
        const labels = ['all', 'index', 'index_middle', 'index_thumb', 'other'];
        const labelQueue = ['other', 'other', 'other', 'other', 'other'];
        let session;
        init();
        initModel(modelFile).then(output => {  // モデルの初期化
            session = output;
        })

        function init() {
            operationCanvasElement.width = window.innerWidth;
            operationCanvasElement.height = window.innerHeight;
            operationCanvasCtx.scale(-1, 1);
            operationCanvasCtx.translate(-operationCanvasElement.width, 0);
            drawCanvasCtx.scale(-1, 1);
            drawCanvasCtx.translate(-drawCanvasElement.width, 0);
            handCanvasCtx.scale(-1, 1);
            handCanvasCtx.translate(-handCanvasElement.width, 0);
        }

        function onResults(results) {
            operationCanvasCtx.clearRect(0, 0, operationCanvasElement.width, operationCanvasElement.height);
            handCanvasCtx.clearRect(0, 0, handCanvasElement.width, handCanvasElement.height);
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    operateDOM(results, landmarks);
                }
            }
        }

        async function operateDOM(results, landmarks) {
            const indexCoordinate = { 'x': landmarks[8]['x'] * operationCanvasElement.width, 'y': landmarks[8]['y'] * operationCanvasElement.height };
            await drawHandRegion(results.image, landmarks);
            const output = await runModel(session, handCanvasCtx)
            const label = labels[output.data.indexOf(Math.max(...output.data))];
            labelQueue.shift();
            labelQueue.push(label);
            console.log(labelQueue);
            await Promise.all([
                drawPointer(indexCoordinate),
                drawLine(indexCoordinate, labelQueue),
            ]);
        }

        function drawHandRegion(image, landmarks) {
            const [dx, dy, dw, dh] = getHandRegion(landmarks);
            handCanvasCtx.drawImage(
                image, image.width * dx, image.height * dy, image.width * dw, image.height * dh,
                0, 0, handCanvasElement.width, handCanvasElement.height);
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

        function drawPointer(indexCoordinate) {
            operationCanvasCtx.beginPath();
            operationCanvasCtx.arc(indexCoordinate.x, indexCoordinate.y, 10, 0, 2 * Math.PI, false);
            operationCanvasCtx.fillStyle = 'rgba(50, 50, 50, 127)';
            operationCanvasCtx.fill();
            operationCanvasCtx.stroke();
        }

        function drawLine(indexCoordinate, labelQueue) {
            const drawRect = drawCanvasElement.getBoundingClientRect();
            // 5回(labelQueue.length)連続indexかつindexの座標がdrawCanvas内の場合実行
            if ((labelQueue.length === labelQueue.filter(label => label === 'index').length) &&
                (drawRect.left < indexCoordinate.x) &&
                (indexCoordinate.x < drawRect.right) &&
                (drawRect.top < indexCoordinate.y) &&
                (indexCoordinate.y < drawRect.bottom)) {
                if (!lineFlag) {
                    lineFlag = true;
                    drawCanvasCtx.beginPath();
                }
                drawCanvasCtx.lineWidth = 5;
                drawCanvasCtx.lineTo(indexCoordinate.x - drawRect.left - 12, indexCoordinate.y - drawRect.top);
                drawCanvasCtx.stroke();
            } else {
                if (lineFlag) {
                    lineFlag = false;
                    drawCanvasCtx.closePath();
                }
            }
        }

        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        hands.setOptions({
            maxNumHands: 1,
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