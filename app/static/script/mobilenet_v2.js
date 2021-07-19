async function initModel(modelFile) {
    // 推論に用いるセッションの初期化
    // Backendには cpu や webgl, wasm を利用することができます
    const session = new InferenceSession({ backendHint: 'webgl' });
    // モデルの読み込み
    await session.loadModel(modelFile);
    return session;
}

export async function runModel() {
    // Inputデータの準備（必要であれば事前に前処理をしておく必要があります）
    // とりあえず、すべて0とするダミーデータを用意します
    const input = getImageTensor();
    const inputTensor = new Tensor(dummy_input, 'float32', [1, 3, 112, 112]);

    // 推論の実行
    const outputData = await session.run([inputTensor]);
}

function getImageTensor() {
    // input-canvasのcontextを取得
    const ctx = document.getElementById('input-canvas').getContext('2d');

    // input-canvasのデータをに変換して、input-canvas-scaledに書き込む
    const ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d');
    ctxScaled.save();
    ctxScaled.scale(28 / ctx.canvas.width, 28 / ctx.canvas.height);
    ctxScaled.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctxScaled.drawImage(document.getElementById('input-canvas'), 0, 0);
    ctxScaled.restore()

    // input-canvas-scaledのデータをTensorに変換
    const imageDataScaled = ctxScaled.getImageData(0, 0, 28, 28);
    // console.log('imageDataScaled', imageDataScaled)

    const input = new Float32Array(784);
    for (let i = 0, len = imageDataScaled.data.length; i < len; i += 4) {
        input[i / 4] = imageDataScaled.data[i + 3] / 255;
    }
    const tensor = new Tensor(input, 'float32', [1, 1, 28, 28]);

    return tensor
}