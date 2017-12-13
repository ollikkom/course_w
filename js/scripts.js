'use strict';

/**
 * Функция, возвращающая рандомное число от min до max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Функция тормозилка - запускает переданную функцию не чаще чем раз в ms секунд.
 * @param func {function} функция, которую нужно затормозить.
 * @param ms {number} количество милисекунд.
 * @returns {wrapper} обертка выполняющая функцию не чаще чем раз в ms секунд.
 */
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

/**
 * Попарно запрещенные направления для движения змейки по игровому полю.
 * @type {Object}
 */
const restrictedDirections = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up',
};

/**
 * Класс отрисовки.
 */
class SnakeRenderer {

    /**
     * Функция спавнит змейку на поле - генерирует ее html.
     * @param {Object} snake - экземпляр класса Snake.
     */
    static spawn(snake) {
        const snakeEl = document.createElement('div');
        snakeEl.classList.add('snake');
        snakeEl.id = `snake-${snake.id}`;
        let snakeParts = '';
        for (let i = 0; i < snake.coords.length; i++) {
            snakeParts += `<div data-part="${i}"></div>`;
        }
        snakeEl.innerHTML = snakeParts;
        document.getElementsByClassName('gameArea')[0].appendChild(snakeEl);

        SnakeRenderer.render(snake);
    }

    /**
     * Функция удаляет змейку с поля - убирает html элемент.
     * @param {Object} snake - экземпляр класса Snake.
     */
    static remove(snake) {
        const snakeEl = document.getElementById(`snake-${snake.id}`);
        snakeEl.remove();
    }

    /**
     * Функция увеличения змейки на 1 единицу длины - добавляет html элемент кусочка змейки.
     * @param {Object} snake - экземпляр класса Snake.
     */
    static expand(snake) {
        const snakeEl = document.getElementById(`snake-${snake.id}`);
        const newPartEl = document.createElement('div');
        newPartEl.dataset.part = snake.coords.length - 1;
        snakeEl.appendChild(newPartEl);
    }

    /**
     * Функция отрисовки змейки на поле в соответствии с ее координатами.
     * @param {Object} snake - экземпляр класса Snake.
     */
    static render(snake) {
        if (snake.eatingApple) {
            SnakeRenderer.expand(snake);
        }
        const snakeEl = document.getElementById(`snake-${snake.id}`);
        const snakeParts = snakeEl.children;
        for (let i = 0; i < snakeParts.length; i++) {
            const j = snakeParts[i].dataset['part'];
            snakeParts[i].style.transform = `translate(${snake.coords[j].x[0] * snake.gridSize}px, ${snake.coords[j].y[0] * snake.gridSize}px)`;
        }
    }
}

/**
 * Класс змейки.
 */
class Snake {

    /**
     * Получение экземпляров класса.
     * @returns {Array}
     */
    static get instances() {
        Snake._instances = Snake._instances || [];
        return Snake._instances;
    };

    /**
     * Счетчик количества созданных змеек для присваивания id.
     * @returns {number}
     */
    static get counter() {
        Snake._counter = (Snake._counter || 0) + 1;
        return Snake._counter;
    }

    /**
     * Функция сброса экземлпяров класса, также выполняет обнуление id созданных змеек.
     */
    static resetAll() {
        Snake._counter = 0;
        Snake._instances = [];
    }

    /**
     * Конструктор змейки.
     * Объявляет поля используемые будущими экземплярами класса.
     * @param {Object} options - экземпляр класса Game для доступа к его свойствам.
     */
    constructor(options) {
        this.gameInstance = options.gameInstance;
        this.gridSize = this.gameInstance.gridSize;
        this.id = Snake.counter;
        this.length = 0;
        this.direction = '';
        this.nextDirection = '';
        this.coords = [];
        this.eatingApple = false;
        this.lastPartNewCoords = {};
        Snake.instances.push(this);
    }

    /**
     * Функция, задающая будущее направление движения змейки по игровому полю.
     * @param direction - новое направление ('up'/'down'/'left'/'right').
     */
    changeDirection(direction) {
        this.nextDirection = direction;
    }

