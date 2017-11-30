
QUnit.test( "Snake.init() test", function( assert ) {
    let snake = new Snake({gameInstance: myGame});
    assert.deepEqual( snake.coords, [], "After instance creating coords empty" );
    assert.equal( snake.direction, '', "After instance creating snake has no direction" );
    snake.init();
    assert.deepEqual( snake.coords[0], {x: [2], y: [0]}, "After init call coords as expected" );
    assert.equal( snake.direction, 'right', "After instance creating snake has 'right' direction" );
    snake = null;
    Snake.resetAll();
});

QUnit.test("Snake.move() test", function ( assert ) {
    let snake = new Snake({gameInstance: myGame});
    snake.init();
    assert.deepEqual( snake.coords[0], {x: [2], y: [0]}, "Initial head coords as expected" );
    assert.equal( snake.direction, 'right', "Initial direction - 'right'" );
    snake.move();
    assert.deepEqual( snake.coords[0], {x: [3], y: [0]}, "After one Snake.move call head coords as expected" );
    snake = null;
    Snake.resetAll();
});

QUnit.test( "Snake.changeDirection() test", function( assert ) {
    let snake = new Snake({gameInstance: myGame});
    snake.init();
    assert.equal(snake.direction, 'right', "Snake direction is 'right'");
    snake.changeDirection('left');
    snake.move();
    assert.equal(snake.direction, 'right', "Snake direction wasn't changed after calling changeDirection('left')");
    snake.changeDirection('up');
    snake.move();
    assert.equal(snake.direction, 'up', "Snake direction was changed after calling changeDirection('up')");
    snake.changeDirection('down');
    snake.move();
    assert.equal(snake.direction, 'up', "Snake direction wasn't changed after calling changeDirection('down')");
    snake = null;
    Snake.resetAll();
});

QUnit.test( "Snake.eatApple() test", function( assert ) {
    let snake = new Snake({gameInstance: myGame});
    snake.init();
    assert.deepEqual( snake.coords[0], {x: [2], y: [0]}, "Initial head coords as expected" );
    assert.equal( snake.coords.length, 3, "Initial coords array length as expected - 3" );
    snake.move();
    snake.eatApple();
    assert.equal( snake.coords.length, 4, "After eating apple coords array length is 4" );
    snake = null;
    Snake.resetAll();
});

QUnit.test( "Snake.destroy() test", function( assert ) {
    let snake = new Snake({gameInstance: myGame});
    snake.init();
    assert.deepEqual( snake.coords[0], {x: [2], y: [0]}, "Initial head coords as expected" );
    snake.destroy();
    assert.deepEqual( snake.coords, [], "After destroy coords array is empty" );
    snake = null;
    Snake.resetAll();
});