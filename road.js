class Road {

    // Constructor for road with default lane count being 3 lanes
    constructor(x, width, laneCount = 3) {

        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x-width/2;
        this.right = x+width/2;

        // Make top and bottom very far away,
        // giving the illusion of the road being infinite
        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        // Identify the corner points of the road
        const topLeft = {x:this.left, y:this.top};
        const topRight = {x:this.right, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const bottomRight = {x:this.right, y:this.bottom};

        // Add borders based on the corner points
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    // Get the center of a specific lane
    getLaneCenter(laneIndex) {
        const laneWidth = this.width/this.laneCount;
        return this.left + laneWidth/2 + 
            Math.min(laneIndex, this.laneCount-1)*laneWidth;
    }

    // Draw the road
    draw(ctx) {

        // Set line width to 5 and stroke style to white
        // for consistency accross lanes 
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // Go lane by lane drawing each
        for (let i = 1; i <= this.laneCount-1; i++) {

            const x = lerp(
                this.left,
                this.right,
                i/this.laneCount
            );
            
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        // Draw road borders
        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        })
    }
}