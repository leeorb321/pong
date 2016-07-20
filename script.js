var canvas = document.getElementById('pong-canvas');
var ctx = canvas.getContext("2d");

function drawCenterLine() {
	ctx.fillStyle="#000000";
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 3;
	ctx.setLineDash([5, 12]);
	ctx.beginPath();
	ctx.moveTo(canvas.width/2, 0);
	ctx.lineTo(canvas.width/2, canvas.height);
	ctx.stroke();
	ctx.setLineDash([]);
}

function loadSound() {
	createjs.Sound.registerSound("sounds/blip1.wav", "blip1");
	createjs.Sound.registerSound("sounds/blip2.wav", "blip2");
	createjs.Sound.registerSound("sounds/blip3.wav", "blip3");
	createjs.Sound.registerSound("sounds/blip4.wav", "blip4");
}

var key = {
  _pressed: {},

  UP: 38,
  DOWN: 40,
  S: 83,
  X: 88,
  ENTER: 13,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

function State (enterFunction, updateFunction) {
	this.enter = enterFunction;
	this.update = updateFunction;
}

var newGame = new State(function() {}, function() {
	ctx.fillStyle="#000000";
	ctx.font = "40px monospace";
	ctx.textAlign = "center";
	ctx.strokeStyle = "#000000";
	ctx.fillText("PONG", canvas.width/2, canvas.height/2);
	ctx.fillText("Press Enter to Continue", canvas.width/2, canvas.height/2 + 50);
	if (key.isDown(key.ENTER)) {
		game.setState(playing);
	}
});

var playing = new State(function() {
			theBall.reset();
		}, function() {
	this.name="playing update";
	drawCenterLine();
	theBall.move();
	theBall.draw();
	score.draw();
	paddle1.move();
	paddle1.draw();
	paddle2.move();
	paddle2.draw();
});

var scored = new State(function() {
	theBall.color = theBall.blinkColor1;
	var blinkInterval = window.setInterval(function() {
		console.log('blink');
		console.log(theBall.color);
		if (theBall.color != theBall.blinkColor1) {
			theBall.color = theBall.blinkColor1;
		}
		else {
			theBall.color = theBall.blinkColor2;
		}
	;},250);
	window.setTimeout(function() {
			clearInterval(blinkInterval);
			if (score.winner) {
				game.setState(gameOver);
			}
			else {
				game.setState(playing);
			}
		}, 2000);
	}, function() {
		drawCenterLine();
		score.draw();
		paddle1.draw();
		paddle2.draw();
		theBall.draw();
		this.name="playing update";
});

var gameOver = new State(function() {}, function() {
	score.draw();
	paddle1.draw();
	paddle2.draw();

	ctx.fillStyle="#000000";
	ctx.font = "40px monospace";
	ctx.textAlign = "center";
	ctx.strokeStyle = "#000000";
	ctx.fillText("GAME OVER!", canvas.width/2, canvas.height/2 - 50);
	ctx.fillText(score.winner + " WINS!", canvas.width/2, canvas.height/2);
	ctx.fillText("Press Enter to Play Again", canvas.width/2, canvas.height/2 + 50);
	if (key.isDown(key.ENTER)) {
		game.reset();
		game.setState(playing);
	}
});

var game = {
	state: newGame,
	stateStartTime: null,
	setState: function(newState) {
		this.stateStartTime = Date.now();
		this.state = newState;
		newState.enter();
	},
	play: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.state.update();
		window.requestAnimationFrame( game.play );
	},
	reset: function() {
		theBall.reset();
		score.player1 = 0;
		score.player2 = 0;
		score.winner = null;
	}
}

var theBall = new Ball();
var paddle1 = new Paddle('right', key.UP, key.DOWN);
var paddle2 = new Paddle('left', key.S, key.X);

