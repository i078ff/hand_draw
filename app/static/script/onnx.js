export async function initModel(modelFile) {
    // 推論に用いるセッションの初期化
    // Backendには cpu や webgl, wasm を利用することができます
    const session = new InferenceSession({ backendHint: 'webgl' });
    // モデルの読み込み
    await session.loadModel(modelFile);
    return session;
}

export async function runModel(session, ctx) {
    const input = preProcess(ctx);
    const inputTensor = new Tensor(input, 'float32', [1, 3, 224, 224]);
    // const start = new Date();
    // 推論の実行
    const outputData = await session.run([inputTensor]);
    // const end = new Date();
    // const inferenceTime = (end.getTime() - start.getTime());
    const output = outputData.values().next().value;
    // console.log("推論時間：" + inferenceTime);
    return output;
}

function preProcess(ctx) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { data, width, height } = imageData;
    const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
    const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [1, 3, width, height]);

    ndarray.ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 2));
    ndarray.ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
    ndarray.ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 0));
    ndarray.ops.divseq(dataProcessedTensor, 255);
    ndarray.ops.subseq(dataProcessedTensor.pick(0, 0, null, null), 0.485);
    ndarray.ops.subseq(dataProcessedTensor.pick(0, 1, null, null), 0.456);
    ndarray.ops.subseq(dataProcessedTensor.pick(0, 2, null, null), 0.406);
    ndarray.ops.divseq(dataProcessedTensor.pick(0, 0, null, null), 0.229);
    ndarray.ops.divseq(dataProcessedTensor.pick(0, 1, null, null), 0.224);
    ndarray.ops.divseq(dataProcessedTensor.pick(0, 2, null, null), 0.225);

    return dataProcessedTensor.data;
}