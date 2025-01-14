// enemyBehaviors.js
import { DIRECTIONS } from './constants.js';

export const BEHAVIORS = {
  CHASE: 'chase',       // Directly chase player
  PATROL: 'patrol',     // Move in a pattern
  AMBUSH: 'ambush',     // Wait and then rush
  RANGED: 'ranged',     // Keep distance and shoot
  SWARM: 'swarm',       // Move in group patterns
  TELEPORT: 'teleport'  // Disappear and reappear
};

export class EnemyBehaviorController {
  static updateChase(enemy, deltaTime, player, distToPlayer) {
    if (distToPlayer <= enemy.config.detectionRange) {
      enemy.target = player;
      enemy.state = distToPlayer < 1.5 ? 'attacking' : 'moving';
      EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
    } else {
      enemy.target = null;
      enemy.state = 'idle';
    }
  }

  static updatePatrol(enemy, deltaTime, player, distToPlayer) {
    if (enemy.patrolPoints.length === 0) {
      EnemyBehaviorController.setupPatrolPoints(enemy);
    }
    
    if (distToPlayer <= enemy.config.detectionRange) {
      EnemyBehaviorController.updateChase(enemy, deltaTime, player, distToPlayer);
    } else {
      const target = enemy.patrolPoints[enemy.currentPatrolPoint];
      const distToPoint = Math.sqrt(
        Math.pow(target.x - enemy.x, 2) + 
        Math.pow(target.y - enemy.y, 2)
      );
      
      if (distToPoint < 0.1) {
        enemy.currentPatrolPoint = (enemy.currentPatrolPoint + 1) % enemy.patrolPoints.length;
      } else {
        enemy.target = target;
        EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
      }
    }
  }

  static moveTowardTarget(enemy, deltaTime) {
    if (!enemy.target) return;
    
    const dx = enemy.target.x - enemy.x;
    const dy = enemy.target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      // Convert deltaTime from milliseconds to seconds for consistent movement speed
      const seconds = deltaTime / 1000;
      enemy.x += (dx / dist) * enemy.speed * seconds;
      enemy.y += (dy / dist) * enemy.speed * seconds;
      
      // Update direction
      if (Math.abs(dx) > Math.abs(dy)) {
        enemy.direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
      } else {
        enemy.direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
      }
    }
  }

  static moveAwayFromTarget(enemy, deltaTime, target) {
    const dx = enemy.x - target.x;
    const dy = enemy.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const seconds = deltaTime / 1000;
      enemy.x += (dx / dist) * enemy.speed * seconds;
      enemy.y += (dy / dist) * enemy.speed * seconds;
    }
  }

  static setupPatrolPoints(enemy) {
    const radius = 2;
    enemy.patrolPoints = [
      { x: enemy.x - radius, y: enemy.y - radius },
      { x: enemy.x + radius, y: enemy.y - radius },
      { x: enemy.x + radius, y: enemy.y + radius },
      { x: enemy.x - radius, y: enemy.y + radius }
    ];
  }

  static updateAmbush(enemy, deltaTime, player, distToPlayer) {
    if (!enemy.ambushTriggered && distToPlayer <= enemy.config.detectionRange) {
      enemy.ambushTriggered = true;
      enemy.speed = enemy.config.ambushSpeed;
      enemy.state = 'ambush';
    }
    
    if (enemy.ambushTriggered) {
      enemy.target = player;
      EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
      
      if (distToPlayer < 1 || distToPlayer > enemy.config.detectionRange * 2) {
        enemy.ambushTriggered = false;
        enemy.speed = enemy.config.speed;
        enemy.state = 'idle';
      }
    }
  }

  static updateRanged(enemy, deltaTime, player, distToPlayer) {
    if (distToPlayer <= enemy.config.detectionRange) {
      if (distToPlayer < 4) {
        EnemyBehaviorController.moveAwayFromTarget(enemy, deltaTime, player);
      } else if (distToPlayer > 6) {
        EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
      } else {
        enemy.shootAtPlayer(player);
      }
    } else {
      enemy.state = 'idle';
    }
  }

  static updateSwarm(enemy, deltaTime, player, distToPlayer) {
    if (distToPlayer <= enemy.config.detectionRange) {
      const angle = (enemy.behaviorTime * 0.001) + enemy.swarmOffset;
      const radius = 3;
      const targetX = player.x + Math.cos(angle) * radius;
      const targetY = player.y + Math.sin(angle) * radius;
      
      enemy.target = { x: targetX, y: targetY };
      EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
    } else {
      enemy.state = 'idle';
    }
  }

  static updateTeleport(enemy, deltaTime, player, distToPlayer, worldManager) {
    if (enemy.teleportCooldown > 0) {
      enemy.teleportCooldown -= deltaTime;
      return;
    }
    
    if (distToPlayer <= enemy.config.detectionRange) {
      if (distToPlayer < 2 || distToPlayer > 5) {
        EnemyBehaviorController.teleport(enemy, player, worldManager);
        enemy.teleportCooldown = enemy.config.teleportCooldown;
      } else {
        enemy.target = player;
        EnemyBehaviorController.moveTowardTarget(enemy, deltaTime);
      }
    }
  }

  static teleport(enemy, player, worldManager) {
    const attempts = 10;
    for (let i = 0; i < attempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 3 + Math.random() * 2;
      const newX = player.x + Math.cos(angle) * distance;
      const newY = player.y + Math.sin(angle) * distance;
      
      if (worldManager.isWalkable(newX, newY)) {
        enemy.x = newX;
        enemy.y = newY;
        break;
      }
    }
  }
}