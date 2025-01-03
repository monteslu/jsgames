
let playerColor = 'yellow';
// import { loadImage } from '@napi-rs/canvas';
import beep from './sound.js';


let btns = Array(17).fill(0).map((b) => {
  return {pressed: false, value: 0};
});

const { requestAnimationFrame, localStorage } = globalThis;

console.log('requestAnimationFrame def1', requestAnimationFrame);


const loadImage2 = (url) => {
  console.log('loadImage2', url);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = (loaded) => {
      console.log('img loaded', loaded);
      resolve(loaded);
    };
    img.onerror = (error) => {
      console.error('img error', error);
      reject(error);
    };
    img.src = url;
  });
}

let axs = [];

let tuxImg;
let jsImg;
let jsX = 50;
let jsY = 70;
let speed = 0.2;
let fired = false;
let sounded = false;

const canvas = document.getElementById('game-canvas');


const update = (millis) => {
  const [p1] = globalThis.navigator.getGamepads();
  // console.log('pi', p1);
  if (p1) {
    const { axes, buttons } = p1;
    // console.log('buttons', buttons, axes);
    btns = buttons;
    axs = axes;
    if (btns[12] && btns[12].pressed) {
      jsY -= millis * speed;
    }
    if (btns[13] && btns[13].pressed) {
      jsY += millis * speed;
    }
    if (btns[14] && btns[14].pressed) {
      jsX -= millis * speed;
    }
    if (btns[15] && btns[15].pressed) {
      jsX += millis * speed;
    }
    if (btns[0] && btns[0].pressed) {
      fired = true;
    } else {
      fired = false;
    }
    if (btns[1] && btns[1].pressed) {
      if (!sounded) {
        console.log('sound');
        beep();
        sounded = true;
      }
    } else if (btns[1] && !btns[1].pressed){
      sounded = false;
    }
  }
}

const draw = () => {
  const ctx = canvas.getContext('2d');
  const { width, height } = ctx.canvas;
  ctx.fillStyle = '#8888FF';
  ctx.fillRect(0, 0, width, height);


  ctx.fillStyle = fired ? 'red' : 'black';
  ctx.font = '35px Arial';
  ctx.fillText('Hello, node-sdl !', 10, 37);

  ctx.drawImage(tuxImg, 220, 150);
  ctx.drawImage(jsImg, jsX, jsY);
  

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
};

let lastTime = 0;
function gameLoop() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    // console.log('gameLoop', delta);
    update(delta);
    draw();
  requestAnimationFrame(gameLoop);
}

async function launch() {
  try {
    console.log('start');
    tuxImg = await loadImage2('./tux64.png');
    console.log('tuxImg', tuxImg);
    jsImg = await loadImage2('/js64.png');
    console.log('jsImg', jsImg);
    console.log('localStorage', localStorage);
    localStorage.clear();
    // console.log('localstorage.foo', localStorage.foo);
    localStorage.foo = 'bar22';
    console.log('localstorage.foo', localStorage.foo);
    gameLoop();
  } catch (e) {
    console.error('error', e);
  }
}

launch();
