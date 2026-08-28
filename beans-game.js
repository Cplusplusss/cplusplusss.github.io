const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ITEM_SIZE = 50;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const PLAYER_SPEED = 4;

// Load sprite images
const sprites = {};
const spriteUrls = {
	baggy: 'Beans/assets/baggy.png',
	bean: 'Beans/assets/bean.png',
	bomb: 'Beans/assets/bomb.png',
	multiplier: 'Beans/assets/2x_multiplier.png',
	bg: 'Beans/assets/bg.png'
};

let spritesLoaded = 0;
for (const [key, url] of Object.entries(spriteUrls)) {
	const img = new Image();
	img.onload = () => {
		sprites[key] = img;
		spritesLoaded++;
	};
	img.onerror = () => {
		console.warn(`Failed to load sprite: ${url}`);
		spritesLoaded++;
	};
	img.src = url;
}

// Game variables
let playerX = 100;
let playerY = CANVAS_HEIGHT - 260;
let playerRotation = 0;

let beanX = 400;
let beanY = CANVAS_HEIGHT - 100;

let bombX = 400;
let bombY = CANVAS_HEIGHT - 260;

let multiplierX = 400;
let multiplierY = CANVAS_HEIGHT - 100;

let score = 0;
let timer = 0;
let sessionGames = 0;
let gameOver = false;
let multiplierActive = false;
let showMultiplier = false;

const keys = {};

// Input handling
window.addEventListener('keydown', (e) => {
	keys[e.key.toLowerCase()] = true;
	if (e.key === 'Escape') {
		location.href = 'projects.html';
	}
	if ((e.key === 'Enter') && gameOver) {
		restartGame();
	}
});

window.addEventListener('keyup', (e) => {
	keys[e.key.toLowerCase()] = false;
});

// Colors
const WHITE = '#ffffff';
const BLACK = '#000000';
const GREEN = '#00ff00';
const RED = '#ff0000';
const BEIGE = '#f5f5dc';
const ORANGE = '#ff8800';

// Helper functions
function drawText(text, x, y, size, color) {
	ctx.fillStyle = color;
	ctx.font = `bold ${size}px Arial`;
	ctx.textAlign = 'left';
	ctx.fillText(text, x, y);
}

function drawCenteredText(text, x, y, size, color) {
	ctx.fillStyle = color;
	ctx.font = `bold ${size}px Arial`;
	ctx.textAlign = 'center';
	ctx.fillText(text, x, y);
}

function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
	return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function spawnRandomPosition(itemSize) {
	return {
		x: Math.random() * (CANVAS_WIDTH - itemSize),
		y: Math.random() * (CANVAS_HEIGHT - itemSize)
	};
}

