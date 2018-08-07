export default class Synapse {
    constructor(inputNeuron, outputNeuron, weight) {
        this.inputNeuron = inputNeuron;
        this.outputNeuron = outputNeuron;
        this.weight = typeof weight === "number" ? weight : Math.random();
        this.delta = 0;
        this.grad = 0;
    }
}