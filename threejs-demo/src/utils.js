/** 

Simple utils for loading assets
and getting input from a gamepad or keyboard

Copyright 2025 Luis Montes. Licensed under the MIT License.

**/

const window = globalThis;

let audioContext;
let audioEnabled = false;
try {
  audioContext = new AudioContext();
  if (audioContext.state === 'running') {
    audioEnabled = true;
  } else {
    audioContext.resume().then(() => {
      audioEnabled = true;
      console.log('audio context resumed', audioContext.state);
    });
  }
  console.log('audio context created', audioContext.state);
} catch (e) {
  console.info('audio context requires user interaction to enable');
}

export async function loadSound(url) {
  const dataBuffer = await fetch(url).then(res => res.arrayBuffer());
  dataBuffer._decoded = false;
  if (audioContext) {
    console.log('decoding audio data', url, audioContext.state);
    dataBuffer._audioBuffer = await audioContext.decodeAudioData(dataBuffer);
    dataBuffer._decoded = true;
  }
  return dataBuffer;
}

function enableAudio() {
  console.log('enabling audio');
  if (!audioEnabled) {
    audioEnabled = true;
    if (audioContext) {
      audioContext.resume();
    } else {
      audioContext = new AudioContext();
    }
  }
  removeAllGestureListeners();
}

function setupGestureListeners() {
  // Mouse events
  document.addEventListener('click', enableAudio, { once: true });
  document.addEventListener('mousedown', enableAudio, { once: true });

  // Touch events
  document.addEventListener('touchstart', enableAudio, { once: true });
  document.addEventListener('touchend', enableAudio, { once: true });

  // Keyboard events
  document.addEventListener('keydown', enableAudio, { once: true });

  // Scroll event
  document.addEventListener('scroll', enableAudio, { once: true });
}

function removeAllGestureListeners() {
  document.removeEventListener('click', enableAudio);
  document.removeEventListener('mousedown', enableAudio);
  document.removeEventListener('touchstart', enableAudio);
  document.removeEventListener('touchend', enableAudio);
  document.removeEventListener('keydown', enableAudio);
  document.removeEventListener('scroll', enableAudio);
}

// Set up listeners when page loads
setupGestureListeners();


export function playSound(dataBuffer, loop = false) {
  if (!dataBuffer || !audioEnabled) {
    return;
  }

  if (!dataBuffer._decoded) {
    if (!dataBuffer._decoding) {
      dataBuffer._decoding = true;
      audioContext.decodeAudioData(dataBuffer).then((audioBuffer) => {
        dataBuffer._audioBuffer = audioBuffer;
        dataBuffer._decoded = true;
        dataBuffer._decoding = false;
        playSound(dataBuffer, loop);
      });
    }
    return;
  }

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = dataBuffer._audioBuffer;
  
  bufferSource.connect(audioContext.destination);
  if (loop) {
    bufferSource.loop = true;
  }
  bufferSource.start();
  bufferSource.onended = () => {
    bufferSource.disconnect();
  };
  return bufferSource;
}

// loads image from a url as a promise
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export function createResourceLoader() {
  return {
    imgCount: 0,
    soundCount: 0,
    imgLoadedCount: 0,
    soundLoadedCount: 0,
    images: {},
    sounds: {},
    imagePromises: [],
    soundPromises: [],
    addImage(name, src) {
      this.imgCount++;
      const promise = loadImage(src).then((img) => {
        this.images[name] = img;
        this.imgLoadedCount++;
        return img;
      });
      this.imagePromises.push(promise);
      return promise;
    },
    addSound(name, src) {
      this.soundCount++;
      const promise = loadSound(src).then((sound) => {
        this.sounds[name] = sound;
        this.soundLoadedCount++;
        return sound;
      });
      this.soundPromises.push(promise);
      return promise;
    },
    getPercentComplete() {
      return (this.imgLoadedCount + this.soundLoadedCount) / (this.imgCount + this.soundCount);
    },
    isComplete() {
      return this.imgLoadedCount === this.imgCount && this.soundLoadedCount === this.soundCount;
    },
    load() {
      return Promise.all([...this.imagePromises, ...this.soundPromises]);
    },
    reset() {
      this.imgLoadedCount = 0;
      this.soundLoadedCount = 0;
      this.images = {};
      this.sounds = {};
      this.imagePromises = [];
      this.soundPromises = [];
    },
  };
}

export function drawLoadingScreen(ctx, percentComplete, backgroundColor = 'black', foregroundColor = 'white') {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const fontSize = height * 0.1;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = foregroundColor;
  ctx.font = `${fontSize}px monospace`;
  // draw loading text in center of screen
  ctx.fillText('Loading...', width / 2 - ctx.measureText('Loading...').width / 2, height / 2);
  const loadingBarWidth = width * 0.8;
  const loadingBarCompletedWidth = loadingBarWidth * percentComplete;
  const loadingBarHeight = height * 0.1;
  ctx.fillStyle = foregroundColor;
  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = height * 0.01;
  ctx.fillRect(width / 2 - loadingBarWidth / 2, height / 2 - loadingBarHeight / 2 + fontSize, loadingBarCompletedWidth, loadingBarHeight);
  ctx.strokeRect(width / 2 - loadingBarWidth / 2, height / 2 - loadingBarHeight / 2 + fontSize, loadingBarWidth, loadingBarHeight);
}

