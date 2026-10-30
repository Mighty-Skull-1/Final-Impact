// Final Impact - Procedural Sound Design & Mix Engine
// 100% runtime-synthesised audio (Web Audio API, no sample files).
//
// Signal flow
//   sound voices ──> sfxGain ──┐
//        └─ send ─> sfxVerbIn ─┤──> convolver (procedural IR) ─> hp ─> reverbReturn ─┐
//   music voices ─> session ─> musicDuck ─> musicGain ──────────────────────────────┤
//        └─ send ─> musicVerbIn / musicEchoIn (tempo delay) ─────────────────────────┤
//                                                                    masterGain <───┘
//   masterGain ─> glue compressor ─> brickwall limiter ─> soft clipper ─> destination
//
// Every public play*() method is a no-op until init()/ensureContext() has created
// an AudioContext, and is wrapped so a missing Web Audio feature never throws.
//
// Dropping in real samples later
//   soundFX.registerSample('hitHeavy', audioBuffer | [buffers], { gain, send, vary })
//   await soundFX.loadSample('hitHeavy', 'assets/sfx/hit_heavy.wav' | [urls])
// When a sample is registered for a sound id (see SOUND_IDS) it is played instead of
// the synthesised design (random pick between buffers + slight pitch variation).

import {
  SoundVoice, clamp, rand, vary,
  setP, linP, cancelP, makeNoiseBuffer, makeImpulseResponse, softClipCurve
} from './AudioCore.js';
import { MusicEngine } from './MusicEngine.js';
import { MUSIC_TRACKS, resolveTrackName } from './MusicTracks.js';
import { speakLine, recentlySpoken } from './AnnouncerVoice.js';

// Sound ids usable with registerSample()/loadSample()
export const SOUND_IDS = [
  'menuSelect', 'menuMove', 'menuBack', 'jump', 'land', 'landHeavy', 'dash',
  'whooshLight', 'whooshHeavy', 'hitLight', 'hitHeavy', 'block', 'counterHit', 'critical',
  'throw', 'tech', 'breaker', 'stanceBreak', 'wallBounce', 'knockdown', 'ko', 'ultimateLock',
  'hadouken', 'sonicBlade', 'shoryuken', 'flashKick', 'shadowWarp', 'clonePoof',
  'ultimateActivation', 'ultimateFinisher', 'rageIgnite', 'superReady', 'gong', 'lowGong',
  'parryChime', 'noiseCrack', 'pocketSand', 'taserShock', 'caltrops', 'crowdCheer',
  'unlock', 'tutorialStep'
];

const MAX_SFX_VOICES = 40;
const GROUP_CAPS = { whoosh: 5, hit: 10, ui: 4, crowd: 2 };

// Inharmonic partial tables: [ratio, gain, decayScale]
const METAL = [[1, 1, 1], [1.47, 0.8, 0.8], [2.09, 0.6, 0.6], [2.56, 0.5, 0.5], [3.39, 0.35, 0.35]];
const BELL = [[1, 1, 1], [2.0, 0.3, 0.55], [3.0, 0.12, 0.35], [4.16, 0.06, 0.25]];
const GONG = [[1, 1, 1], [1.52, 0.6, 0.8], [2.0, 0.5, 0.9], [2.74, 0.35, 0.6], [3.42, 0.25, 0.45], [4.1, 0.15, 0.3], [5.4, 0.1, 0.2]];
const LOW_GONG = [[1, 1, 1], [2.0, 0.7, 0.8], [2.4, 0.45, 0.7], [2.9, 0.35, 0.6], [3.6, 0.25, 0.45], [5.2, 0.15, 0.3], [6.8, 0.08, 0.2]];

// Layered impact recipes (see _impactLayers)
const HIT_LIGHT = {
  click: { f: 2600, d: 0.012, g: 0.4 },
  snap: { f: 1500, to: 420, d: 0.025, g: 0.1 },
  body: { f: 1200, to: 520, d: 0.075, g: 0.55, Q: 1.1 },
  sub: { f: 190, to: 72, d: 0.1, g: 0.5 }
};
const HIT_HEAVY = {
  click: { f: 1800, d: 0.02, g: 0.55 },
  snap: { f: 1000, to: 220, d: 0.035, g: 0.14 },
  body: { f: 750, to: 210, d: 0.17, g: 1.1, Q: 0.9, color: 'pink' },
  crunch: { f: 1500, d: 0.09, g: 0.26, drive: 6 },
  sub: { f: 155, to: 42, d: 0.28, g: 0.9, drive: 1.5 }
};
const HIT_BLOCK = {
  click: { f: 3200, d: 0.01, g: 0.38 },
  body: { f: 2400, to: 1500, d: 0.05, g: 0.3, Q: 2 },
  ring: { f: 1250, d: 0.16, g: 0.09 },
  sub: { f: 150, to: 95, d: 0.06, g: 0.28 }
};
const HIT_KO = {
  click: { f: 1500, d: 0.03, g: 0.7 },
  snap: { f: 800, to: 120, d: 0.06, g: 0.18 },
  body: { f: 600, to: 110, d: 0.55, g: 1.1, Q: 0.8, color: 'pink' },
  crunch: { f: 900, d: 0.25, g: 0.35, drive: 8 },
  sub: { f: 120, to: 28, time: 1.0, d: 1.4, g: 1.0, drive: 1.3 }
};

