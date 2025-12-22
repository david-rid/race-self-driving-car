// ------ Utility functions for the AI ------

// Method to generate #(N) AI cars
function generateCars(N) {

    // Create empty array for the AI cars
    const aiCars = [];

    // Generate an AI car N times
    for (let i = 0; i < N; i++) {

        // Create each new AI car in the same position with the same dimensions
        const c = new Car(aiRoad.getLaneCenter(1), 100, 30, 50, "AI")

        // Slightly randomize the angle of the car for better results
        c.angle += (Math.random()-0.5)*0.02;

        // Push each car to aiCars 
        aiCars.push(c);
    }

    // Return the array of aiCars
    return aiCars;
}

// Method to check if a car is stuck
function checkStuck(car, traffic) {
    const TIMEOUT_FRAMES = 600;

    // ensure frame age field exist (in case of non-AI cars)
    if (car.frameAge == null) car.frameAge = 0;

    car.frameAge++;

    const passedNow = checkPassed(car, traffic);

    // reset timer only when making *new* progress
    if (passedNow > car.maxPasses) {
        car.frameAge = 0;
        car.maxPasses = passedNow;
    }

    if (car.frameAge > TIMEOUT_FRAMES) {
        // only register car as stuck if it is not already damaged
        // and also check if the car has passed all traffic
        if (!car.damaged && car.maxPasses < traffic.length) {
            car.damaged = true;
            car.isStuck = true;
        }
    }
}

// Pick the best car
function pickBestCar(cars) {

    // Make sure stuck cars are not elligible
    const eligibleCars = cars.filter(c => !c.isStuck);

    // If all cars were stuck, just choose the first car
    if (eligibleCars.length == 0) {
        return cars[0];
    }

    // Return the eligible car that travelled the furthest
    return eligibleCars.find(
        c => c.y == Math.min(
            ...eligibleCars.map(c => c.y)
        )
    );
}

function checkPassed(car, traffic) {

    let passedCount = 0;

    for (let i = 0; i < traffic.length; i++) {
        if (car.y < traffic[i].y) {
            passedCount++;
        }
    }

    return passedCount;
}