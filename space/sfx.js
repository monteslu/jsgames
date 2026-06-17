
let audioContext;

export async function loadSound(file) {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  const url = `./sounds/${file}.mp3`;
  const soundBuffer = await fetch(url).then(res => res.arrayBuffer());
  const audioBuffer = await audioContext.decodeAudioData(soundBuffer);
  return audioBuffer;
}

const SFX_VOLUME = 0.3;

export function playSound(audioBuffer) {
  if (!audioBuffer) return;
  if (!audioContext) audioContext = new AudioContext();
  const bufferSource = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  gain.gain.value = SFX_VOLUME;
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(gain);
  gain.connect(audioContext.destination);
  bufferSource.start();
  bufferSource.onended = () => { bufferSource.disconnect(); gain.disconnect(); };
}

// --- Music system ---

const FADE_DURATION = 1.5; // seconds

let levelTracks = [];
let bossTracks = [];
let currentSource = null;
let currentGain = null;
let musicLoaded = false;

export async function loadMusic() {
  if (!audioContext) audioContext = new AudioContext();

  const levelFiles = ['level_a', 'level_b', 'level_c', 'level_d'];
  const bossFiles = ['boss_a', 'boss_b', 'boss_c', 'boss_d'];

  try {
    const [levels, bosses] = await Promise.all([
      Promise.all(levelFiles.map(f =>
        fetch(`./music/${f}.ogg`).then(r => r.arrayBuffer()).then(b => audioContext.decodeAudioData(b))
      )),
      Promise.all(bossFiles.map(f =>
        fetch(`./music/${f}.ogg`).then(r => r.arrayBuffer()).then(b => audioContext.decodeAudioData(b))
      )),
    ]);
    levelTracks = levels;
    bossTracks = bosses;
    musicLoaded = true;
    console.log(`Music loaded: ${levelTracks.length} level, ${bossTracks.length} boss`);
  } catch (e) {
    console.error('Music load error:', e);
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stopCurrent(fadeSec) {
  if (!currentSource || !currentGain) return;
  const g = currentGain;
  const s = currentSource;
  // Fade out
  g.gain.setValueAtTime(g.gain.value, audioContext.currentTime);
  g.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeSec);
  setTimeout(() => {
    try { s.stop(); } catch {}
    try { s.disconnect(); } catch {}
    try { g.disconnect(); } catch {}
  }, fadeSec * 1000 + 100);
  currentSource = null;
  currentGain = null;
}

function playTrack(buffer, loop, volume = 0.8, fadeIn = FADE_DURATION) {
  if (!audioContext || !buffer) return;
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.loop = loop;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + fadeIn);
  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
  currentSource = source;
  currentGain = gain;
}

export function startLevelMusic() {
  if (!musicLoaded || levelTracks.length === 0) return;
  stopCurrent(FADE_DURATION);
  setTimeout(() => playTrack(pickRandom(levelTracks), true, 0.8, FADE_DURATION), FADE_DURATION * 1000);
}

const BOSS_FADE_IN = 0.5;

export function startBossMusic() {
  if (!musicLoaded || bossTracks.length === 0) return;
  stopCurrent(BOSS_FADE_IN);
  setTimeout(() => playTrack(pickRandom(bossTracks), true, 1.0, BOSS_FADE_IN), BOSS_FADE_IN * 1000);
}
