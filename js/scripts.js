'use strict';

// Usefull functions:
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
// ------------------

class Game {
    constructor(zmeika1, options) {
        this.zmeika1 = zmeika1;
        this.squareSize = options.squareSize;
        this.gameSpeed = options.gameSpeed;
        this.iteration = 0;
    }
    get size() {
        return this.squareSize;
    }
    get speed() {
        return this.gameSpeed;
    }
    start() {
        this.draw();
        console.log('game started');
    }
    stop() {
        cancelAnimationFrame(this.rAFid);
        console.log('game stopped');
    }
    draw() {
        setTimeout(() => {
            this.rAFid = requestAnimationFrame(this.draw.bind(this));
            if (this.iteration == 2) {
                this.zmeika1.changeDirection('down');
            }
            this.zmeika1.move();
            this.iteration++;
            console.log('draw');
        }, 1000 * this.gameSpeed);
    }
    init() {
        this.start();
        $('.gameGrid').css({
            width: `${this.squareSize * 20}px`,
            height: `${this.squareSize * 20}px`,
        });
        console.log('game inited');
    }
};

class Zmeika {
    constructor() {
        this.length = 3;
        this.direction = 'right';
        this.coords = [
            { x: [2], y: [0] },
            { x: [1, 2], y: [0,0] },
            { x: [0, 1, 2], y: [0,0,0] }
        ];

    }

    // spawn() {
    //     this.coords.push(
    //         {
    //             x: getRandomArbitrary(0, Game.size),
    //             y: getRandomArbitrary(0, Game.size),
    //         }
    //     );
    // }

    changeDirection(direction) {
        this.direction = direction;
    }

    move() {
        switch (this.direction) {
            case 'left':

                break;
            case 'right':
                for (let i = 0; i < this.coords.length; i++) {
                    let thisPart = this.coords[i];
                    let lastCoord = thisPart.x[thisPart.x.length - 1];
                    console.log(this.coords);
                    thisPart.x.push(++lastCoord);
                    thisPart.x.shift();
                    console.log(this.coords);
                    // for (let j = 0; j < this.coords[i].x; j++) {
                    //     this.coords[i].x[j]
                    // }
                }
                this.draw();
                break;
            case 'up':
                break;
            case 'down':
                for (let i = 0; i < this.coords.length; i++) {
                    let thisPart = this.coords[i];
                    let lastCoord = thisPart.y[thisPart.y.length - 1];
                    console.log(this.coords);
                    thisPart.x.push(thisPart.x[thisPart.x.length - 1]);
                    thisPart.x.shift();
                    thisPart.y.push(++lastCoord);
                    thisPart.y.shift();
                    console.log(this.coords);
                    // for (let j = 0; j < this.coords[i].x; j++) {
                    //     this.coords[i].x[j]
                    // }
                }
                this.draw();
                break;

            default:
                break;
        }
    }
    draw() {
        const self = this;
        $('.zmeika-1').children().each(function() {
            console.log($(this));
            let i = $(this).data('part');
            console.log(self.coords[i].x[0]);
            $(this).css('transform', `translate(${self.coords[i].x[0] * 20}px, ${self.coords[i].y[0] * 20}px)`);
        });
    }
};


$( document ).ready(function() {
    const zmeika1 = new Zmeika();
    const myGame = new Game(zmeika1, { squareSize: 10, gameSpeed: 0.2 });
    myGame.init();
});