class Sensor {

    // Create a car for the sensors to operate on
    constructor(car) {

        this.car = car;

        // Create 5 total rays (sensor beams)
        // Each with length of 150 and spread evenly in a 90 degree cone
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI/2;

        // Create empty arrays for rays and readings
        this.rays = [];
        this.readings = [];
    }

    // Update the sensors
    update(roadBorders, traffic) {

        // Cast the rays
        this.#castRays();

        // Empty the readings
        this.readings = [];
        // Get new readings
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push (
                this.#getReading(
                    this.rays[i], 
                    roadBorders,
                    traffic
                )
            );
        }
    }

    // Get new reading from a ray
    #getReading(ray, roadBorders, traffic) {

        // Empty array for touches
        let touches = [];

        // Check for touches with the road boarders
        for (let i = 0; i < roadBorders.length; i++) {

            // Check for a touch between the current roadBorder
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );

            // If the ray touches the road border, add it to touches
            if (touch) {
                touches.push(touch);
            }
        }

        // Check for touches with traffic (dummy cars)
        for (let i = 0; i < traffic.length; i++) {

            // Set poly as the polygon for the current car in traffic we are checking for touches
            const poly = traffic[i].polygon;

            // Go through each face of the polygon
            for (let j = 0; j < poly.length; j++) {

                // Check if the sensor is touching
                const value  = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );

                // If there is a touch, add it to touches
                if (value) {
                    touches.push(value);
                }
            }
        }

        // If touches.length is zero, the sensor is touching nothing
        if (touches.length == 0) {
            return null;
        } else {
            // 1. Map all of the offsets from touches
            const offsets = touches.map(e => e.offset);
            // 2. Find the smallest offset
            const minOffset = Math.min(...offsets);
            // 3. Find and return the touch object that has the smallest offset
            return touches.find(e => e.offset==minOffset);
        }
    }

    // Cast rays
    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {

            // Find the angle by which the current ray should be cast
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                i/(this.rayCount-1)
            )+this.car.angle; // accout for the angle of the car

            // Determine the starting and end point of the ray
            const start = {x:this.car.x, y:this.car.y};
            const end = {
                x:this.car.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                    Math.cos(rayAngle)*this.rayLength
            };

            // Update the rays
            this.rays.push([start, end]);
        }
    }

    // Draw the sensors
    draw(ctx) {

        // Go though rays and draw each one
        for (let i = 0; i < this.rayCount; i++) {

            // Find where ray should end
            let end = this.rays[i][1];

            // If the ray has hit something, make that the end
            if (this.readings[i]) {
                end = this.readings[i];
            }

            // Make a yellow line from the start to the end
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            // Make a black line from where the yellow line ended to the end of the ray
            // If the ray did not hit anything, there will be no black line
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}