export default class Neuron {
    constructor(layerIndex, neuronIndex) {
        this.layerIndex = layerIndex;
        this.neuronIndex = neuronIndex;
        this.id = `${layerIndex}-${neuronIndex}`;
        this.inputs = [];
        this.output = 0;
        this.inputSynapses = [];
        this.outputSynapses = [];
    }
}