    /**
     * Функция, смещающая координаты в зависимости от направления змейки.
     * Сначала происходит проверка нового направления на противоположность текущему, в случае прохождения проверки
     * змейка меняет координаты в соответствии с новым направлением, в противном случае - в соответствии с текущим.
     * Затем происходит сохранение координат последней части змейки, чтобы в случае поедания яблока можно было добавить
     * эти координаты как последние в массив координат новой части змейки.
     */
    move() {
        if (this.direction !== restrictedDirections[this.nextDirection]) {
            this.direction = this.nextDirection;
        } else {
            this.nextDirection = this.direction;
            console.log("you tried to go in opposite direction, it's bad idea, guy");
        }
        this.eatingApple = false;
        /**
         * @param {string} axis - String 'x' or 'y'.
         * @param {number} value - Number 1 or -1.
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

    /**
     * Функция проверки наличия яблока в клетке с координатами головной части змейки.
     * В случае наличия яблока вызывается функция его поедания змейкой и удаления его из базы яблок.
     */
    checkForApple() {
        const headCoords = this.coords[0];
        const coordsToCheck = `${headCoords.x[0]}/${headCoords.y[0]}`;
        const possibleApple = this.gameInstance.apples[coordsToCheck];
        if (possibleApple) {
            this.eatApple();
            possibleApple.eat();
        }
    }

    /**
     * Функция, добавляющая координаты новой части змейки при съедании яблока в массив координат частей змейки.
     */
    eatApple() {
        this.eatingApple = true;
        this.length++;
        const newPart = {x: [], y: []};
        for (let i = 0; i < this.coords.length; i++) {
            newPart.x.push(this.coords[0].x[0]);
            newPart.y.push(this.coords[0].y[0]);
        }
        newPart.x.push(this.lastPartNewCoords.x);
        newPart.y.push(this.lastPartNewCoords.y);
        this.coords.push(newPart);
    }

    /**
     * Функция проверки на поражение.
     * Проверяет следующие условия:
     * 1) выход за края игрового поля,
     * 2) выход за края одновременно с оппонентом,
     * 3) столкновения головами змеек,
     * 4) съедание змейкой самой себя,
     * 5) съедание змейкой оппонента.
     */
    checkForLoose() {
        // if (this.gameInstance.stopped) return;
        const thisHead = this.coords[0];
        const game = this.gameInstance;
        const maxVal = game.areaSize - 1;
        const opponentSnake = this.id === 1 ? game.snake2 : game.snake1;
        const opponentHead = opponentSnake.coords[0];
        const checkOutOfArea = (head) => head.x[0] < 0 || head.x[0] > maxVal || head.y[0] < 0 || head.y[0] > maxVal;

        const thisOutOfArea = checkOutOfArea(thisHead);
        const opponentOutOfArea = checkOutOfArea(opponentHead);
        const headOnCollision = opponentHead.x[0] == thisHead.x[0] && opponentHead.y[0] == thisHead.y[0];

        if (thisOutOfArea)  {
            if (opponentOutOfArea) {
                game.gameOver(0, () => 'Both snakes left the game area!');
                return;
            } else {
                game.gameOver(this.id, (winner, looser) => `<span class="${looser.toLowerCase()}">${looser}</span> snake left the game area!`);
                return;
            }
        }
        if (headOnCollision) {
            const sameSizeSnakes = this.coords.length === opponentSnake.coords.length;
            if (sameSizeSnakes) {
                game.gameOver(0, () => 'Head collision of same length snakes!');
            } else {
                const looser = this.coords.length > opponentSnake.coords.length ? opponentSnake.id : this.id;
                game.gameOver(looser, (winner, looser) => `Head collision, <span class="${winner.toLowerCase()}">${winner}</span> snake is longer than <span class="${looser.toLowerCase()}">${looser}</span> snake!`);
            };
            return;
        }
        for (let i = 1; i < this.coords.length; i++) {
            let ateItself = thisHead.x[0] == this.coords[i].x[0] && thisHead.y[0] == this.coords[i].y[0];
            if (ateItself) {
                game.gameOver(this.id, (winner, looser) => `<span class="${looser.toLowerCase()}">${looser}</span> snake ate itself!`);
                return;
            }
            let ateByOpponent = opponentHead.x[0] == this.coords[i].x[0] && opponentHead.y[0] == this.coords[i].y[0];
            if (ateByOpponent) {
                game.gameOver(this.id, (winner, looser) => `<span class="${winner.toLowerCase()}">${winner}</span> snake ate <span class="${looser.toLowerCase()}">${looser}</span> snake!`);
                return;
            }
        }
    }

    /**
     * Функция инициализация змейки, происходит присвоение координат и исходного и следующего за ним направления.
     */
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
        this.nextDirection = this.direction;
    }

