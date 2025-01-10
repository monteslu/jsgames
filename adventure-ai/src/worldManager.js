// worldManager.js
import { TILE_TYPES, SPRITE_CONFIG, COLORS, STATUS_BAR } from './constants.js';
import { Enemy } from './enemy.js';

export class WorldManager {
    constructor(combatSystem) {
        this.worldWidth = 20;
        this.worldHeight = 13;
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
                        y: y,
                        backgroundColor: screenData.backgroundColor // Add this line to copy backgroundColor
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

    isWalkable(x, y, hitboxSize = 0.5) {
        const TRANSITION_BUFFER = 0.45;
        const hitbox = {
            left: x - hitboxSize / 2,
            right: x + hitboxSize / 2,
            top: y - hitboxSize / 2,
            bottom: y + hitboxSize / 2
        };

        if (hitbox.left < -TRANSITION_BUFFER || 
            hitbox.right > this.screenWidth + TRANSITION_BUFFER ||
            hitbox.top < -TRANSITION_BUFFER ||
            hitbox.bottom > this.screenHeight + TRANSITION_BUFFER) {

            let nextScreen = null;
            if (hitbox.left < -TRANSITION_BUFFER) nextScreen = this.getNextScreen('left');
            if (hitbox.right > this.screenWidth + TRANSITION_BUFFER) nextScreen = this.getNextScreen('right');
            if (hitbox.top < -TRANSITION_BUFFER) nextScreen = this.getNextScreen('up');
            if (hitbox.bottom > this.screenHeight + TRANSITION_BUFFER) nextScreen = this.getNextScreen('down');

            if (!nextScreen) return false;

            const tileX = Math.floor(x);
            const tileY = Math.floor(y);
            if (tileX >= 0 && tileX < this.screenWidth && tileY >= 0 && tileY < this.screenHeight) {
                const tile = this.getCurrentScreen().layout[tileY][tileX];
                if (tile === TILE_TYPES.WALL) return false;
            }

            return true;
        }

        const minTileX = Math.floor(hitbox.left);
        const maxTileX = Math.ceil(hitbox.right);
        const minTileY = Math.floor(hitbox.top);
        const maxTileY = Math.ceil(hitbox.bottom);

        for (let checkY = minTileY; checkY < maxTileY; checkY++) {
            for (let checkX = minTileX; checkX < maxTileX; checkX++) {
                if (checkX < 0 || checkX >= this.screenWidth || 
                    checkY < 0 || checkY >= this.screenHeight) {
                    continue;
                }

                const tile = this.getCurrentScreen().layout[checkY][checkX];
                if (tile === TILE_TYPES.WALL || 
                    (tile === TILE_TYPES.DOOR && !this.hasKey)) {
                    return false;
                }
            }
        }
        
        return true;
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

    drawMiniMap(ctx, x, y) {
        const { screenWidth, screenHeight } = STATUS_BAR.miniMap;
        
        // Calculate total minimap dimensions
        const minimapWidth = this.worldWidth * screenWidth;
        const minimapHeight = this.worldHeight * screenHeight;
        
        // Draw background (unexplored area)
        ctx.fillStyle = COLORS.minimap.unexplored;
        ctx.fillRect(x, y, minimapWidth, minimapHeight);
        
        // Draw each screen
        this.worldGrid.forEach((row, screenY) => {
            row.forEach((screen, screenX) => {
                if (screen.visited) {
                    // Use screen's custom background color or default explored color
                    ctx.fillStyle = screen.backgroundColor || COLORS.minimap.explored;
                    ctx.fillRect(
                        x + screenX * screenWidth,
                        y + screenY * screenHeight,
                        screenWidth,
                        screenHeight
                    );
                }
            });
        });
        
        // Draw current screen indicator
        ctx.fillStyle = COLORS.minimap.current;
        ctx.fillRect(
            x + this.currentScreenX * screenWidth,
            y + this.currentScreenY * screenHeight,
            screenWidth,
            screenHeight
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