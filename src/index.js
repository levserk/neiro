import Network from './instances/network.js'

const init = () => {
   testXor();
};

const testNetwork = () => {
    //I1=1, I2=0, w1=0.45, w2=0.78 ,w3=-0.12 ,w4=0.13 ,w5=1.5 ,w6=-2.3.
    const conf = {
        inputsCount: 2,
        outputsCount: 1,
        inputs: [1, 0],
        layers: [
            {
                neuronsCount: 2,
            },
            {
                neuronsCount: 2,
                neurons: [
                    {
                        synapses: [
                            {layerIndex: 0, neuronIndex: 0, weight: 0.45},
                            {layerIndex: 0, neuronIndex: 1, weight: -0.12}
                        ]
                    },
                    {
                        synapses: [
                            {layerIndex: 0, neuronIndex: 0, weight: 0.78},
                            {layerIndex: 0, neuronIndex: 1, weight: 0.13}
                        ]
                    }
                ]
            },
            {
                neuronsCount: 1,
                neurons: [
                    {
                        synapses: [
                            {layerIndex: 1, neuronIndex: 0, weight: 1.5},
                            {layerIndex: 1, neuronIndex: 1, weight: -2.3}
                        ]
                    },
                ]
            }
        ]
    };
    let network = new Network(conf);
    network.inputs = conf.inputs;
    console.log(network.outputs[0]);

    network.backpropagation([1], 100);
    console.log(network.outputs[0]);
};

const testXor = () => {
    const conf = {
        inputsCount: 2,
        outputsCount: 1,
        inputs: [1, 0],
        layers: [
            {
                neuronsCount: 2,
            },
            {
                neuronsCount: 3,
            },
            {
                neuronsCount: 1,
            }
        ]
    };
    const learnData = [
        {inputs: [0, 0], outputs:[0]},
        {inputs: [1, 0], outputs:[1]},
        {inputs: [0, 1], outputs:[1]},
        {inputs: [1, 1], outputs:[0]}
    ];
    let network = new Network(conf);
    network.test(learnData);
    network.learn(learnData, 50000, 0.07, 0.3);
    network.test(learnData);
};

init();


if (module.hot) {
    module.hot.accept(['./index.js'], () => {
        init();
    });
}

