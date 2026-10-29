// Final Impact - Arcade Announcer
// Deep, slow, dramatic speech-synthesis voice (best deep English voice available)
// layered over synthetic reverb "stingers" from SoundFX. Fails silently wherever
// speechSynthesis is missing (Node tests / some Electron builds) — the stingers still play.

import { soundFX } from './SoundFX.js';
import { pickDeepVoice, speakLine, recentlySpoken } from './AnnouncerVoice.js';

export class Announcer {
  constructor() {
    this.speechAvailable = typeof window !== 'undefined' && !!window && 'speechSynthesis' in window;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.speechAvailable) return;
    const findVoice = () => {
      try {
        this.voice = pickDeepVoice(window.speechSynthesis.getVoices());
      } catch (e) {}
    };
    findVoice();
    try {
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', findVoice);
      } else {
        window.speechSynthesis.onvoiceschanged = findVoice;
      }
    } catch (e) {}
  }

  speak(text, { pitch = 0.45, rate = 0.82, volume = 1.0 } = {}) {
    if (!this.speechAvailable) return;
    try {
      // The same line was just triggered via soundFX.playAnnouncer() — don't restart it
      if (recentlySpoken(text, 400)) return;
      const master = (soundFX && typeof soundFX.getMasterVolume === 'function') ? soundFX.getMasterVolume() : 0.8;
      const sfx = (soundFX && typeof soundFX.getSFXVolume === 'function') ? soundFX.getSFXVolume() : 0.9;
      const effectiveVol = Math.max(0, Math.min(1, volume * master * sfx));
      if (effectiveVol <= 0.001) return; // Silent if volume muted
      if (!this.voice) {
        try { this.voice = pickDeepVoice(window.speechSynthesis.getVoices()); } catch (e) {}
      }
      speakLine(text, { pitch, rate, volume: effectiveVol, voice: this.voice || null });
    } catch (e) {}
  }

  stinger(kind, delay = 0) {
    try {
      if (soundFX && typeof soundFX.playAnnouncerStinger === 'function') soundFX.playAnnouncerStinger(kind, delay);
    } catch (e) {}
  }

  // --- MORTAL KOMBAT STYLE CALLS ---
  round1() {
    this.speak('Round one... Fight!', { pitch: 0.45, rate: 0.8 });
    this.stinger('ROUND');
    this.stinger('FIGHT', 1.35);
  }

  round2() {
    this.speak('Round two... Fight!', { pitch: 0.45, rate: 0.8 });
    this.stinger('ROUND');
    this.stinger('FIGHT', 1.35);
  }

  finalRound() {
    this.speak('Final round... Fight!', { pitch: 0.4, rate: 0.78 });
    this.stinger('FINAL');
    this.stinger('FIGHT', 1.5);
  }

  finishHim() {
    this.speak('Finish him!', { pitch: 0.38, rate: 0.8 });
    this.stinger('FINISH');
  }

  fatality() {
    this.speak('Fatality!', { pitch: 0.34, rate: 0.75 });
    this.stinger('FATALITY');
  }

  stageFatality() {
    this.speak('Stage Fatality!', { pitch: 0.34, rate: 0.75 });
    this.stinger('FATALITY');
  }

  brutality() {
    this.speak('Brutality!', { pitch: 0.36, rate: 0.8 });
    this.stinger('FATALITY');
  }

  flawlessVictory() {
    this.speak('Flawless Victory!', { pitch: 0.42, rate: 0.8 });
    this.stinger('WIN');
  }

  testYourMight() {
    this.speak('Test Your Might!', { pitch: 0.44, rate: 0.8 });
    this.stinger('ROUND');
  }

  // --- ELDEN RING ATMOSPHERIC CALLS ---
  youDied() {
    this.speak('You Died', { pitch: 0.28, rate: 0.62 });
    this.stinger('DIED');
  }

  greatEnemyFelled() {
    this.speak('Great Enemy Felled', { pitch: 0.4, rate: 0.75 });
    this.stinger('FELLED');
  }

  legendFelled() {
    this.speak('Legend Felled', { pitch: 0.36, rate: 0.72 });
    this.stinger('FELLED');
  }

  godSlain() {
    this.speak('God Slain', { pitch: 0.32, rate: 0.66 });
    this.stinger('GOD');
  }
}

export const announcer = new Announcer();
