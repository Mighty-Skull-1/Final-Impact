// Final Impact - Arcade Announcer Voice & Sound Synthesizer
// Provides punchy digitized vocal announcements for Mortal Kombat style events,
// round intros, fatalities, and Elden Ring victory/defeat banners.

import { soundFX } from './SoundFX.js';

export class Announcer {
  constructor() {
    this.speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.speechAvailable) return;
    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for a deep English voice
      this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English') || v.name.includes('Natural'))) ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0] || null;
    };
    findVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  speak(text, { pitch = 0.55, rate = 0.95, volume = 1.0 } = {}) {
    if (!this.speechAvailable) return;
    try {
      window.speechSynthesis.cancel(); // Stop overlapping speech
      const utt = new SpeechSynthesisUtterance(text);
      if (this.voice) utt.voice = this.voice;
      utt.pitch = pitch; // Deep authoritative tone
      utt.rate = rate;   // Punchy arcade cadence

      const master = (soundFX && typeof soundFX.getMasterVolume === 'function') ? soundFX.getMasterVolume() : 0.8;
      const sfx = (soundFX && typeof soundFX.getSFXVolume === 'function') ? soundFX.getSFXVolume() : 0.9;
      const effectiveVol = Math.max(0, Math.min(1, volume * master * sfx));
      if (effectiveVol <= 0.001) return; // Silent if volume muted

      utt.volume = effectiveVol;
      window.speechSynthesis.speak(utt);
    } catch (e) {}
  }

  // --- MORTAL KOMBAT STYLE CALLS ---
  round1() {
    this.speak('Round 1... Fight!', { pitch: 0.5, rate: 0.9 });
    try { soundFX.playAnnouncer('FIGHT'); } catch (e) {}
  }

  round2() {
    this.speak('Round 2... Fight!', { pitch: 0.5, rate: 0.9 });
    try { soundFX.playAnnouncer('FIGHT'); } catch (e) {}
  }

  finalRound() {
    this.speak('Final Round... Fight!', { pitch: 0.45, rate: 0.85 });
    try { soundFX.playAnnouncer('FIGHT'); } catch (e) {}
  }

  finishHim() {
    this.speak('Finish Him!', { pitch: 0.42, rate: 0.85 });
    try { soundFX.playAnnouncer('FINISH_HIM'); } catch (e) {}
  }

  fatality() {
    this.speak('Fatality!', { pitch: 0.38, rate: 0.8 });
  }

  stageFatality() {
    this.speak('Stage Fatality!', { pitch: 0.38, rate: 0.8 });
  }

  brutality() {
    this.speak('Brutality!', { pitch: 0.38, rate: 0.85 });
  }

  flawlessVictory() {
    this.speak('Flawless Victory!', { pitch: 0.45, rate: 0.85 });
  }

  testYourMight() {
    this.speak('Test Your Might!', { pitch: 0.48, rate: 0.85 });
  }

  // --- ELDEN RING ATMOSPHERIC CALLS ---
  youDied() {
    this.speak('You Died', { pitch: 0.3, rate: 0.65 });
  }

  greatEnemyFelled() {
    this.speak('Great Enemy Felled', { pitch: 0.42, rate: 0.8 });
  }

  legendFelled() {
    this.speak('Legend Felled', { pitch: 0.38, rate: 0.75 });
  }

  godSlain() {
    this.speak('God Slain', { pitch: 0.35, rate: 0.7 });
  }
}

export const announcer = new Announcer();
