// ------ Canvas Creation ------

// Create the canvas for the AI cars
const aiCanvas=document.getElementById("carCanvas");
aiCanvas.width=200;
// Create the canvas for the player car
const playerCanvas = document.getElementById("playerCanvas");
playerCanvas.width = 200;
// Create the canvas for the network visualizer
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

// ------ End of Canvas Creation ------


// ------ 2d Context Creation ------

const aiCtx = aiCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const playerCtx = playerCanvas.getContext("2d");

// ------ End of 2d Context Creation ------


// ------ Roads Creation ------

const aiRoad = new Road(aiCanvas.width/2, aiCanvas.width*0.9);
const playerRoad = new Road(playerCanvas.width/2, playerCanvas.width*0.9);

// ------ End of Roads Creation ------


// ------ Cars Creation ------

// Make a singular player car
let playerCar = new Car(playerRoad.getLaneCenter(1), 100, 30, 50, "PLAYER");
// Make the default max speed 3
let playerMaxSpeed = 3;

// Count to determine the amount of AI cars
let aiCount = 250;

// Generate the AI cars
let aiCars = generateCars(aiCount);

// Pick a "best car", just the first car in the array by default
let bestCar = aiCars[0];

// Check if there is a "besrBrain" in storage
if (localStorage.getItem("bestBrain")) {

    console.log("Loaded bestBrain from local storage.");

    // Go through all the AI cars
    for (let i = 0; i < aiCars.length; i++) {

        // Set the brain of the AI car to the bestBrain
        aiCars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain") 
        );

        // Mutate the brain of each car, unless the car is the first one in the array
        if (i != 0) {
            NeuralNetwork.mutate(
                aiCars[i].brain,
                0.25
            );
        }
    }
}

// ------ End of Cars Creation ------


// ------ Traffic Creation ------

// Set a value for the number of cars that will be in traffic, 35 by default
let maxTraffic = 35;

// Generate some random traffic
function randomTraffic(road, trafficArray) {
    for (let i = 0; i < maxTraffic; i++) {
        const lane = i % 3;
        const carToAdd = new Car(road.getLaneCenter(lane), (-100 - (150*i)), 30, 50, "DUMMY", 2);
        trafficArray.push(carToAdd);
    }
}

// Random traffic for ai road
const aiTraffic = [];
randomTraffic(aiRoad, aiTraffic);

// Random traffic for player road
const playerTraffic = [];
randomTraffic(playerRoad, playerTraffic);

// ------ End of Traffic Creation ------

// ------ Sliders Creation / Logic ------

const aiCountSlider = document.getElementById("aiCountSlider");
const aiCountDisplay = document.getElementById("aiCountDisplay");

// This function runs every time the AI count slider moves
// Used to display the number the user will select when slider is released
aiCountSlider.addEventListener("input", (event) => {

    // Update the count visually
    aiCountDisplay.innerText = parseInt(aiCountSlider.value);
});

// This function runs when the user picks a new value
aiCountSlider.addEventListener("change", (event) => {

    // Update the aiCount variable with the new value
    aiCount = parseInt(aiCountSlider.value)

    // Reset the AI state
    resetAiState();
});

const speedSlider = document.getElementById("speedSlider");
const speedDisplay = document.getElementById("speedDisplay");

// This function runs every time the speed slider moves
// Used to display the number the user will select when slider is released
speedSlider.addEventListener("input", (event) => {

    // Update the count visually
    speedDisplay.innerText = parseInt(speedSlider.value);
});

// This function runs when the user picks a new value
speedSlider.addEventListener("change", (event) => {

    // Update the aiCount variable with the new value
    playerMaxSpeed = parseInt(speedSlider.value);

    // Reset the player state
    resetPlayerState();
});

const trafficSlider = document.getElementById("trafficSlider");
const trafficDisplay = document.getElementById("trafficDisplay");

// This function runs every time the traffic slider moves
// Used to display the number the user will select when slider is released
trafficSlider.addEventListener("input", (event) => {

    // Update the count visually
    trafficDisplay.innerText = parseInt(trafficSlider.value);
});

// This function runs when the user picks a new value
trafficSlider.addEventListener("change", (event) => {

    // Update the aiCount variable with the new value
    maxTraffic = parseInt(trafficSlider.value);

    // Reset the player and AI state
    resetPlayerState();
    resetAiState();
});

// ------ End of Sliders Creation / Logic ------


// ------ Animation ------

// Call animate() to start the game
animate();

function animate() {

    // Update height according to the window
    aiCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight - 100;
    playerCanvas.height = window.innerHeight;

    // Animate AI Section
    animateAiSection();

    // Animate player section
    animatePlayerSection();

    // Get next frame
    requestAnimationFrame(animate);
}