function drawSprite(spriteKey, x, y, width, height, rotation = 0) {
	if (!sprites[spriteKey]) return;
	
	if (rotation !== 0) {
		ctx.save();
		ctx.translate(x + width / 2, y + height / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.drawImage(sprites[spriteKey], -width / 2, -height / 2, width, height);
		ctx.restore();
	} else {
		ctx.drawImage(sprites[spriteKey], x, y, width, height);
	}
}

// Game logic
function update() {
	// Player movement with rotation
	if (keys['a'] || keys['arrowleft']) {
		playerX -= PLAYER_SPEED;
		playerRotation = 25;
	} else if (keys['d'] || keys['arrowright']) {
		playerX += PLAYER_SPEED;
		playerRotation = -25;
	} else {
		playerRotation = 0;
	}

	if (keys['w'] || keys['arrowup']) playerY -= PLAYER_SPEED;
	if (keys['s'] || keys['arrowdown']) playerY += PLAYER_SPEED;

	// Boundary check
	if (playerX < 0) playerX = 0;
	if (playerX + PLAYER_WIDTH > CANVAS_WIDTH) playerX = CANVAS_WIDTH - PLAYER_WIDTH;
	if (playerY < 0) playerY = 0;
	if (playerY + PLAYER_HEIGHT > CANVAS_HEIGHT) playerY = CANVAS_HEIGHT - PLAYER_HEIGHT;

	if (gameOver) return;

	// Collision - bean
	if (rectCollision(playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, beanX, beanY, ITEM_SIZE, ITEM_SIZE)) {
		score += multiplierActive ? 2 : 1;
		const beanPos = spawnRandomPosition(ITEM_SIZE);
		beanX = beanPos.x;
		beanY = beanPos.y;
		const bombPos = spawnRandomPosition(ITEM_SIZE);
		bombX = bombPos.x;
		bombY = bombPos.y;
	}

	// Collision - bomb
	if (rectCollision(playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, bombX, bombY, ITEM_SIZE, ITEM_SIZE)) {
		score = 0;
		sessionGames++;
		const bombPos = spawnRandomPosition(ITEM_SIZE);
		bombX = bombPos.x;
		bombY = bombPos.y;
		multiplierActive = false;
		showMultiplier = false;
	}

	// Multiplier at score 10
	if (score === 10 && !multiplierActive) {
		showMultiplier = true;
		const multPos = spawnRandomPosition(ITEM_SIZE);
		multiplierX = multPos.x;
		multiplierY = multPos.y;
	}

	// Collision - multiplier
	if (showMultiplier && rectCollision(playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, multiplierX, multiplierY, ITEM_SIZE, ITEM_SIZE)) {
		score *= 1.5;
		multiplierActive = true;
		showMultiplier = false;
	}
}

function draw() {
	// Draw background
	if (sprites.bg) {
		ctx.drawImage(sprites.bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	} else {
		ctx.fillStyle = WHITE;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	// Draw player (baggy) with rotation
	drawSprite('baggy', playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, playerRotation);

	// Draw bean
	drawSprite('bean', beanX, beanY, ITEM_SIZE, ITEM_SIZE);

	// Draw bomb
	drawSprite('bomb', bombX, bombY, ITEM_SIZE, ITEM_SIZE);

	// Draw multiplier at score 10
	if (showMultiplier) {
		drawSprite('multiplier', multiplierX, multiplierY, ITEM_SIZE, ITEM_SIZE);
	}

	// HUD - Score (top right)
	drawText(`Score: ${Math.floor(score)}`, 650, 50, 36, BLACK);

	// HUD - Timer (top left)
	drawText(`Time: ${timer}`, 50, 50, 36, BLACK);

	// HUD - Games this session
	drawText(`Games This Session: ${sessionGames}`, 465, 100, 30, BLACK);

	// HUD - Exit message
	drawText('ESC = Exit', 10, CANVAS_HEIGHT - 10, 15, RED);

	// Score alert at 30
	if (score === 30) {
		drawCenteredText('You have reached 30!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 48, GREEN);
	}

	// Bomb death alert
	if (sessionGames > 0 && Math.floor(score) === 0 && timer > 0) {
		drawCenteredText('You Died From A BOMB', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 36, RED);
	}

	// Game over screen
	if (gameOver) {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		drawCenteredText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 48, RED);
		drawCenteredText('Press Enter to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 36, RED);
	}
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

function restartGame() {
	playerX = 100;
	playerY = CANVAS_HEIGHT - 260;
	playerRotation = 0;
	const beanPos = spawnRandomPosition(ITEM_SIZE);
	beanX = beanPos.x;
	beanY = beanPos.y;
	const bombPos = spawnRandomPosition(ITEM_SIZE);
	bombX = bombPos.x;
	bombY = bombPos.y;
	score = 0;
	timer = 0;
	gameOver = false;
	multiplierActive = false;
	showMultiplier = false;
}

// Initialize game
function initGame() {
	// Start timer every second
	setInterval(() => {
		if (!gameOver) {
			timer++;
			if (timer >= 45) {
				gameOver = true;
			}
		}
	}, 1000);

	// Start game loop when sprites are ready
	gameLoop();
}

// Wait for sprites to load then start
let checkInterval = setInterval(() => {
	if (spritesLoaded === Object.keys(spriteUrls).length) {
		clearInterval(checkInterval);
		initGame();
	}
}, 50);

