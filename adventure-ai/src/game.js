// game.js
import { GameEngine } from './engine.js';
import { Player } from './player.js';
import { WorldManager } from './worldManager.js';
import { STATUS_BAR, COLORS, GAME_STATES, TRANSITION_CONFIG } from './constants.js';
import { WORLD_DATA } from './worldData.js';
import { playSound, getInput } from './utils.js';
import { CombatSystem } from './combat.js';

export class Game extends GameEngine {
    constructor(canvas, resources) {
        super(canvas, resources);
        this.combatSystem = new CombatSystem(resources);
        this.worldManager = new WorldManager(this.combatSystem);
        this.player = null;
        this.gameState = GAME_STATES.LOADING;
        this.transitionType = TRANSITION_CONFIG.TYPES.NONE;
        this.init();
    }

    async init() {
        await super.init();
        
        // Load world data
        this.worldManager.loadWorld(WORLD_DATA);
        
        // Create player at starting position
        this.player = new Player(10, 6, this.resources, this.combatSystem);
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameState = GAME_STATES.PLAYING;
        this.gameLoop();
    }

    handleResize() {
        const canvas = this.canvas;
        const aspectRatio = canvas.width / canvas.height;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (windowWidth / windowHeight > aspectRatio) {
            canvas.style.width = `${windowHeight * aspectRatio}px`;
            canvas.style.height = `${windowHeight}px`;
        } else {
            canvas.style.width = `${windowWidth}px`;
            canvas.style.height = `${windowWidth / aspectRatio}px`;
        }
        
        this.ctx.imageSmoothingEnabled = false;
    }

    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = Math.min(currentTime - this.lastTime, 32); // Cap at ~30 FPS
        
        this.update(deltaTime);
        this.draw();
        
