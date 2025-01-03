import express from 'express';
import path from 'path';
import os from 'os';
import http from 'http';
import RED from 'node-red';
import EventEmitter from 'events';
import getInput from './input.js';

globalThis.jsGameEmitter = new EventEmitter();
globalThis.jsCanvasCommandQueue = [];

const canvas = document.getElementById('game-canvas');
canvas.width = 320;
canvas.height = 240;
globalThis.canvas = canvas;

const PORT = 1880 || process.env.PORT;

// Create an Express app
const app = express();

let userDir = path.join(os.homedir(), '.node-red');
if (globalThis.localStorage.__storageFile) {
  userDir = path.join(path.dirname(globalThis.localStorage.__storageFile), 'nodered');
}

// Add a simple route for static content served from 'public'
app.use("/",express.static("public"));

// Create a server
const server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
const settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir,
    functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

server.listen(PORT);

// Start the runtime
RED.start();


function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {
    for (const details of interfaces[key]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
}

const myIP = getLocalIP();

const myURL = `http://${myIP}:${PORT}/red`;
const myHost = `http://${os.hostname}:${PORT}/red`;

console.log('Your LAN IP:', myIP); 

const ctx = canvas.getContext('2d');
const fontSize = canvas.width / 25;
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.font = `${fontSize}px Arial`;
ctx.fillStyle = 'white';
ctx.fillText(myURL, fontSize, fontSize * 1.5);
ctx.fillText(myHost, fontSize, fontSize * 3);

function update(elapsedTime) {
  const data = {
    gamepads: navigator.getGamepads(),
    input: getInput(),
    height: canvas.height,
    width: canvas.width,
    canvas,
    ctx,
    elapsedTime,
  }
  // console.log('update', data.input[0]);
  globalThis.jsGameEmitter.emit('update', data);
}

globalThis.jsGameEmitter.on('msg', (msg) => {
  if (msg && msg.payload) {
    console.log('JSGAME output msg', msg);
    if (Array.isArray(msg.payload)) {
      for (const command of msg.payload) {
        if (command.type) {
          globalThis.jsCanvasCommandQueue.push(command);
        }
      }
    } else {
      if (msg.payload.type) {
        globalThis.jsCanvasCommandQueue.push(msg.payload);
      }
    }
  }
});

// if any commands are received, emit them to the game
function draw() {
  // console.log('draw');
  let pathStarted = false;
  let pathEnded = false;
  while (globalThis.jsCanvasCommandQueue.length) {
    const command = globalThis.jsCanvasCommandQueue.shift();
    const { type } = command;
    
    if (type === 'beginPath') {
      ctx.beginPath();
      pathStarted = true;
    } else if (type === 'clearRect') {
      const { x, y, width, height } = command;
      ctx.clearRect(x || 0, y || 0, width || canvas.width, height || canvas.height);
    } else if (type === 'fillStyle') {
      const { fillStyle } = command;
      ctx.fillStyle = fillStyle;
    } else if (type === 'strokeStyle') {
      const { strokeStyle } = command;
      ctx.strokeStyle = strokeStyle;
    } else if (type === 'lineWidth') {
      const { lineWidth } = command;
      ctx.lineWidth = lineWidth;
    } else if (type === 'closePath') {
      ctx.closePath();
      pathEnded = true;
    } else if (type === 'arc') {
      const { x, y, radius, startAngle, endAngle, anticlockwise, fillStyle, strokeStyle } = command;
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
      }
      if (!pathStarted) {
        ctx.beginPath();
        pathStarted = true;
      }
      ctx.arc(x || 0, y || 0, radius, startAngle, endAngle, anticlockwise || false);
    } else if (type === 'fill') {
      ctx.fill();
      pathEnded = true;
    } else if (type === 'font') {
      const { font } = command;
      ctx.font = font;
    } else if (type === 'strokeText') {
      const { text, x, y, maxWidth, font, strokeStyle } = command;
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
      }
      if (font) {
        ctx.font = font;
      }
      ctx.strokeText(text, x, y, maxWidth);
    } else if (type === 'fillText') {
      const { text, x, y, maxWidth, font } = command;
      if (font) {
        ctx.font = font;
      }
      ctx.fillText(text, x || 0, y || 0, maxWidth);
    } else if (type === 'fillRect') {
      const { x, y, width, height, fillStyle } = command;
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
      }
      if (height && width) {
        ctx.fillRect(x || 0, y || 0, width, height);
      }
    } else if (type === 'strokeRect') {
      const { x, y, width, height, strokeStyle, lineWidth } = command;
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
      }
      if (lineWidth) {
        ctx.lineWidth = lineWidth;
      }
      if (height && width) {
        ctx.strokeRect(x, y, width, height);
      }
    } else if (type === 'moveTo') {
      const { x, y } = command;
      if (!pathStarted) {
        ctx.beginPath();
        pathStarted = true;
      }
      ctx.moveTo(x || 0, y || 0);
    } else if (type === 'lineTo') {
      const { x, y, lineWidth } = command;
      if (lineWidth) {
        ctx.lineWidth = lineWidth;
      }
      if (!pathStarted) {
        ctx.beginPath();
        pathStarted = true;
      }
      ctx.lineTo(x || 0, y || 0);
    } else if (type === 'stroke' && pathStarted) {
      const { strokeStyle, lineWidth } = command;
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
      }
      if (lineWidth) {
        ctx.lineWidth = lineWidth;
      }
      ctx.stroke();
      pathEnded = true;
    } else if (type === 'fill' && pathStarted) {
      const { fillStyle } = command;
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
      }
      ctx.fill();
      pathEnded = true;
    } else if (type === 'clip') {
      ctx.clip();
    } else if (type == 'drawImage') {
      const {
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight,
      } = command;
      if (image) {
        if (sx !== undefined && sy !== undefined) {
          ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        } else if (dWidth !== undefined && dHeight !== undefined) {
          ctx.drawImage(image, dx, dy, dWidth, dHeight);
        } else {
          ctx.drawImage(image, dx || 0, dy || 0);
        }
      }
    }
  }
  if (pathStarted && !pathEnded) {
    ctx.stroke();
  }
}

const loop = (time) => {
  update(time);
  draw();
  requestAnimationFrame(loop);
}

loop();
