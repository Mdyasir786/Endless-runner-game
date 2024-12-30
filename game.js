const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let isJumping = false;
let isDoubleJumping = false;
let gravity = 0.6;
let jumpStrength = 15;
let doubleJumpStrength = 12;
let speed = 2;
let score = 0;
let gameOver = false;

const player = {
  x: 50,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  color: "green",
  velocity: 0,
};

let obstacles = [];
let obstacleWidth = 20;
let obstacleHeight = 30;
let background = { x: 0, speed: 2, cloudX: canvas.width, cloudY: 50 };

let jumpCounter = 0;
let obstacleInterval = 2000;
let lastObstacleTime = 0;

let scoreIncreaseInterval = 100; // Control the speed of score increase
let lastScoreIncreaseTime = 0;

document.addEventListener("keydown", (event) => {
  if (event.key === " " && !gameOver) {
    if (!isJumping) {
      isJumping = true;
      player.velocity = jumpStrength;
      jumpCounter = 1;
    } else if (jumpCounter === 1 && !isDoubleJumping) {
      isDoubleJumping = true;
      player.velocity = doubleJumpStrength;
      jumpCounter = 2;
    }
  }

  if (event.key === "r" && gameOver) {
    resetGame();
  }
});

function drawPlayer() {
  if (isJumping || isDoubleJumping) {
    player.velocity -= gravity;
    player.y -= player.velocity;

    if (player.y >= canvas.height - player.height) {
      player.y = canvas.height - player.height;
      isJumping = false;
      isDoubleJumping = false;
      jumpCounter = 0;
    }
  }

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacle(obstacleX, obstacleY) {
  ctx.fillStyle = "red";
  ctx.fillRect(obstacleX, obstacleY, obstacleWidth, obstacleHeight);
}

function drawObstacles() {
  obstacles.forEach((obstacle, index) => {
    drawObstacle(obstacle.x, obstacle.y);
    obstacle.x -= speed;
    if (obstacle.x + obstacleWidth < 0) {
      obstacles.splice(index, 1);
    }
  });
}

function createObstacles(currentTime) {
  if (currentTime - lastObstacleTime > obstacleInterval) {
    let obstacleY = canvas.height - obstacleHeight;
    let gap = 200; // Control the space between obstacles
    obstacles.push({ x: canvas.width + 200, y: obstacleY });
    lastObstacleTime = currentTime;

    // Randomize obstacle generation timing and gap
    obstacleInterval = Math.max(1500, obstacleInterval - 50); // Reduce interval for more frequent obstacles
  }
}

function checkCollision() {
  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacleWidth &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacleHeight &&
      player.y + player.height > obstacle.y
    ) {
      gameOver = true;
      displayGameOver();
    }
  });
}

function updateScore(currentTime) {
  if (!gameOver && currentTime - lastScoreIncreaseTime > scoreIncreaseInterval) {
    score++;
    lastScoreIncreaseTime = currentTime;
  }
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

function increaseSpeed() {
  if (score % 100 === 0 && score > 0) {
    speed += 0.2;
  }
}

function drawBackground() {
  ctx.fillStyle = "#87ceeb"; // Sky Blue
  ctx.fillRect(background.x, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "#ffcc00"; // Sun
  ctx.beginPath();
  ctx.arc(canvas.width - 100, 100, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white"; // Clouds
  ctx.beginPath();
  ctx.arc(background.cloudX, background.cloudY, 50, 0, Math.PI * 2);
  ctx.arc(background.cloudX + 80, background.cloudY, 50, 0, Math.PI * 2);
  ctx.arc(background.cloudX + 160, background.cloudY, 50, 0, Math.PI * 2);
  ctx.fill();

  background.x -= background.speed;
  if (background.x + canvas.width <= 0) {
    background.x = 0;
  }

  background.cloudX -= 0.3;
  if (background.cloudX + 200 <= 0) {
    background.cloudX = canvas.width;
  }
}

function displayGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over! Press 'R' to Restart", canvas.width / 4, canvas.height / 2);
}

function resetGame() {
  obstacles = [];
  score = 0;
  speed = 2;
  gameOver = false;
  player.y = canvas.height - 50;
  player.velocity = 0;
  jumpCounter = 0;
  gameLoop();
}

function gameLoop(currentTime) {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
  createObstacles(currentTime);
  checkCollision();
  updateScore(currentTime);
  increaseSpeed();

  requestAnimationFrame(gameLoop);
}

gameLoop();
