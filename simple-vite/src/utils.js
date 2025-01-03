const window = globalThis;

let audioContext;

export async function loadSound(url) {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  const soundBuffer = await fetch(url).then(res => res.arrayBuffer());

  const audioBuffer = await audioContext.decodeAudioData(soundBuffer);
  return audioBuffer;
}

export function playSound(audioBuffer) {
  if (!audioBuffer) {
    return;
  }
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = audioBuffer;
  
  bufferSource.connect(audioContext.destination);
  bufferSource.start();
  bufferSource.onended = () => {
    bufferSource.disconnect();
  };
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

function getDefaultBtn() {
  return {
    pressed: false,
    value: 0,
  };
}

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
  const gamepads = navigator.getGamepads();
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
        BUTTON_SOUTH: gp.buttons[0],
        BUTTON_EAST: gp.buttons[1],
        BUTTON_WEST: gp.buttons[2],
        BUTTON_NORTH: gp.buttons[3],
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
    DPAD_UP: keys['ArrowUp'] || getDefaultBtn(),
    DPAD_DOWN: keys['ArrowDown'] || getDefaultBtn(),
    DPAD_LEFT: keys['ArrowLeft'] || getDefaultBtn(),
    DPAD_RIGHT: keys['ArrowRight'] || getDefaultBtn(),
    BUTTON_SOUTH: keys['z'] || getDefaultBtn(),
    BUTTON_EAST: keys['x'] || getDefaultBtn(),
    BUTTON_WEST: keys['a'] || getDefaultBtn(), 
    BUTTON_NORTH: keys['s'] || getDefaultBtn(),
    LEFT_SHOULDER: keys['q'] || getDefaultBtn(),
    RIGHT_SHOULDER: keys['r'] || getDefaultBtn(),
    LEFT_TRIGGER: keys['e'] || getDefaultBtn(),
    RIGHT_TRIGGER: keys['r'] || getDefaultBtn(),
    SELECT: keys['Shift'] || getDefaultBtn(),
    START: keys['Enter'] || getDefaultBtn(),
    GUIDE: keys['Escape'] || getDefaultBtn(),
    LEFT_STICK: keys['c'] || getDefaultBtn(),
    RIGHT_STICK: keys['v'] || getDefaultBtn(),
    LEFT_STICK_X: 0,
    LEFT_STICK_Y: 0,
    RIGHT_STICK_X: 0,
    RIGHT_STICK_Y: 0,
  })
  return players;
}