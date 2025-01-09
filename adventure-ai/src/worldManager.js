// worldManager.js
import { TILE_TYPES, SPRITE_CONFIG } from './constants.js';
import { Enemy } from './enemy.js';

export class WorldManager {
    constructor(combatSystem) {
        this.worldWidth = 10;
        this.worldHeight = 10;
        this.screenWidth = 20;
        this.screenHeight = 12;
        this.currentScreenX = 0;
        this.currentScreenY = 0;
        this.combatSystem = combatSystem;
        
        // Initialize empty world grid
        this.worldGrid = Array(this.worldHeight).fill().map(() => 
            Array(this.worldWidth).fill().map(() => ({
                layout: this.createEmptyScreen(),
                items: new Set(),
                enemies: new Set(),
                enemyData: [], // Stores enemy configurations for respawning
                visited: false,
                cleared: false // Tracks if all enemies have been defeated
            }))
        );
    }

    createEmptyScreen() {
        return Array(this.screenHeight).fill().map(() => 
            Array(this.screenWidth).fill(TILE_TYPES.EMPTY)
        );
    }

    loadWorld(worldData) {
        worldData.forEach((row, y) => {
            row.forEach((screenData, x) => {
                if (screenData) {
                    const screen = {
                        layout: this.parseScreenLayout(screenData.layout),
                        items: new Set(screenData.items || []),
                        enemies: new Set(),
                        enemyData: screenData.enemies || [],
                        visited: false,
                        cleared: false
                    };
                    
                    // Initialize enemies if this is a combat room
                    if (screenData.enemies) {
                        this.initializeEnemies(screen);
                    }
                    
                    this.worldGrid[y][x] = screen;
                }
            });
        });
    }

    initializeEnemies(screen) {
        screen.enemies.clear();
        screen.enemyData.forEach(enemyConfig => {
            const enemy = new Enemy(
                enemyConfig.x,
                enemyConfig.y,
                enemyConfig.type
            );
            screen.enemies.add(enemy);
        });
    }

    parseScreenLayout(layout) {
        return layout.map(row => row.split(''));
    }

    getCurrentScreen() {
        return this.worldGrid[this.currentScreenY][this.currentScreenX];
    }

    getNextScreen(direction) {
        let nextX = this.currentScreenX;
        let nextY = this.currentScreenY;
        
        switch (direction) {
            case 'left':
                nextX = Math.max(0, this.currentScreenX - 1);
                break;
            case 'right':
                nextX = Math.min(this.worldWidth - 1, this.currentScreenX + 1);
                break;
            case 'up':
                nextY = Math.max(0, this.currentScreenY - 1);
                break;
            case 'down':
                nextY = Math.min(this.worldHeight - 1, this.currentScreenY + 1);
                break;
        }
        
        // Check if the next screen exists and is different from current
        if (nextX === this.currentScreenX && nextY === this.currentScreenY) {
            return null;
        }
        
        const nextScreen = this.worldGrid[nextY][nextX];
        return nextScreen || null;
    }

    changeScreen(direction) {
        let success = false;
        
        switch (direction) {
            case 'left':
                if (this.currentScreenX > 0) {
                    this.currentScreenX--;
                    success = true;
                }
                break;
            case 'right':
                if (this.currentScreenX < this.worldWidth - 1) {
                    this.currentScreenX++;
                    success = true;
                }
                break;
            case 'up':
                if (this.currentScreenY > 0) {
                    this.currentScreenY--;
                    success = true;
                }
                break;
            case 'down':
                if (this.currentScreenY < this.worldHeight - 1) {
                    this.currentScreenY++;
                    success = true;
                }
                break;
        }
        
        if (success) {
            const newScreen = this.getCurrentScreen();
            if (!newScreen.visited) {
                newScreen.visited = true;
                this.initializeEnemies(newScreen);
            }
        }
        
        return success;
    }

    update(deltaTime, player) {
        const currentScreen = this.getCurrentScreen();
        
        // Update all enemies in the current screen
        for (const enemy of currentScreen.enemies) {
            enemy.update(deltaTime, player, this);
            
            // Remove dead enemies
            if (enemy.isDead()) {
                currentScreen.enemies.delete(enemy);
                
                // Check if screen is cleared
                if (currentScreen.enemies.size === 0) {
                    currentScreen.cleared = true;
                    this.handleRoomClear(currentScreen);
                }
            }
        }
    }

    handleRoomClear(screen) {
        // Spawn rewards, trigger events, etc.
        if (Math.random() < 0.3) { // 30% chance
            const x = Math.floor(this.screenWidth / 2);
            const y = Math.floor(this.screenHeight / 2);
            screen.layout[y][x] = TILE_TYPES.HEART;
            screen.items.add(`${x},${y}`);
        }
    }

