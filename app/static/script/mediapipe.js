window.addEventListener(
    'DOMContentLoaded', () => {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;

        function onResults(results) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.scale(-1, 1);
            canvasCtx.translate(-canvasElement.width, 0);
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    w = results.image.width;
                    h = results.image.height;
                    const [dx, dy, dw, dh] = getHandRegion(landmarks)
                    canvasCtx.drawImage(
                        results.image, w * dx, h * dy, w * dw, h * dh,
                        canvasElement.width * dx, canvasElement.height * dy, canvasElement.width * dw, canvasElement.height * dh);
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 5 });
                    drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
                }
            }
            canvasCtx.restore();
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
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
        }, false);
    }, false);