var score = {
	maxScore: 3,
	player1: 0,
	player2: 0,
	winner: null,
	incrementScore: function (player) {

		if (player === 1) {
			this.player1 += 1;
		}
		if (player === 2) {
			this.player2 += 1;
		}
		createjs.Sound.play('blip3');

		//Check if player has won
		if (this.player1 === this.maxScore) {
			this.winner = "PLAYER 1";
		}
		else if (this.player2 === this.maxScore) {
			this.winner = "PLAYER 2";
		}

		game.setState(scored);

	},
	draw: function() {
		ctx.fillStyle="#000000";
		ctx.font = "40px monospace";
		ctx.textAlign = "center";
		ctx.strokeStyle = "#000000";
		ctx.fillText(this.player1, canvas.width/2 + 50, 50);
		ctx.fillText(this.player2, canvas.width/2 - 50, 50);

	}
}

function testCollision(paddle, ball) {
	if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height) {
		return true;
	}
	else {
		return false;
	}
}

function Ball () {
	this.defaultColor = '#000000';
	this.blinkColor1 = '#FF0000';
	this.blinkColor2 = '#FFFFFF';
	this.color = '#000000';
	this.radius = 15;
	this.x = canvas.width/2;
	// Randomize initial ball starting point along y-axis
	this.y = Math.random() * (canvas.height/4) + (canvas.height/4);
	var speed = 4;
	// Randomize initial ball direction (left/right)
	if (Math.random() > 0.5) {
		this.vx = -speed;
	}
	else {
		this.vx = speed;
	}
	this.vy = speed;
	this.reset = function() {
		this.color = this.defaultColor;
		this.x = canvas.width/2;
		// Randomize initial ball starting point along y-axis
		this.y = Math.random() * (canvas.height/4) + (canvas.height/4);
		var speed = 4;
		// Randomize initial ball direction (left/right)
		if (Math.random() > 0.5) {
			this.vx = -speed;
		}
		else {
			this.vx = speed;
		}
	}
	this.draw = function() {
		ctx.fillStyle= this.color;
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x + (1/2), this.y + (1/2), this.radius, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
	};
	this.move = function() {
		// Check if ball hit left edge
		if (this.x + this.vx - this.radius < paddle2.width * 2) {
			if (testCollision(paddle2, theBall)) {
				createjs.Sound.play('blip2');
				this.vx *= (-1);
			}
			else {
				score.incrementScore(1);
			}			
		}

		// Check if ball hit right edge
		if (this.x + this.vx + this.radius > canvas.width - paddle1.width * 2) {
			if (testCollision(paddle1, theBall)) {
				createjs.Sound.play('blip1');
				this.vx *= (-1);
			}
			else {
				score.incrementScore(2);
			}
		}

		// Check if ball hit top or bottom
		if (this.y + this.vy - this.radius < 0 || this.y + this.vy + this.radius > canvas.height) {
			this.vy *= (-1);
		}

		// Move ball
		this.x += this.vx;
		this.y += this.vy; 
	};
	this.blink = function() {
		var color = "#FF0000";
			if (color === "#FF0000") {
				color = "#FFFFFF";
			} 
			else {
				color = "#FF0000";
			}
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(this.x + (1/2), this.y + (1/2), this.radius, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();

	};
}

function Paddle(side, upKey, downKey) {
	this.width = 15;
	this.height = 100;
	if (side === "left") {
		this.x = this.width;
	}
	if (side === "right") {
		this.x = canvas.width - this.width * 2;
	}

	this.y = (canvas.height/2) - (this.height/2);
	var speed = 4;

	this.draw = function() {
		ctx.fillStyle="#000000";
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 3;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.move = function() {
		if (this.y - speed >= 0 && key.isDown(upKey)) {
			this.y -= speed * 2;
		}

		if (this.y + this.height + speed <= canvas.height && key.isDown(downKey)) {
			this.y += speed * 2;
		}
	};
};

window.addEventListener('keyup', function(event) { key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { key.onKeydown(event); }, false);
loadSound();

function gameOver(winningPlayer) {

}

game.play();