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

  // Bulletproof 60 FPS Game Loop with exception safety and lag protection
  let lastTime = performance.now();
  const tickInterval = 1000 / 60;
  let accumulator = 0;

  function loop(currentTime) {
    requestAnimationFrame(loop); // Schedule next frame immediately

    try {
      // Clamp delta to 100ms max to prevent freeze/spiral of death when tab is backgrounded
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;
      accumulator += delta;

      // Run fixed-step updates (max 3 ticks per frame to guarantee 60fps responsiveness)
      let steps = 0;
      while (accumulator >= tickInterval && steps < 3) {
        game.update();
        accumulator -= tickInterval;
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
