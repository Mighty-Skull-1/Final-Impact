// Final Impact - Procedural Music Engine
// Look-ahead scheduler (setInterval ~25ms + AudioContext clock) driving a small
// synth band: kick / snare / hats / ride / toms, bass, pad, arp and lead.
// Tracks are pure data (MusicTracks.js). Output goes:
//   note voices -> session gain (per startMusic, used for fades) -> fx.musicDuck -> fx.musicGain
//   + sends to fx.musicVerbIn (shared convolution reverb) and fx.musicEchoIn (tempo delay)

import { SoundVoice, midiToFreq, setP, linP, cancelP, safeDisconnect, rand } from './AudioCore.js';
import { MUSIC_TRACKS, resolveTrackName } from './MusicTracks.js';

const LOOKAHEAD = 0.12;        // seconds scheduled ahead while the tab is visible
const LOOKAHEAD_HIDDEN = 1.2;  // background tabs clamp timers to ~1s
const TICK_MS = 25;

export class MusicEngine {
  constructor(fx) {
    this.fx = fx;
    this.track = null;
    this.trackName = 'fight';
    this.playing = false;
    this.timer = null;
    this.step = 0;
    this.nextTime = 0;
    this.session = null;
    this.scriptIndex = null;
  }

  get ctx() { return this.fx.ctx; }
  noiseBuffer(color) { return this.fx.noiseBuffer(color); }

  static trackNames() { return Object.keys(MUSIC_TRACKS); }

  stepDuration(track = this.track) {
    return 60 / ((track && track.bpm) || 140) / 4;
  }

  start(name = 'fight') {
    const ctx = this.ctx;
    if (!ctx) return false;
    this.stop(0.35);
    const resolved = resolveTrackName(name);
    this.track = MUSIC_TRACKS[resolved];
    this.trackName = resolved;
    this.step = 0;
    this.scriptIndex = this._indexScript(this.track);

    // Fresh session bus so the previous track can fade out independently
    const now = ctx.currentTime;
    const session = ctx.createGain();
    const fadeIn = resolved === 'menu' ? 1.2 : 0.04;
    setP(session.gain, 0.0001, now);
    linP(session.gain, this.track.level || 1, now + fadeIn);
    session.connect(this.fx.musicDuck || this.fx.musicGain);
    this.session = session;

    // Tempo-synced echo (dotted 8th)
    if (this.fx.musicEchoDelay) {
      const dotted8 = this.stepDuration() * 3;
      setP(this.fx.musicEchoDelay.delayTime, Math.min(1.9, dotted8), now);
    }

    this.nextTime = now + 0.08;
    this.playing = true;
    this._tick();
    if (typeof setInterval === 'function') {
      this.timer = setInterval(() => this._tick(), TICK_MS);
      if (this.timer && typeof this.timer.unref === 'function') this.timer.unref();
    }
    return true;
  }

