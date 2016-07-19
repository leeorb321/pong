var canvas = document.getElementById('pong-canvas');
var ctx = canvas.getContext("2d");

ctx.fillStyle="#000000";
ctx.font = "40px monospace";
ctx.textAlign = "center";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;

function drawCenterLine() {
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

var Key = {
  _pressed: {},

  UP: 38,
  DOWN: 40,
  S: 83,
  X: 88,
  
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

var theBall = new Ball();
var paddle1 = new Paddle('right', Key.UP, Key.DOWN);
var paddle2 = new Paddle('left', Key.S, Key.X);

var score = {
	player1: 0,
	player2: 0,
	incrementScore: function (player) {
		if (player === 1) {
			this.player1 += 1;
		}
		if (player === 2) {
			this.player2 += 1;
		}
		createjs.Sound.play('blip3');
		theBall = new Ball();
	},
	draw: function() {
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
	this.draw = function() {
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
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.move = function() {
		if (this.y - speed >= 0 && Key.isDown(upKey)) {
			this.y -= speed * 2;
		}

		if (this.y + this.height + speed <= canvas.height && Key.isDown(downKey)) {
			this.y += speed * 2;
		}
	};
};

window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
loadSound();

function drawFrame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCenterLine();
	theBall.move();
	theBall.draw();
	score.draw();
	paddle1.move();
	paddle1.draw();
	paddle2.move();
	paddle2.draw();

	requestAnimationFrame(drawFrame);
}

drawFrame();