        this.lastTime = currentTime;
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        if (this.gameState === GAME_STATES.PLAYING) {
            const input = getInput()[0]; // Get first player's input
            
            // Update player first
            const oldX = this.player.x;
            const oldY = this.player.y;
            this.player.update(deltaTime, input);
            
            // Check collisions with world
            if (!this.worldManager.isWalkable(this.player.x, this.player.y)) {
                this.player.x = oldX;
                this.player.y = oldY;
            }
            
            // Check screen transitions
            this.checkScreenTransitions();
            
            // Update combat system
            this.combatSystem.update(deltaTime, this.player, this.worldManager.getEnemies(), this.worldManager);
            
            // Update world (enemies, etc)
            this.worldManager.update(deltaTime, this.player);
            
            // Check item collection
            this.checkItemCollection();
        } else if (this.gameState === GAME_STATES.TRANSITIONING) {
            this.updateTransition(deltaTime);
        }
    }

    checkScreenTransitions() {
        let transitionDirection = null;
        let newPlayerX = this.player.x;
        let newPlayerY = this.player.y;
        
        // Check horizontal transitions
        if (this.player.x < -0.45) {
            if (this.worldManager.getNextScreen('left')) {
                transitionDirection = 'left';
                newPlayerX = this.worldManager.screenWidth - 0.55;
            } else {
                this.player.x = 0;
            }
        } else if (this.player.x > this.worldManager.screenWidth - 0.55) {
            if (this.worldManager.getNextScreen('right')) {
                transitionDirection = 'right';
                newPlayerX = 0;
            } else {
                this.player.x = this.worldManager.screenWidth - 1;
            }
        }
        
        // Check vertical transitions
        if (this.player.y < -0.45) {
            if (this.worldManager.getNextScreen('up')) {
                transitionDirection = 'up';
                newPlayerY = this.worldManager.screenHeight - 0.55;
            } else {
                this.player.y = 0;
            }
        } else if (this.player.y > this.worldManager.screenHeight - 0.55) {
            if (this.worldManager.getNextScreen('down')) {
                transitionDirection = 'down';
                newPlayerY = 0;
            } else {
                this.player.y = this.worldManager.screenHeight - 1;
            }
        }
        
        // Start transition if needed
        if (transitionDirection) {
            this.startScreenTransition(transitionDirection);
            this.player.x = newPlayerX;
            this.player.y = newPlayerY;
        }
    }

    startScreenTransition(direction) {
        this.gameState = GAME_STATES.TRANSITIONING;
        this.transitionDirection = direction;
        this.transitionProgress = 0;
        this.transitionType = TRANSITION_CONFIG.TYPES.SLIDE;
        this.worldManager.changeScreen(direction);
    }

    updateTransition(deltaTime) {
        this.transitionProgress += deltaTime / TRANSITION_CONFIG.DURATION;
        
        if (this.transitionProgress >= 1) {
            this.gameState = GAME_STATES.PLAYING;
            this.transitionProgress = 0;
            this.transitionType = TRANSITION_CONFIG.TYPES.NONE;
        }
    }

    checkItemCollection() {
        const tile = this.worldManager.getTile(
            Math.floor(this.player.x), 
            Math.floor(this.player.y)
        );
        
        if (this.worldManager.removeItem(
            Math.floor(this.player.x), 
            Math.floor(this.player.y))
        ) {
            playSound(this.resources.sounds.item);
            this.player.addItem(tile);
        }
    }

    draw() {
        // Clear the canvas
        this.ctx.fillStyle = COLORS.tan;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === GAME_STATES.PLAYING) {
            this.drawGame();
        } else if (this.gameState === GAME_STATES.TRANSITIONING) {
            this.drawTransition();
        }
    }

    drawGame() {
        // Draw status bar
        this.drawStatusBar();
        
        // Set up transform for game area
        this.ctx.save();
        this.ctx.translate(0, STATUS_BAR.height);
        
        // Draw current screen
        this.worldManager.drawScreen(this.ctx, this.resources);
        
        // Draw combat effects
        this.combatSystem.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
        
        this.ctx.restore();
    }

    drawTransition() {
        const progress = this.transitionProgress;
        
        // Calculate offset based on transition direction
        let offsetX = 0;
        let offsetY = STATUS_BAR.height;
        
        switch (this.transitionDirection) {
            case 'right':
                offsetX = -this.canvas.width * progress;
                break;
            case 'left':
                offsetX = this.canvas.width * progress;
                break;
            case 'down':
                offsetY = STATUS_BAR.height - (this.canvas.height - STATUS_BAR.height) * progress;
                break;
            case 'up':
                offsetY = STATUS_BAR.height + (this.canvas.height - STATUS_BAR.height) * progress;
                break;
        }
        
        // Draw status bar (doesn't move during transition)
        this.drawStatusBar();
        
        // Draw current screen with offset
        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        this.worldManager.drawScreen(this.ctx, this.resources);
        this.player.draw(this.ctx);
        this.ctx.restore();
    }

    drawStatusBar() {
        // Draw status bar background
        this.ctx.fillStyle = COLORS.black;
        this.ctx.fillRect(0, 0, this.canvas.width, STATUS_BAR.height);
        
        // Draw hearts
        for (let i = 0; i < this.player.maxHealth; i++) {
            const filled = i < this.player.health;
            this.ctx.drawImage(
                this.resources.images.items,
                (filled ? 2 : 3) * 32,
                0,
                32,
                32,
                STATUS_BAR.padding + i * (STATUS_BAR.heartWidth + STATUS_BAR.heartSpacing),
                STATUS_BAR.padding,
                STATUS_BAR.heartWidth,
                STATUS_BAR.heartHeight
            );
        }
        
        // Draw current weapon
        if (this.player.inventory.sword) {
            this.ctx.drawImage(
                this.resources.images.items,
                32,
                0,
                32,
                32,
                this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize,
                STATUS_BAR.padding,
                STATUS_BAR.weaponSize,
                STATUS_BAR.weaponSize
            );
        }
        
        // Draw key count
        if (this.player.inventory.keys > 0) {
            this.ctx.drawImage(
                this.resources.images.items,
                0,
                0,
                32,
                32,
                this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 2,
                STATUS_BAR.padding,
                STATUS_BAR.weaponSize,
                STATUS_BAR.weaponSize
            );
            
            this.ctx.fillStyle = COLORS.white;
            this.ctx.font = '24px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `×${this.player.inventory.keys}`,
                this.canvas.width - STATUS_BAR.padding - STATUS_BAR.weaponSize * 1.5,
                STATUS_BAR.padding + STATUS_BAR.weaponSize * 0.75
            );
        }
        
        // Draw mini-map
        this.worldManager.drawMiniMap(
            this.ctx,
            this.canvas.width / 2 - (this.worldManager.worldWidth * STATUS_BAR.miniMapScale) / 2,
            STATUS_BAR.padding,
            STATUS_BAR.miniMapScale
        );
    }
}