  stop(fade = 0.25) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.playing = false;
    const session = this.session;
    this.session = null;
    const ctx = this.ctx;
    if (session && ctx) {
      try {
        const now = ctx.currentTime;
        cancelP(session.gain, now);
        setP(session.gain, session.gain.value, now);
        linP(session.gain, 0, now + Math.max(0.02, fade));
      } catch (e) {}
      const ms = (Math.max(0.02, fade) + LOOKAHEAD_HIDDEN + 0.2) * 1000;
      if (typeof setTimeout === 'function') {
        const t = setTimeout(() => safeDisconnect(session), ms);
        if (t && typeof t.unref === 'function') t.unref();
      }
    }
  }

  _indexScript(track) {
    if (!track || !track.script) return null;
    const map = new Map();
    for (const ev of track.script) {
      const key = ev[0] * 16 + ev[1];
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }

  _totalSteps(track = this.track) {
    return track ? track.bars * 16 : 0;
  }

  _tick() {
    if (!this.playing || !this.ctx || !this.track) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const hidden = typeof document !== 'undefined' && document && document.hidden;
    const ahead = hidden ? LOOKAHEAD_HIDDEN : LOOKAHEAD;
    // After a long stall (throttled tab, debugger), skip forward rather than burst
    if (this.nextTime < now - 0.1) this.nextTime = now + 0.03;
    const stepDur = this.stepDuration();
    let guard = 0;
    while (this.nextTime < now + ahead && guard++ < 256) {
      if (!this.track.loop && this.step >= this._totalSteps()) {
        this._finishOneShot();
        return;
      }
      try { this.scheduleStep(this.step, this.nextTime); } catch (e) {}
      this.step++;
      this.nextTime += stepDur;
    }
  }

  _finishOneShot() {
    const tail = (this.track && this.track.tailSeconds) || 2;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.playing = false;
    const session = this.session;
    this.session = null;
    const done = () => {
      safeDisconnect(session);
      if (!this.playing && this.fx) this.fx.musicPlaying = this.fx.music && this.fx.music.playing;
    };
    if (typeof setTimeout === 'function') {
      const t = setTimeout(done, (tail + 0.3) * 1000);
      if (t && typeof t.unref === 'function') t.unref();
    }
  }

  _section(bar) {
    const tr = this.track;
    const secs = tr.sections || [{}];
    return secs[Math.floor(bar / (tr.sectionBars || 8)) % secs.length] || {};
  }

  _voice(time, opts = {}) {
    const ctx = this.ctx;
    return new SoundVoice(this, {
      bus: this.session || this.fx.musicDuck || this.fx.musicGain,
      verb: this.fx.musicVerbIn,
      echo: this.fx.musicEchoIn,
      at: time - ctx.currentTime,
      ...opts
    });
  }

  // Schedules every event of one 16th-note step at audio time `time`.
  scheduleStep(step, time, track = this.track) {
    if (!track || !this.ctx) return;
    const prevTrack = this.track;
    this.track = track;
    try {
      const bar = Math.floor(step / 16);
      const s = step % 16;
      const loopBar = track.loop ? bar % track.bars : bar;
      const sec = this._section(bar);
      const prog = track.progression || [];
      const chord = prog.length ? prog[loopBar % prog.length] : null;
      const sd = this.stepDuration(track);

      // --- Drums ---
      if (sec.drums && track.drums) {
        const fillBar = track.fill && (loopBar % track.fill.every) === track.fill.every - 1;
        const hit = (name) => {
          let p = (fillBar && track.fill[name]) || track.drums[name];
          if (!p) return '.';
          if (Array.isArray(p)) p = p[bar % p.length];
          return p[s] || '.';
        };
        const vel = (c) => (c === 'x' ? 1 : c === 'o' ? 0.45 : 0);
        const k = vel(hit('kick'));
        if (k) this.kick(time, k, track.name);
        const sn = vel(hit('snare'));
        if (sn) this.snare(time, fillBar && s >= 12 ? sn * (0.6 + (s - 12) * 0.13) : sn, track.name);
        const h = vel(hit('hat'));
        if (h) this.hat(time, h, false);
        const oh = vel(hit('ohat'));
        if (oh) this.hat(time, oh, true);
        const rd = vel(hit('ride'));
        if (rd) this.ride(time, rd);
      }
      if (s === 0 && sec.crash && loopBar % (track.sectionBars || 8) === 0) this.crash(time, 0.7);
      if (s === 0 && sec.taiko && loopBar % 4 === 0) this.taiko(time, 1);

      // --- Bass ---
      if (track.bass && chord) {
        const off = track.bass.pattern[s];
        if (off !== null && off !== undefined) {
          const lenSteps = (track.bass.lens && track.bass.lens[s]) || track.bass.len || 1.5;
          this.bass(time, chord.bass + off, lenSteps * sd, track.bass.style);
        }
      }

      // --- Pad (once per bar) ---
      if (s === 0 && sec.pad && track.pad && chord) {
        this.pad(time, chord.pad, sd * 16, track.pad.style, track.pad.level || 1);
      }

      // --- Arp ---
      if (sec.arp && track.arp && chord) {
        const idx = track.arp.pattern[s];
        if (idx !== null && idx !== undefined) {
          const notes = chord.pad;
          this.arp(time, notes[idx % notes.length] + (track.arp.octave || 12), sd * 0.9);
        }
      }

      // --- Lead ---
      if (sec.lead && track.lead && track.lead.phrases && track.lead.phrases.length) {
        const phrase = track.lead.phrases[loopBar % track.lead.phrases.length];
        for (const [st, note, len] of phrase) {
          if (st === s) this.lead(time, note, len * sd, track.lead.style);
        }
      }

      // --- Scripted events ---
      if (this.scriptIndex && track === prevTrack) {
        const evs = this.scriptIndex.get(step);
        if (evs) for (const ev of evs) this._scriptEvent(ev, time, sd);
      } else if (track.script) {
        for (const ev of track.script) if (ev[0] * 16 + ev[1] === step) this._scriptEvent(ev, time, sd);
      }
    } finally {
      this.track = prevTrack;
    }
  }

  _scriptEvent(ev, time, sd) {
    const kind = ev[2];
    switch (kind) {
      case 'brass': this.brass(time, ev[3], ev[4] * sd); break;
      case 'lead': this.lead(time, ev[3], ev[4] * sd, 'brass'); break;
      case 'bass': this.bass(time, ev[3], ev[4] * sd, 'soft'); break;
      case 'kick': this.kick(time, ev[3] || 1, 'victory'); break;
      case 'snare': this.snare(time, ev[3] || 1, 'victory'); break;
      case 'crash': this.crash(time, ev[3] || 1); break;
      case 'timpani': this.timpani(time, ev[3] || 1); break;
    }
  }

  // ---------------------------------------------------------------------------
  // Instruments
  // ---------------------------------------------------------------------------
  kick(t, v = 1, style = 'fight') {
    const heavy = style === 'boss';
    const vo = this._voice(t, { gain: v });
    vo.tone({ f: heavy ? 130 : 160, path: [[0.03, heavy ? 62 : 75], [0.14, heavy ? 40 : 46]], a: 0.001, d: heavy ? 0.45 : 0.3, g: 0.95, drive: heavy ? 1.8 : 0 });
    vo.noise({ filter: { type: 'highpass', f: 2800 }, a: 0.0005, d: 0.012, g: 0.22 });
    vo.finish();
  }

  snare(t, v = 1, style = 'fight') {
    const vo = this._voice(t, { gain: v, send: style === 'boss' ? 0.55 : 0.22 });
    vo.tone({ type: 'triangle', f: 230, to: 165, time: 0.08, a: 0.001, d: 0.11, g: 0.32 });
    vo.noise({ filter: { type: 'bandpass', f: 1900, Q: 0.7 }, a: 0.001, d: style === 'boss' ? 0.28 : 0.17, g: 0.5 });
    vo.noise({ filter: { type: 'highpass', f: 5200 }, a: 0.001, d: 0.07, g: 0.18 });
    vo.finish();
  }

  hat(t, v = 1, open = false) {
    const vo = this._voice(t, { gain: v, pan: rand(-0.25, 0.25) });
    vo.noise({ filter: { type: 'highpass', f: 7200 }, a: 0.0008, d: open ? 0.22 : 0.035, g: open ? 0.16 : 0.13 });
    vo.finish();
  }

  ride(t, v = 1) {
    const vo = this._voice(t, { gain: v, pan: 0.2, send: 0.15 });
    vo.noise({ filter: { type: 'highpass', f: 5200 }, a: 0.001, d: 0.3, g: 0.07 });
    vo.partials({ f: 3150, partials: [[1, 1, 1], [1.37, 0.6, 0.8], [2.11, 0.4, 0.6]], a: 0.001, d: 0.35, g: 0.012 });
    vo.finish();
  }

  crash(t, v = 1) {
    const vo = this._voice(t, { gain: v, send: 0.3 });
    vo.noise({ filter: { type: 'highpass', f: 3600 }, a: 0.002, d: 1.8, g: 0.17 });
    vo.noise({ filter: { type: 'bandpass', f: 6500, Q: 0.6 }, a: 0.002, d: 0.9, g: 0.1 });
    vo.finish();
  }

  taiko(t, v = 1) {
    const vo = this._voice(t, { gain: v, send: 0.45 });
    vo.tone({ f: 95, to: 46, time: 0.25, a: 0.002, d: 0.9, g: 0.75 });
    vo.noise({ color: 'brown', filter: { type: 'lowpass', f: 380 }, a: 0.001, d: 0.18, g: 0.6 });
    vo.noise({ filter: { type: 'bandpass', f: 1200, Q: 1 }, a: 0.0005, d: 0.02, g: 0.2 });
    vo.finish();
  }

  timpani(t, v = 1) {
    const vo = this._voice(t, { gain: v, send: 0.35 });
    vo.tone({ f: 98 * 1.04, to: 98, time: 0.05, a: 0.002, d: 0.7, g: 0.55 });
    vo.tone({ f: 98 * 1.5, a: 0.002, d: 0.35, g: 0.15 });
    vo.noise({ color: 'pink', filter: { type: 'lowpass', f: 700 }, a: 0.001, d: 0.06, g: 0.35 });
    vo.finish();
  }

  bass(t, midi, dur, style = 'drive') {
    const f = midiToFreq(midi);
    if (style === 'heavy') {
      const vo = this._voice(t, { gain: 0.8 });
      const env = { a: 0.004, hold: dur * 0.55, d: Math.max(0.06, dur * 0.6) };
      const bus = vo.filterBus({ type: 'lowpass', f: 1100, to: 380, time: dur, Q: 2 });
      vo.tone({ type: 'sawtooth', f, detune: -9, ...env, g: 0.28, drive: 3, dest: bus });
      vo.tone({ type: 'sawtooth', f, detune: 9, ...env, g: 0.28, drive: 3, dest: bus });
      vo.tone({ type: 'sine', f: f / 2, ...env, g: 0.45 });
      vo.finish();
    } else if (style === 'soft') {
      const vo = this._voice(t, { gain: 0.8 });
      vo.tone({ type: 'sine', f, a: 0.02, hold: dur * 0.7, d: Math.max(0.2, dur * 0.4), g: 0.55 });
      vo.tone({ type: 'triangle', f: f * 2, a: 0.02, hold: dur * 0.5, d: dur * 0.4, g: 0.12, filter: { type: 'lowpass', f: 700 } });
      vo.finish();
    } else {
      const vo = this._voice(t, { gain: 0.8 });
      const env = { a: 0.003, hold: dur * 0.5, d: Math.max(0.07, dur * 0.6) };
      vo.tone({ type: 'sawtooth', f, ...env, g: 0.32, filter: { type: 'lowpass', f: 2400, path: [[0.02, 1400], [Math.max(0.05, dur), 320]], Q: 5 } });
      vo.tone({ type: 'square', f: f / 2, ...env, g: 0.2, filter: { type: 'lowpass', f: 300 } });
      vo.finish();
    }
  }

  pad(t, notes, dur, style = 'saw', level = 1) {
    const choir = style === 'choir';
    const warm = style === 'warm';
    const vo = this._voice(t, { gain: level, send: warm ? 0.65 : 0.5 });
    const a = warm ? 1.1 : choir ? 0.7 : 0.35;
    const env = { a, hold: Math.max(0.05, dur - a - 0.15), d: warm ? 1.4 : 0.9 };
    const cutoff = warm ? 900 : choir ? 1300 : 1500;
    // One shared filter chain for the whole chord (CPU)
    let bus;
    if (choir) {
      const formant = vo.filterBus({ type: 'peaking', f: 700, Q: 2, gain: 6 });
      bus = vo._filter(null, { type: 'lowpass', f: cutoff }, vo.t);
      bus.connect(formant);
    } else {
      bus = vo.filterBus({ type: 'lowpass', f: cutoff * 0.7, to: cutoff, time: dur * 0.6 });
    }
    for (const n of notes) {
      const f = midiToFreq(n);
      for (const det of [-8, 8]) {
        vo.tone({ type: 'sawtooth', f, detune: det, ...env, g: warm ? 0.03 : 0.026, dest: bus });
      }
    }
    if (choir || warm) vo.tone({ type: 'sine', f: midiToFreq(notes[0] - 12), ...env, g: 0.08 });
    vo.finish();
  }

  arp(t, midi, dur) {
    const vo = this._voice(t, { gain: 1, echoSend: 0.3, send: 0.12, pan: rand(-0.35, 0.35) });
    vo.tone({ type: 'square', f: midiToFreq(midi), a: 0.002, d: Math.max(0.08, dur * 1.2), g: 0.045, filter: { type: 'lowpass', f: 2600, to: 700, time: 0.12 } });
    vo.finish();
  }

  lead(t, midi, dur, style = 'square') {
    const f = midiToFreq(midi);
    if (style === 'bell') {
      const vo = this._voice(t, { gain: 1, send: 0.45, echoSend: 0.35 });
      vo.partials({ f, partials: [[1, 1, 1], [2, 0.32, 0.6], [3.01, 0.14, 0.4], [4.2, 0.06, 0.25]], a: 0.004, d: Math.max(1.1, dur), g: 0.13 });
      vo.finish();
      return;
    }
    if (style === 'dark') {
      const vo = this._voice(t, { gain: 1, send: 0.45, echoSend: 0.15 });
      const env = { a: 0.09, hold: Math.max(0.05, dur * 0.7), d: Math.max(0.25, dur * 0.4) };
      const bus = vo.filterBus({ type: 'lowpass', f: 1500, Q: 1.5 });
      for (const det of [-12, 12]) {
        vo.tone({ type: 'sawtooth', f, detune: det, ...env, g: 0.055, vib: { rate: 5, depth: f * 0.01, delay: 0.25 }, dest: bus });
      }
      vo.tone({ type: 'sine', f: f / 2, ...env, g: 0.05 });
      vo.finish();
      return;
    }
    if (style === 'brass') {
      const vo = this._voice(t, { gain: 1, send: 0.35, echoSend: 0.1 });
      const env = { a: 0.025, hold: Math.max(0.03, dur * 0.75), d: Math.max(0.18, dur * 0.35) };
      const bus = vo.filterBus({ type: 'lowpass', f: 600, path: [[0.04, 3600], [0.35, 2000]], Q: 1.2 });
      for (const det of [-7, 0, 7]) {
        vo.tone({ type: 'sawtooth', f, detune: det, ...env, g: 0.05, vib: { rate: 5.5, depth: f * 0.008, delay: 0.2 }, dest: bus });
      }
      vo.finish();
      return;
    }
    // 'square' arcade lead
    const vo = this._voice(t, { gain: 1, send: 0.25, echoSend: 0.32 });
    const env = { a: 0.008, hold: Math.max(0.02, dur * 0.7), d: Math.max(0.1, dur * 0.35) };
    const bus = vo.filterBus({ type: 'lowpass', f: 3100, Q: 1 });
    vo.tone({ type: 'square', f, ...env, g: 0.07, vib: { rate: 6, depth: f * 0.012, delay: 0.12 }, dest: bus });
    vo.tone({ type: 'sawtooth', f, detune: 7, ...env, g: 0.05, vib: { rate: 6, depth: f * 0.012, delay: 0.12 }, dest: bus });
    vo.finish();
  }

  brass(t, notes, dur) {
    const vo = this._voice(t, { gain: 1, send: 0.35 });
    const env = { a: 0.03, hold: Math.max(0.03, dur * 0.8), d: Math.max(0.25, dur * 0.3) };
    const bus = vo.filterBus({ type: 'lowpass', f: 500, path: [[0.05, 2600], [0.4, 1500]], Q: 1 });
    for (const n of notes) {
      const f = midiToFreq(n);
      for (const det of [-6, 6]) {
        vo.tone({ type: 'sawtooth', f, detune: det, ...env, g: 0.028, dest: bus });
      }
    }
    vo.finish();
  }
}
