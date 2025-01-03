import Phaser from 'phaser';
import { getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');

let canPlaySound = true;

class Example extends Phaser.Scene
{
    preload ()
    {
      this.load.setPath('/');
      this.load.audio('laser', 'sounds/laser.mp3');
      this.load.image('sky', 'images/space3.png');
      this.load.image('logo', 'images/phaser3-logo.png');
      this.load.image('red', 'images/red.png');
    }

    create ()
    {
        this.add.image(400, 300, 'sky');

        const particles = this.add.particles(0, 0, 'red', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        const logo = this.physics.add.image(400, 100, 'logo');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);
        this.laser = this.sound.add('laser');
    }

    update(time, delta) {
      const [p1] = getInput(); 
      if (p1.BUTTON_SOUTH.pressed && canPlaySound) {
        this.laser.play();
        canPlaySound = false;
      } else if (!p1.BUTTON_SOUTH.pressed) {
        canPlaySound = true;
      }
    }
}

const config = {
  type: Phaser.CANVAS,
  canvas,
  width: 640,
  height: 480,
  scene: Example,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 200 }
    }
  }
};

const game = new Phaser.Game(config);

export default game;





