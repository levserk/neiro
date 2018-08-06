import Neyron from './neuron.js';
import Synapse from './synapse.js';

const defaultConf = {
    inputsCount: 2,
    outputsCount: 1,
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
    ],
    synapses: []
};

export default class Network {
    constructor(conf) {
        this.conf = conf = {...defaultConf, conf};

        console.log(`conf:`, conf);

        if (conf.layers.length && conf.layers[0].neuronsCount !== conf.inputsCount) {
            throw new Error(`wrong neurons count on input layer`);
        }

        if (conf.layers.length && conf.layers[conf.layers.length - 1].neuronsCount !== conf.outputsCount) {
            throw new Error(`wrong neurons count on output layer`);
        }

        this.inputs = conf.inputs || new Array(conf.inputsCount);
        this.outputs = new Array(conf.outputsCount);
        this.layers = Network.createLayers(conf.layers);
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