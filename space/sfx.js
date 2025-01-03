
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