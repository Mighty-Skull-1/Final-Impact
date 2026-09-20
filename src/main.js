// Final Impact - Main Application Entry Point
import { Game } from './engine/Game.js';
import { soundFX } from './audio/SoundFX.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // Resume Web Audio Context on first interaction
  const unlockAudio = () => {
    soundFX.ensureContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Bulletproof 60 FPS Game Loop with VSync cadence tolerance and stutter protection
  let lastTime = performance.now();
  const targetFPS = 60;
  const tickInterval = 1000 / targetFPS; // 16.666ms
  let accumulator = 0;

  function loop(currentTime) {
    requestAnimationFrame(loop); // Schedule next frame immediately

    try {
      let delta = currentTime - lastTime;
      lastTime = currentTime;

      // Clamp delta to prevent spiral of death when tab is unfocused (100ms max)
      if (delta > 100) delta = 100;
      if (delta < 0) delta = 0;

      accumulator += delta;

      // Allow 1.8ms slack to match display VSync (prevents 59.9Hz / 60Hz stutter & judder)
      let steps = 0;
      while (accumulator >= tickInterval - 1.8 && steps < 3) {
        game.update();
        accumulator = Math.max(0, accumulator - tickInterval);
        steps++;
      }
      if (steps >= 3) {
        accumulator = 0; // Discard excess lag debt
      }

      game.render();
    } catch (err) {
      console.error('Handled game loop error:', err);
    }
  }

  requestAnimationFrame(loop);
});
