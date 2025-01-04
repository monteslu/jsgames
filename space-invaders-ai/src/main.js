import { loadSound, loadImage, getInput } from './utils.js';
import { Player } from './entities/player.js';
import { EnemyGrid } from './entities/enemyGrid.js';
import { GameState } from './gameState.js';
import * as CONSTANTS from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const { width, height } = canvas;

// Calculate relative sizes based on actual canvas dimensions
const SIZES = {
    PLAYER: {
        WIDTH: (24 / width) * 100,    // 24px relative to screen width
        HEIGHT: (24 / height) * 100,  // 24px relative to screen height
        BULLET_WIDTH: (2 / width) * 100,
        BULLET_HEIGHT: (8 / height) * 100
    },
    ENEMY: {
        WIDTH: (27 / width) * 100,    // 27px relative to screen width
        HEIGHT: (33 / height) * 100,  // 33px relative to screen height
        BULLET_WIDTH: (2 / width) * 100,
        BULLET_HEIGHT: (8 / height) * 100
    },
    STAR: {
        MIN: (1 / width) * 100,
        MAX: (2 / width) * 100
    }
};

// Game assets
let laserSound, enemyLaserSound, explosionSound;
let playerImg;
let enemyImages = {};

// Game objects
let gameState;
let player;
let enemyGrid;

// Initialize starfield
const stars = Array(CONSTANTS.STAR_SETTINGS.COUNT).fill(null).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * (SIZES.STAR.MAX - SIZES.STAR.MIN) + SIZES.STAR.MIN
}));

function drawStarfield() {
    ctx.fillStyle = CONSTANTS.COLORS.TEXT;
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += (CONSTANTS.STAR_SETTINGS.SPEED_PERCENT * height) / 100;
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    });
}

function getScreenUnit(percentage, dimension = 'width') {
    return (percentage / 100) * (dimension === 'width' ? width : height);
}

function update(deltaTime) {
    if (!gameState.isGameOver()) {
        player.update(deltaTime, width, height);
        enemyGrid.update(deltaTime, player);
    }
    // Always update game state to handle restart input
    gameState.update(deltaTime);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, width, height);
    
    // Draw starfield
    drawStarfield();

    // Draw game objects
    player.draw(ctx);
    enemyGrid.draw(ctx);
    
    // Draw ground line
    const groundY = getScreenUnit(CONSTANTS.GROUND_SETTINGS.Y_PERCENT, 'height');
    ctx.fillStyle = CONSTANTS.COLORS.GROUND;
    ctx.fillRect(0, groundY, width, CONSTANTS.GROUND_SETTINGS.HEIGHT);
    
    // Draw score
    ctx.fillStyle = CONSTANTS.COLORS.SCORE;
    const scoreFontSize = getScreenUnit(CONSTANTS.UI_SETTINGS.SCORE_FONT_SIZE_PERCENT, 'height');
    ctx.font = `${scoreFontSize}px monospace`;
    ctx.fillText(
        `SCORE: ${gameState.getScore()}`,
        getScreenUnit(CONSTANTS.UI_SETTINGS.SCORE_X_PERCENT),
        getScreenUnit(CONSTANTS.UI_SETTINGS.SCORE_Y_PERCENT, 'height')
    );
    
    // Draw lives
    ctx.fillStyle = CONSTANTS.COLORS.LIVES;
    ctx.fillText(
        `LIVES: ${gameState.getLives()}`,
        getScreenUnit(CONSTANTS.UI_SETTINGS.LIVES_X_PERCENT),
        getScreenUnit(CONSTANTS.UI_SETTINGS.LIVES_Y_PERCENT, 'height')
    );
    
    // Draw game over screen
    if (gameState.isGameOver()) {
        ctx.fillStyle = CONSTANTS.COLORS.TEXT;
        const gameOverSize = getScreenUnit(CONSTANTS.UI_SETTINGS.GAME_OVER_FONT_SIZE_PERCENT, 'height');
        ctx.font = `${gameOverSize}px monospace`;
        const gameOverText = 'GAME OVER';
        const textMetrics = ctx.measureText(gameOverText);
        ctx.fillText(
            gameOverText,
            (width - textMetrics.width) / 2,
            height / 2
        );
        
        ctx.font = `${scoreFontSize}px monospace`;
        const restartText = 'Press ENTER or Z to restart';
        const restartMetrics = ctx.measureText(restartText);
        ctx.fillText(
            restartText,
            (width - restartMetrics.width) / 2,
            height / 2 + gameOverSize
        );
    }
}

function gameLoop(timestamp) {
    if (!gameState.lastTime) {
        gameState.lastTime = timestamp;
    }
    const deltaTime = timestamp - gameState.lastTime;
    
    update(deltaTime);
    draw();
    
    gameState.lastTime = timestamp;
    requestAnimationFrame(gameLoop);
}

async function initGame() {
    try {
        // Load sounds
        laserSound = await loadSound('sounds/laser.mp3');
        enemyLaserSound = await loadSound('sounds/enemylaser.mp3');
        explosionSound = await loadSound('sounds/explosion.mp3');
        
        // Load images
        playerImg = await loadImage('images/player.png');
        enemyImages = {
            enemy1: await loadImage('images/enemy1.png'),
            enemy2: await loadImage('images/enemy2.png'),
            enemy3: await loadImage('images/enemy3.png'),
            enemy4: await loadImage('images/enemy4.png'),
            enemy5: await loadImage('images/enemy5.png'),
            enemy6: await loadImage('images/enemy6.png')
        };

        // Initialize game objects
        gameState = new GameState();
        window.gameState = gameState; // Make it accessible to enemy grid for scoring
        
        player = new Player(
            width / 2 - getScreenUnit(SIZES.PLAYER.WIDTH) / 2,
            getScreenUnit(CONSTANTS.PLAYER_SETTINGS.STARTING_Y_PERCENT, 'height'),
            laserSound,
            playerImg,
            SIZES.PLAYER
        );
        
        enemyGrid = new EnemyGrid(
            width,
            height,
            enemyImages,
            enemyLaserSound,
            explosionSound,
            SIZES.ENEMY
        );
        
        // Start game loop
        gameLoop(0);
    } catch (error) {
        console.error('Error loading game assets:', error);
    }
}

// Initialize the game
initGame();