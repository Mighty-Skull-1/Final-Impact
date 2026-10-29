// Final Impact - Audio Core
// Low-level helpers shared by the SFX designer (SoundFX.js) and the procedural
// music engine (MusicEngine.js): guarded AudioParam automation, procedural
// noise / impulse-response / drive-curve generators, and the `SoundVoice`
// layer builder that owns every node of one sound and disconnects them when it ends.
//
// Every helper is defensive: Node test mocks implement only a tiny subset of
// Web Audio, so missing methods silently fall back or no-op.

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const vary = (v, pct) => v * (1 + (Math.random() * 2 - 1) * pct);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const SILENT = 0.0001;

// ---------------------------------------------------------------------------
// Guarded AudioParam automation
// ---------------------------------------------------------------------------
export function setP(p, v, t) {
  if (!p) return;
  if (typeof p.setValueAtTime === 'function') p.setValueAtTime(v, t);
  else if ('value' in p) p.value = v;
}

export function linP(p, v, t) {
  if (!p) return;
  if (typeof p.linearRampToValueAtTime === 'function') p.linearRampToValueAtTime(v, t);
  else setP(p, v, t);
}

export function expP(p, v, t) {
  if (!p) return;
  const val = Math.max(Math.abs(v), SILENT) * (v < 0 ? -1 : 1);
  if (typeof p.exponentialRampToValueAtTime === 'function') p.exponentialRampToValueAtTime(val, t);
  else linP(p, val, t);
}

export function cancelP(p, t) {
  if (p && typeof p.cancelScheduledValues === 'function') p.cancelScheduledValues(t);
}

export function safeDisconnect(node) {
  if (!node || typeof node.disconnect !== 'function') return;
  try { node.disconnect(); } catch (e) {}
}

// ---------------------------------------------------------------------------
// Procedural buffers
// ---------------------------------------------------------------------------
export function makeNoiseBuffer(ctx, seconds = 2, color = 'white') {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  const n = Math.min(len, data.length);
  if (color === 'pink') {
    // Paul Kellet's refined pink filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else if (color === 'brown') {
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  } else {
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  }
  // Short crossfade at the loop point so looping sources never click
  const fade = Math.min(256, Math.floor(n / 4));
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    data[n - fade + i] = data[n - fade + i] * (1 - k) + data[i] * k;
  }
  return buf;
}

// Stereo hall-ish impulse response: predelay, a handful of early reflections,
// then exponentially decaying noise whose high end is progressively damped.
export function makeImpulseResponse(ctx, seconds = 2.4, { predelay = 0.014, damping = 0.82, early = 6 } = {}) {
  const rate = ctx.sampleRate;
  const len = Math.max(1, Math.floor(rate * seconds));
  const ir = ctx.createBuffer(2, len, rate);
  const pre = Math.floor(predelay * rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    const n = Math.min(len, data.length);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      if (i < pre) { data[i] = 0; continue; }
      const t = (i - pre) / Math.max(1, n - pre);
      const env = Math.exp(-6.9 * t) * Math.min(1, (i - pre) / (rate * 0.006));
      const c = 1 - damping * Math.pow(t, 0.6); // HF damping grows over the tail
      lp += Math.max(0.04, c) * ((Math.random() * 2 - 1) - lp);
      data[i] = lp * env;
    }
    for (let e = 0; e < early; e++) {
      const idx = pre + Math.floor(rate * (0.008 + Math.random() * 0.075));
      if (idx < n) data[idx] += (Math.random() < 0.5 ? -1 : 1) * (0.55 - e * 0.06);
    }
  }
  return ir;
}

const curveCache = new Map();
export function driveCurve(amount = 4) {
  const key = Math.round(amount * 100);
  if (curveCache.has(key)) return curveCache.get(key);
  const n = 1024;
  const curve = new Float32Array(n);
  const norm = Math.tanh(amount);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * x) / norm;
  }
  curveCache.set(key, curve);
  return curve;
}

// Transparent below ~-1.5 dBFS, then a soft knee into a hard ceiling at 0.98.
export function softClipCurve() {
  const n = 4096;
  const curve = new Float32Array(n);
  const knee = 0.84, ceil = 0.98;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const ax = Math.abs(x);
    const y = ax <= knee ? ax : knee + (ceil - knee) * Math.tanh((ax - knee) / (ceil - knee));
    curve[i] = Math.sign(x) * y;
  }
  return curve;
}

