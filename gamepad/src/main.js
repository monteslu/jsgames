import { loadImage, getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;


const ctx = canvas.getContext('2d');

const _jsg = globalThis._jsg;
if (_jsg) {
  _jsg.debug = true;
}

const { width, height } = canvas;

//base on original gamepad image size of 320x178
const BUTTON_RADIUS = 9;
const AXIS_RADIUS = 12;

const BUTTON_SOUTH_X = 232;
const BUTTON_SOUTH_Y = 98;

const BUTTON_EAST_X = 256;
const BUTTON_EAST_Y = 77;

const BUTTON_WEST_X = 208;
const BUTTON_WEST_Y = 77;

const BUTTON_NORTH_X = 232;
const BUTTON_NORTH_Y = 53;

const START_X = 177;
const START_Y = 56;

const SELECT_X = 143;
const SELECT_Y = 56;

const DPAD_UP_X = 88;
const DPAD_UP_Y = 56;

const DPAD_DOWN_X = 88;
const DPAD_DOWN_Y = 98;

const DPAD_LEFT_X = 67;
const DPAD_LEFT_Y = 78;

const DPAD_RIGHT_X = 109;
const DPAD_RIGHT_Y = 78;

const GUIDE_X = 159;
const GUIDE_Y = 97;

const LEFT_STICK_X = 112;
const LEFT_STICK_Y = 135;

const RIGHT_STICK_X = 207;
const RIGHT_STICK_Y = 135;

const RIGHT_SHOULDER_X = 259;
const RIGHT_SHOULDER_Y = 22;

const LEFT_SHOULDER_X = 59;
const LEFT_SHOULDER_Y = 22;

const LEFT_TRIGGER_X = 106;
const LEFT_TRIGGER_Y = 12;

const RIGHT_TRIGGER_X = 211;
const RIGHT_TRIGGER_Y = 12;

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawButton(idx, x, y, size, btn) {
  ctx.strokeStyle = btn.pressed ? 'red' : 'white';
  ctx.fillStyle = btn.pressed ? 'red' : 'white';
  ctx.textAlign = 'center';
  ctx.lineWidth = size / 10;
  ctx.strokeRect(x, y, size, size);
  ctx.font = `${size / 2}px Arial`;
  ctx.fillText(String(idx), x + size / 2, y + size / 2);
  ctx.font = `${size / 3}px Arial`;
  ctx.fillStyle = 'white';
  ctx.fillText(Number(btn.value).toFixed(2), x + size / 2, y + size / 1.2);
}

function drawSimpleButton(idx, x, y, size, btn) {
  ctx.strokeStyle = btn.pressed ? 'red' : 'white';
  ctx.fillStyle = btn ? 'red' : 'white';
  ctx.textAlign = 'center';
  ctx.lineWidth = size / 10;
  ctx.strokeRect(x, y, size, size);
  ctx.font = `${size / 1.5}px Arial`;
  ctx.fillText(String(idx), x + size / 2, y + size / 1.4);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
  return y;
}

let gamepadImg;
let gamepadWidth;
let gamepadHeight;
let buttonSize;

// gamepad pixel size scale
let gps;
let btnRadius;
let axisRadius;
let closing = false;
function draw() {
  const [p1] = getInput();
  ctx.fillStyle = 'blue';
  if (p1?.START?.pressed && p1?.SELECT?.pressed) {
    closing = true;
    setTimeout(() => {
      window.close();
    }, 2000);
  }
  if (closing) {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = `${buttonSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('START + SELECT pressed to close...', width / 2, height / 2);
    return;
  }
  ctx.fillRect(0, 0, width, height);
  
  ctx.drawImage(gamepadImg, 0, 0, gamepadWidth, gamepadHeight);
  if (p1.gp) {
    ctx.fillStyle = 'yellow';
    ctx.font = `${buttonSize / 2}px Arial`;
    ctx.textAlign = 'left';
    let guidText = '';
    // console.log('p1', p1.gp.guid);
    if (p1.gp.guid) {
      let guid = p1.gp.guid || '';
      if (guid.length === 32) {
        guid = guid.slice(0, 8) + ' ' + guid.slice(8, 16) + ' ' + guid.slice(16, 24) + ' ' + guid.slice(24, 32);
      }
      guidText = ' \nguid: ' + guid;
    }
    if (p1.gp._jsMap?.dbMatch) {
      guidText += ' - dbMatch: ' + p1.gp._jsMap.dbMatch.name;
      const dbGuid = p1.gp._jsMap.dbMatch.guid;
      if (dbGuid.length === 32) {
        guidText += ' ' + dbGuid.slice(0, 8) + ' ' + dbGuid.slice(8, 16) + ' ' + dbGuid.slice(16, 24) + ' ' + dbGuid.slice(24, 32);
      }
      if (p1.gp._jsMap.dbMatch.fromDB) {
        guidText += ' fromDB: ' + p1.gp._jsMap.dbMatch.fromDB;
      } else if (p1.gp._jsMap.dbMatch.fromAdditional) {
        guidText += ' fromDB: additional';
      }
    }
    wrapText(ctx, p1.name + guidText, gamepadWidth, buttonSize, width / 2, buttonSize);
    if (p1.BUTTON_SOUTH.pressed) {
      drawCircle(BUTTON_SOUTH_X * gps, BUTTON_SOUTH_Y * gps, btnRadius, 'red');
    }
    if (p1.BUTTON_EAST.pressed) {
      drawCircle(BUTTON_EAST_X * gps, BUTTON_EAST_Y * gps, btnRadius, 'red');
    }
    if (p1.BUTTON_WEST.pressed) {
      drawCircle(BUTTON_WEST_X * gps, BUTTON_WEST_Y * gps, btnRadius, 'red');
    }
    if (p1.BUTTON_NORTH.pressed) {
      drawCircle(BUTTON_NORTH_X * gps, BUTTON_NORTH_Y * gps, btnRadius, 'red');
    }
    if (p1.START.pressed) {
      drawCircle(START_X * gps, START_Y * gps, btnRadius, 'red');
    }
    if (p1.SELECT.pressed) {
      drawCircle(SELECT_X * gps, SELECT_Y * gps, btnRadius, 'red');
    }
    if (p1.DPAD_UP.pressed) {
      drawCircle(DPAD_UP_X * gps, DPAD_UP_Y * gps, btnRadius, 'red');
    }
    if (p1.DPAD_DOWN.pressed) {
      drawCircle(DPAD_DOWN_X * gps, DPAD_DOWN_Y * gps, btnRadius, 'red');
    }
    if (p1.DPAD_LEFT.pressed) {
      drawCircle(DPAD_LEFT_X * gps, DPAD_LEFT_Y * gps, btnRadius, 'red');
    }
    if (p1.DPAD_RIGHT.pressed) {
      drawCircle(DPAD_RIGHT_X * gps, DPAD_RIGHT_Y * gps, btnRadius, 'red');
    }
    if (p1.GUIDE.pressed) {
      drawCircle(GUIDE_X * gps, GUIDE_Y * gps, btnRadius, 'red');
    }
    drawCircle(
      (LEFT_STICK_X * gps) + (p1.LEFT_STICK_X * gps * axisRadius * 1.2),
      (LEFT_STICK_Y * gps) + (p1.LEFT_STICK_Y * gps * axisRadius * 1.2),
      axisRadius,
      p1.LEFT_STICK.pressed ? 'red' : 'black'
    );
    drawCircle(
      (RIGHT_STICK_X * gps) + (p1.RIGHT_STICK_X * gps * axisRadius * 1.2),
      (RIGHT_STICK_Y * gps) + (p1.RIGHT_STICK_Y * gps * axisRadius * 1.2),
      axisRadius,
      p1.RIGHT_STICK.pressed ? 'red' : 'black'
    );
    if (p1.RIGHT_SHOULDER.pressed) {
      drawCircle(RIGHT_SHOULDER_X * gps, RIGHT_SHOULDER_Y * gps, btnRadius, 'red');
    }
    if (p1.LEFT_SHOULDER.pressed) {
      drawCircle(LEFT_SHOULDER_X * gps, LEFT_SHOULDER_Y * gps, btnRadius, 'red');
    }
    if (p1.RIGHT_TRIGGER.pressed) {
      drawCircle(RIGHT_TRIGGER_X * gps, RIGHT_TRIGGER_Y * gps, btnRadius, 'red');
    }
    if (p1.LEFT_TRIGGER.pressed) {
      drawCircle(LEFT_TRIGGER_X * gps, LEFT_TRIGGER_Y * gps, btnRadius, 'red');
    }
    if (p1.gp) {
      p1.gp.buttons.forEach((b, idx) => {
        // add space between buttons
        drawButton(idx, (idx * buttonSize * 1.2) + (gps * 10), gamepadHeight, buttonSize, b);
      });
      ctx.fillStyle = 'white';
      ctx.font = `${buttonSize / 2}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText('Axes:', (gps * 20), gamepadHeight + (buttonSize * 1.6));
      ctx.font = `${buttonSize / 2}px Arial`;
      p1.gp.axes.forEach((a, idx) => {
        ctx.fillText(Number(a).toFixed(5), (idx * buttonSize * 2.5) + (gps * 90), gamepadHeight + (buttonSize * 1.6));
      });
    }
    if (_jsg) {
      ctx.fillStyle = 'white';
      ctx.font = `${buttonSize * 0.7}px Arial`;
      ctx.textAlign = 'left';
      const hasController = _jsg.controllers.length > 0;
      const hasJoystick = _jsg.joysticks.length > 0;
      ctx.fillText('SDL ' + `${hasController ? 'Controller' : ''} ${hasJoystick ? 'Joystick' : ''} :`
        , (gps * 20), gamepadHeight + (buttonSize * 2.8));
      ctx.font = `${buttonSize / 2}px Arial`;
      if (_jsg.controllers.length > 0) {
        const c = _jsg.controllers[0];
        let buttonY = 0;
        if (c.state.buttons) {
          const btnText = Object.keys(c.state.buttons).map((k) => {
            return `${k}:${c.state.buttons[k] ? '1' : '0'}`;
          }).sort().join(' ');
          buttonY = wrapText(ctx, btnText, (gps * 20), gamepadHeight + (buttonSize * 3.5), width * 0.8, buttonSize);
        }
        if (c.state.axes) {
          const axesText = Object.keys(c.state.axes).map((k) => {
            return `${k}:${Number(c.state.axes[k]).toFixed(6)}`;
          }).sort().join('  ');
          wrapText(ctx, axesText, (gps * 20), buttonY + buttonSize, width * 0.8, buttonSize);
        }
      } else if (_jsg.joysticks.length > 0) {
        const j = _jsg.joysticks[0];
        // console.log('has joysticks', j.state);
        j.state.buttons.forEach((b, idx) => {
          // add space between buttons
          drawSimpleButton(idx, (idx * buttonSize * 1.2) + (gps * 8), gamepadHeight + (buttonSize * 4), buttonSize, b);
        });
        ctx.fillStyle = 'white';
        ctx.font = `${buttonSize / 2}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('Axes:', (gps * 20), gamepadHeight + (buttonSize * 6));
        j.state.axes.forEach((a, idx) => {
          ctx.fillText(Number(a).toFixed(5), (idx * buttonSize * 2.5) + (gps * 90), gamepadHeight + (buttonSize * 6));
        });
        ctx.font = `${buttonSize / 2}px Arial`;
        ctx.fillText('Hats:', (gps * 20), gamepadHeight + (buttonSize * 7));
        wrapText(ctx, JSON.stringify(j.state.hats), (gps * 20), gamepadHeight + (buttonSize * 8), width * 0.8, buttonSize);
      }
    }
  }
}

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

async function launch() {
  // wait for assets to load
  gamepadImg = await loadImage('images/short_gamepad.png');
  gamepadWidth = width / 2;
  gamepadHeight = gamepadImg.height * gamepadWidth / gamepadImg.width;
  gps = gamepadWidth / gamepadImg.width;
  btnRadius = BUTTON_RADIUS * gps;
  axisRadius = AXIS_RADIUS * gps;
  buttonSize = width / 23;
  gameLoop();
}

launch();