    /**
     * Функция удаления координат змейки.
     */
    destroy() {
        this.coords = [];
    }
};

/**
 * Класс яблока.
 */
class Apple {

    /**
     * Функция получения доступных классов яблок для будущей генерации разных яблок на поле.
     * @return {Array}
     */
    static get classes() {
        Apple._classes = ['red', 'green'];
        return Apple._classes;
    }
    /**
     * Конструктор класса.
     * Генерирует случайные координаты, создает html элемент яблока со случайным классом из определенного набора.
     * @param {Object} options - объект параметров, содержащий в себе размер поля, размер клетки.
     * и функцию удаления яблока.
     */
    constructor(options) {
        this.x = getRandomArbitrary(0, options.areaSize);
        this.y = getRandomArbitrary(0, options.areaSize);
        this.element = document.createElement('div');
        this.element.classList.add('apple');
        this.element.classList.add(Apple.classes[getRandomArbitrary(0, 2)]);
        this.gridSize = options.gridSize;
        this.removeApple = options.removeApple;
    }

    /**
     * Функция отвечает за постановку яблока на поле в html и сдвиг согласно его координатам.
     */
    spawn() {
        document.getElementsByClassName('gameArea')[0].appendChild(this.element);
        this.element.style.transform = `translate(${this.x * this.gridSize}px, ${this.y * this.gridSize}px)`;
    }

    /**
     * Функция удаления яблока, также удаляется ключ яблока, по которому ранее происходило взаимодействие.
     */
    eat() {
        this.element.remove();
        this.removeApple(`${this.x}/${this.y}`);
    }
}

/**
 * Класс игры.
 */
class Game {

