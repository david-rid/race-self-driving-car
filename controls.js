class Controls {

    // Construct controls based on type
    constructor(type) {

        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        switch(type) {
            case "PLAYER":
                // only add keyboard listeners if control type is player
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                // These dummy cars are the traffic cars, so just keep them moving forward
                this.forward = true;
                break;
        }

    }

    // Add controls for the player via the arrow keys
    #addKeyboardListeners() {

        // Add onkeydown events for when a key is PRESSED
        document.onkeydown = (event) => {
            switch(event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }

        // Add onkeyup events for when a key is RELEASED
        document.onkeyup = (event) => {
            switch(event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}