function animatePlayerSection() {

    // Update player traffic
    for (let i = 0; i < playerTraffic.length; i++) {
        playerTraffic[i].update(playerRoad.borders, []);
    }

    // Update player car
    playerCar.update(playerRoad.borders, playerTraffic);

    // Check the # of cars currently passed
    const passedNow = checkPassed(playerCar, playerTraffic);

    // Check if there is a new maxPasses value
    playerCar.maxPasses = Math.max(playerCar.maxPasses, passedNow);

    // Log the maxPasses of the player
    console.log("Player has maxPasses of " + playerCar.maxPasses);

    // Check if the player won
    // The player can win by passing all of the traffic
    if (playerCar.maxPasses >= playerTraffic.length) {
        console.log("Player has won!");
    }

    // Follow player car
    playerCtx.save();
    playerCtx.translate(0, -playerCar.y+playerCanvas.height*0.7);

    // Draw player road
    playerRoad.draw(playerCtx);

    // Draw traffic as red
    for (let i = 0; i < playerTraffic.length; i++) {
        playerTraffic[i].draw(playerCtx, "red");
    }

    // Draw player car solid blue
    playerCar.draw(playerCtx, "blue", true);

    // Restore ctx
    playerCtx.restore();

    // If player car is disabled reset player state
    if (playerCar.damaged) {
        resetPlayerState();
        console.log("Player car damaged, reseting player state.");
    }
}

function animateAiSection() {

    // Disable stuck cars
    for (let i = 0; i < aiCars.length; i++) {
        checkStuck(aiCars[i], aiTraffic);
    }

    // Check how many of the AI cars are damaged
    let damagedCount = 0;
    for (let i = 0; i < aiCars.length; i++) {
        if (aiCars[i].damaged == true) {
            damagedCount++;
        }
    }

    // If all cars are disabled, save the best car and reset the simulation
    if (damagedCount == aiCount) {
        save();
        resetAiState();
    }

    // Update AI road traffic
    for (let i = 0; i < aiTraffic.length; i++) {
        aiTraffic[i].update(aiRoad.borders, []);
    }

    // Update AI road cars
    for (let i = 0; i < aiCars.length; i++) {
        aiCars[i].update(aiRoad.borders, aiTraffic);
    }

    // Find the best car (the car that travelled the furthest)
    bestCar = pickBestCar(aiCars);

    // Check if the AI won
    if (bestCar.maxPasses >= aiTraffic.length) {
        console.log("The AI won!");
    }

    // Follow bestCar
    aiCtx.save();
    aiCtx.translate(0, -bestCar.y+aiCanvas.height*0.7);

    // Draw road
    aiRoad.draw(aiCtx);

    // Draw traffic as red
    for (let i = 0; i < aiTraffic.length; i++) {
        aiTraffic[i].draw(aiCtx, "red");
    }

    // Draw all cars except for bestCar transparently
    aiCtx.globalAlpha = 0.2;
    for (let i = 0; i < aiCars.length; i++) {
        aiCars[i].draw(aiCtx, "blue");
    }

    // Draw the best car solid blue
    aiCtx.globalAlpha = 1;
    bestCar.draw(aiCtx, "blue", true);

    // Restore ctx
    aiCtx.restore();

    // Draw vizualizer for the neural network
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
}

// ------ End of Animation ------


// ------ Save / Discard method for JSON "bestBrain" ------

// Save a JSON Object called "bestBrain"
function save() {
    localStorage.setItem(
        "bestBrain",
        JSON.stringify(bestCar.brain)
    );
}

// Discard a JSON Object called "bestBrain"
function discard() {
    localStorage.removeItem("bestBrain");
    resetAiState();
}

// ------ End of Save / Discard method for JSON "bestBrain" ------


// ------ Reset States for AI and Player ------

// Method to reset the state of the AI
function resetAiState() {

    console.log("Resetting AI state.");

    // Generate some new AI cars
    aiCars = generateCars(aiCount);

    // Check if there is a "bestBrain" in storage
    if (localStorage.getItem("bestBrain")) {

        // Go through all the AI cars
        for (let i = 0; i < aiCars.length; i++) {

            // Set the brain of the AI car to the bestBrain
            aiCars[i].brain = JSON.parse(
                localStorage.getItem("bestBrain") 
            );

            // Mutate the brain of the car, unless the car is the first one in the array
            if (i != 0) {
                NeuralNetwork.mutate(
                    aiCars[i].brain,
                    0.25
                );
            }
        }
    } else { // otherwise generate some random cars and set bestCar as the first one in the array of AI cars
        aiCars = generateCars(aiCount);
        bestCar = aiCars[0];
        save();
    }

    // Reset AI traffic
    aiTraffic.length = 0;
    randomTraffic(aiRoad, aiTraffic);
}

// Method to reset the state of the player
function resetPlayerState() {

    console.log("Resetting Player state.");

    playerCar = new Car(playerRoad.getLaneCenter(1), 100, 30, 50, "PLAYER", playerMaxSpeed);

    playerTraffic.length = 0;
    randomTraffic(playerRoad, playerTraffic);
}

// ------ End of Reset States for AI and Player ------

// ------ Change Game Variables ------

// Method to update the number of AI cars running in parallel
function updateAiCount() {

}

// Method to update the max speed of the player car
function updateSpeed() {

}

// Method to update the number of cars in traffic
function updateTrafficCount() {
    
}

// ------ End of Change Game Variables ------