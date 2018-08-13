import Neyron from './neuron.js';
import Synapse from './synapse.js';

const defaultConf = {
    inputsCount: 2,
    outputsCount: 1,
    SPEED: 0.7,
    MOMENT: 0.3,
    layers: [
        {
            neuronsCount: 2,
            bias: false
        },
        {
            neuronsCount: 1,
            bias: false,
            neurons: [
                {
                    synapses: [
                        {layerIndex: 0, neuronIndex: 0, weight: 1},
                        {layerIndex: 0, neuronIndex: 1, weight: 0}
                    ]
                }
            ]
        }
    ]
};

export default class Network {
    constructor(conf) {
        this.conf = conf = {...defaultConf, ...conf};

        console.log(`conf:`, conf);

        if (conf.layers.length && conf.layers[0].neuronsCount !== conf.inputsCount) {
            throw new Error(`wrong neurons count on input layer`);
        }

        if (conf.layers.length && conf.layers[conf.layers.length - 1].neuronsCount !== conf.outputsCount) {
            throw new Error(`wrong neurons count on output layer`);
        }

        this.SPEED = conf.SPEED;
        this.MOMENT = conf.MOMENT;
        this._inputs = conf.inputs || new Array(conf.inputsCount);
        this.outputs = new Array(conf.outputsCount);
        this.layers = Network.createLayers(conf.layers);
    }

    get inputs() {
        return this._inputs;
    }

    set inputs(inputs) {
        this._inputs = inputs;
        this.updateOutputs();
    }

    updateOutputs() {
        let layer, neuron;
        for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
            layer = this.layers[layerIndex];
            for (let neuronIndex = 0; neuronIndex < layer.length; neuronIndex++) {
                neuron = layer[neuronIndex];
                if (layerIndex === 0) {
                    neuron.input = this._inputs[neuronIndex];
                    neuron.output = neuron.input;
                    //console.log(`${neuron.id} input: ${neuron.input}, output: ${neuron.output}`);
                }
                else {
                    neuron.input = 0;
                    for (let synapse of neuron.inputSynapses) {
                        neuron.input += synapse.inputNeuron.output * synapse.weight;
                    }
                    neuron.output = sigmoid(neuron.input);
                    //console.log(`${neuron.id} input: ${neuron.input}, output: ${neuron.output}`);
                }
                if (layerIndex === this.layers.length - 1) {
                    this.outputs[neuronIndex] = neuron.output
                }
            }
        }
    }

    getMSE(validOutputs) {
        let sum = 0;
        for (let i = 0; i < this.outputs.length; i++) {
            sum += Math.pow((validOutputs[i] - this.outputs[i]), 2);
        }
        return sum / this.outputs.length;
    }

    backpropagation(validOutputs, iterations) {

        let layers = this.layers,
            layer, neuron, synapse;

        for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
            layer = layers[layerIndex];
            for (let neuronIndex = 0; neuronIndex < layer.length; neuronIndex++) {
                neuron = layer[neuronIndex];
                if (layerIndex === layers.length - 1) {
                    // first layer delta
                    neuron.delta = (validOutputs[neuronIndex] - neuron.output) * derivativeSigmoid(neuron.output);
                } else {
                    neuron.delta = 0;
                    for (let i = 0; i < neuron.outputSynapses.length; i++) {
                        synapse = neuron.outputSynapses[i];
                        //neuron.delta += synapse.weight * synapse.outputNeuron.delta;
                        synapse.grad = synapse.outputNeuron.delta * neuron.output;
                        synapse.delta = this.SPEED * synapse.grad + this.MOMENT * synapse.delta;
                        synapse.weight += synapse.delta;
                        neuron.delta += synapse.weight * synapse.outputNeuron.delta;
                    }
                    if (layerIndex !== 0) {
                        neuron.delta *= derivativeSigmoid(neuron.output)
                    }
                }
            }
        }
        this.updateOutputs();
    }

    learn(learnData, iterations, speed, moment) {
        this.SPEED = speed || this.SPEED;
        this.MOMENT = moment || this.MOMENT;

        const timeStart = Date.now();
        let error  = 0;

        for (let iteration = 0; iteration < iterations; iteration++) {
            learnData= learnData.sort(() => 0.5 - Math.random());
            error  = 0;
            for (let data of learnData) {
                this.inputs = data.inputs;
                this.backpropagation(data.outputs, iterations);
                error += this.getMSE(data.outputs);
            }
            if (iteration % 100 === 0) {
                console.log(iteration, `/`, iterations, error / learnData.length);
            }
        }

        console.log(`learn done; final error:`, error / learnData.length, `time:`, Date.now() - timeStart)

    }

    test(tests) {
        for (let test of tests) {
            let inputs = test.inputs,
                validOutputs = test.outputs;
            this.inputs = inputs;
            console.log(`inputs:`, inputs, `valid outputs:`, validOutputs, `networkOutputs:`, this.outputs,
                `error:`, this.getMSE(validOutputs));
        }
    }

    static createLayers(layerSchemes) {
        let layers = [];
        for (let layerIndex = 0; layerIndex < layerSchemes.length; layerIndex++) {
            let layer = [], layerScheme = layerSchemes[layerIndex];
            layers.push(layer);

            for (let neuronIndex = 0; neuronIndex < layerScheme.neuronsCount; neuronIndex++) {
                let neuron = new Neyron(layerIndex, neuronIndex);
                layer.push(neuron);

                if (layerIndex === 0 || layerIndex === layerScheme.neuronsCount && layerScheme.bias) {
                    continue; // skip creating synapses for input layer or bias neuron
                }

                if (layerScheme.neurons && layerScheme.neurons[neuronIndex] && layerScheme.neurons[neuronIndex].synapses) {
                    for (let synapse of layerScheme.neurons[neuronIndex].synapses) {
                        let inputNeuron = layers[synapse.layerIndex][synapse.neuronIndex];
                        Network.createSynapse(inputNeuron, neuron, synapse.weight)
                    }
                } else {
                    let prevLayer = layers[layerIndex - 1];
                    for (let inputNeuron of prevLayer) {
                        Network.createSynapse(inputNeuron, neuron)
                    }
                }
            }
        }
        return layers;
    }

    static createSynapse(inputNeuron, neuron, weight) {
        let synapse = new Synapse(inputNeuron, neuron, weight);
        inputNeuron.outputSynapses.push(synapse);
        neuron.inputSynapses.push(synapse);
    }

    getScheme() {
        return {
            inputsCount: this.inputs.length,
            inputs: this.inputs,
            outputsCount: this.outputs.length,
            outputs: this.outputs,
            layers: this.getLayerSchemes()
        }
    }

    getLayerSchemes() {
        let layerSchemes = [];
        for (let layer of this.layers) {
            let layerScheme = {
                neuronsCount: layer.length, bias: false,
            }, neurons = [];
            layerSchemes.push(layerScheme);

            for (let neuron of layer) {
                if (neuron.layerIndex === 0) {
                    continue;
                }
                if (neuron.inputSynapses.length === 0) {
                    layerScheme.bias = true;
                } else {
                    layerScheme.neyrons = neurons;
                    let synapses = [];
                    for (let synapse of neuron.inputSynapses) {
                        synapses.push({
                            layerIndex: synapse.inputNeuron.layerIndex,
                            neuronIndex: synapse.inputNeuron.neuronIndex,
                            weight: synapse.weight
                        })
                    }
                    neurons.push({
                        synapses
                    })
                }
            }
        }
        return layerSchemes;
    }
}

const sigmoid = (value) => 1 / (1 + Math.exp(-value));
const derivativeSigmoid = (value) => (1 - value) * value;