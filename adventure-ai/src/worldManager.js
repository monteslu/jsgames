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
        
        this.worldGrid = Array(this.worldHeight).fill().map(() => 
            Array(this.worldWidth).fill().map(() => ({
                layout: this.createEmptyScreen(),
                items: new Set(),
                enemies: new Set(),
                enemyData: [],
                visited: false,
                cleared: false
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
                        cleared: false,
                        x: x,
                        y: y
                    };
                    
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
        
        if (nextX === this.currentScreenX && nextY === this.currentScreenY) {
            return null;
        }
        
        return this.worldGrid[nextY][nextX] || null;
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

    isWalkable(x, y) {
        // Convert float coordinates to tile coordinates
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        // Check screen boundaries with margin for transitions
        if (x < -0.45 || x > this.screenWidth - 0.55 || 
            y < -0.45 || y > this.screenHeight - 0.55) {
            return true; // Allow movement for screen transitions
        }

        // Get the 4 surrounding tiles for collision check
        const tiles = [
            [tileX, tileY],             // Current tile
            [tileX + 1, tileY],         // Right tile
            [tileX, tileY + 1],         // Bottom tile
            [tileX + 1, tileY + 1]      // Bottom-right tile
        ];

        // Check hitbox against each relevant tile
        const HITBOX_SIZE = 0.8;  // Slightly smaller than 1 tile
        const playerBox = {
            left: x - HITBOX_SIZE / 2,
            right: x + HITBOX_SIZE / 2,
            top: y - HITBOX_SIZE / 2,
            bottom: y + HITBOX_SIZE / 2
        };

        // Check each tile that the hitbox might intersect
        for (const [checkX, checkY] of tiles) {
            // Skip tiles outside the screen
            if (checkX < 0 || checkX >= this.screenWidth || 
                checkY < 0 || checkY >= this.screenHeight) {
                continue;
            }

            const tile = this.getCurrentScreen().layout[checkY][checkX];
            if (tile === TILE_TYPES.WALL || 
                (tile === TILE_TYPES.DOOR && !this.hasKey)) {
                // Create tile collision box
                const tileBox = {
                    left: checkX,
                    right: checkX + 1,
                    top: checkY,
                    bottom: checkY + 1
                };

                // Check for intersection
                if (this.boxesIntersect(playerBox, tileBox)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    boxesIntersect(a, b) {
        return !(
            a.right < b.left ||
            a.left > b.right ||
            a.bottom < b.top ||
            a.top > b.bottom
        );
    }

    update(deltaTime, player) {
        const currentScreen = this.getCurrentScreen();
        
        for (const enemy of currentScreen.enemies) {
            enemy.update(deltaTime, player, this);
            
            if (enemy.isDead()) {
                currentScreen.enemies.delete(enemy);
                
                if (currentScreen.enemies.size === 0) {
                    currentScreen.cleared = true;
                    this.handleRoomClear(currentScreen);
                }
            }
        }
    }

    handleRoomClear(screen) {
        if (Math.random() < 0.3) {
            const x = Math.floor(this.screenWidth / 2);
            const y = Math.floor(this.screenHeight / 2);
            screen.layout[y][x] = TILE_TYPES.HEART;
            screen.items.add(`${x},${y}`);
        }
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
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, mapWidth, mapHeight);
        
        this.worldGrid.forEach((row, screenY) => {
            row.forEach((screen, screenX) => {
                if (screen.visited) {
                    ctx.fillStyle = screen.cleared ? 
                        'rgba(0, 255, 0, 0.3)' : 
                        'rgba(255, 255, 255, 0.3)';
                    
                    ctx.fillRect(
                        x + screenX * scale,
                        y + screenY * scale,
                        scale,
                        scale
                    );
                }
            });
        });
        
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