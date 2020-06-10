class Animation {

    constructor(colours, mirroring, condition, squareDimensions, canvas, slider, speed, facesBool) {
        this.colours = colours; // expressed in ABC order
        this.mirrored = mirroring;
        this.launchingType = condition[0];
        this.targetSync = condition[1];
        this.hideA = condition[2];
        if (this.colours[0] === "hidden") {
            this.hideA = true;
        }
        this.stickAndHole = condition[3];
        this.squareDimensions = squareDimensions;
        this.canvas = canvas;
        this.slider = slider;
        this.faces = facesBool;

        this.squareNames = ["A", "B", "C"];
        this.faceNames = ["angry", "love", "surprise"];
        this.faceNamesR = ["angry", "loveR", "surprise"];
        this.holeColour = "#d9d2a6"
        this.participantCanLeave = false;
        this.animationStarted = Infinity;
        this.animationEnded = false;
        this.flashState = false;
        this.animationTimer = [];
        this.speed = speed;
        this.durations = [];

        this.showFlash = false;
        this.squareList = [];
        this.placeSquares();
        this.resetSquares();
    }

    placeSquares() {
        for (var i = 0; i < 3; i++) {
            var squareColour = (this.hideA && i === 0) ? "hidden" : this.colours[i];
            var face, newSquare;
            if (this.faces === true){
                face = this.mirrored ? this.faceNamesR[i] : this.faceNames[i];
                newSquare = new Square(this.squareNames[i], squareColour, this.squareDimensions, face);
            } else {
                newSquare = new Square(this.squareNames[i], squareColour, this.squareDimensions, false);
            }

            this.squareList.push(newSquare);
        }
        if (this.hideA === true) {
            this.squareList[0].colourName = "hidden";
        }
        this.setUp()
    }

    setUp(){
        var canvasMargin = this.canvas.width / 4;
        // give start/end positions
        for (var i = 0; i<3; i++) {
            var square = this.squareList[i];
            var startPosition, endPosition;
            if (i === 0) {
                startPosition = this.mirrored ? canvasMargin + 5 * this.squareDimensions[0] : canvasMargin;
                endPosition = this.mirrored ? startPosition - 2.5 * this.squareDimensions[0] : canvasMargin + 2.5 * this.squareDimensions[0];
            } else {
                startPosition = this.mirrored ? this.squareList[0].finalPosition[0] - this.squareDimensions[0] - 2 * this.squareDimensions[0] * (i-1) : this.squareList[0].finalPosition[0] + this.squareDimensions[0] + 2*this.squareDimensions[0] * (i-1);
                endPosition = this.mirrored ? startPosition - this.squareDimensions[0] : startPosition + this.squareDimensions[0];
            }
            square.startPosition = [startPosition, 100];
            square.finalPosition = [endPosition, 100];
            var duration = (endPosition - startPosition) / this.speed; //(pix p step)
            duration = this.mirrored ? duration * -1 : duration;
            square.duration = duration;
            this.durations.push(duration);

        this.draw();
        }

        // give "move At" instructions
        if (this.launchingType === "canonical"){
            this.squareList[0].moveAt = 0;
            this.squareList[1].moveAt = this.squareList[0].duration;
            this.squareList[2].moveAt = this.squareList[1].moveAt + this.squareList[1].duration;
        } else {
            this.squareList[0].moveAt = 0;
            this.squareList[2].moveAt = this.squareList[0].duration;
            this.squareList[1].moveAt = this.squareList[2].moveAt + this.squareList[2].duration;
        }
    }
    resetSquares() {
        for (var i = 0; i < 3; i++) {
            this.squareList[i].reset();
        }
    }

    startAnimation(){
        this.animationStarted = Date.now();
        window.requestAnimationFrame(this.draw.bind(this));
    }
    endAnimation(){
        this.animationEnded = Date.now();
        /*if(this.opts.test) {
            this.showQuestion = true;
            this.nextVisible = true;
            this.experiment.update();//will show button
        }
        else{
            this.finish();
        }*/
    }
    setTimeouts(startInstructions=null) {
        // self.mirrored = self.opts.mirrored;
        //
        // self.colour = self.opts.colours[2];
        // self.textStyle = {color:self.colour,'font-weight': 'bold'};
        //
        // self.canvas = self.refs.canvas;
        //
        //
        // self.setup();
        // self.experiment.screenShot = self.canvas.toDataURL();
        // var finishTimings = self.objects.map(function(obj){return obj.moveAt+ obj.duration});
        var finishTimings = this.squareList.map(function(obj){return obj.moveAt+ obj.duration});
        var lastFinish = Math.max.apply(null, finishTimings);
        var startAt;
        if (startInstructions === null) {
            startAt = 1500;
        } else {
            startAt = startInstructions;
        }
        var timeoutId;
        timeoutId = setTimeout(this.startAnimation.bind(this), startAt);
        this.animationTimer.push(timeoutId);
        timeoutId = setTimeout(this.endAnimation.bind(this), startAt + lastFinish + 500);
        this.animationTimer.push(timeoutId);
        var animationSpace = lastFinish + 500;
        if (this.showFlash) {
            var flashTime = animationSpace / 200 * this.slider.value + 750;
            timeoutId = setTimeout(this.flashOn.bind(this), flashTime);
            this.animationTimer.push(timeoutId);
            timeoutId = setTimeout(this.flashOn.bind(this), flashTime + 25);
            this.animationTimer.push(timeoutId);
        }
        return lastFinish;
    }

    draw() {
        if (!this.animationEnded) {
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            var step = Date.now() - this.animationStarted;

            for (var i = 0; i < this.squareList.length; i++) {
                this.squareList[i].draw(this.canvas, step);
            }
            // draw the whole for middle
            if (this.squareList[1].colourName !== "hidden"){
                let ctx = this.canvas.getContext("2d");
                ctx.fillStyle = this.holeColour;
                ctx.fillRect(this.squareList[1].position[0], this.squareList[1].position[1] + 1/3 * this.squareList[1].dimensions[1], this.squareList[1].dimensions[0],1/3* this.squareList[1].dimensions[1]);
            }

            if(this.stickAndHole) {
                this.drawObjects()
            }
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    drawObjects(){
        var ctx = this.canvas.getContext('2d');
        var squareA = this.squareList[0];
        var squareB = this.squareList[1];
        var squareC = this.squareList[2];
        var stickSize = squareA.dimensions[0] * 2;
        if (this.mirrored) {

            // draw stick
            if (!this.hideA) {
                ctx.beginPath();
                ctx.moveTo(squareA.position[0], squareA.position[1] + 1 / 2 * squareA.dimensions[1]);
                ctx.lineTo(squareA.position[0] - stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1]);
                ctx.stroke();
                // vertical
                ctx.beginPath();
                ctx.moveTo(squareA.position[0] - stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1] - 5);
                ctx.lineTo(squareA.position[0] - stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1] + 5);
                ctx.stroke();
            }

        } else {

            // draw stick
            // horizontal
            if (!this.hideA) {
                ctx.beginPath();
                ctx.moveTo(squareA.position[0] + squareA.dimensions[0], squareA.position[1] + 1 / 2 * squareA.dimensions[1]);
                ctx.lineTo(squareA.position[0] + squareA.dimensions[0] + stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1]);
                ctx.stroke();
                // vertical
                ctx.beginPath();
                ctx.moveTo(squareA.position[0] + squareA.dimensions[0] + stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1] - 5);
                ctx.lineTo(squareA.position[0] + squareA.dimensions[0] + stickSize, squareA.position[1] + 1 / 2 * squareA.dimensions[1] + 5);
                ctx.stroke();
            }
        }
        // draw chain
        if (this.squareList[1].colourName !== "hidden" && this.squareList[2].colourName !== "hidden"){
            ctx.beginPath();
            var squareBMiddleX, squareBChosenY, squareCMiddleX, squareCChosenY;
            squareBMiddleX = squareB.position[0] + squareB.dimensions[0] * 1 / 2;
            squareBChosenY = squareB.position[1] + squareB.dimensions[1] * 9 / 10;
            squareCMiddleX = squareC.position[0] + squareC.dimensions[0] * 1 / 2;
            squareCChosenY = squareC.position[1] + squareC.dimensions[1] * 9 / 10;

            var distanceBetweenSquares, squareMiddlePoint;
            distanceBetweenSquares = Math.abs(squareBMiddleX - squareCMiddleX);
            squareMiddlePoint = this.mirrored ? distanceBetweenSquares / 2 + squareCMiddleX : distanceBetweenSquares / 2 + squareBMiddleX;

            var chosenCPY = squareB.position[1] + squareB.dimensions[1] + 120 - 0.75 * distanceBetweenSquares;
            ctx.moveTo(squareBMiddleX, squareBChosenY);
            ctx.quadraticCurveTo(squareMiddlePoint, chosenCPY, squareCMiddleX, squareCChosenY);
            ctx.stroke();
        }

    }
    flashOn() {
        if (this.showFlash = true) {
            if (this.flashState === false){
                this.canvas.style.backgroundColor = "black";
                this.flashState = true;
                if (this.hideA === true){
                    this.squareList[0].colour = "#000000";
                    this.squareList[0].drawMe(this.canvas);
                }
            } else {
                this.canvas.style.backgroundColor = "white";
                this.flashState = false;
                if (this.hideA === true) {
                    this.squareList[0].colour = "#FFFFFF";
                    this.squareList[0].drawMe(this.canvas);
                }
            }
        }
    }
}