    isWalkable(x, y) {
        // Handle screen transitions
        if (x < 0 || x >= this.screenWidth || 
            y < 0 || y >= this.screenHeight) {
            return true;
        }

        const HITBOX_RADIUS = 0.375; // Half of 0.75
        const box = {
            left: x - HITBOX_RADIUS,
            right: x + HITBOX_RADIUS,
            top: y - HITBOX_RADIUS,
            bottom: y + HITBOX_RADIUS
        };

        // Debug logging for near-wall positions
        console.log(`Player pos: (${x.toFixed(3)}, ${y.toFixed(3)})`);
        console.log(`Box: t:${box.top.toFixed(3)} b:${box.bottom.toFixed(3)} l:${box.left.toFixed(3)} r:${box.right.toFixed(3)}`);

        // Get overlapping tiles
        const tiles = [
            [Math.floor(box.left), Math.floor(box.top)],     // Top-left
            [Math.floor(box.right), Math.floor(box.top)],    // Top-right
            [Math.floor(box.left), Math.floor(box.bottom)],  // Bottom-left
            [Math.floor(box.right), Math.floor(box.bottom)]  // Bottom-right
        ];

        // Check each potential tile and log if it's a wall
        for (const [tileX, tileY] of tiles) {
            if (tileX < 0 || tileX >= this.screenWidth || 
                tileY < 0 || tileY >= this.screenHeight) {
                continue;
            }

            const tile = this.getCurrentScreen().layout[tileY][tileX];
            if (tile === TILE_TYPES.WALL || 
                (tile === TILE_TYPES.DOOR && !this.hasKey)) {
                console.log(`Collision at tile (${tileX}, ${tileY})`);
                return false;
            }
        }
        
        return true;
    }

    getTile(x, y) {
        const screen = this.getCurrentScreen();
        if (x < 0 || x >= this.screenWidth || 
            y < 0 || y >= this.screenHeight) {
            return TILE_TYPES.WALL;
        }
        return screen.layout[y][x];
    }

    removeItem(x, y) {
        const screen = this.getCurrentScreen();
        const key = `${x},${y}`;
        if (screen.items.has(key)) {
            screen.items.delete(key);
            screen.layout[y][x] = TILE_TYPES.EMPTY;
            return true;
        }
        return false;
    }

    drawMiniMap(ctx, x, y, scale) {
        const mapWidth = this.worldWidth * scale;
        const mapHeight = this.worldHeight * scale;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, mapWidth, mapHeight);
        
        // Draw visited screens
        this.worldGrid.forEach((row, screenY) => {
            row.forEach((screen, screenX) => {
                if (screen.visited) {
                    // Different colors for different screen states
                    ctx.fillStyle = screen.cleared ? 
                        'rgba(0, 255, 0, 0.3)' : // Cleared rooms are green
                        'rgba(255, 255, 255, 0.3)'; // Uncleared rooms are white
                    
                    ctx.fillRect(
                        x + screenX * scale,
                        y + screenY * scale,
                        scale,
                        scale
                    );
                }
            });
        });
        
        // Draw current screen
        ctx.fillStyle = 'white';
        ctx.fillRect(
            x + this.currentScreenX * scale,
            y + this.currentScreenY * scale,
            scale,
            scale
        );
    }

    drawScreen(ctx, resources) {
        const screen = this.getCurrentScreen();
        
        // Draw tiles
        screen.layout.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === TILE_TYPES.EMPTY) return;
                
                const tileIndex = SPRITE_CONFIG.tiles.mapping[tile] || 0;
                const srcX = tileIndex * SPRITE_CONFIG.tiles.frameWidth;
                
                ctx.drawImage(
                    resources.images.tiles,
                    srcX,
                    0,
                    SPRITE_CONFIG.tiles.frameWidth,
                    SPRITE_CONFIG.tiles.frameHeight,
                    x * 32,
                    y * 32,
                    32,
                    32
                );
            });
        });
        
        // Draw items
        const itemSheet = resources.images.items;
        screen.items.forEach(itemPos => {
            const [x, y] = itemPos.split(',').map(Number);
            const tile = screen.layout[y][x];
            const itemIndex = SPRITE_CONFIG.items.mapping[tile] || 0;
            
            ctx.drawImage(
                itemSheet,
                itemIndex * SPRITE_CONFIG.items.frameWidth,
                0,
                SPRITE_CONFIG.items.frameWidth,
                SPRITE_CONFIG.items.frameHeight,
                x * 32,
                y * 32,
                32,
                32
            );
        });
        
        // Draw enemies
        screen.enemies.forEach(enemy => {
            enemy.draw(ctx);
        });
    }

    getEnemies() {
        return this.getCurrentScreen().enemies;
    }

    isScreenCleared() {
        return this.getCurrentScreen().cleared;
    }
}