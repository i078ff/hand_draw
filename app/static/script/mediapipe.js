window.addEventListener(
    'DOMContentLoaded', () => {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');

        function onResults(results) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.scale(-1, 1);
            canvasCtx.translate(-canvasElement.width, 0);
            if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    const [x, y, w, h] = getHandRegion(landmarks)
                    canvasCtx.drawImage(
                        results.image, x, y, w, h, x, y, w, h);
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 5 });
                    drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
                }
            }
            canvasCtx.restore();
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

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        camera.start();

        function getHandRegion(landmarks) {
            const xList = [];
            const yList = [];
            for (let i = 0; i < landmarks.length; i++) {
                xList.push(landmarks[i]['x']);
                yList.push(landmarks[i]['y']);
            }
            const x = Math.min(...xList) * canvasElement.width;
            const y = Math.min(...yList) * canvasElement.height;
            const w = Math.max(...xList) * canvasElement.width - x;
            const h = Math.max(...yList) * canvasElement.height - y;
            return [x, y, w, h];
        }
    }, false);