class Square {
    constructor(name, colourName, dimensions, face) {
        this.colourName = colourName;
        switch (this.colourName) {
            case "red":
                this.colour = "#FF0000";
                break;
            case "green":
                this.colour = "#00FF00";
                break;
            case "blue":
                this.colour = "#0000FF";
                break;
            case "black":
                this.colour = "#000000";
                break;
            case "hidden":
                this.colour = "#FFFFFF";
                break;
            case "purple":
                this.colour = "#ec00f0";
                break;
        }
        this.name = name;
        this.dimensions = dimensions;

        this.startPosition = [0, 0];
        this.finalPosition = [0, 0];
        this.moveAt = 0;
        this.movedAt = -1; //the time it actually moved
        this.position = [0, 0];
        this.duration = 200;

        this.animationTimer = 0;
        this.pixelsPerStep = [0,0];

        this.hasFace = face;
        if (this.hasFace !== false){
            this.facePic = new Image();
            switch (this.hasFace) {
                case "angry":
                    this.facePic.src = "Angry.png";
                    break;
                case "love":
                    this.facePic.src = "Love.png";
                    break;
                case "loveR":
                    this.facePic.src = "LoveR.png";
                    break;
                case "surprise":
                    this.facePic.src = "Surprise.png";
                    break;
            }
        }
    }

    draw(canvas, step){
        // var canvas = document.getElementById("MyCanvas");
        var myStep = Math.max(0, step - this.moveAt);

        if (myStep < this.duration) {
            this.position[0] = this.startPosition[0] + this.pixelsPerStep[0] * myStep;
            this.position[1] = this.startPosition[1] + this.pixelsPerStep[1] * myStep;
        } else {
            this.position[0] = this.finalPosition[0];
            this.position[1] = this.finalPosition[1];
        }

        this.drawMe(canvas);



        if(this.movedAt ===-1 && myStep>0) {
            this.movedAt = step;
            // console.log(this.name + ' moved at ' + this.movedAt);
        }
    }

    drawMe(canvas) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.position[0],  this.position[1], this.dimensions[0], this.dimensions[1]);

        if (this.hasFace !== false && this.colourName !== "hidden") {
            ctx.drawImage(this.facePic, this.position[0], this.position[1], this.dimensions[0], this.dimensions[1])
        }
    }


    reset(){
        this.movedAt = -1;
        this.position = this.startPosition.slice();
        this.pixelsPerStep = [(this.finalPosition[0] - this.startPosition[0]) / this.duration,
            (this.finalPosition[1] - this.startPosition[1]) / this.duration];
    }
}