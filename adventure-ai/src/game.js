// game.js
import { GameEngine } from './engine.js';
import { Player } from './player.js';
import { WorldManager } from './worldManager.js';
import { GAME_STATES } from './constants.js';
import { WORLD_DATA } from './worldData.js';
import { playSound, getInput } from './utils.js';
import { CombatSystem } from './combat.js';
import { GameRenderer } from './gameRenderer.js';
import { TransitionManager } from './transitionManager.js';

export class Game extends GameEngine {
  constructor(canvas, resources) {
    super(canvas, resources);
    this.combatSystem = new CombatSystem(resources);
    this.worldManager = new WorldManager(this.combatSystem);
    this.player = null;
    this.gameState = GAME_STATES.LOADING;
    this.renderer = new GameRenderer(canvas, resources);
    this.transitionManager = new TransitionManager();
    this.init();
  }

  async init() {
    super.init();
    this.worldManager.loadWorld(WORLD_DATA);
    this.player = new Player(10, 6, this.resources, this.combatSystem, this.worldManager);
    this.lastTime = performance.now();
    this.gameState = GAME_STATES.PLAYING;
    this.gameLoop();
  }

  handleResize() {
    this.renderer.handleResize();
  }

  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 32);
    this.update(deltaTime);
    this.draw();
    this.lastTime = currentTime;
    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    if (this.gameState === GAME_STATES.PLAYING) {
      const input = getInput()[0];
      const oldX = this.player.x;
      const oldY = this.player.y;
      this.player.update(deltaTime, input);
      
      if (!this.worldManager.isWalkable(this.player.x, this.player.y)) {
        this.player.x = oldX;
        this.player.y = oldY;
      }
      
      this.checkScreenTransitions();
      this.combatSystem.update(deltaTime, this.player, this.worldManager.getEnemies(), this.worldManager);
      this.worldManager.update(deltaTime, this.player);
      this.checkItemCollection();
    } else if (this.gameState === GAME_STATES.TRANSITIONING) {
      this.transitionManager.update(deltaTime);
      if (this.transitionManager.isComplete()) {
        this.worldManager.changeScreen(this.transitionManager.direction);
        this.gameState = GAME_STATES.PLAYING;
      }
    }
  }

  checkScreenTransitions() {
    const transition = this.transitionManager.checkTransition(
      this.player,
      this.worldManager
    );

    if (transition) {
      this.gameState = GAME_STATES.TRANSITIONING;
      this.player.x = transition.newX;
      this.player.y = transition.newY;
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
    this.renderer.draw({
      gameState: this.gameState,
      player: this.player,
      worldManager: this.worldManager,
      combatSystem: this.combatSystem,
      transitionManager: this.transitionManager
    });
  }
}