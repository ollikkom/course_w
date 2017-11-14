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
    static get instances() {
        Snake._instances = Snake._instances || [];
        return Snake._instances;
    };

    static get counter() {
        Snake._counter = (Snake._counter || 0) + 1;
        return Snake._counter;
    }

    static moveAll() {
        Snake.instances.forEach((snake) => {
            snake.move();
        });
        Snake.instances.forEach((snake) => {
            snake.checkForLoose();
            snake.checkForApple();
            snake.draw();
        });
    }

    constructor(options) {
        this.gameInstance = options.gameInstance;
        this.gridSize = this.gameInstance.gridSize;
        this.id = Snake.counter;
        this.snakeEl = null;
        this.length = 0;
        this.direction = '';
        this.coords = [];
        this.lastPartNewCoords = {};
        this.keyDownHandler = throttle(this.onKeyDown.bind(this), 1000 * this.gameInstance.gameSpeed);
        Snake.instances.push(this);
        this.init();
    }

    changeDirection(direction) {
        if (this.direction === restrictedDirections[direction]) return; // check if snake try to go in opposite direction
        this.direction = direction;
    }

    move() {
        if (this.gameInstance.stopped) return;
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

            this.lastPartNewCoords = {
                x: lastPartCoords.x[this.coords.length - 1],
                y: lastPartCoords.y[this.coords.length - 1],
            };
            // this.checkForLoose();
            // this.checkForApple(lastPartNewCoords);
        };

        switch (this.direction) {
            case 'left':
                changeCoords('x', -1);
                break;
            case 'right':
                changeCoords('x', 1);
                break;
            case 'up':
                changeCoords('y', -1);
                break;
            case 'down':
                changeCoords('y', 1);
                break;

            default:
                break;
        }
    }

    checkForApple() {
        const headCoords = this.coords[0];
        const coordsToCheck = `${headCoords.x[0]}/${headCoords.y[0]}`;
        const possibleApple = this.gameInstance.apples[coordsToCheck];
        if (possibleApple) {
            this.eatApple(this.lastPartNewCoords);
            possibleApple.eat();
        }
    }

    eatApple() {
        this.length++;
        const newPart = {x: [], y: []};
        for (let i = 0; i < this.coords.length; i++) {
            newPart.x.push(this.coords[0].x[0]);
            newPart.y.push(this.coords[0].y[0]);
        }
        newPart.x.push(this.lastPartNewCoords.x);
        newPart.y.push(this.lastPartNewCoords.y);
        this.coords.push(newPart);
        const newPartEl = document.createElement('div');
        newPartEl.dataset.part = this.coords.length - 1;
        this.snakeEl.appendChild(newPartEl);
    }

    checkForLoose() {
        if (this.gameInstance.stopped) return;
        const thisHead = this.coords[0];
        const game = this.gameInstance;
        const maxVal = game.areaSize - 1;
        const opponentSnake = this.id === 1 ? game.snake2 : game.snake1;
        const opponentHead = opponentSnake.coords[0];

        const outOfArea = thisHead.x[0] < 0 || thisHead.x[0] > maxVal || thisHead.y[0] < 0 || thisHead.y[0] > maxVal;
        const headOnCollision = opponentHead.x[0] == thisHead.x[0] && opponentHead.y[0] == thisHead.y[0];

        if (outOfArea)  {
            game.gameOver(this.id);
            return;
        }
        if (headOnCollision) {
            game.gameOver(0);
            return;
        }
        for (let i = 1; i < this.coords.length; i++) {
            let ateItself = thisHead.x[0] == this.coords[i].x[0] && thisHead.y[0] == this.coords[i].y[0];
            if (ateItself) {
                game.gameOver(this.id);
                return;
            }
            let ateByOpponent = opponentHead.x[0] == this.coords[i].x[0] && opponentHead.y[0] == this.coords[i].y[0];
            if (ateByOpponent) {
                game.gameOver(this.id);
                return;
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
        const isFirst = this.id === 1;
        const codes = {
            left: isFirst ? 37 : 65,   // 37 - 'pageLeft' key, 65 - 'a' key
            right: isFirst ? 39 : 68,  // 39 - 'pageRight' key, 68 - 'd' key
            up: isFirst ? 38 : 87,     // 38 - 'pageUp' key, 87 - 'w' key
            down: isFirst ? 40 : 83,   // 40 - 'pageDown' key, 83 - 's' key
        };

        switch (e.keyCode) {
            case codes['left']:
                this.changeDirection('left');
                break;
            case codes['up']:
                this.changeDirection('up');
                break;
            case codes['right']:
                this.changeDirection('right');
                break;
            case codes['down']:
                this.changeDirection('down');
                break;
            default:
                break;
        }
    }

    init() {
        const isFirst = this.id === 1;
        const size = this.gameInstance.areaSize;
        this.coords = isFirst ? [
            {x: [2], y: [0]},
            {x: [1, 2], y: [0, 0]},
            {x: [0, 1, 2], y: [0, 0, 0]},
        ] : [
            {x: [size - 3], y: [size - 1]},
            {x: [size - 2, size - 3], y: [size - 1, size - 1]},
            {x: [size - 1, size - 2, size - 3], y: [size - 1, size - 1, size - 1]},
        ];
        this.length = this.coords.length;
        this.direction = isFirst ? 'right' : 'left';
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
};

class Apple {
    constructor(options) {
        this.x = getRandomArbitrary(0, options.areaSize);
        this.y = getRandomArbitrary(0, options.areaSize);
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
        this.snake2 = null;
        this.gridSize = 20;
        this.areaSize = options.areaSize;
        this.gameSpeed = options.gameSpeed;
        this.appleCount = this.areaSize + getRandomArbitrary(1, this.areaSize / 3);
        this.apples = {};
        this.iteration = 0;
        this.stopped = true;
        this.restart = this.restart.bind(this);
        this.keyDownRestartHandler = this.keyDownRestartHandler.bind(this);
    }

    start() {
        this.stopped = false;
        this.draw();
        console.log('game started');
    }

    stop() {
        this.stopped = true;
        cancelAnimationFrame(this.rAFid);
        console.log('game stopped');
    }

    gameOver(looser) {
        const winnerFromLooser = {
            0: 'Draw', 1: 'Blue', 2: 'Pink'
        };
        this.stop();
        this.openModal(winnerFromLooser[looser]);
    }

    openModal(winner) {
        let result = '';
        if (winner === 'Draw') {
            result = 'Draw!';
        } else {
            result = `<span class="${winner.toLowerCase()}">${winner}</span> snake won!`;
        }
        const modalEl = document.createElement('div');
        modalEl.classList.add('modal-overlay');
        modalEl.innerHTML = '<div class="modal">' +
            '<div class="modal-title">GAME OVER</div>' +
            '<div class="modal-body">' +
                `<div class="result">${result}</div>` +
                '<div class="restart-btn">Restart</div>' +
            '</div>' +
            '</div>';
        document.body.appendChild(modalEl);
        modalEl.getBoundingClientRect(); // force redraw, for running element transition instantly after appending to DOM
        document.body.classList.add('modal-opened');
        modalEl.getElementsByClassName('restart-btn')[0].addEventListener('click', this.restart);
        document.addEventListener('keydown', this.keyDownRestartHandler);
    }

    closeModal() {
        document.getElementsByClassName('restart-btn')[0].removeEventListener('click', this.restart);
        document.removeEventListener('keydown', this.keyDownRestartHandler);
        document.body.classList.add('modal-closing');
        setTimeout(() => {
            document.getElementsByClassName('modal-overlay')[0].remove();
            document.body.classList.remove('modal-closing', 'modal-opened');
        }, 500);
    }

    draw() {
        setTimeout(() => {
            this.rAFid = requestAnimationFrame(this.draw.bind(this));
            Snake.moveAll();
            this.iteration++;
            console.log('draw');
        }, 1000 * this.gameSpeed);
    }

    init() {
        console.log('game inited');
        this.snake1 = new Snake({gameInstance: this});
        this.snake2 = new Snake({gameInstance: this});
        this.spawnApples();
        this.start();
        const gameGridEl = document.getElementsByClassName('gameGrid')[0];
        gameGridEl.style.width = `${this.areaSize * this.gridSize}px`;
        gameGridEl.style.height = `${this.areaSize * this.gridSize}px`;
    }

    destroy() {
        this.snake1.destroy();
        this.snake2.destroy();
        this.removeApples();
        this.iteration = 0;
    }

    restart() {
        console.log('game restarted');
        this.closeModal();
        this.destroy();
        this.snake1.init();
        this.snake2.init();
        this.spawnApples();
        this.start();
    }

    spawnApples() {
        for (let i = 0; i < this.appleCount; i++) {
            const as = this.areaSize;
            const apple = new Apple({
                areaSize: as,
                removeApple: this.removeApple.bind(this),
                gridSize: this.gridSize
            });
            const noAppleHere = typeof this.apples[`${apple.x}/${apple.y}`] === 'undefined';
            const noSnakesHere = [0, 1, 2, 3, as-1, as-2, as-3, as-4].indexOf(apple.x) < 0 || [0, as-1].indexOf(apple.y) < 0;
            if (noAppleHere && noSnakesHere) {
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

    keyDownRestartHandler(e) {
        if (e.keyCode === 13) {
            this.restart();
        }
    }
};

const myGame = new Game({ areaSize: 20, gameSpeed: 0.2 });

myGame.init();