// ---------------------------------------------------------------------------
// SoundVoice: one playable sound made of several layers.
// engine must expose: ctx, noiseBuffer(color), _registerVoice(v), _releaseVoice(v)
// ---------------------------------------------------------------------------
export class SoundVoice {
  constructor(engine, { bus, verb = null, send = 0, echo = null, echoSend = 0, gain = 1, pan = 0, at = 0, group = null, id = null } = {}) {
    const ctx = engine.ctx;
    this.engine = engine;
    this.ctx = ctx;
    this.group = group;
    this.id = id;
    this.t = ctx.currentTime + Math.max(0, at);
    this.end = this.t;
    this.sources = [];
    this.disposed = false;

    this.out = ctx.createGain();
    setP(this.out.gain, gain, ctx.currentTime);
    let tail = this.out;
    if (pan && typeof ctx.createStereoPanner === 'function') {
      this.panner = ctx.createStereoPanner();
      setP(this.panner.pan, clamp(pan, -1, 1), ctx.currentTime);
      this.out.connect(this.panner);
      tail = this.panner;
    }
    tail.connect(bus);
    if (send > 0 && verb) {
      this.send = ctx.createGain();
      setP(this.send.gain, send, ctx.currentTime);
      tail.connect(this.send);
      this.send.connect(verb);
    }
    if (echoSend > 0 && echo) {
      this.echo = ctx.createGain();
      setP(this.echo.gain, echoSend, ctx.currentTime);
      tail.connect(this.echo);
      this.echo.connect(echo);
    }
  }

  panSweep(from, to, dur, at = 0) {
    if (!this.panner) return;
    const t = this.t + at;
    setP(this.panner.pan, clamp(from, -1, 1), t);
    linP(this.panner.pan, clamp(to, -1, 1), t + dur);
  }

  _filter(input, f, t) {
    const bq = this.ctx.createBiquadFilter();
    bq.type = f.type || 'lowpass';
    setP(bq.frequency, clamp(f.f, 10, 20000), t);
    if (f.Q != null) setP(bq.Q, f.Q, t);
    if (f.gain != null && bq.gain) setP(bq.gain, f.gain, t);
    if (f.path) {
      for (const [dt, fr] of f.path) expP(bq.frequency, clamp(fr, 10, 20000), t + dt);
    } else if (f.to) {
      expP(bq.frequency, clamp(f.to, 10, 20000), t + (f.time != null ? f.time : 0.1));
    }
    if (input) input.connect(bq);
    return bq;
  }

  // Shared filter feeding the voice output: pass the returned node as `dest`
  // to several layers so they share one biquad (cheaper than one per layer).
  filterBus(f, at = 0) {
    const bq = this._filter(null, f, this.t + at);
    bq.connect(this.out);
    return bq;
  }

  // Routes a source through filters / drive / AM into an enveloped gain.
  // Envelope options: at, a (attack), hold, d (decay), g (peak), swell (exp attack), lin (linear decay)
  _env(src, o) {
    const ctx = this.ctx;
    const t = this.t + (o.at || 0);
    let node = src;
    const filters = o.filters || (o.filter ? [o.filter] : []);
    for (const f of filters) node = this._filter(node, f, t);
    if (o.drive && typeof ctx.createWaveShaper === 'function') {
      const ws = ctx.createWaveShaper();
      ws.curve = driveCurve(o.drive);
      node.connect(ws);
      node = ws;
    }
    const a = o.a != null ? o.a : 0.002;
    const hold = o.hold || 0;
    const d = o.d != null ? o.d : 0.12;
    const peak = o.g != null ? o.g : 0.5;
    const stopAt = t + a + hold + d + 0.03;

    if (o.am && o.am.depth > 0) {
      const amp = ctx.createGain();
      const depth = clamp(o.am.depth, 0, 0.95);
      setP(amp.gain, 1 - depth / 2, t);
      const lfo = ctx.createOscillator();
      lfo.type = o.am.type || 'sine';
      setP(lfo.frequency, o.am.rate || 8, t);
      if (o.am.to) expP(lfo.frequency, o.am.to, t + a + hold + d);
      const lg = ctx.createGain();
      setP(lg.gain, depth / 2, t);
      lfo.connect(lg);
      lg.connect(amp.gain);
      lfo.start(t);
      lfo.stop(stopAt);
      this._track(lfo, stopAt);
      node.connect(amp);
      node = amp;
    }

    const g = ctx.createGain();
    setP(g.gain, SILENT, t);
    if (o.swell) expP(g.gain, peak, t + a);
    else linP(g.gain, peak, t + a);
    if (hold > 0) linP(g.gain, peak, t + a + hold);
    if (o.lin) linP(g.gain, 0, t + a + hold + d);
    else expP(g.gain, SILENT, t + a + hold + d);
    node.connect(g);
    g.connect(o.dest || this.out);
    return { gain: g, t, stopAt };
  }

