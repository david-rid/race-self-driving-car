// Neural network class
// Made out of an array of levels
class NeuralNetwork {

    // Construct a new NeuralNetwork
    // by adding #(neuronCounts) levels
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length-1; i++) {
            // Push a new level with:
            // input neurons count equal to neuronCounts[i]
            // output neurons count equal to neuronCounts[i+1]
            this.levels.push( new Level(
                neuronCounts[i], neuronCounts[i+1]
            ));
        }
    }

    // Feed forward algorithm
    static feedForward(givenInputs, network) {

        // Initally call feedForward on the first Level of the network
        // using the givenInputs
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]
        );

        // Loop through remaining levels
        for (let i = 1; i < network.levels.length; i++) {
            // Feed forward result from last level
            outputs = Level.feedForward(
                outputs, network.levels[i]
            )
        }

        // Return the outputs
        return outputs;
    }

    // Mutation algorithm
    // This is a simple genetic mutation algorithm
    static mutate(network, amount = 1) {

        // For all the levels of the network
        network.levels.forEach(level => {

            // Go through all the biases of this level
            for (let i = 0; i < level.biases.length; i++) {

                // Set the (i)th bias to the linear interpolation of:
                // the current value of the bias and
                // and a random value between -1 and 1
                // **DEPENDING on the specificed amount**
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            
            // Go through all the [i][j] weights 
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {

                    // Set the [i][j] weight to the linear interpolation of:
                    // the current value of the weight
                    // and a random number between -1 and 1
                    // **DEPENDING on the specificed amount**
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    );
                }
            }
        });
    }
}

// Level class, which has:
// a layer of input neurons
// a layer of output neurons
class Level {

    // Construct a level with # input neurons and # output neurons
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        // Each output neuron has a bias, a value above which it will fire
        this.biases = new Array(outputCount);

        // The weight of each input neuron to each output neuron
        this.weights = [];

        // Go through all input neurons
        for (let i = 0; i < inputCount; i++) {
            // For each input, you have #(outputCount) connections
            // i.e. each input neuron is connected to each output neuron
            this.weights[i] = new Array(outputCount);
        }

        // Randomize brain to begin with
        Level.#randomize(this);
    }

    // Method to randomize a level
    static #randomize(level) {
        
        // Go through each input
        for (let i = 0; i < level.inputs.length; i++) {
            // Go through each output
            for (let j = 0; j < level.outputs.length; j++) {
                // For every input / output pair, set the weight to a random value
                // between -1 and 1
                level.weights[i][j] = Math.random()*2-1;
            }
        }

        // Also fill the bias values for each output node with random numbers -1 to 1
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random()*2-1;
        }
    }

    // Feed forward algorithm
    static feedForward(givenInputs, level) {

        // Set values in level.inputs to the values in given.inputs
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        // Go through every output
        for (let i = 0; i < level.outputs.length; i++) {

            // The sum is 0 in the beginning
            let sum = 0;

            // Calculate sum like so:
            // 1. Multiply each input node value by output node i value
            // 2. Add all the values up
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j]*level.weights[j][i];
            }

            // If sum is greater than bias value for output node i value,
            // turn the output neuron "on"
            if (sum > level.biases[i]) { 
                level.outputs[i] = 1;
            } else { // otherwise turn it off
                level.outputs[i] = 0;
            }
        }

        // Return the outputs
        return level.outputs;
    }
}