/**
 * Checks if two rectangles are colliding
 * @param {Object} rect1 - First rectangle with x, y, width, height
 * @param {Object} rect2 - Second rectangle with x, y, width, height
 * @returns {boolean} - True if colliding, false otherwise
 */
export function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Checks if a point is inside a rectangle
 * @param {number} x - Point x coordinate
 * @param {number} y - Point y coordinate
 * @param {Object} rect - Rectangle with x, y, width, height
 * @returns {boolean} - True if point is inside rectangle, false otherwise
 */
export function checkPointInRect(x, y, rect) {
    return x >= rect.x &&
           x <= rect.x + rect.width &&
           y >= rect.y &&
           y <= rect.y + rect.height;
}

/**
 * Checks if an entity is outside the game bounds
 * @param {Object} entity - Entity with x, y, width, height
 * @param {number} gameWidth - Width of game area
 * @param {number} gameHeight - Height of game area
 * @returns {boolean} - True if out of bounds, false otherwise
 */
export function isOutOfBounds(entity, gameWidth, gameHeight) {
    return entity.x < 0 ||
           entity.x + entity.width > gameWidth ||
           entity.y < 0 ||
           entity.y + entity.height > gameHeight;
}

/**
 * Checks collisions between bullets and targets
 * @param {Array} bullets - Array of bullet objects
 * @param {Array} targets - Array of target objects
 * @returns {Array} - Array of collision objects {bullet, target}
 */
export function checkBulletCollisions(bullets, targets) {
    const collisions = [];
    
    bullets.forEach(bullet => {
        targets.forEach(target => {
            if (target.alive !== false && checkRectCollision(bullet, target)) {
                collisions.push({
                    bullet: bullet,
                    target: target
                });
            }
        });
    });
    
    return collisions;
}

/**
 * Checks if player has been hit by any enemy bullets
 * @param {Object} player - Player object with x, y, width, height
 * @param {Array} enemyBullets - Array of enemy bullet objects
 * @returns {boolean} - True if player was hit, false otherwise
 */
export function checkPlayerHit(player, enemyBullets) {
    return enemyBullets.some(bullet => checkRectCollision(bullet, player));
}

/**
 * Creates a bounding box for a group of entities
 * @param {Array} entities - Array of entities with x, y, width, height
 * @returns {Object} - Bounding box with x, y, width, height
 */
export function createBoundingBox(entities) {
    if (entities.length === 0) return null;
    
    const alive = entities.filter(e => e.alive !== false);
    if (alive.length === 0) return null;

    const minX = Math.min(...alive.map(e => e.x));
    const maxX = Math.max(...alive.map(e => e.x + e.width));
    const minY = Math.min(...alive.map(e => e.y));
    const maxY = Math.max(...alive.map(e => e.y + e.height));
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}
