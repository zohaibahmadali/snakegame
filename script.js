const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');
const restartBtn = document.getElementById('restartBtn');
const startGameBtn = document.getElementById('startGameBtn');
const scoreElement = document.getElementById('score');

// Set initial canvas size
canvas.width = window.innerWidth * 0.9;
canvas.height = canvas.width;

const snakeSize = 50; // Size of the snake
const moveInterval = 200; // Time in milliseconds between snake moves
let score = 0;

let snake = [{ x: Math.floor(canvas.width / 2 / snakeSize) * snakeSize, y: Math.floor(canvas.height / 2 / snakeSize) * snakeSize }];
let direction = 'RIGHT';
let food = { x: 50, y: 50 };
let gameOver = false;
let lastMoveTime = 0;

function draw(currentTime) {
    if (gameOver) {
        showGameOverPopup();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    updateScore();

    // Check if it's time to move the snake
    if (currentTime - lastMoveTime >= moveInterval) {
        moveSnake();
        checkCollision();
        lastMoveTime = currentTime;
    }

    requestAnimationFrame(draw);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.beginPath();
        ctx.arc(part.x + snakeSize / 2, part.y + snakeSize / 2, snakeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x + snakeSize / 2, food.y + snakeSize / 2, snakeSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'UP':
            head.y -= snakeSize;
            break;
        case 'DOWN':
            head.y += snakeSize;
            break;
        case 'LEFT':
            head.x -= snakeSize;
            break;
        case 'RIGHT':
            head.x += snakeSize;
            break;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        if (eatSound.readyState >= 2) {
            eatSound.play().catch(error => console.log('Audio play failed:', error));
        }
        generateFood();
        score++;
    } else {
        snake.pop();
    }
}

function changeDirection(event) {
    const key = event.keyCode;

    if (key === 37 && direction !== 'RIGHT') direction = 'LEFT';
    if (key === 38 && direction !== 'DOWN') direction = 'UP';
    if (key === 39 && direction !== 'LEFT') direction = 'RIGHT';
    if (key === 40 && direction !== 'UP') direction = 'DOWN';
}

function handleTouch(touch) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = touch.clientX - canvasRect.left;
    const y = touch.clientY - canvasRect.top;

    if (x < canvas.width / 2) {
        direction = y < canvas.height / 2 ? 'UP' : 'DOWN';
    } else {
        direction = y < canvas.height / 2 ? 'RIGHT' : 'LEFT';
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver = true;
        if (gameOverSound.readyState >= 2) {
            gameOverSound.play().catch(error => console.log('Audio play failed:', error));
        }
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            if (gameOverSound.readyState >= 2) {
                gameOverSound.play().catch(error => console.log('Audio play failed:', error));
            }
        }
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize,
        y: Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize
    };
}

function showGameOverPopup() {
    ctx.fillStyle = 'black';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '30px Arial';
    ctx.fillText(`Total Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    restartBtn.classList.remove('hidden');
}

function restartGame() {
    snake = [{ x: Math.floor(canvas.width / 2 / snakeSize) * snakeSize, y: Math.floor(canvas.height / 2 / snakeSize) * snakeSize }];
    direction = 'RIGHT';
    generateFood();
    score = 0;
    updateScore();
    gameOver = false;
    restartBtn.classList.add('hidden');
    lastMoveTime = 0; // Reset the move time
    draw();
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function startGame() {
    startGameBtn.classList.add('hidden');
    restartGame();
}

document.addEventListener('keydown', changeDirection);
restartBtn.addEventListener('click', restartGame);
startGameBtn.addEventListener('click', startGame);

document.addEventListener('click', () => {
    if (eatSound.readyState >= 2 && gameOverSound.readyState >= 2) {
        startGame();
    }
});

canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    handleTouch(touch);
}, { passive: true });

// Initialize the game
requestAnimationFrame(draw);
