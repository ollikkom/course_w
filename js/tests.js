myGame.stop();

QUnit.test( "Snake.move() test", function( assert ) {
    assert.deepEqual( myGame.snake1.coords[0], {x: [2], y: [0]}, "Initial head coords as expected" );
    assert.equal( myGame.snake1.direction, 'right', "Initial direction - 'right'" );
    myGame.start();
    myGame.snake1.move();
    myGame.stop();
    assert.deepEqual( myGame.snake1.coords[0], {x: [3], y: [0]}, "After one Snake.move call head coords as expected" );
});

QUnit.test( "Snake.destroy() test", function( assert ) {
    myGame.stop();
    assert.ok(myGame.snake2.snakeEl, "Snake element exists");
    myGame.snake2.destroy();
    assert.equal(myGame.snake2.snakeEl, null, "Snake element is null");
});

QUnit.test( "Snake.changeDirection() test", function( assert ) {
    assert.equal(myGame.snake1.direction, 'right', "Snake direction is 'right'");
    myGame.snake1.changeDirection('left');
    assert.equal(myGame.snake1.direction, 'right', "Snake direction wasn't changed after calling changeDirection('left')");
    myGame.snake1.changeDirection('up');
    assert.equal(myGame.snake1.direction, 'up', "Snake direction was changed after calling changeDirection('up')");
    myGame.snake1.changeDirection('down');
    assert.equal(myGame.snake1.direction, 'up', "Snake direction wasn't changed after calling changeDirection('down')");

});