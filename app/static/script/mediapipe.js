import { initModel, runModel } from './onnx.js';

window.addEventListener(
    'DOMContentLoaded', () => {
        const menuColor = document.getElementsByClassName('menu-color')[0]
        const menuThickness = document.getElementsByClassName('menu-thickness')[0]
        const menuSetting = document.getElementsByClassName('menu-setting')[0]
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
        let colorFlag = false;
        let thicknessFlag = false;
        let settingFlag = false;
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
                chooseColor(indexCoordinate),
                chooseThickness(indexCoordinate),
                chooseSetting(indexCoordinate)
            ]);
            await drawLine(indexCoordinate)
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
            if (labelQueue.length === labelQueue.filter(label => label === 'index').length) {
                operationCanvasCtx.fillStyle = 'rgba(50, 50, 50, 127)';
            } else {
                operationCanvasCtx.fillStyle = 'rgba(127, 127, 127, 127)';
            }
            operationCanvasCtx.fill();
            operationCanvasCtx.stroke();
        }

        function chooseColor(indexCoordinate) {
            const menuColorRect = menuColor.getBoundingClientRect();
            if ((menuColorRect.left < operationCanvasElement.width - indexCoordinate.x) &&
                (operationCanvasElement.width - indexCoordinate.x < menuColorRect.right) &&
                (menuColorRect.top < indexCoordinate.y) &&
                (indexCoordinate.y < menuColorRect.bottom)) {
                if (!colorFlag) {
                    colorFlag = true;
                    document.getElementsByClassName('button-color-hide')[0].style.display = 'flex';
                }
            } else {
                if (colorFlag) {
                    colorFlag = false;
                    document.getElementsByClassName('button-color-hide')[0].style.display = 'none';
                }
            }
        }

        function chooseThickness(indexCoordinate) {
            const menuThicknessRect = menuThickness.getBoundingClientRect();
            if ((menuThicknessRect.left < operationCanvasElement.width - indexCoordinate.x) &&
                (operationCanvasElement.width - indexCoordinate.x < menuThicknessRect.right) &&
                (menuThicknessRect.top < indexCoordinate.y) &&
                (indexCoordinate.y < menuThicknessRect.bottom)) {
                if (!thicknessFlag) {
                    thicknessFlag = true;
                    document.getElementsByClassName('button-thickness-hide')[0].style.display = 'flex';
                }
            } else {
                if (thicknessFlag) {
                    thicknessFlag = false;
                    document.getElementsByClassName('button-thickness-hide')[0].style.display = 'none';
                }
            }
        }

        function chooseSetting(indexCoordinate) {
            const menuSettingRect = menuSetting.getBoundingClientRect();
            if ((menuSettingRect.left < operationCanvasElement.width - indexCoordinate.x) &&
                (operationCanvasElement.width - indexCoordinate.x < menuSettingRect.right) &&
                (menuSettingRect.top < indexCoordinate.y) &&
                (indexCoordinate.y < menuSettingRect.bottom)) {
                if (!settingFlag) {
                    settingFlag = true;
                    document.getElementsByClassName('button-setting-hide')[0].style.display = 'flex';
                }
            } else {
                if (settingFlag) {
                    settingFlag = false;
                    document.getElementsByClassName('button-setting-hide')[0].style.display = 'none';
                }
            }
        }

        function drawLine(indexCoordinate) {
            const drawRect = drawCanvasElement.getBoundingClientRect();
            // 5連続index判定かつ隠しメニュー非表示かつindexの座標がdrawCanvas内の場合実行
            if ((labelQueue.length === labelQueue.filter(label => label === 'index').length) &&
                (!colorFlag) &&
                (!thicknessFlag) &&
                (!settingFlag) &&
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