function getDefaultBtn() {
  return {
    pressed: false,
    value: 0,
  };
}

// allows games to override the default key mapping
export const KEYMAP = {
  'DPAD_UP': 'ArrowUp',
  'DPAD_DOWN': 'ArrowDown',
  'DPAD_LEFT': 'ArrowLeft',
  'DPAD_RIGHT': 'ArrowRight',
  'BUTTON_SOUTH': 'z',
  'BUTTON_EAST': 'x',
  'BUTTON_WEST': 'a',
  'BUTTON_NORTH': 's',
  'LEFT_SHOULDER': 'q',
  'RIGHT_SHOULDER': 'r',
  'LEFT_TRIGGER': 'w',
  'RIGHT_TRIGGER': 'e',
  'SELECT': 'Shift',
  'START': 'Enter',
  'GUIDE': 'Escape',
  'LEFT_STICK': 'c',
  'RIGHT_STICK': 'v',
};

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = keys[e.key] || getDefaultBtn();
  keys[e.key].pressed = true;
  keys[e.key].value = 1;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = keys[e.key] || getDefaultBtn();
  keys[e.key].pressed = false;
  keys[e.key].value = 0;
});

// normalizes input from a gamepad or keyboard
// if there's a gamepad, player 1 is the gamead and player 2 is the keyboard
// if there's no gamepad, player 1 is the keyboard
export function getInput() {
  let gamepads = navigator.getGamepads();
  gamepads = gamepads.filter((gp) => gp && (gp.mapping === 'standard' || gp.mapping === 'xbox'));
  const players = [];
  gamepads.forEach((gp) => {
    if (gp) {
      const player = {
        type: 'gp',
        name: gp.id,
        DPAD_UP: gp.buttons[12],
        DPAD_DOWN: gp.buttons[13],
        DPAD_LEFT: gp.buttons[14],
        DPAD_RIGHT: gp.buttons[15],
        BUTTON_SOUTH: gp.buttons[0], // A on xbox, B on nintendo
        BUTTON_EAST: gp.buttons[1], // B on xbox, A on nintendo
        BUTTON_WEST: gp.buttons[2], // X on xbox, Y on nintendo
        BUTTON_NORTH: gp.buttons[3], // Y on xbox, X on nintendo
        LEFT_SHOULDER: gp.buttons[4] || getDefaultBtn(),
        RIGHT_SHOULDER: gp.buttons[5] || getDefaultBtn(),
        LEFT_TRIGGER: gp.buttons[6] || getDefaultBtn(),
        RIGHT_TRIGGER: gp.buttons[7] || getDefaultBtn(),
        SELECT: gp.buttons[8] || getDefaultBtn(),
        START: gp.buttons[9] || getDefaultBtn(),
        GUIDE: gp.buttons[16] || getDefaultBtn(),
        LEFT_STICK: gp.buttons[10] || getDefaultBtn(),
        RIGHT_STICK: gp.buttons[11] || getDefaultBtn(),
        LEFT_STICK_X: gp.axes[0] || 0,
        LEFT_STICK_Y: gp.axes[1] || 0,
        RIGHT_STICK_X: gp.axes[2] || 0,
        RIGHT_STICK_Y: gp.axes[3] || 0,
      };
      players.push(player);
    }
  });
  players.push({
    type: 'keyboard',
    name: 'keyboard',
    DPAD_UP: keys[KEYMAP.DPAD_UP] || getDefaultBtn(),
    DPAD_DOWN: keys[KEYMAP.DPAD_DOWN] || getDefaultBtn(),
    DPAD_LEFT: keys[KEYMAP.DPAD_LEFT] || getDefaultBtn(),
    DPAD_RIGHT: keys[KEYMAP.DPAD_RIGHT] || getDefaultBtn(),
    BUTTON_SOUTH: keys[KEYMAP.BUTTON_SOUTH] || getDefaultBtn(),
    BUTTON_EAST: keys[KEYMAP.BUTTON_EAST] || getDefaultBtn(),
    BUTTON_WEST: keys[KEYMAP.BUTTON_WEST] || getDefaultBtn(),
    BUTTON_NORTH: keys[KEYMAP.BUTTON_NORTH] || getDefaultBtn(),
    LEFT_SHOULDER: keys[KEYMAP.LEFT_SHOULDER] || getDefaultBtn(),
    RIGHT_SHOULDER: keys[KEYMAP.RIGHT_SHOULDER] || getDefaultBtn(),
    LEFT_TRIGGER: keys[KEYMAP.LEFT_TRIGGER] || getDefaultBtn(),
    RIGHT_TRIGGER: keys[KEYMAP.RIGHT_TRIGGER] || getDefaultBtn(),
    SELECT: keys[KEYMAP.SELECT] || getDefaultBtn(),
    START: keys[KEYMAP.START] || getDefaultBtn(),
    GUIDE: keys[KEYMAP.GUIDE] || getDefaultBtn(),
    LEFT_STICK: keys[KEYMAP.LEFT_STICK] || getDefaultBtn(),
    RIGHT_STICK: keys[KEYMAP.RIGHT_STICK] || getDefaultBtn(),
    LEFT_STICK_X: 0,
    LEFT_STICK_Y: 0,
    RIGHT_STICK_X: 0,
    RIGHT_STICK_Y: 0,
  });
  return players;
}
