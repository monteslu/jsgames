export function rgColorGradient(value) {
  // Clamp the value between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Initialize RGB values
  let r, g, b;

  if (value <= 0.5) {
    // Interpolate from red (1,0,0) to yellow (1,1,0)
    r = 255;
    g = Math.floor(255 * (value * 2)); // Scale green from 0 to 255
    b = 0;
  } else {
    // Interpolate from yellow (1,1,0) to green (0,1,0)
    r = Math.floor(255 * (1 - (value - 0.5) * 2)); // Scale red down to 0
    g = 255;
    b = 0;
  }

  return [r, g, b];
}
