'use strict';

// Usefull functions:
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function throttle(func, ms) {
    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {
        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }
        func.apply(this, arguments);
        isThrottled = true;
        setTimeout(function () {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}
// ------------------
// Usefull dictionaries:
const restrictedDirections = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up',
};
// ------------------

class Snake {
    constructor(options) {
        this.gameInstance = options.gameInstance;
        this.gridSize = this.gameInstance.gridSize;
        this.id = Snake.counter;
        this.snakeEl = null;
        this.length = 0;
        this.direction = '';
        this.coords = [];
        this.keyDownHandler = throttle(this.onKeyDown.bind(this), 1000 * this.gameInstance.gameSpeed);
        this.init();
    }

    static get counter() {
        Snake._counter = (Snake._counter || 0) + 1;
        return Snake._counter;
    }

    changeDirection(direction) {
        if (this.direction === restrictedDirections[direction]) return; // check if snake try to go in opposite direction
        this.direction = direction;
    }

    move() {
        /**
         * @param axis - String 'x' or 'y'
         * @param value - Number 1 or -1
         */
        const changeCoords = (axis, value) => {
            for (let i = 0; i < this.coords.length; i++) {
                let thisPart = this.coords[i];
                let thisPartLastCoords = {
                    x: thisPart.x[thisPart.x.length - 1],
                    y: thisPart.y[thisPart.y.length - 1],
                };
                thisPartLastCoords[axis] += value;
                thisPart.x.push(thisPartLastCoords.x);
                thisPart.y.push(thisPartLastCoords.y);
                thisPart.x.shift();
                thisPart.y.shift();
            }
            const lastPartCoords = this.coords[this.coords.length - 1];
            const lastPartNewCoords = {
                x: lastPartCoords.x[this.coords.length - 1],
                y: lastPartCoords.y[this.coords.length - 1],
            };
            this.checkForLoose();
            this.checkForApple(lastPartNewCoords);
        };

        switch (this.direction) {
            case 'left':
                changeCoords('x', -1);
                this.draw();
                break;
            case 'right':
                changeCoords('x', 1);
                this.draw();
                break;
            case 'up':
                changeCoords('y', -1);
                this.draw();
                break;
            case 'down':
                changeCoords('y', 1);
                this.draw();
                break;

            default:
                break;
        }
    }

    checkForApple(newCoords) {
        const headCoords = this.coords[0];
        const coordsToCheck = `${headCoords.x[0]}/${headCoords.y[0]}`;
        const possibleApple = this.gameInstance.apples[coordsToCheck];
        if (possibleApple) {
            this.eatApple(newCoords);
            possibleApple.eat();
        }
    }

    eatApple(newCoords) {
        this.length++;
        const newPart = {x: [], y: []};
        for (let i = 0; i < this.coords.length; i++) {
            newPart.x.push(this.coords[0].x[0]);
            newPart.y.push(this.coords[0].y[0]);
        }
        newPart.x.push(newCoords.x);
        newPart.y.push(newCoords.y);
        this.coords.push(newPart);
        const newPartEl = document.createElement('div');
        newPartEl.dataset.part = this.coords.length - 1;
        this.snakeEl.appendChild(newPartEl);
    }

    checkForLoose() {
        const headCoords = this.coords[0];
        const maxVal = this.gameInstance.areaSize - 1;
        if (headCoords.x[0] < 0 || headCoords.x[0] > maxVal || headCoords.y[0] < 0 || headCoords.y[0] > maxVal)  {
            this.gameInstance.stop();
            openModal();
        }
        for (let i = 1; i < this.coords.length; i++) {
            if (headCoords.x[0] == this.coords[i].x[0] && headCoords.y[0] == this.coords[i].y[0]) {
                this.gameInstance.stop();
                openModal();
            }
        }
    }

    draw() {
        const self = this;
        const snakeParts = this.snakeEl.children;
        for (let i = 0; i < snakeParts.length; i++) {
            const j = snakeParts[i].dataset['part'];
            snakeParts[i].style.transform = `translate(${self.coords[j].x[0] * this.gridSize}px, ${self.coords[j].y[0] * this.gridSize}px)`;
        }
    }

    onKeyDown(e) {
        switch (e.keyCode) {
            case 37:
                this.changeDirection('left');
                break;
            case 38:
                this.changeDirection('up');
                break;
            case 39:
                this.changeDirection('right');
                break;
            case 40:
                this.changeDirection('down');
                break;
            default:
                break;
        }
    }

    init() {
        this.coords = [
            {x: [2], y: [0]},
            {x: [1, 2], y: [0, 0]},
            {x: [0, 1, 2], y: [0, 0, 0]},
        ];
        this.length = this.coords.length;
        this.direction = 'right';
        const snakeEl = document.createElement('div');
        snakeEl.classList.add('snake');
        snakeEl.id = `snake-${this.id}`;
        let snakeParts = '';
        for (let i = 0; i < this.coords.length; i++) {
            snakeParts += `<div data-part="${i}"></div>`;
        }
        snakeEl.innerHTML = snakeParts;
        document.getElementsByClassName('gameArea')[0].appendChild(snakeEl);
        this.snakeEl = snakeEl;
        this.draw();
        this.attachEvents();
    }

    destroy() {
        this.snakeEl.remove();
        this.snakeEl = null;
        this.coords = [];
        this.dettachEvents();
    }

    attachEvents() {
        document.addEventListener('keydown', this.keyDownHandler);
    }

    dettachEvents() {
        document.removeEventListener('keydown', this.keyDownHandler);
    }
}
;

class Apple {
    constructor(options) {
        this.x = getRandomArbitrary(1, options.areaSize);
        this.y = getRandomArbitrary(1, options.areaSize);
        this.element = document.createElement('div');
        this.element.classList.add('apple');
        this.gridSize = options.gridSize;
        this.removeApple = options.removeApple;
    }

    spawn() {
        document.getElementsByClassName('gameArea')[0].appendChild(this.element);
        this.element.style.transform = `translate(${this.x * this.gridSize}px, ${this.y * this.gridSize}px)`;
    }

    eat() {
        this.element.remove();
        this.removeApple(`${this.x}/${this.y}`);
    }
}

class Game {
    constructor(options) {
        this.snake1 = null;
        this.gridSize = 20;
        this.areaSize = options.areaSize;
        this.gameSpeed = options.gameSpeed;
        this.appleCount = this.areaSize + getRandomArbitrary(1, this.areaSize/2);
        this.apples = {};
        this.iteration = 0;
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
            this.snake1.move();
            this.iteration++;
            console.log('draw');
        }, 1000 * this.gameSpeed);
    }

    init() {
        console.log('game inited');
        this.snake1 = new Snake({gameInstance: this});
        this.spawnApples();
        this.start();
        const gameGridEl = document.getElementsByClassName('gameGrid')[0];
        gameGridEl.style.width = `${this.areaSize * this.gridSize}px`;
        gameGridEl.style.height = `${this.areaSize * this.gridSize}px`;
    }

    destroy() {
        this.snake1.destroy();
        this.removeApples();
        this.iteration = 0;
    }

    restart() {
        console.log('game restarted');
        closeModal();
        this.destroy();
        this.snake1.init();
        this.spawnApples();
        this.start();
    }

    spawnApples() {
        for (let i = 0; i < this.appleCount; i++) {
            const apple = new Apple({
                areaSize: this.areaSize,
                removeApple: this.removeApple.bind(this),
                gridSize: this.gridSize
            });
            if (typeof this.apples[`${apple.x}/${apple.y}`] === 'undefined') {
                this.apples[`${apple.x}/${apple.y}`] = apple;
                apple.spawn();
            } else {
                i--;
            }
        }
    }

    removeApples() {
        for (let apple in this.apples) {
            this.apples[apple].eat();
        }
    }

    removeApple(id) {
        delete this.apples[id];
    }
};


