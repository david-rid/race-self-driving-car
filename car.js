class Car {

    // Constructor for car with maxSpeed being set to 3 by default
    constructor(x, y, width, height, controlType, maxSpeed = 3) {

        // Position car
        this.x = x;
        this.y = y;

        // Add width and height to car
        this.width = width;
        this.height = height;

        // Set default speed, acceleration, maxSpeed, and friction
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction=0.05;

        // Set the default angle of the car as 0 (facing up)
        this.angle = 0;

        // Car is not damaged by default
        this.damaged = false;

        // Car has not passed any of the traffic by default
        this.maxPasses = 0;

        // Property to store true if the car will be using an AI brain
        this.useBrain = controlType == "AI";

        if (controlType == "AI") {

            // If car is AI, add these new properties:
            // 1. sensor: sensors for the AI car from sensor.js
            // 2. brain: brain for the AI to control the car from network.js
            // 3. frameAge: how many frames the car has existed for
            // 4. isStuck: boolean to track if the car is stuck behind traffic

            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
            this.frameAge = 0;
            this.isStuck = false;

            console.log("AI car registered.")
        }

        // No new properties needed if car is a player controlled car
        if (controlType == "PLAYER") {
            console.log("Player car registered.");
        }

        // "DUMMY" is the traffic cars
        if (controlType == "DUMMY") {
            // Boolean to keep track of if the car has been passed
            this.passed = false;
            console.log("Traffic car registered.")
        }

        // Register controls for the car based on passed control type
        this.controls = new Controls(controlType);
    }
    
    // Update the car
    update(roadBorders, traffic) {

        // Check if the car is NOT damaged
        if (!this.damaged) {
            // Allow the car to move
            this.#move();
            // Update polygon for the car
            this.polygon = this.#createPolygon();
            // Assess if the car has become damaged
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        // If the car has sensors, update them
        if (this.sensor) {

            // Call .update on sensors
            this.sensor.update(roadBorders, traffic);

            // Create an array of offsets from the sensors
            const offsets = this.sensor.readings.map(
                s => s==null?0:1-s.offset
            );

            // Feed the offsets into the neural network
            const outputs = NeuralNetwork.feedForward(
                offsets,
                this.brain
            );

            // Use the output from the neural network to move the car
            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    // Assess if the car is damaged or not
    // Damaged means the car has hit something like the road border or traffic
    #assessDamage(roadBorders, traffic) {

        // If the car intersects with any of the road borders, it is damaged
        for (let i = 0; i <  roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }

        // If the car intersects with any of the traffic, it is damaged
        for (let i = 0; i <  traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }

        // If we have reached here, there has been no collisions, so return false for damaged
        return false;
    }

    // Create a polygon for the car
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });

        return points;
    }

    // Move the car according to controls
    #move() {

        // Basic foward and reverse, adjusted for acceleration
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        
        // Only allow car to reach up to the max speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        // If the car is traveling at less than half of the max speed, make it travel at half the max speed
        if (this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }

        // Apply friction if the car is in motion
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }

        // If the speed is less than the friction, set speed to zero
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // Flip left/right controls based on which direction the car is travelling
        if (this.speed != 0) {
            const flip = (this.speed > 0) ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03*flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03*flip;
            }
        }

        // update x and y values of the car
        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    // Draw the car
    draw(ctx, color, drawSensor = false) {

        // Make the car gray if it is damaged
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else { // otherwise make the car the specified color
            ctx.fillStyle = color;
        }

        // Draw the car
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        // Draw the sensors if there are any
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}