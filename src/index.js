import Network from './instances/network.js'

const init = () => {
    console.log(`init 12`, `width: ${document.documentElement.clientWidth} height: ${document.documentElement.clientHeight}`);
    let network = new Network({});
    console.log(network);
    let scheme = network.getScheme();
    console.log(scheme);
    console.log(new Network(scheme));

    testNetwork();
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
    for (let i = 0; i < 100; i++) {
        network.backpropagation([1]);
    }
};

init();


if (module.hot) {
    module.hot.accept(['./index.js'], () => {
        init();
    });
}