// Announcer call table: spoken line + synthetic stinger
const ANNOUNCER_LINES = {
  ROUND1: { text: 'Round one... Fight!', stinger: 'ROUND', fight: 1.35 },
  ROUND2: { text: 'Round two... Fight!', stinger: 'ROUND', fight: 1.35 },
  ROUND3: { text: 'Round three... Fight!', stinger: 'ROUND', fight: 1.4 },
  FINALROUND: { text: 'Final round... Fight!', stinger: 'FINAL', pitch: 0.4, rate: 0.78, fight: 1.5 },
  FIGHT: { text: 'Fight!', stinger: 'FIGHT', pitch: 0.5, rate: 0.9 },
  FINISH_HIM: { text: 'Finish him!', stinger: 'FINISH', pitch: 0.38, rate: 0.8 },
  FINISH_HER: { text: 'Finish her!', stinger: 'FINISH', pitch: 0.38, rate: 0.8 },
  FLAWLESS: { text: 'Flawless victory!', stinger: 'WIN', pitch: 0.42 },
  PERFECT: { text: 'Perfect!', stinger: 'WIN' },
  KO: { text: 'K. O.!', stinger: 'KO', pitch: 0.4, rate: 0.75 },
  YOU_WIN: { text: 'You win!', stinger: 'WIN' },
  YOU_LOSE: { text: 'You lose', stinger: 'TIME', pitch: 0.35, rate: 0.75 },
  TIME_OVER: { text: 'Time over!', stinger: 'TIME' },
  DRAW: { text: 'Draw game', stinger: 'TIME' },
  FATALITY: { text: 'Fatality!', stinger: 'FATALITY', pitch: 0.36, rate: 0.78 },
  BRUTALITY: { text: 'Brutality!', stinger: 'FATALITY', pitch: 0.38, rate: 0.82 },
  STAGE_FATALITY: { text: 'Stage fatality!', stinger: 'FATALITY', pitch: 0.36, rate: 0.78 },
  TEST_YOUR_MIGHT: { text: 'Test your might!', stinger: 'ROUND', pitch: 0.45 },
  COUNTER: { text: 'Counter!', stinger: 'FIGHT', pitch: 0.5, rate: 0.95 },
  ULTIMATE: { text: 'Ultimate!', stinger: 'FIGHT', pitch: 0.4 }
};

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.tempo = 140;
    this.step = 0;
    this.currentTrack = 'fight';

    this.sharedNoiseBuffer = null;
    this.noiseBuffers = {};
    this.activeVoices = [];
    this.samples = new Map();
    this._lastPlay = Object.create(null);
    this.music = new MusicEngine(this);

    // Normalized volume levels (0.0 to 1.0)
    this.masterVolumeVal = 0.8;
    this.musicVolumeVal = 0.7;
    this.sfxVolumeVal = 0.9;
    this.loadSavedVolumes();
  }

  loadSavedVolumes() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('final_impact_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.masterVolume === 'number') {
            this.masterVolumeVal = Math.max(0, Math.min(1, parsed.masterVolume / 100));
          }
          if (typeof parsed.musicVolume === 'number') {
            this.musicVolumeVal = Math.max(0, Math.min(1, parsed.musicVolume / 100));
          }
          if (typeof parsed.sfxVolume === 'number') {
            this.sfxVolumeVal = Math.max(0, Math.min(1, parsed.sfxVolume / 100));
          }
        }
      }
    } catch (e) {}
  }

  saveVolumeSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const existing = localStorage.getItem('final_impact_settings');
        const parsed = existing ? JSON.parse(existing) : {};
        parsed.masterVolume = Math.round(this.masterVolumeVal * 100);
        parsed.musicVolume = Math.round(this.musicVolumeVal * 100);
        parsed.sfxVolume = Math.round(this.sfxVolumeVal * 100);
        localStorage.setItem('final_impact_settings', JSON.stringify(parsed));
      }
    } catch (e) {}
  }

  // init() creates the AudioContext. An existing context (e.g. an OfflineAudioContext
  // for rendering/tests) may be passed in. options.bypassDynamics skips comp/limiter.
  init(existingContext = null, options = {}) {
    if (this.ctx) return;
    try {
      let ctx = existingContext;
      if (!ctx) {
        const w = typeof window !== 'undefined' ? window : null;
        const AudioCtx = w ? (w.AudioContext || w.webkitAudioContext) : null;
        if (!AudioCtx) return;
        ctx = new AudioCtx({ latencyHint: 'interactive' });
      }
      this.ctx = ctx;
      this._buildGraph(options || {});
      if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
        const p = this.ctx.resume();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch (e) {
      try { console.warn('Web Audio API not supported', e); } catch (err) {}
    }
  }

  _buildGraph(options) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this.loadSavedVolumes();

    // --- Master dynamics: glue compressor -> limiter -> soft clipper ---
    let out = ctx.destination;
    if (!options.bypassDynamics) {
      if (typeof ctx.createWaveShaper === 'function') {
        this.softClipper = ctx.createWaveShaper();
        this.softClipper.curve = softClipCurve();
        try { this.softClipper.oversample = '2x'; } catch (e) {}
        this.softClipper.connect(out);
        out = this.softClipper;
      }
      if (typeof ctx.createDynamicsCompressor === 'function') {
        this.limiter = ctx.createDynamicsCompressor();
        setP(this.limiter.threshold, -3, now);
        setP(this.limiter.knee, 0, now);
        setP(this.limiter.ratio, 20, now);
        setP(this.limiter.attack, 0.001, now);
        setP(this.limiter.release, 0.09, now);
        this.limiter.connect(out);
        out = this.limiter;

        this.compressor = ctx.createDynamicsCompressor();
        setP(this.compressor.threshold, -18, now);
        setP(this.compressor.knee, 10, now);
        setP(this.compressor.ratio, 3, now);
        setP(this.compressor.attack, 0.004, now);
        setP(this.compressor.release, 0.2, now);
        this.compressor.connect(out);
        out = this.compressor;

        // Pre-compressor trim: offsets the compressor's automatic makeup gain
        // (~+7 dB at these settings) so quiet sounds pass at unity.
        this.busTrim = ctx.createGain();
        setP(this.busTrim.gain, 0.45, now);
        this.busTrim.connect(out);
        out = this.busTrim;
      }
    }

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolumeVal, now);
    this.masterGain.connect(out);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolumeVal * 0.9, now);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolumeVal * 0.45, now);
    this.musicGain.connect(this.masterGain);

    // Sidechain-style duck stage for music (big hits push the music down briefly)
    this.musicDuck = ctx.createGain();
    setP(this.musicDuck.gain, 1, now);
    this.musicDuck.connect(this.musicGain);

    // --- Shared convolution reverb with post-fader sends ---
    if (typeof ctx.createConvolver === 'function') {
      try {
        this.reverb = ctx.createConvolver();
        this.reverb.buffer = makeImpulseResponse(ctx, 2.6);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        setP(hp.frequency, 170, now);
        this.reverbReturn = ctx.createGain();
        setP(this.reverbReturn.gain, 0.85, now);
        this.reverb.connect(hp);
        hp.connect(this.reverbReturn);
        this.reverbReturn.connect(this.masterGain);

        this.sfxVerbIn = ctx.createGain();
        setP(this.sfxVerbIn.gain, this.sfxVolumeVal * 0.9, now);
        this.sfxVerbIn.connect(this.reverb);
        this.musicVerbIn = ctx.createGain();
        setP(this.musicVerbIn.gain, this.musicVolumeVal * 0.45, now);
        this.musicVerbIn.connect(this.reverb);
      } catch (e) {
        this.reverb = null;
        this.sfxVerbIn = null;
        this.musicVerbIn = null;
      }
    }

    // --- Music tempo echo (dotted 8th, filtered feedback) ---
    if (typeof ctx.createDelay === 'function') {
      try {
        this.musicEchoIn = ctx.createGain();
        setP(this.musicEchoIn.gain, 1, now);
        this.musicEchoDelay = ctx.createDelay(2.0);
        setP(this.musicEchoDelay.delayTime, 0.32, now);
        const fb = ctx.createGain();
        setP(fb.gain, 0.3, now);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        setP(lp.frequency, 2600, now);
        const echoOut = ctx.createGain();
        setP(echoOut.gain, 0.5, now);
        this.musicEchoIn.connect(this.musicEchoDelay);
        this.musicEchoDelay.connect(lp);
        lp.connect(fb);
        fb.connect(this.musicEchoDelay);
        lp.connect(echoOut);
        echoOut.connect(this.musicDuck);
      } catch (e) {
        this.musicEchoIn = null;
      }
    }

    // Reusable 2-second white noise buffer (no per-hit allocation / GC)
    this.sharedNoiseBuffer = makeNoiseBuffer(ctx, 2, 'white');
    this.noiseBuffers = { white: this.sharedNoiseBuffer };
  }

  noiseBuffer(color = 'white') {
    if (!this.ctx) return null;
    if (!this.noiseBuffers[color]) {
      try { this.noiseBuffers[color] = makeNoiseBuffer(this.ctx, 2, color); } catch (e) { return this.sharedNoiseBuffer; }
    }
    return this.noiseBuffers[color];
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
      try {
        const p = this.ctx.resume();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) {}
    }
  }

  setMasterVolume(val) {
    this.masterVolumeVal = Math.max(0, Math.min(1, Number(val) || 0));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolumeVal, this.ctx.currentTime);
    }
    this.saveVolumeSettings();
  }

  setMusicVolume(val) {
    this.musicVolumeVal = Math.max(0, Math.min(1, Number(val) || 0));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolumeVal * 0.45, this.ctx.currentTime);
      if (this.musicVerbIn) setP(this.musicVerbIn.gain, this.musicVolumeVal * 0.45, this.ctx.currentTime);
    }
    this.saveVolumeSettings();
  }

  setSFXVolume(val) {
    this.sfxVolumeVal = Math.max(0, Math.min(1, Number(val) || 0));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolumeVal * 0.9, this.ctx.currentTime);
      if (this.sfxVerbIn) setP(this.sfxVerbIn.gain, this.sfxVolumeVal * 0.9, this.ctx.currentTime);
    }
    this.saveVolumeSettings();
  }

  getMasterVolume() {
    return this.masterVolumeVal;
  }

  getMusicVolume() {
    return this.musicVolumeVal;
  }

  getSFXVolume() {
    return this.sfxVolumeVal;
  }

  // ===========================================================================
  // Voice management
  // ===========================================================================
  _ready() {
    return !!(this.ctx && this.sfxGain && this.enabled !== false);
  }

  _voice(opts = {}) {
    return new SoundVoice(this, { bus: this.sfxGain, verb: this.sfxVerbIn, ...opts });
  }

  _registerVoice(v) {
    const now = this.ctx ? this.ctx.currentTime : 0;
    // Safety net for environments where onended never fires
    if (this.activeVoices.length > MAX_SFX_VOICES / 2) {
      for (const old of this.activeVoices.slice()) {
        if (old.end < now - 1) old.dispose();
      }
    }
    this.activeVoices.push(v);
    if (v.group && GROUP_CAPS[v.group]) {
      const same = this.activeVoices.filter((x) => x.group === v.group);
      for (let i = 0; i < same.length - GROUP_CAPS[v.group]; i++) this._steal(same[i]);
    }
    while (this.activeVoices.length > MAX_SFX_VOICES) this._steal(this.activeVoices[0]);
  }

  _steal(v) {
    const idx = this.activeVoices.indexOf(v);
    if (idx >= 0) this.activeVoices.splice(idx, 1);
    v.kill();
  }

  _releaseVoice(v) {
    const idx = this.activeVoices.indexOf(v);
    if (idx >= 0) this.activeVoices.splice(idx, 1);
  }

  // Runs a sound design safely. Returns true if something was scheduled.
  // gap: minimum seconds between two triggers of the same id (stops same-frame stacking).
  _run(id, design, gap = 0.015) {
    if (!this._ready()) return false;
    try {
      const now = this.ctx.currentTime;
      if (gap > 0) {
        const last = this._lastPlay[id];
        if (last !== undefined && now >= last && now - last < gap) return false;
        this._lastPlay[id] = now;
      }
      if (this._playSample(id)) return true;
      design(now);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ===========================================================================
  // Sample drop-in API
  // ===========================================================================
  registerSample(id, buffers, opts = {}) {
    const list = (Array.isArray(buffers) ? buffers : [buffers]).filter(Boolean);
    if (!id || !list.length) return false;
    this.samples.set(id, { buffers: list, gain: 1, send: 0.1, vary: 0.04, ...opts });
    return true;
  }

  clearSample(id) {
    return this.samples.delete(id);
  }

  async loadSample(id, urls, opts = {}) {
    this.ensureContext();
    if (!this.ctx || typeof fetch !== 'function') return false;
    const list = Array.isArray(urls) ? urls : [urls];
    const buffers = [];
    for (const url of list) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.arrayBuffer();
        const buf = await new Promise((resolve, reject) => {
          const p = this.ctx.decodeAudioData(data, resolve, reject);
          if (p && typeof p.then === 'function') p.then(resolve, reject);
        });
        if (buf) buffers.push(buf);
      } catch (e) {}
    }
    return buffers.length ? this.registerSample(id, buffers, opts) : false;
  }

  _playSample(id) {
    const entry = this.samples.get(id);
    if (!entry || !entry.buffers.length) return false;
    const buf = entry.buffers[Math.floor(Math.random() * entry.buffers.length)];
    const v = this._voice({ id, send: entry.send, gain: entry.gain, group: entry.group || null });
    v.sample({ buffer: buf, rate: entry.vary ? vary(1, entry.vary) : 1, g: 1 });
    v.finish();
    return true;
  }

  // ===========================================================================
  // Shared design building blocks
  // ===========================================================================

  // Layered impact: transient click + pitched snap + filtered noise body +
  // driven crunch + pitched sub thump + optional metallic ring.
  _impactLayers(v, spec, { at = 0, gain = 1, pitch = vary(1, 0.06), fvar = vary(1, 0.15) } = {}) {
    const G = gain * vary(1, 0.06);
    if (spec.click) v.noise({ at, filter: { type: 'highpass', f: spec.click.f * fvar }, a: 0.0005, d: spec.click.d, g: spec.click.g * G });
    if (spec.snap) v.tone({ at, type: 'square', f: spec.snap.f * pitch, to: spec.snap.to * pitch, time: spec.snap.d, a: 0.0005, d: spec.snap.d, g: spec.snap.g * G, filter: { type: 'lowpass', f: 5000 } });
    if (spec.body) v.noise({ at, color: spec.body.color || 'white', filter: { type: 'bandpass', f: spec.body.f * fvar, to: spec.body.to * fvar, time: spec.body.d, Q: spec.body.Q != null ? spec.body.Q : 1 }, a: 0.001, d: spec.body.d, g: spec.body.g * G });
    if (spec.crunch) v.noise({ at, filter: { type: 'bandpass', f: spec.crunch.f * fvar, Q: 1.5 }, drive: spec.crunch.drive || 6, a: 0.001, d: spec.crunch.d, g: spec.crunch.g * G });
    if (spec.sub) v.tone({ at, type: 'sine', f: spec.sub.f * pitch, to: spec.sub.to * pitch, time: spec.sub.time != null ? spec.sub.time : spec.sub.d * 0.7, a: 0.001, d: spec.sub.d, g: spec.sub.g * G, drive: spec.sub.drive });
    if (spec.ring) v.partials({ at, f: spec.ring.f * pitch, partials: spec.ring.partials || METAL, d: spec.ring.d, g: spec.ring.g * G, spread: 0.01 });
  }

  _glass(v, at = 0, g = 1) {
    for (let i = 0; i < 12; i++) {
      v.tone({ at: at + rand(0, 0.07), f: rand(2500, 7500), a: 0.0008, d: rand(0.08, 0.35), g: rand(0.02, 0.05) * g });
    }
    v.noise({ at, filter: { type: 'highpass', f: 5000 }, a: 0.001, d: 0.25, g: 0.22 * g });
    v.noise({ at, filter: { type: 'bandpass', f: 3500, Q: 0.8 }, a: 0.0005, d: 0.05, g: 0.35 * g });
  }

  _sparkle(v, at, span, count = 8, g = 1) {
    for (let i = 0; i < count; i++) {
      v.tone({ at: at + rand(0, span), f: rand(3000, 8000), a: 0.002, d: rand(0.08, 0.2), g: rand(0.015, 0.035) * g });
    }
  }

  _koLayers(v, at = 0, gain = 1) {
    this._impactLayers(v, HIT_KO, { at, gain });
    v.noise({ at, filter: { type: 'lowpass', f: 3500, to: 150, time: 1.2 }, a: 0.003, d: 1.5, g: 0.5 * gain });
    v.noise({ at, color: 'brown', filter: { type: 'lowpass', f: 140 }, a: 0.05, d: 2.2, g: 0.65 * gain });
  }

  duckMusic(depth = 0.5, hold = 0.25, release = 0.8) {
    if (!this.ctx || !this.musicDuck) return;
    try {
      const p = this.musicDuck.gain;
      const now = this.ctx.currentTime;
      cancelP(p, now);
      setP(p, p.value, now);
      linP(p, clamp(depth, 0.05, 1), now + 0.03);
      linP(p, clamp(depth, 0.05, 1), now + 0.03 + hold);
      linP(p, 1, now + 0.03 + hold + release);
    } catch (e) {}
  }

  // ===========================================================================
  // UI
  // ===========================================================================

  // Bright two-note confirm chime
  playMenuSelect() {
    this._run('menuSelect', () => {
      const v = this._voice({ group: 'ui', send: 0.2, gain: 0.9 });
      v.tone({ type: 'triangle', f: 523, to: 1046, time: 0.06, a: 0.002, d: 0.08, g: 0.06 });
      v.partials({ f: 1046.5, partials: BELL, a: 0.002, d: 0.25, g: 0.13 });
      v.partials({ at: 0.06, f: 1568, partials: BELL, a: 0.002, d: 0.45, g: 0.13 });
      v.noise({ filter: { type: 'highpass', f: 6000 }, a: 0.01, d: 0.08, g: 0.04 });
      v.finish();
    }, 0.03);
  }

  // Soft tick for menu / dialogue navigation
  playMenuMove() {
    this._run('menuMove', () => {
      const v = this._voice({ group: 'ui', send: 0.05 });
      v.tone({ f: 1480 * vary(1, 0.01), a: 0.001, d: 0.035, g: 0.14 });
      v.noise({ filter: { type: 'highpass', f: 5000 }, a: 0.0005, d: 0.006, g: 0.06 });
      v.finish();
    }, 0.03);
  }

  // Descending soft "back / cancel"
  playMenuBack() {
    this._run('menuBack', () => {
      const v = this._voice({ group: 'ui', send: 0.1 });
      v.tone({ type: 'triangle', f: 784, to: 523, time: 0.09, a: 0.002, d: 0.12, g: 0.12 });
      v.tone({ at: 0.06, type: 'triangle', f: 523, to: 392, time: 0.1, a: 0.002, d: 0.14, g: 0.1 });
      v.noise({ color: 'pink', filter: { type: 'lowpass', f: 400 }, a: 0.001, d: 0.04, g: 0.1 });
      v.finish();
    }, 0.03);
  }

  // Reward fanfare: boom + bell arpeggio + shimmering chord + sparkles
  playUnlock() {
    this._run('unlock', () => {
      const v = this._voice({ send: 0.4 });
      v.tone({ f: 80, to: 40, time: 0.5, a: 0.002, d: 0.6, g: 0.45 });
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        v.partials({ at: i * 0.075, f, partials: BELL, a: 0.002, d: 1.0, g: 0.1 });
      });
      for (const f of [523.25, 659.25, 783.99]) {
        for (const det of [-10, 10]) {
          v.tone({ at: 0.3, type: 'sawtooth', f, detune: det, a: 0.08, hold: 0.5, d: 0.9, g: 0.022, am: { rate: 7, depth: 0.3 }, filter: { type: 'lowpass', f: 3000 } });
        }
      }
      v.noise({ at: 0.25, filter: { type: 'highpass', f: 7000 }, swell: true, a: 0.3, d: 0.8, g: 0.05 });
      this._sparkle(v, 0.25, 0.8, 10);
      v.finish();
    }, 0.2);
  }

  // Positive two-note chime for tutorial progress
  playTutorialStep() {
    this._run('tutorialStep', () => {
      const v = this._voice({ group: 'ui', send: 0.3 });
      v.partials({ f: 1318.5, partials: BELL, a: 0.002, d: 0.45, g: 0.11 });
      v.partials({ at: 0.085, f: 1975.5, partials: BELL, a: 0.002, d: 0.6, g: 0.11 });
      v.noise({ at: 0.08, filter: { type: 'highpass', f: 7000 }, a: 0.01, d: 0.15, g: 0.03 });
      v.finish();
    }, 0.08);
  }

  // ===========================================================================
  // Movement
  // ===========================================================================

  // Airy hop + foot scuff
  playJump() {
    this._run('jump', () => {
      const v = this._voice({ send: 0.04 });
      v.noise({ filter: { type: 'bandpass', f: 500 * vary(1, 0.1), to: 1900, time: 0.12, Q: 1.3 }, a: 0.03, d: 0.1, g: 0.22 });
      v.noise({ color: 'pink', filter: { type: 'lowpass', f: 700 }, a: 0.001, d: 0.035, g: 0.2 });
      v.tone({ f: 140 * vary(1, 0.05), to: 240, time: 0.08, a: 0.002, d: 0.08, g: 0.12 });
      v.finish();
    }, 0.05);
  }

  // Landing thud (heavy = from a big fall / launch)
  playLand(heavy = false) {
    this._run(heavy ? 'landHeavy' : 'land', () => {
      const v = this._voice({ send: heavy ? 0.1 : 0.04 });
      v.tone({ f: 120 * vary(1, 0.06), to: 55, time: 0.09, a: 0.001, d: 0.1, g: 0.42 });
      v.noise({ color: 'pink', filter: { type: 'lowpass', f: 600 * vary(1, 0.15) }, a: 0.001, d: 0.07, g: 0.35 });
      v.noise({ filter: { type: 'highpass', f: 2500 }, a: 0.0005, d: 0.02, g: 0.07 });
      if (heavy) {
        v.tone({ f: 85, to: 32, time: 0.25, a: 0.001, d: 0.3, g: 0.75, drive: 1.3 });
        v.noise({ filter: { type: 'bandpass', f: 1500, Q: 0.7 }, a: 0.01, d: 0.35, g: 0.12 });
      }
      v.finish();
    }, 0.05);
  }

  // Quick snappy dash
  playDash() {
    this._run('dash', () => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const v = this._voice({ group: 'whoosh', send: 0.05, pan: dir * 0.2 });
      v.panSweep(-dir * 0.3, dir * 0.3, 0.14);
      const fv = vary(1, 0.12);
      v.noise({ filter: { type: 'bandpass', f: 900 * fv, path: [[0.04, 3200 * fv], [0.14, 1100 * fv]], Q: 1.4 }, a: 0.04, d: 0.1, g: 0.32 });
      v.noise({ color: 'pink', filter: { type: 'highpass', f: 2200 }, a: 0.001, d: 0.05, g: 0.15 });
      v.tone({ f: 110, to: 70, time: 0.08, a: 0.002, d: 0.08, g: 0.15 });
      v.finish();
    }, 0.04);
  }

  // Swing whoosh: noise through a moving band-pass, stereo sweep
  playWhoosh(type = 'light') {
    const heavy = type === 'heavy';
    this._run(heavy ? 'whooshHeavy' : 'whooshLight', () => {
      const dur = heavy ? rand(0.22, 0.28) : rand(0.12, 0.16);
      const fv = vary(1, 0.15);
      const dir = Math.random() < 0.5 ? -1 : 1;
      const v = this._voice({ group: 'whoosh', send: heavy ? 0.08 : 0.04, pan: dir * 0.2 });
      v.panSweep(-dir * 0.25, dir * 0.25, dur);
      const [f0, f1, f2] = heavy ? [260, 1300, 330] : [650, 2600, 950];
      v.noise({ filter: { type: 'bandpass', f: f0 * fv, path: [[dur * 0.45, f1 * fv], [dur, f2 * fv]], Q: heavy ? 1.1 : 1.6 }, a: dur * 0.45, d: dur * 0.55, g: heavy ? 0.62 : 0.46 });
      v.noise({ filter: { type: 'highpass', f: 4500 }, a: dur * 0.4, d: dur * 0.5, g: heavy ? 0.09 : 0.07 });
      if (heavy) {
        v.noise({ color: 'pink', filter: { type: 'lowpass', f: 450 }, a: dur * 0.4, d: dur * 0.6, g: 0.28 });
        v.tone({ f: 95, to: 55, time: dur, a: dur * 0.4, d: dur * 0.6, g: 0.1 });
      }
      v.finish();
    }, 0.025);
  }

  // ===========================================================================
  // Impacts
  // ===========================================================================
  playHitLight() {
    this._run('hitLight', () => {
      const v = this._voice({ group: 'hit', send: 0.07, pan: rand(-0.15, 0.15) });
      this._impactLayers(v, HIT_LIGHT, { gain: 1 });
      v.finish();
    }, 0.02);
  }

  playHitHeavy() {
    this._run('hitHeavy', () => {
      const v = this._voice({ group: 'hit', send: 0.14, pan: rand(-0.1, 0.1) });
      this._impactLayers(v, HIT_HEAVY);
      v.finish();
    }, 0.02);
  }

  playHitConfirm(type = 'light') {
    switch (type) {
      case 'heavy': return this.playHitHeavy();
      case 'counter': return this.playCounterHit();
      case 'critical':
      case 'crit': return this.playCritical();
      case 'block': return this.playBlock();
      default: return this.playHitLight();
    }
  }

  // Metallic guard clang
  playBlock() {
    this._run('block', () => {
      const v = this._voice({ group: 'hit', send: 0.1, pan: rand(-0.1, 0.1) });
      this._impactLayers(v, HIT_BLOCK);
      v.finish();
    }, 0.02);
  }

  // Counter hit: heavy impact + bright ringing "ting" + upward chirp
  playCounterHit() {
    this._run('counterHit', () => {
      const v = this._voice({ group: 'hit', send: 0.22 });
      this._impactLayers(v, HIT_HEAVY, { gain: 1 });
      v.partials({ f: 2200 * vary(1, 0.03), partials: METAL, a: 0.001, d: 0.45, g: 0.07 });
      v.tone({ f: 900, to: 2800, time: 0.07, a: 0.001, d: 0.09, g: 0.12 });
      v.finish();
    }, 0.03);
  }

  // Critical: heavy impact + glass shatter + deep boom
  playCritical() {
    this._run('critical', () => {
      const v = this._voice({ send: 0.35 });
      this._impactLayers(v, HIT_HEAVY, { gain: 1.05 });
      this._glass(v, 0.01, 1);
      v.tone({ f: 110, to: 30, time: 0.5, a: 0.002, d: 0.7, g: 0.55 });
      v.finish();
      this.duckMusic(0.55, 0.2, 0.7);
    }, 0.05);
  }

  // Stance / guard break: glass shatter + low boom + falling tone
  playStanceBreak() {
    this._run('stanceBreak', () => {
      const v = this._voice({ send: 0.4 });
      this._glass(v, 0, 1.1);
      v.noise({ filter: { type: 'highpass', f: 1500 }, a: 0.0005, d: 0.02, g: 0.5 });
      v.tone({ f: 100, to: 34, time: 0.45, a: 0.002, d: 0.6, g: 0.8, drive: 1.3 });
      v.tone({ type: 'sawtooth', f: 520, to: 70, time: 0.55, a: 0.005, d: 0.6, g: 0.1, filter: { type: 'lowpass', f: 1600 } });
      v.finish();
      this.duckMusic(0.5, 0.25, 0.8);
    }, 0.1);
  }

  // Throw: grab rustle -> heavy swing -> body slam into the floor
  playThrow() {
    this._run('throw', () => {
      const v = this._voice({ send: 0.18 });
      v.noise({ filter: { type: 'bandpass', f: 2500, Q: 0.8 }, a: 0.005, d: 0.07, g: 0.25 });
      v.noise({ at: 0.05, filter: { type: 'bandpass', f: 300, path: [[0.1, 1200], [0.2, 300]], Q: 1.1 }, a: 0.09, d: 0.11, g: 0.4 });
      this._impactLayers(v, {
        click: { f: 1500, d: 0.02, g: 0.45 },
        body: { f: 450, to: 150, d: 0.25, g: 1.0, Q: 0.8, color: 'pink' },
        crunch: { f: 900, d: 0.1, g: 0.22, drive: 6 },
        sub: { f: 130, to: 34, d: 0.4, g: 0.95, drive: 1.4 }
      }, { at: 0.22 });
      v.noise({ at: 0.24, filter: { type: 'bandpass', f: 1500, Q: 0.5 }, a: 0.005, d: 0.3, g: 0.1 });
      v.finish();
    }, 0.1);
  }

  // Throw tech: two quick clacks + bright ping + push-away whoosh
  playTech() {
    this._run('tech', () => {
      const v = this._voice({ send: 0.15, gain: 1.4 });
      for (const at of [0, 0.05]) {
        v.noise({ at, filter: { type: 'bandpass', f: 1800 * vary(1, 0.08), Q: 6 }, a: 0.0005, d: 0.03, g: 0.55 });
        v.tone({ at, type: 'triangle', f: 760 * vary(1, 0.05), a: 0.0005, d: 0.04, g: 0.2 });
      }
      v.partials({ at: 0.05, f: 2600, partials: [[1, 1, 1], [2.4, 0.3, 0.5]], a: 0.001, d: 0.35, g: 0.1 });
      v.noise({ at: 0.04, filter: { type: 'bandpass', f: 800, to: 2400, time: 0.12, Q: 1.3 }, a: 0.03, d: 0.1, g: 0.15 });
      v.finish();
    }, 0.1);
  }

  // Combo breaker: shockwave burst, electric crackle, ring
  playBreaker() {
    this._run('breaker', () => {
      const v = this._voice({ send: 0.35 });
      v.noise({ filter: { type: 'highpass', f: 1500 }, a: 0.0005, d: 0.02, g: 0.55 });
      v.tone({ f: 95, to: 30, time: 0.45, a: 0.001, d: 0.6, g: 0.85, drive: 1.4 });
      v.noise({ filter: { type: 'bandpass', f: 300, to: 5200, time: 0.25, Q: 2 }, a: 0.02, d: 0.35, g: 0.32 });
      v.tone({ type: 'square', f: 55, a: 0.002, d: 0.3, g: 0.1, drive: 8, am: { rate: 35, depth: 0.9, type: 'square' }, filter: { type: 'highpass', f: 1200 } });
      v.partials({ f: 1500, partials: METAL, a: 0.001, d: 0.6, g: 0.06 });
      v.noise({ at: 0.03, filter: { type: 'bandpass', f: 3000, to: 400, time: 0.4, Q: 1.2 }, a: 0.01, d: 0.4, g: 0.2 });
      v.finish();
      this.duckMusic(0.5, 0.2, 0.8);
    }, 0.15);
  }

  // Flurry of rapid hits for ultimate lock-in cinematics
  playUltimateLock() {
    this._run('ultimateLock', () => {
      const v = this._voice({ send: 0.15 });
      const n = 9;
      for (let i = 0; i < n; i++) {
        const at = i * 0.062 + rand(-0.008, 0.008) + 0.01;
        if (i % 2 === 0) {
          v.noise({ at: Math.max(0, at - 0.03), filter: { type: 'bandpass', f: 700, to: 2600, time: 0.04, Q: 1.5 }, a: 0.02, d: 0.03, g: 0.18 });
        }
        this._impactLayers(v, HIT_LIGHT, { at, gain: rand(0.6, 0.8) });
      }
      this._impactLayers(v, HIT_HEAVY, { at: n * 0.062 + 0.04, gain: 1 });
      v.finish();
    }, 0.2);
  }

  // Wall bounce: heavy impact + stone/wood resonance + debris rattle
  playWallBounce() {
    this._run('wallBounce', () => {
      const v = this._voice({ send: 0.25 });
      this._impactLayers(v, HIT_HEAVY, { gain: 0.9 });
      v.noise({ filter: { type: 'bandpass', f: 170, Q: 5 }, a: 0.002, d: 0.35, g: 0.6 });
      v.partials({ f: 118 * vary(1, 0.05), partials: [[1, 1, 1], [1.58, 0.7, 0.7], [2.3, 0.4, 0.5]], a: 0.001, d: 0.4, g: 0.18 });
      for (let i = 0; i < 5; i++) {
        v.noise({ at: rand(0.05, 0.35), filter: { type: 'highpass', f: 3000 }, a: 0.0005, d: 0.015, g: rand(0.06, 0.12) });
      }
      v.finish();
    }, 0.08);
  }

  // Body fall: thud + bounce + dust
  playKnockdown() {
    this._run('knockdown', () => {
      const v = this._voice({ send: 0.12 });
      v.tone({ f: 95 * vary(1, 0.05), to: 40, time: 0.25, a: 0.001, d: 0.32, g: 0.85, drive: 1.2 });
      v.noise({ color: 'pink', filter: { type: 'lowpass', f: 450 }, a: 0.001, d: 0.2, g: 0.6 });
      v.tone({ at: 0.15, f: 80, to: 45, time: 0.1, a: 0.001, d: 0.15, g: 0.38 });
      v.noise({ at: 0.15, color: 'pink', filter: { type: 'lowpass', f: 350 }, a: 0.001, d: 0.1, g: 0.3 });
      v.noise({ filter: { type: 'bandpass', f: 1200, Q: 0.6 }, a: 0.02, d: 0.5, g: 0.1 });
      v.finish();
    }, 0.08);
  }

  // K.O. — cinematic explosion boom with long sub tail
  playKO() {
    this._run('ko', () => {
      const v = this._voice({ send: 0.45 });
      this._koLayers(v, 0, 1);
      v.finish();
      this.duckMusic(0.35, 1.0, 1.5);
    }, 0.15);
  }

  // Generic filtered noise burst (kept for gameplay call sites)
  playNoiseCrack(duration = 0.2, filterFreq = 1200, gainVal = 0.4) {
    this._run('noiseCrack', () => {
      const v = this._voice({ send: 0.15 });
      const fv = vary(1, 0.1);
      v.noise({ filter: { type: 'lowpass', f: filterFreq * fv, to: Math.max(80, filterFreq * 0.35), time: duration }, a: 0.002, d: duration, g: gainVal });
      v.noise({ filter: { type: 'highpass', f: 2500 }, a: 0.0005, d: Math.min(0.02, duration * 0.2), g: gainVal * 0.5 });
      if (filterFreq <= 1000) v.tone({ f: 120, to: 40, time: duration, a: 0.001, d: Math.min(0.4, duration), g: gainVal * 0.8 });
      v.finish();
    }, 0.01);
  }

  // ===========================================================================
  // Specials & ultimates
  // ===========================================================================

  // Fireball: charge chirp, buzzing energy swell, release burst + thump
  playHadouken() {
    this._run('hadouken', () => {
      const v = this._voice({ send: 0.25 });
      v.tone({ f: 160, to: 560, time: 0.12, a: 0.01, d: 0.14, g: 0.22 });
      for (const r of [1, 1.006, 0.994]) {
        v.tone({ type: 'sawtooth', f: 220 * r, a: 0.05, hold: 0.05, d: 0.35, g: 0.06, am: { rate: 18, depth: 0.4 }, filter: { type: 'bandpass', f: 500, path: [[0.1, 2200], [0.4, 900]], Q: 3 } });
      }
      v.noise({ at: 0.09, filter: { type: 'lowpass', f: 3000, to: 500, time: 0.35 }, a: 0.01, d: 0.35, g: 0.42 });
      v.tone({ at: 0.09, f: 120, to: 48, time: 0.18, a: 0.001, d: 0.22, g: 0.5 });
      v.noise({ filter: { type: 'highpass', f: 6000 }, a: 0.05, d: 0.35, g: 0.06 });
      v.finish();
    }, 0.05);
  }

  // Sonic blade: high swish + ringing steel
  playSonicBlade() {
    this._run('sonicBlade', () => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const v = this._voice({ send: 0.22, pan: dir * 0.2, gain: 1.7 });
      v.panSweep(-dir * 0.35, dir * 0.35, 0.22);
      v.noise({ filter: { type: 'bandpass', f: 1800, path: [[0.06, 6000], [0.22, 2200]], Q: 2 }, a: 0.06, d: 0.18, g: 0.42 });
      v.partials({ at: 0.03, f: 1750 * vary(1, 0.03), partials: [[1, 1, 1], [1.41, 0.6, 0.8], [2.13, 0.4, 0.6], [2.9, 0.2, 0.4]], a: 0.002, d: 0.45, g: 0.065 });
      v.tone({ type: 'sawtooth', f: 320, to: 110, time: 0.2, a: 0.005, d: 0.2, g: 0.14, filter: { type: 'lowpass', f: 900 } });
      v.finish();
    }, 0.05);
  }

  // Rising dragon punch: uppercut impact + rising whoosh + flickering fire roar
  playShoryuken() {
    this._run('shoryuken', () => {
      const v = this._voice({ send: 0.22 });
      this._impactLayers(v, HIT_LIGHT, { gain: 0.75 });
      v.noise({ filter: { type: 'bandpass', f: 250, to: 2800, time: 0.26, Q: 1.2 }, a: 0.12, d: 0.2, g: 0.42 });
      v.noise({ filter: { type: 'bandpass', f: 700, Q: 0.6 }, drive: 3, am: { rate: 28, depth: 0.6 }, a: 0.05, hold: 0.1, d: 0.35, g: 0.28 });
      v.tone({ type: 'sawtooth', f: 110, to: 330, time: 0.25, a: 0.02, d: 0.35, g: 0.14, filter: { type: 'lowpass', f: 1300 } });
      v.finish();
    }, 0.05);
  }

  // Flash kick: arcing whoosh + shimmer chirp + crack
  playFlashKick() {
    this._run('flashKick', () => {
      const v = this._voice({ send: 0.25, pan: -0.4 });
      v.panSweep(-0.5, 0.5, 0.3);
      v.noise({ filter: { type: 'bandpass', f: 400, path: [[0.12, 3400], [0.3, 600]], Q: 1.4 }, a: 0.12, d: 0.2, g: 0.42 });
      v.tone({ f: 600, to: 2600, time: 0.2, a: 0.01, d: 0.25, g: 0.1 });
      v.noise({ at: 0.08, filter: { type: 'highpass', f: 2000 }, a: 0.0005, d: 0.02, g: 0.38 });
      v.tone({ at: 0.08, f: 170, to: 60, time: 0.1, a: 0.001, d: 0.12, g: 0.42 });
      v.finish();
    }, 0.05);
  }

  // Shadow warp: reversed swell that cuts into a pop + ghostly tail
  playShadowWarp() {
    this._run('shadowWarp', () => {
      const v = this._voice({ send: 0.5 });
      v.noise({ filter: { type: 'bandpass', f: 1100, Q: 2.5 }, swell: true, a: 0.18, d: 0.03, lin: true, g: 0.42 });
      v.tone({ f: 200, to: 900, time: 0.18, swell: true, a: 0.18, d: 0.03, lin: true, g: 0.12 });
      v.tone({ at: 0.19, f: 420, to: 70, time: 0.09, a: 0.001, d: 0.1, g: 0.42 });
      v.noise({ at: 0.19, filter: { type: 'lowpass', f: 1500 }, a: 0.001, d: 0.06, g: 0.28 });
      v.partials({ at: 0.19, f: 330, partials: [[1, 1, 1], [1.5, 0.5, 0.8]], a: 0.01, d: 0.6, g: 0.05 });
      v.finish();
    }, 0.05);
  }

  // Shadow clone "poof"
  playClonePoof() {
    this._run('clonePoof', () => {
      const v = this._voice({ send: 0.2 });
      v.noise({ filter: { type: 'lowpass', f: 2200, to: 300, time: 0.25 }, a: 0.012, d: 0.28, g: 0.5 });
      v.tone({ f: 280, to: 60, time: 0.12, a: 0.001, d: 0.12, g: 0.38 });
      v.noise({ filter: { type: 'highpass', f: 5000 }, a: 0.03, d: 0.3, g: 0.09 });
      v.finish();
    }, 0.05);
  }

  // Ultimate activation: flash + sub drop, riser, rising chord shimmer, boom
  playUltimateActivation() {
    this._run('ultimateActivation', () => {
      const v = this._voice({ send: 0.5 });
      v.noise({ filter: { type: 'highpass', f: 2000 }, a: 0.0005, d: 0.02, g: 0.45 });
      v.tone({ f: 95, to: 28, time: 0.8, a: 0.001, d: 1.1, g: 0.8, drive: 1.3 });
      v.noise({ filter: { type: 'bandpass', f: 300, to: 6000, time: 0.6, Q: 2 }, swell: true, a: 0.45, d: 0.35, g: 0.3 });
      for (const f of [220, 329.63, 440, 554.37]) {
        for (const det of [-10, 10]) {
          v.tone({ type: 'sawtooth', f, to: f * 1.06, time: 0.6, detune: det, a: 0.25, hold: 0.25, d: 0.5, g: 0.026, am: { rate: 12, depth: 0.3 }, filter: { type: 'bandpass', f: 600, to: 2400, time: 0.6, Q: 1.2 } });
        }
      }
      this._sparkle(v, 0.1, 0.6, 8);
      v.noise({ at: 0.62, color: 'brown', filter: { type: 'lowpass', f: 600 }, a: 0.002, d: 0.6, g: 0.5 });
      v.noise({ at: 0.62, color: 'pink', filter: { type: 'bandpass', f: 900, to: 200, time: 0.5 }, a: 0.002, d: 0.5, g: 0.3 });
      v.finish();
      this.duckMusic(0.4, 0.8, 1.0);
    }, 0.2);
  }

  // Ultimate finisher: slam, then the cinematic K.O. detonation 120ms later
  playUltimateFinisher() {
    this._run('ultimateFinisher', () => {
      const v = this._voice({ send: 0.45 });
      this._impactLayers(v, HIT_HEAVY, { gain: 1 });
      this._koLayers(v, 0.12, 1);
      v.finish();
      this.duckMusic(0.3, 1.2, 1.5);
    }, 0.2);
  }

  // Adrenaline / rage ignition: fire flare + driven growl + sub
  playRageIgnite() {
    this._run('rageIgnite', () => {
      const v = this._voice({ send: 0.28 });
      v.noise({ filter: { type: 'lowpass', f: 400, to: 5000, time: 0.3 }, am: { rate: 22, depth: 0.5 }, a: 0.04, d: 0.45, g: 0.45 });
      for (const det of [-15, 15]) {
        v.tone({ type: 'sawtooth', f: 80, to: 170, time: 0.35, detune: det, drive: 4, a: 0.03, d: 0.5, g: 0.1, filter: { type: 'lowpass', f: 1300 } });
      }
      v.tone({ f: 75, to: 34, time: 0.45, a: 0.002, d: 0.55, g: 0.65 });
      for (let i = 0; i < 6; i++) {
        v.noise({ at: rand(0.05, 0.45), filter: { type: 'highpass', f: 3000 }, a: 0.0005, d: 0.01, g: rand(0.08, 0.16) });
      }
      v.finish();
      this.duckMusic(0.6, 0.2, 0.6);
    }, 0.1);
  }

  // Super meter ready: bell arpeggio + riser + shimmer
  playSuperReady() {
    this._run('superReady', () => {
      const v = this._voice({ send: 0.3, gain: 1.6 });
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        v.partials({ at: i * 0.055, f, partials: BELL, a: 0.002, d: 0.35, g: 0.1 });
      });
      v.noise({ filter: { type: 'highpass', f: 2000, to: 8000, time: 0.45 }, swell: true, a: 0.25, d: 0.2, g: 0.08 });
      v.partials({ at: 0.22, f: 1760, partials: [[1, 1, 1], [1.5, 0.5, 0.8], [2, 0.3, 0.6]], a: 0.005, d: 0.6, g: 0.06 });
      v.finish();
    }, 0.1);
  }

  // Round bell
  playGong() {
    this._run('gong', () => {
      const v = this._voice({ send: 0.45 });
      v.noise({ filter: { type: 'bandpass', f: 2500, Q: 1 }, a: 0.0005, d: 0.03, g: 0.2 });
      v.partials({ f: 196, partials: GONG, a: 0.002, d: 2.0, g: 0.15, spread: 0.004, drop: 0.985, dropTime: 1.5 });
      v.tone({ f: 98, a: 0.002, d: 1.2, g: 0.18 });
      v.finish();
    }, 0.1);
  }

  // Deep ominous gong (YOU DIED, fatality banners)
  playLowGong() {
    this._run('lowGong', () => {
      const v = this._voice({ send: 0.55 });
      v.noise({ color: 'pink', filter: { type: 'lowpass', f: 600 }, a: 0.001, d: 0.08, g: 0.4 });
      v.partials({ f: 55, partials: LOW_GONG, a: 0.003, d: 4.0, g: 0.2, drop: 0.97, dropTime: 3 });
      v.partials({ f: 55 * 1.004, partials: LOW_GONG.slice(1, 4), a: 0.003, d: 3.0, g: 0.08 });
      v.tone({ f: 41, swell: true, a: 0.3, d: 3.0, g: 0.3 });
      v.finish();
      this.duckMusic(0.5, 1.0, 2.0);
    }, 0.2);
  }

  // Bright glassy chime (stance break / parry)
  playParryChime() {
    this._run('parryChime', () => {
      const v = this._voice({ send: 0.35 });
      v.noise({ filter: { type: 'bandpass', f: 4000, Q: 3 }, a: 0.0005, d: 0.02, g: 0.28 });
      v.partials({ f: 1320, partials: [[1, 1, 1], [2.0, 0.5, 0.7], [2.76, 0.35, 0.5], [5.4, 0.15, 0.25]], a: 0.001, d: 0.7, g: 0.1 });
      v.partials({ at: 0.025, f: 1980, partials: [[1, 1, 1], [2.76, 0.3, 0.4]], a: 0.001, d: 0.6, g: 0.07 });
      v.noise({ filter: { type: 'highpass', f: 6000 }, a: 0.002, d: 0.25, g: 0.07 });
      v.finish();
    }, 0.05);
  }

  // ===== Signature fighters =====
  // TEMPO: metronome tick (accent on the downbeat)
  playBeatTick(accent = false) {
    this._run('beatTick', () => {
      const v = this._voice({ group: 'sfx', send: 0.05, gain: 0.7 });
      v.tone({ type: 'sine', f: accent ? 1760 : 1320, a: 0.001, d: 0.04, g: accent ? 0.12 : 0.07 });
      v.noise({ filter: { type: 'highpass', f: 7000 }, a: 0.0005, d: 0.02, g: accent ? 0.06 : 0.035 });
      if (accent) v.tone({ type: 'sine', f: 110, to: 55, time: 0.08, a: 0.001, d: 0.1, g: 0.18 });
      v.finish();
    }, 0.02);
  }

  // GLITCH: bit-crushed stutter
  playGlitch() {
    this._run('glitch', () => {
      const v = this._voice({ send: 0.1 });
      for (let i = 0; i < 5; i++) {
        v.tone({ at: i * 0.022, type: 'square', f: 300 + ((i * 397) % 900), a: 0.001, d: 0.018, g: 0.06 });
      }
      v.noise({ filter: { type: 'bandpass', f: 2400, Q: 6 }, a: 0.001, d: 0.09, g: 0.12 });
      v.finish();
    }, 0.04);
  }

  // ECHO: reversed shimmer
  playEcho() {
    this._run('echo', () => {
      const v = this._voice({ send: 0.45 });
      v.tone({ type: 'triangle', f: 660, to: 1320, time: 0.25, a: 0.18, d: 0.12, g: 0.07 });
      v.tone({ at: 0.06, type: 'sine', f: 990, to: 1980, time: 0.2, a: 0.14, d: 0.12, g: 0.05 });
      v.finish();
    }, 0.05);
  }

  // ECHO: tape rewind
  playRewind() {
    this._run('rewind', () => {
      const v = this._voice({ send: 0.2 });
      v.tone({ type: 'sawtooth', f: 900, to: 140, time: 0.45, a: 0.01, hold: 0.3, d: 0.15, g: 0.05, filter: { type: 'lowpass', f: 2200 } });
      v.noise({ filter: { type: 'bandpass', f: 1800, Q: 2 }, swell: true, a: 0.3, d: 0.15, g: 0.08 });
      v.finish();
    }, 0.1);
  }

  // ATLAS: stone grinding up out of the floor
  playWallRise() {
    this._run('wallRise', () => {
      const v = this._voice({ send: 0.15 });
      v.tone({ type: 'sine', f: 70, to: 45, time: 0.25, a: 0.005, d: 0.3, g: 0.35 });
      v.noise({ color: 'brown', filter: { type: 'lowpass', f: 700 }, a: 0.02, d: 0.28, g: 0.3 });
      v.finish();
    }, 0.06);
  }

  // ATLAS: ceiling slab impact
  playSlabCrash() {
    this._run('slabCrash', () => {
      const v = this._voice({ send: 0.35 });
      v.tone({ type: 'sine', f: 60, to: 28, time: 0.6, a: 0.002, d: 0.8, g: 0.6 });
      v.noise({ color: 'brown', filter: { type: 'lowpass', f: 1200 }, a: 0.002, d: 0.7, g: 0.5 });
      v.noise({ filter: { type: 'highpass', f: 3000 }, a: 0.001, d: 0.25, g: 0.12 });
      v.finish();
    }, 0.1);
  }

  // Kazuki: pocket gravel / sand toss
  playPocketSand() {
    this._run('pocketSand', () => {
      const v = this._voice({ send: 0.1, gain: 1.5 });
      for (let i = 0; i < 16; i++) {
        v.noise({ at: rand(0, 0.3), filter: { type: 'bandpass', f: rand(2500, 7000), Q: 2 }, a: 0.001, d: rand(0.015, 0.04), g: rand(0.05, 0.12) });
      }
      v.noise({ filter: { type: 'bandpass', f: 1200, to: 4000, time: 0.2, Q: 1.2 }, a: 0.04, d: 0.2, g: 0.25 });
      v.tone({ f: 600, to: 180, time: 0.2, a: 0.002, d: 0.2, g: 0.08 });
      v.finish();
    }, 0.05);
  }

  // Raven: concealed taser shock
  playTaserShock() {
    this._run('taserShock', () => {
      const v = this._voice({ send: 0.12, gain: 1.6 });
      v.tone({ type: 'square', f: 120, drive: 5, am: { rate: 22, depth: 0.9, type: 'square' }, a: 0.005, hold: 0.25, d: 0.08, g: 0.11, filter: { type: 'bandpass', f: 1800, Q: 1 } });
      v.tone({ type: 'sawtooth', f: 183, drive: 5, am: { rate: 17, depth: 0.9, type: 'square' }, a: 0.005, hold: 0.25, d: 0.08, g: 0.1, filter: { type: 'bandpass', f: 2400, Q: 1 } });
      for (let i = 0; i < 10; i++) {
        v.noise({ at: rand(0, 0.32), filter: { type: 'highpass', f: 2500 }, a: 0.0005, d: 0.008, g: 0.15 });
      }
      for (const at of [0, 0.12, 0.24]) v.tone({ at, f: 3000, to: 700, time: 0.05, a: 0.001, d: 0.05, g: 0.07 });
      v.finish();
    }, 0.05);
  }

  // Kagura: caltrops & smoke powder
  playCaltrops() {
    this._run('caltrops', () => {
      const v = this._voice({ send: 0.2, gain: 1.4 });
      for (let i = 0; i < 7; i++) {
        v.partials({ at: rand(0, 0.25), f: rand(2000, 4800), partials: [[1, 1, 1], [1.53, 0.5, 0.6], [2.41, 0.3, 0.4]], a: 0.001, d: rand(0.08, 0.18), g: 0.05 });
      }
      v.noise({ filter: { type: 'highpass', f: 3000 }, a: 0.002, d: 0.2, g: 0.12 });
      v.noise({ filter: { type: 'bandpass', f: 3000, Q: 0.5 }, a: 0.05, d: 0.4, g: 0.1 });
      v.finish();
    }, 0.05);
  }

  // Arena crowd roar with scattered claps
  playCrowdCheer() {
    this._run('crowdCheer', () => {
      const v = this._voice({ group: 'crowd', send: 0.35 });
      for (const f of [450, 850, 1500, 2600]) {
        v.noise({ color: 'pink', filter: { type: 'bandpass', f: f * vary(1, 0.08), Q: 1.2 }, a: rand(0.15, 0.3), hold: 0.4, d: 0.7, g: 0.32, am: { rate: rand(3, 6), depth: 0.4 } });
      }
      for (let i = 0; i < 20; i++) {
        v.noise({ at: rand(0, 1.3), filter: { type: 'bandpass', f: rand(1100, 1900), Q: 1.5 }, a: 0.001, d: 0.02, g: rand(0.08, 0.16) });
      }
      v.finish();
    }, 0.2);
  }

  // ===========================================================================
  // Announcer
  // ===========================================================================

  // Deep dramatic voice line (speechSynthesis) + synthetic reverb stinger.
  playAnnouncer(call, opts = {}) {
    const key = String(call || '').toUpperCase().replace(/[\s-]+/g, '_');
    const line = ANNOUNCER_LINES[key] || { text: key.replace(/_/g, ' ').toLowerCase(), stinger: 'ROUND' };
    if (opts.speak !== false && line.text && !recentlySpoken(line.text)) {
      const vol = clamp(this.masterVolumeVal * this.sfxVolumeVal, 0, 1);
      speakLine(line.text, { pitch: line.pitch != null ? line.pitch : 0.45, rate: line.rate != null ? line.rate : 0.82, volume: vol });
    }
    this.playAnnouncerStinger(line.stinger, opts.delay || 0);
    if (line.fight) this.playAnnouncerStinger('FIGHT', (opts.delay || 0) + line.fight);
  }

  // Synthetic stinger only (used by Announcer.js). kind: ROUND, FINAL, FIGHT, FINISH,
  // KO, WIN, TIME, FATALITY, FELLED, GOD, DIED. delay in seconds.
  playAnnouncerStinger(kind = 'ROUND', delay = 0) {
    const k = String(kind || 'ROUND').toUpperCase();
    this._run('stinger:' + k, () => {
      const at = Math.max(0, delay);
      const v = this._voice({ send: 0.5, at });
      switch (k) {
        case 'FINAL':
          this._boom(v, 0, 0.8);
          this._boom(v, 0.32, 0.9, 0.85);
          v.partials({ f: 73.4, partials: LOW_GONG, a: 0.003, d: 2.5, g: 0.12 });
          break;
        case 'FIGHT':
          v.noise({ filter: { type: 'highpass', f: 1800 }, a: 0.0005, d: 0.025, g: 0.5 });
          v.tone({ f: 110, to: 35, time: 0.6, a: 0.001, d: 0.9, g: 0.85, drive: 1.3 });
          v.noise({ filter: { type: 'bandpass', f: 1200, to: 300, time: 0.5, Q: 0.9 }, a: 0.002, d: 0.5, g: 0.45 });
          v.noise({ filter: { type: 'highpass', f: 3000 }, a: 0.003, d: 1.4, g: 0.15 });
          v.partials({ f: 196, partials: GONG, a: 0.002, d: 1.6, g: 0.07 });
          break;
        case 'FINISH':
          v.partials({ f: 55, partials: LOW_GONG, a: 0.003, d: 3.0, g: 0.16 });
          v.tone({ f: 45, swell: true, a: 0.6, d: 1.5, g: 0.35 });
          v.noise({ color: 'brown', filter: { type: 'lowpass', f: 220 }, am: { rate: 6, depth: 0.5 }, a: 0.2, d: 1.8, g: 0.5 });
          this._boom(v, 0, 0.7);
          break;
        case 'KO':
          this._koLayers(v, 0, 1);
          break;
        case 'WIN':
          this._boom(v, 0, 0.5);
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => v.partials({ at: i * 0.05, f, partials: BELL, a: 0.003, d: 1.6, g: 0.07 }));
          this._sparkle(v, 0.1, 0.9, 10);
          break;
        case 'TIME':
          this._boom(v, 0, 0.7);
          this._boom(v, 0.35, 0.6, 0.8);
          v.tone({ type: 'triangle', f: 330, to: 110, time: 0.8, a: 0.01, d: 0.9, g: 0.08 });
          break;
        case 'FATALITY':
          this._boom(v, 0, 1);
          v.partials({ f: 49, partials: LOW_GONG, a: 0.003, d: 3.5, g: 0.16 });
          v.noise({ color: 'brown', filter: { type: 'lowpass', f: 200 }, am: { rate: 9, depth: 0.6 }, a: 0.05, d: 2.4, g: 0.55 });
          break;
        case 'FELLED':
        case 'GOD': {
          const big = k === 'GOD';
          this._boom(v, 0, big ? 1 : 0.75);
          const root = big ? 110 : 146.83;
          for (const r of [1, 1.5, 2, 2.52]) {
            for (const det of [-9, 9]) {
              v.tone({ type: 'sawtooth', f: root * r, detune: det, a: 0.6, hold: 0.8, d: 1.6, g: 0.022, filters: [{ type: 'lowpass', f: 1400 }, { type: 'peaking', f: 650, Q: 2, gain: 6 }] });
            }
          }
          v.partials({ at: 0.05, f: root * 4, partials: BELL, a: 0.004, d: 2.2, g: 0.05 });
          break;
        }
        case 'DIED':
          v.tone({ f: 41, swell: true, a: 0.8, d: 2.5, g: 0.3 });
          v.noise({ color: 'brown', filter: { type: 'lowpass', f: 160 }, a: 0.6, d: 2.5, g: 0.35 });
          break;
        case 'ROUND':
        default:
          this._boom(v, 0, 0.8);
          v.noise({ filter: { type: 'bandpass', f: 4000, Q: 1 }, a: 0.003, d: 0.5, g: 0.1 });
          v.partials({ f: 880, partials: METAL, a: 0.002, d: 1.2, g: 0.035 });
          break;
      }
      v.finish();
      if (k === 'KO' || k === 'FATALITY' || k === 'GOD') this.duckMusic(0.35, 1.0, 1.5);
    }, 0.3);
  }

  // Cinematic boom (transient + sub drop + dark noise body)
  _boom(v, at = 0, g = 1, pitch = 1) {
    v.noise({ at, filter: { type: 'highpass', f: 1500 }, a: 0.0005, d: 0.02, g: 0.4 * g });
    v.tone({ at, f: 80 * pitch, to: 32 * pitch, time: 0.7, a: 0.001, d: 1.2, g: 0.85 * g, drive: 1.2 });
    v.noise({ at, color: 'brown', filter: { type: 'lowpass', f: 320 }, a: 0.002, d: 0.9, g: 0.5 * g });
  }

  // ===========================================================================
  // Music
  // ===========================================================================
  getMusicTracks() {
    return Object.keys(MUSIC_TRACKS);
  }

  // track: 'menu' | 'fight' | 'boss' | 'victory' (unknown names map to 'fight')
  startMusic(track = 'fight') {
    this.ensureContext();
    if (this.musicPlaying) this.stopMusic();
    if (!this.ctx) return;
    if (this.musicGain) {
      try {
        const now = this.ctx.currentTime;
        const targetGain = (this.musicVolumeVal !== undefined ? this.musicVolumeVal : 0.7) * 0.45;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(targetGain, now);
      } catch (e) {}
    }
    const name = resolveTrackName(track);
    this.currentTrack = name;
    this.tempo = MUSIC_TRACKS[name].bpm;
    this.step = 0;
    let ok = false;
    try { ok = this.music.start(name); } catch (e) { ok = false; }
    this.musicPlaying = !!ok;
    this.musicTimer = this.music.timer;
  }

  stopMusic() {
    this.musicPlaying = false;
    try { this.music.stop(0.25); } catch (e) {}
    this.musicTimer = null;
  }

  // Schedules one 16th-note step of the current track at audio time `time`.
  playMusicStep(step, time) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const track = MUSIC_TRACKS[this.currentTrack] || MUSIC_TRACKS.fight;
      this.music.scheduleStep(step, time != null ? time : this.ctx.currentTime, track);
    } catch (e) {}
  }
}

export { SoundFX };
export const soundFX = new SoundFX();
