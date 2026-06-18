// Create an audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a tone
export default function playTone(frequency = 440, duration = 1) {
  // Create an oscillator node
  const oscillator = audioContext.createOscillator();

  // Set the type of waveform (sine, square, sawtooth, triangle)
  oscillator.type = 'sine';

  // Set the frequency of the tone
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  // Create a gain node for volume control
  const gainNode = audioContext.createGain();

  // Connect the oscillator to the gain node, and the gain node to the destination
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Declick: ramp the gain up at the start and down before the stop. A bare
  // oscillator start/stop hard-switches the signal at a non-zero amplitude, which
  // is an audible click — this is standard Web Audio behavior (the browser does
  // NOT auto-fade), so the game does it with a short (~10ms) gain envelope.
  const now = audioContext.currentTime;
  const fade = 0.01;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + fade);
  gainNode.gain.setValueAtTime(1, now + duration - fade);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  // Start the oscillator
  oscillator.start(now);

  // Stop the oscillator after the duration (just after the fade-out completes)
  oscillator.stop(now + duration);
}
