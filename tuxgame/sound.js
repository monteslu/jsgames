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

  // Start the oscillator
  oscillator.start();

  // Stop the oscillator after the duration
  oscillator.stop(audioContext.currentTime + duration);
}