    /**
     * Конструктор класса.
     * Объявляет поля используемые будущими экземплярами класса.
     * @param {Object} options - объект параметров, содержащий в себе размер поля и скорость игры.
     */
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
        this.modalRemoveTimerId = 0;
        this.restart = this.restart.bind(this);
        this.keyDownRestartHandler = this.keyDownRestartHandler.bind(this);
    }

    /**
     * Снимается флаг остановки игры, а также запускается игровой цикл.
     */
    start() {
        this.stopped = false;
        this.draw();
        console.log('game started');
    }

    /**
     * Ставится флаг остановки игры, а также отменяется вызов следующей отрисовки.
     */
    stop() {
        this.stopped = true;
        cancelAnimationFrame(this.rAFid);
        console.log('game stopped');
    }

    /**
     * Функция получения результата по окончанию игры, выполняющая определение победителя, генерирующая текст результата
     * и вызывающая функцию открытия модального окна с выводом результатов.
     * @param {number} looser - значение, соответствующее результату игры - либо проигрыш синего (2), либо красного (1), либо ничья (0).
     * @param {function} getReason - функция генерации текста о причине победы, в которую посылается цвета победителя и проигравшего.
     */
    gameOver(looser, getReason) {
        this.stop();
        const winnerFromLooser = { 0: 'Draw', 1: 'Blue', 2: 'Pink' };
        const winnerColor = winnerFromLooser[looser];
        let result = '';
        if (looser === 0) {
            result = 'Draw!';
        } else {
            result = `<span class="${winnerColor.toLowerCase()}">${winnerColor}</span> snake won!`;
        }
        const looserColor = looser === 1 ? 'Pink' : 'Blue';
        result += `<br /><span class="reason">(${getReason(winnerColor, looserColor)})</span>`;
        this.openModal(result);
    }

    /**
     * Функция открытия модального окна с выводом результатов игры.
     * @param {string} result - итог игры, содержащий победителя и причину его победы.
     */
    openModal(result) {
        clearTimeout(this.modalRemoveTimerId);
        const prevModal = document.getElementsByClassName('modal-overlay')[0];
        if (prevModal) {
            prevModal.remove();
            document.body.classList.remove('modal-closing', 'modal-opened');
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

    /**
     * Функция закрытия модального окна.
     */
    closeModal() {
        document.getElementsByClassName('restart-btn')[0].removeEventListener('click', this.restart);
        document.removeEventListener('keydown', this.keyDownRestartHandler);
        document.body.classList.add('modal-closing');
        this.modalRemoveTimerId = setTimeout(() => {
            document.getElementsByClassName('modal-overlay')[0].remove();
            document.body.classList.remove('modal-closing', 'modal-opened');
        }, 500);
    }

    /**
     * Рекурсивная функция игрового цикла, изначально происходит проверка флага остановки игры,
     * если он установлен - ничего не происходит.
     */
    draw() {
        setTimeout(() => {
            if (this.stopped) return; // thx tests for finding this bug!
            this.rAFid = requestAnimationFrame(this.draw.bind(this));
            Snake.instances.forEach((snake) => {
                snake.move();
            });
            Snake.instances.forEach((snake) => {
                if (this.stopped) {
                    SnakeRenderer.render(snake);
                    return;
                };
                snake.checkForLoose();
                snake.checkForApple();
                SnakeRenderer.render(snake);
            });
            this.iteration++;
            console.log('draw');
        }, 1000 * this.gameSpeed);
    }

    /**
     * Функция инициализации игры, происходит создание каждой из змеек, постановка яблок на поле,
     * запускается игровой цикл, задается визуальный размер поля.
     */
    init() {
        console.log('game inited');
        this.snake1 = new Snake({gameInstance: this});
        this.snake2 = new Snake({gameInstance: this});
        this.initSnakes();
        this.spawnApples();
        this.start();
        const gameGridEl = document.getElementsByClassName('gameGrid')[0];
        gameGridEl.style.width = `${this.areaSize * this.gridSize}px`;
        gameGridEl.style.height = `${this.areaSize * this.gridSize}px`;
    }

    /**
     * Функция, инициализирующая, рисующая и привязывающая события к экземплярам всех змеек.
     */
    initSnakes() {
        Snake.instances.forEach((snake) => {
            snake.init();
            this.attachEvents(snake);
            SnakeRenderer.spawn(snake);
        });
    }

    /**
     * Функция удаления змеек, яблок и событий.
     */
    destroy() {
        Snake.instances.forEach((snake) => {
            SnakeRenderer.remove(snake);
            snake.destroy();
            this.detachEvents(snake);
        });
        this.removeApples();
        this.iteration = 0;
    }

    /**
     * Функция перезагрузки игры.
     */
    restart() {
        console.log('game restarted');
        this.closeModal();
        this.destroy();
        this.initSnakes();
        this.spawnApples();
        this.start();
    }

    /**
     * Функция постановки яблока на поле, происходит проверка на наличие змейки и яблока в ячейке,
     * в которую необходимо заспавнить яблоко.
     */
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

    /**
     * Функция удаления всех яблок из объекта яблок игры.
     */
    removeApples() {
        for (let apple in this.apples) {
            this.apples[apple].eat();
        }
    }

    /**
     * Функция удаления яблока.
     * @param {string} id - координаты вида 'x/y' яблока.
     */
    removeApple(id) {
        delete this.apples[id];
    }

    /**
     * Функция привязки события по нажатию на клавиатуру.
     * @param {Object} snake - экземпляр класса Snake.
     */
    attachEvents(snake) {
        this[`keyDownHandler${snake.id}`] = throttle(this.keyDownControlsHandler.bind(snake), 1000 * this.gameSpeed);
        document.addEventListener('keydown', this[`keyDownHandler${snake.id}`]);
    }

    /**
     * Функция удаления события.
     * @param {Object} snake - экземпляр класса Snake.
     */
    detachEvents(snake) {
        document.removeEventListener('keydown', this[`keyDownHandler${snake.id}`]);
    }

    /**
     * Функция, обрабатывающая события нажатия клавиатуры.
     * @param {event} e - объект события, в котором присутствует код нажатой клавиши.
     */
    keyDownControlsHandler(e) {
        const isFirst = this.id === 1;
        const codes = {
            left: isFirst ? 65 : 37,   // 37 - 'pageLeft' key, 65 - 'a' key
            right: isFirst ? 68 : 39,  // 39 - 'pageRight' key, 68 - 'd' key
            up: isFirst ? 87 : 38,     // 38 - 'pageUp' key, 87 - 'w' key
            down: isFirst ? 83 : 40,   // 40 - 'pageDown' key, 83 - 's' key
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

    /**
     * Функция, обрабатывающая событие нажатия клавиатуры для перезагрузки игры.
     * @param {event} e - объект события.
     */
    keyDownRestartHandler(e) {
        if (e.keyCode === 13) {
            this.restart();
        }
    }
};

window.myGame = new Game({ areaSize: 20, gameSpeed: 0.2 });