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
        WIDTH: (24 / width) * 100,
        HEIGHT: (24 / height) * 100,
        BULLET_WIDTH: (2 / width) * 100,
        BULLET_HEIGHT: (8 / height) * 100
    },
    ENEMY: {
        WIDTH: (27 / width) * 100,
        HEIGHT: (33 / height) * 100,
        BULLET_WIDTH: (4 / width) * 100,
        BULLET_HEIGHT: (12 / height) * 100
    }
};

// Game assets
let laserSound, enemyLaserSound, explosionSound, gameOverSound;
let playerImg;
let enemyImages = {
    enemy1: [],
    enemy2: [],
    enemy3: [],
    enemy4: [],
    enemy5: [],
    enemy6: []
};

// Game objects
let gameState;
let player;
let enemyGrid;

// Star colors
const STAR_COLORS = [
    '#FFFFFF', // White
    '#ADD8E6', // Light blue
    '#FFFFD0'  // Light yellow
];

// Initialize three layers of stars for parallax effect
const starLayers = [
    // Distant stars (small and slow)
    Array.from({ length: 50 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: height * 0.05,
        size: 1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleSpeed: 0.003 + Math.random() * 0.007,
        twinklePhase: Math.random() * Math.PI * 2,
        maxBrightness: 0.7 + Math.random() * 0.3
    })),
    // Mid-distance stars
    Array.from({ length: 30 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: height * 0.1,
        size: 1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleSpeed: 0.003 + Math.random() * 0.007,
        twinklePhase: Math.random() * Math.PI * 2,
        maxBrightness: 0.7 + Math.random() * 0.3
    })),
    // Close stars (faster)
    Array.from({ length: 20 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: height * 0.2,
        size: 1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleSpeed: 0.003 + Math.random() * 0.007,
        twinklePhase: Math.random() * Math.PI * 2,
        maxBrightness: 0.7 + Math.random() * 0.3
    }))
];

function drawStarfield(deltaTime) {
    // Draw each layer of stars
    starLayers.forEach((layer) => {
        layer.forEach(star => {
            // Update star position
            star.y += star.speed * (deltaTime / 1000);
            
            // Wrap stars around when they go off screen
            if (star.y > height) {
                star.y = 0;
                star.x = Math.random() * width;
                star.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
            }
            
            // Update twinkle
            star.twinklePhase += star.twinkleSpeed * deltaTime;
            const brightness = (Math.sin(star.twinklePhase) * 0.5 + 0.5) * star.maxBrightness;
            
            // Convert hex color to RGB for alpha support
            let color = star.color;
            if (color.length === 7) { // hex color
                const r = parseInt(color.substr(1,2), 16);
                const g = parseInt(color.substr(3,2), 16);
                const b = parseInt(color.substr(5,2), 16);
                color = `rgba(${r}, ${g}, ${b}, ${brightness})`;
            }
            
            // Draw star with color and brightness
            ctx.fillStyle = color;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    });
}

function getScreenUnit(percentage, dimension = 'width') {
    return (percentage / 100) * (dimension === 'width' ? width : height);
}

function resetGame() {
    gameState.reset();
    player.reset(width);
    enemyGrid.reset();
}

function update(deltaTime) {
    const [input] = getInput();
    
    if (gameState.isGameOver() && input.START.pressed) {
        resetGame();
        return;
    }

    if (!gameState.isGameOver()) {
        player.update(deltaTime, width, height);
        enemyGrid.update(deltaTime, player);
    }
    
    gameState.update(deltaTime);
}

function draw(deltaTime) {
    // Clear canvas
    ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, width, height);
    
    // Draw starfield
    drawStarfield(deltaTime);

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
    ctx.font = `${scoreFontSize}px SMB`;
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
        ctx.fillStyle = CONSTANTS.COLORS.END_TEXT;
        const gameOverSize = getScreenUnit(CONSTANTS.UI_SETTINGS.GAME_OVER_FONT_SIZE_PERCENT, 'height');
        ctx.font = `${gameOverSize}px SMB`;
        const gameOverText = 'GAME OVER';
        const textMetrics = ctx.measureText(gameOverText);
        ctx.fillText(
            gameOverText,
            (width - textMetrics.width) / 2,
            height / 2
        );
        
        ctx.font = `${scoreFontSize}px SMB`;
        const restartText = 'Press START button to restart';
        const restartMetrics = ctx.measureText(restartText);
        ctx.fillText(
            restartText,
            (width - restartMetrics.width) / 2,
            height / 2 + gameOverSize
        );

        const finalScoreText = `Final Score: ${gameState.getScore()}`;
        const scoreMetrics = ctx.measureText(finalScoreText);
        ctx.fillText(
            finalScoreText,
            (width - scoreMetrics.width) / 2,
            height / 2 + gameOverSize * 2
        );
    }
}

function gameLoop(timestamp) {
    if (!gameState.lastTime) {
        gameState.lastTime = timestamp;
    }
    const deltaTime = timestamp - gameState.lastTime;
    
    update(deltaTime);
    draw(deltaTime);
    
    gameState.lastTime = timestamp;
    requestAnimationFrame(gameLoop);
}

async function loadEnemyAnimations() {
    // Load all animation frames for each enemy type
    for (let enemyType = 1; enemyType <= 6; enemyType++) {
        for (let frame = 1; frame <= 8; frame++) {
            const img = await loadImage(`images/enemy${enemyType}-${frame}.png`);
            enemyImages[`enemy${enemyType}`].push(img);
        }
    }
}

async function initGame() {
    try {
        // Load sounds
        laserSound = await loadSound('sounds/laser.mp3');
        enemyLaserSound = await loadSound('sounds/enemylaser.mp3');
        explosionSound = await loadSound('sounds/explosion.mp3');
        gameOverSound = await loadSound('sounds/game-over.mp3');


        const font = new FontFace('SMB', 'url(/fonts/smb.ttf)');
        const loadedFont = await font.load();
        document.fonts.add(loadedFont);
        
        // Load images
        playerImg = await loadImage('images/player.png');
        await loadEnemyAnimations();

        // Initialize game objects
        gameState = new GameState(gameOverSound);
        window.gameState = gameState;
        
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