  // Oscillator layer. f, to/time or path [[dt, freq]...], vib {rate, depth(Hz), delay}
  tone(o) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    const env = this._env(osc, o);
    const t = env.t;
    setP(osc.frequency, clamp(o.f, 1, 20000), t);
    if (o.path) {
      for (const [dt, fr] of o.path) expP(osc.frequency, clamp(fr, 1, 20000), t + dt);
    } else if (o.to) {
      expP(osc.frequency, clamp(o.to, 1, 20000), t + (o.time != null ? o.time : (o.d || 0.1)));
    }
    if (o.detune && osc.detune) setP(osc.detune, o.detune, t);
    if (o.vib && o.vib.depth) {
      const lfo = ctx.createOscillator();
      setP(lfo.frequency, o.vib.rate || 5.5, t);
      const lg = ctx.createGain();
      const vt = t + (o.vib.delay || 0);
      setP(lg.gain, 0, t);
      setP(lg.gain, 0, vt);
      linP(lg.gain, o.vib.depth, vt + (o.vib.ramp || 0.12));
      lfo.connect(lg);
      lg.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(env.stopAt);
      this._track(lfo, env.stopAt);
    }
    osc.start(t);
    osc.stop(env.stopAt);
    this._track(osc, env.stopAt);
    return env;
  }

  // Noise layer. color: white|pink|brown, rate: playbackRate
  noise(o) {
    const ctx = this.ctx;
    const buf = this.engine.noiseBuffer(o.color || 'white');
    if (!buf) return null;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const env = this._env(src, o);
    if (o.rate && src.playbackRate) setP(src.playbackRate, o.rate, env.t);
    src.start(env.t, Math.random() * 1.5);
    src.stop(env.stopAt);
    this._track(src, env.stopAt);
    return env;
  }

  // Sample layer (used when real samples are registered)
  sample(o) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = o.buffer;
    const dur = (o.buffer && o.buffer.duration) ? o.buffer.duration / (o.rate || 1) : 1;
    const env = this._env(src, { a: 0.001, hold: Math.max(0, dur - 0.05), d: 0.05, ...o });
    if (o.rate && src.playbackRate) setP(src.playbackRate, o.rate, env.t);
    src.start(env.t);
    src.stop(env.stopAt);
    this._track(src, env.stopAt);
    return env;
  }

  // Inharmonic / harmonic partial stack (bells, gongs, metal rings, chimes)
  partials(o) {
    const list = o.partials || [[1, 1, 1]];
    for (const [ratio, pg, pd] of list) {
      this.tone({
        type: o.type || 'sine',
        f: o.f * ratio * (o.spread ? vary(1, o.spread) : 1),
        to: o.drop ? o.f * ratio * o.drop : undefined,
        time: o.dropTime,
        at: o.at,
        a: o.a != null ? o.a : 0.002,
        d: (o.d || 0.5) * (pd != null ? pd : 1),
        g: (o.g || 0.2) * (pg != null ? pg : 1),
        dest: o.dest
      });
    }
  }

  _track(src, stopAt) {
    this.sources.push(src);
    if (stopAt > this.end) {
      this.end = stopAt;
      this.last = src;
    }
  }

  // Must be called once all layers are added: wires up automatic cleanup.
  finish() {
    if (this.last) {
      const self = this;
      try { this.last.onended = () => self.dispose(); } catch (e) {}
    }
    if (this.engine && typeof this.engine._registerVoice === 'function') this.engine._registerVoice(this);
    return this;
  }

  // Fast fade-out used for voice stealing
  kill(fade = 0.025) {
    if (this.disposed) return;
    try {
      const now = this.ctx.currentTime;
      cancelP(this.out.gain, now);
      setP(this.out.gain, this.out.gain.value, now);
      linP(this.out.gain, 0, now + fade);
      for (const s of this.sources) {
        try { s.stop(now + fade + 0.01); } catch (e) {}
      }
    } catch (e) {}
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    safeDisconnect(this.out);
    safeDisconnect(this.panner);
    safeDisconnect(this.send);
    safeDisconnect(this.echo);
    this.sources.length = 0;
    if (this.engine && typeof this.engine._releaseVoice === 'function') this.engine._releaseVoice(this);
  }
}
