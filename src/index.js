import Network from './instances/network.js'

const init = () => {
    // testXor();
    testFindMissed();
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
                neuronsCount: 2,
            },
            {
                neuronsCount: 1,
            }
        ]
    };
    const learnData = [
        {inputs: [0, 0], outputs: [0]},
        {inputs: [1, 0], outputs: [1]},
        {inputs: [0, 1], outputs: [1]},
        {inputs: [1, 1], outputs: [0]}
    ];
    let network = new Network(conf);
    console.log(network);
    console.log(JSON.parse(JSON.stringify(network.getScheme())));
    network.test(learnData);
    network.learn(learnData, 10000, 0.7, 0.01);
    network.test(learnData);
    console.log(JSON.parse(JSON.stringify(network.getScheme())));
};

const testFindMissed = () => {
    const digitsCount = 10;
    const conf = {
        inputsCount: digitsCount,
        outputsCount: 1,
        layers: [
            {
                neuronsCount: digitsCount,
            },
            {
                neuronsCount: 1,
            }
        ]
    };
    const learnData = [1,2,3,4,5,6,7,8,9,10].map((digit) => {
        let inputs = [1,1,1,1,1,1,1,1,1,1],
            outputs = [digit / digitsCount];
        inputs[digit - 1] = 0;
        return {
            inputs,
            outputs
        }
    });
    console.log(`learnData:`, learnData);
    let network = new Network(conf);
    console.log(network);
    console.log(JSON.parse(JSON.stringify(network.getScheme())));
    network.test(learnData);
    network.learn(learnData, 100000, 0.5, 0.01);
    network.test(learnData);
    console.log(JSON.parse(JSON.stringify(network.getScheme())));
};

init();

if (module.hot) {
    module.hot.accept(['./index.js'], () => {
        init();
    });
}