// $( document ).ready(function() {
// });

const myGame = new Game({ areaSize: 20, gameSpeed: 0.3 });

myGame.init();

const clickRestartHandler = myGame.restart.bind(myGame);
const keyDownRestartHandler = (e) => {
    if (e.keyCode === 13) {
        myGame.restart();
    }
};

function openModal() {
    const modalEl = document.createElement('div');
    modalEl.classList.add('modal-overlay');
    modalEl.innerHTML = '<div class="modal">' +
        '<div class="modal-title">GAME OVER</div>' +
        '<div class="modal-body">' +
        '<div class="restart-btn">Restart</div>' +
        '</div>' +
        '</div>';
    document.body.appendChild(modalEl);
    modalEl.getBoundingClientRect();
    document.body.classList.add('modal-opened');
    modalEl.getElementsByClassName('restart-btn')[0].addEventListener('click', clickRestartHandler);
    document.addEventListener('keydown', keyDownRestartHandler);
}

function closeModal() {
    document.getElementsByClassName('restart-btn')[0].removeEventListener('click', clickRestartHandler);
    document.removeEventListener('keydown', keyDownRestartHandler);
    document.body.classList.add('modal-closing');
    setTimeout(() => {
        document.getElementsByClassName('modal-overlay')[0].remove();
        document.body.classList.remove('modal-closing', 'modal-opened');
    }, 500);
}