const {
  Array1D,
  Array2D,
  ENV,
  Scalar,
  FeedEntry,
  InCPUMemoryShuffledInputProviderBuilder,
  Session,
  SGDOptimizer,
  Graph,
  inputTensor,
  labelTensor,
  CostReduction
} = require('deeplearn');

async function predict(x, y, x1) {
  const g = new Graph();

  // Placeholders are input containers. This is the container for where we will
  // feed an input NDArray when we execute the graph.
  const inputShape = [3];
  const inputTensor = g.placeholder('input', inputShape);

  const labelShape = [1];
  const labelTensor = g.placeholder('label', labelShape);

  // Variables are containers that hold a value that can be updated from
  // training.
  // Here we initialize the multiplier variable randomly.
  const multiplier = g.variable('multiplier', Array2D.randNormal([1, 3]));

  // Top level graph methods take Tensors and return Tensors.
  const outputTensor = g.matmul(multiplier, inputTensor);
  const costTensor = g.meanSquaredCost(outputTensor, labelTensor);

  // Tensors, like NDArrays, have a shape attribute.
  console.log(outputTensor.shape);

  const learningRate = 0.00001;
  const batchSize = 3;
  const math = ENV.math;

  const session = new Session(g, math);
  const optimizer = new SGDOptimizer(learningRate);

  const inputs = [
    Array1D.new([1.0, 2.0, 3.0]),
    Array1D.new([10.0, 20.0, 30.0]),
    Array1D.new([100.0, 200.0, 300.0])
  ];

  const labels = [
    Array1D.new([4.0]),
    Array1D.new([40.0]),
    Array1D.new([400.0])
  ];

  // Shuffles inputs and labels and keeps them mutually in sync.
  const shuffledInputProviderBuilder = new InCPUMemoryShuffledInputProviderBuilder(
    [inputs, labels]
  );
  const [
    inputProvider,
    labelProvider
  ] = shuffledInputProviderBuilder.getInputProviders();

  // Maps tensors to InputProviders.
  const feedEntries = [
    { tensor: inputTensor, data: inputProvider },
    { tensor: labelTensor, data: labelProvider }
  ];

  const NUM_BATCHES = 20;
  for (let i = 0; i < NUM_BATCHES; i++) {
    // Train takes a cost tensor to minimize. Trains one batch. Returns the
    // average cost as a Scalar.
    const cost = session.train(
      costTensor,
      feedEntries,
      batchSize,
      optimizer,
      CostReduction.MEAN
    );

    // console.log('last average cost (' + i + '): ' + (await cost.val()));
  }

  const testInput = Array1D.new([0.1, 0.2, 0.3]);

  // session.eval can take NDArrays as input data.
  const testFeedEntries = [{ tensor: inputTensor, data: testInput }];

  const testOutput = session.eval(outputTensor, testFeedEntries);

  //   console.log('---inference output---');
  //   console.log('shape: ' + testOutput.shape);
  //   console.log('value: ' + (await testOutput.data()));
}

module.exports = { predict };
