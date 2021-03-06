function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

function randomClamped() {
	return (Math.random() * 0.2) - 0.1;
}

// NEURON CLASS
{

	function Neuron(numInputs) {
		this.inputs = [];
		this.numInputs = numInputs;
		this.weights = [];
		this.activation = 0;

		for (var i = 0; i < numInputs + 1; i++) {
			this.weights.push(randomClamped());
		}
	}

}

// NEURON LAYER CLASS
{

	function NeuronLayer(numNeurons, inputsPerNeuron) {
		this.neurons = [];
		this.numNeurons = numNeurons;
		this.inputsPerNeuron = inputsPerNeuron;

		this.previousOutputs = [];

		this.buildLayer();
	}

	NeuronLayer.prototype.buildLayer = function() {
		for (var i = 0; i < this.numNeurons; i++) {
			this.neurons.push(new Neuron(this.inputsPerNeuron));
		}

		// for (var i=0; i<this.numNeurons; i++) {
		// 	for (var k=0; k<this.inputsPerNeuron; k++) {
		// 		console.log(this.neurons[i].weights[k]);
		// 	}
		// }
	}

}

// NEURAL NET CLASS
{

	// constructor
	function NeuralNet(o) {
		obj = o? o : {};

		this.numInputs = obj.numInputs? obj.numInputs : 3;
		this.numOutputs = obj.numOutputs? obj.numOutputs : 6;
		this.numHiddenLayers = obj.numHiddenLayers? obj.numHiddenLayers : 1;
		this.neuronsPerHiddenLayer = obj.neuronsPerHiddenLayer? obj.neuronsPerHiddenLayer : 6;
		this.learningRate = obj.learningRate? obj.learningRate : 0.9;

		this.hiddenLayers = [];

		this.buildNet();
	}

	// build the network
	NeuralNet.prototype.buildNet = function() {
		console.log('building');
		if (this.numHiddenLayers > 0) {
			// the first layer is special- connects to inputs, not neurons
			this.inputLayer = new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs);
			this.hiddenLayers.push(this.inputLayer);

			// // middle hidden layers only connect to other neurons
			// for (var i = 0; i < this.numHiddenLayers - 1; i++) {
			// 	this.hiddenLayers.push(new NeuronLayer(this.neuronsPerHiddenLayer,
			// 		this.neuronsPerHiddenLayer));
			// } what the fuck is going on here

			// this.hiddenLayers.push(new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs));

			// output layer
			this.outputLayer = new NeuronLayer(this.numOutputs,
				this.neuronsPerHiddenLayer);
			this.hiddenLayers.push(this.outputLayer);
		} else {
			// create output layer
			this.hiddenLayers.push(new NeuronLayer(this.numOutputs,
				this.numInputs));
		}
		console.log('done building');
	}

	// returns array of all weights in net
	NeuralNet.prototype.getWeights = function() {
		weights = [];

		// for each layer
		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			// for each neuron
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				// for each weight
				for (var k = 0; k < this.hiddenLayers[i].neurons[j].numOutputs; k++) {
					weights.push(this.hiddenLayers[i].neurons[j].weights[k]);
				}
			}
		}

		return weights;
	}

	// returns number of weights in net
	NeuralNet.prototype.numberOfWeights = function() {
		var cWeight = 0;

		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				for (var k = 0; k < this.hiddenLayers[i].neurons[j].numInputs; k++) {
					this.hiddenLayers[i].neurons[j].weights[k] = weights[cWeight++];
				}
			}
		}

		return cWeight;
	}

	// get an array of all weights
	NeuralNet.prototype.getWeights = function() {
		var allWeights = [];

		for (var i=0; i<this.numHIddenLayers + 1; i++) {
			for (var j=0; j<this.hiddenLayers[i].numNeurons; j++) {
				for (var k=0; i<this.hiddenLayers[i].neurons[j].numInputs; k++) {
					allWeights.push(this.hiddenLayers[i].neurons[j].weights[k])
				}
			}
		}

		return allWeights;
	}

	NeuralNet.prototype.putWeights = function(weights) {
		if (weights.length != this.numberOfWeights) {
			console.log("Not enough replacement weights");
			return;
		}

		for (var i=0; i<this.numHiddenLayers + 1; i++) {
			for (var j=0; j<this.hiddenLayers[i].numNeurons; j++) {
				for (var k=0; i<this.hiddenLayers[i].neurons[j].numInputs; k++) {
					this.hiddenLayers[i].neurons[j].weights[k] = weights.shift();
				}
			}
		}
	}

	// calculates outputs from set of inputs
	NeuralNet.prototype.update = function(inputs) {
		outputs = [];
		var cWeight = 0;

		if (inputs.length != this.numInputs) {
			console.log('Inputs do not match');
			return outputs;
		}

		this.previousInputs = inputs;

		// for each layer:
		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			// in the first iteration, we want the raw input.
			// 	in the following iterations, we want the output which
			// 	we calculated in the previous iteration.
			if (i > 0) {
				inputs = outputs;
			}
			// console.log(i, inputs);

			outputs = [];
			cWeight = 0;

			// for each neuron sum the (inputs * weights).
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				var netInput = 0;

				var numInputs = this.hiddenLayers[i].neurons[j].numInputs;

				// for each weight
				for (var k = 0; k < numInputs-1; k++) {
					// sum weights * inputs
					netInput += this.hiddenLayers[i].neurons[j].weights[k] *
						inputs[cWeight++];
					// console.log(i, j, k, this.hiddenLayers[i].neurons[j]);
				}


				// add in bias
				netInput += this.hiddenLayers[i].neurons[j].weights[numInputs-1] *
					-1;

				outputs.push(this.sigmoid(netInput, 1));
				cWeight = 0;
			}

			this.hiddenLayers[i].previousOutputs = outputs;
		}

		return outputs;
	}
	
	NeuralNet.prototype.doBackPropagation = function(outputs, targetOutputs) {
		if (outputs.length != targetOutputs.length
			|| outputs.length != this.numOutputs) {
			console.log("Output vectors do not match");
			debugger;
			return;
		} else if (this.numHiddenLayers > 1) {
			console.log("Backpropagation not genericized for more than one hidden layer");
			debugger;
			return;
		}

		var outputLayerErrors = [];
		var hiddenLayerErrors = [];

		for (var i=0; i<outputs.length; i++) {
			outputLayerErrors[i] = outputs[i]
								* (1 - outputs[i])
								* (outputs[i] - targetOutputs[i]);
		}

		// console.log(outputs, targetOutputs, outputLayerErrors);

		/* TODO: Genericize this for more hidden layers
		// start increment at 1 to skip the input layer
		for (var i=1; i<this.numHiddenLayers; i++)
			for (var j=0; j<this.hiddenLayers[i]; j++)
		*/

		var hiddenLayer = this.inputLayer;
		for (var i=0; i<hiddenLayer.numNeurons; i++) {
			var sum = 0;
			for (j=0; j<outputs.length; j++) {
				// console.log("outputlayererror", j, outputLayerErrors[j]);
				// console.log("weight", this.outputLayer.neurons[j].weights[i]);
				sum += outputLayerErrors[j] * this.outputLayer.neurons[j].weights[i];
			}

			// console.log("sum", sum);

			hiddenLayerErrors[i] = hiddenLayer.previousOutputs[i]
								* (1-hiddenLayer.previousOutputs[i])
								* sum;
		}

		// console.log("Hidden layer to output layer");
		// now adjust the weights between the hidden layer and the output layer
		for (var i=0; i<this.outputLayer.numNeurons; i++) {
			for (var j=0; j<hiddenLayer.numNeurons; j++) {
				var deltaWeight = this.learningRate
								* outputLayerErrors[i]
								* hiddenLayer.previousOutputs[j];

				this.outputLayer.neurons[i].weights[j] += deltaWeight;
				// console.log(this.outputLayer.neurons[i]);
				// console.log(i, j, deltaWeight, this.outputLayer.neurons[i].weights[j]);
			}
		}

		// console.log("Input layer to hidden layer");
		// and adjust the weights between the input layer and the hidden layer
		for (var i=0; i<hiddenLayer.numNeurons; i++) {
			for (var j=0; j<this.numInputs; j++) {
				var deltaWeight = this.learningRate
								* hiddenLayerErrors[i]
								* this.previousInputs[j];

				// console.log(hiddenLayer.neurons[i]);
				// console.log(i, j, deltaWeight, hiddenLayer.neurons[i].weights[j]);

				hiddenLayer.neurons[i].weights[j] += deltaWeight;
			}
		}
	}

	NeuralNet.prototype.reward = function(output, rewardAmount, target) {
		var originalOutput = [], indexes = [];

		// if we have a target then just do that
		if (target) {
			console.log('doing', Math.abs(rewardAmount), 'reward/punish cycles from given target');

			for (var i=0; i<Math.abs(rewardAmount); i++) {
				this.doBackPropagation(output, target);
			}

			return;
		}

		// copy the original output so that we can do sorts
		for (var i=0; i<output.length; i++) {
			originalOutput[i] = output[i];
		}

		// identify strongest and weakest outputs, leave the others alone
		var strongestOutput = 0, weakestOutput = 1;
		for (var i=0; i<output.length; i++) {
			if (output[i] > strongestOutput) {
				strongestOutput = output[i];
			} if (output[i] < weakestOutput) {
				weakestOutput = output[i];
			}
		}

		if (rewardAmount > 0) {
			console.log("reward", rewardAmount, output);

			output[output.indexOf(strongestOutput)] = 1;
			output[output.indexOf(weakestOutput)] = 0;

			// do backprop
			for (var i=0; i<rewardAmount; i++) {
				this.doBackPropagation(originalOutput, output);
			}

			console.log("finished reward");
		} else if (rewardAmount < 0) {
			console.log("punishment", rewardAmount, output);

			// just do some fuzz
			var fuzzyTarget = [];
			for (var i=0; i<output.length; i++) {
				fuzzyTarget[i] = randomClamped();
			}

			for (var i=0; i>rewardAmount; i--) {
				this.doBackPropagation(originalOutput, fuzzyTarget);
			}

			console.log("finished punishment");
		} else {
			console.log("No reward amount given");
		}
	}

	NeuralNet.prototype.sigmoid = function(netInput, response) {
		return (sigmoid(-netInput/response));
	}
}

SuperBrain = new NeuralNet();