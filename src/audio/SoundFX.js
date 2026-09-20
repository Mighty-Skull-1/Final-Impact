// Final Impact - Web Audio Retro Sound & Music Synthesizer
// 100% procedural 16-bit arcade audio engine

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.tempo = 138;
    this.step = 0;
    this.currentTrack = 'fight';
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Master Dynamics Compressor / Limiter (Prevents audio clipping, popping & crackling)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.68, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Pre-generate reusable 2-second white noise buffer (eliminates GC pauses & crackling)
      const noiseLen = this.ctx.sampleRate * 2;
      this.sharedNoiseBuffer = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
      const data = this.sharedNoiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Warm up
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, val * 0.45)), this.ctx.currentTime);
    }
  }

  setSFXVolume(val) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, val * 0.9)), this.ctx.currentTime);
    }
  }

  // Retro Arcade Menu Confirm / Select Chime
  playMenuSelect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.06); // E5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, now); // C6
    osc2.frequency.setValueAtTime(1318.5, now + 0.06); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  // Quick Snappy Dash Whoosh
  playDash() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Naruto Shadow Clone "POOF" Sound
  playClonePoof() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Low pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Smoke hiss
    this.playNoiseCrack(0.2, 1600, 0.45);
  }

  // Naruto Anime Ultimate Secret Technique (Ougi) Activation Sound
  playUltimateActivation() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub Bass Drop (Earth-shattering charge)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(260, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // Resonant Anime Charging Shimmer (Rasengan/Ki hum)
    const shimmer = this.ctx.createOscillator();
    const shimGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    shimmer.type = 'sawtooth';
    shimmer.frequency.setValueAtTime(440, now);
    shimmer.frequency.exponentialRampToValueAtTime(1760, now + 0.5);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(6.0, now);

    shimGain.gain.setValueAtTime(0.01, now);
    shimGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
    shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    shimmer.connect(filter);
    filter.connect(shimGain);
    shimGain.connect(this.sfxGain);
    shimmer.start(now);
    shimmer.stop(now + 0.7);
  }

  // Huge Ultimate Finisher Detonation
  playUltimateFinisher() {
    if (!this.ctx) return;
    this.playHitHeavy();
    setTimeout(() => this.playKO(), 120);
  }

  // --- Sound Effects ---

  // Light Attack Swing Whoosh
  playWhoosh(type = 'light') {
    if (!this.ctx || !this.sharedNoiseBuffer) return;
    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.sharedNoiseBuffer;
    noise.loop = true;

    filter.type = 'bandpass';
    const startFreq = type === 'heavy' ? 700 : 1200;
    const endFreq = type === 'heavy' ? 250 : 400;
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(type === 'heavy' ? 0.30 : 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.12);
  }

  // Hit Impact (Light)
  playHitLight() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Punch snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);

    // Crack transient
    this.playNoiseCrack(0.05, 1400, 0.25);
  }

  // Hit Impact (Heavy) - Bone crushing street fighter impact
  playHitHeavy() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);

    // Crunch transient
    this.playNoiseCrack(0.12, 800, 0.45);
  }

  playHitConfirm(type = 'light') {
    if (type === 'heavy') this.playHitHeavy();
    else this.playHitLight();
  }

  // Block Guard (Metallic Clink)
  playBlock() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(660, now + 0.09);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.09);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  }

  // Fireball (Hadouken) Cast
  playHadouken() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);

    this.playNoiseCrack(0.25, 1200, 0.35);
  }

  // Dragon Punch / Shoryuken Roar
  playShoryuken() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Sonic Blade / Projectile release
  playSonicBlade() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Flash Somersault
  playFlashKick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
    this.playNoiseCrack(0.2, 1600, 0.3);
  }

  // Shadow Warp Teleport
  playShadowWarp() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Knockdown Ground Thud
  playKnockdown() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // K.O. Impact Boom (slow motion explosion)
  playKO() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Sub rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.4);

    // Huge explosion crack
    this.playNoiseCrack(0.8, 400, 0.6);
  }

  // Super Meter Ready chime
  playSuperReady() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  }

  // Round gong / bell
  playGong() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(240, now + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(480, now);
    osc2.frequency.exponentialRampToValueAtTime(360, now + 1.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.4);
    osc2.stop(now + 1.4);
  }

  playNoiseCrack(duration = 0.2, filterFreq = 1200, gainVal = 0.4) {
    if (!this.ctx || !this.sharedNoiseBuffer) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.sharedNoiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  // Adrenaline / Rage Mode Ignition
  playRageIgnite() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
    this.playNoiseCrack(0.35, 2400, 0.3);
  }

  // Kazuki: Pocket Gravel / Sand Toss
  playPocketSand() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playNoiseCrack(0.25, 3500, 0.5);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Raven: Concealed Taser Shock
  playTaserShock() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(850 + (i % 2) * 200, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  // Kagura: Caltrops & Smoke Powder
  playCaltrops() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1200, 1800, 2400, 1600].forEach((freq, idx) => {
      const t = now + idx * 0.035;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.06);
    });
    this.playNoiseCrack(0.2, 1800, 0.35);
  }

  // Arena Corner Crowd Cheering Roar
  playCrowdCheer() {
    if (!this.ctx || !this.sharedNoiseBuffer) return;
    const now = this.ctx.currentTime;
    try {
      const duration = 1.0;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.sharedNoiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  // Announcer Voice Synthesizer (Retro 16-bit arcade chords)
  playAnnouncer(call) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const speechChord = (baseFreq, duration, type = 'sawtooth') => {
      const chord = [1, 1.25, 1.5]; // major triad arcade vocalization
      chord.forEach(ratio => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(baseFreq * ratio, now);

        // Vocal formant emulation
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + duration);
      });
    };

    switch (call) {
      case 'ROUND1':
        speechChord(220, 0.45, 'sawtooth');
        setTimeout(() => speechChord(277, 0.5, 'square'), 350);
        break;
      case 'ROUND2':
        speechChord(220, 0.45, 'sawtooth');
        setTimeout(() => speechChord(330, 0.5, 'square'), 350);
        break;
      case 'FINALROUND':
        speechChord(180, 0.4, 'sawtooth');
        setTimeout(() => speechChord(240, 0.6, 'sawtooth'), 350);
        break;
      case 'FIGHT':
        this.playGong();
        speechChord(330, 0.6, 'sawtooth');
        break;
      case 'KO':
        this.playKO();
        setTimeout(() => speechChord(150, 0.9, 'sawtooth'), 100);
        break;
      case 'YOU_WIN':
        speechChord(260, 0.3, 'sine');
        setTimeout(() => speechChord(330, 0.3, 'sine'), 200);
        setTimeout(() => speechChord(392, 0.3, 'sine'), 400);
        setTimeout(() => speechChord(523, 0.6, 'square'), 600);
        break;
    }
  }

  // --- Dynamic Arcade Fight Background Music ---
  startMusic(track = 'fight') {
    this.ensureContext();
    if (this.musicPlaying) this.stopMusic();
    this.musicPlaying = true;
    this.currentTrack = track;
    this.step = 0;

    const stepInterval = (60 / this.tempo) / 4; // 16th notes
    let nextNoteTime = this.ctx.currentTime + 0.05;

    const schedule = () => {
      if (!this.musicPlaying) return;
      // Protect against tab throttling / background backlog
      if (this.ctx && this.ctx.currentTime - nextNoteTime > 0.3) {
        nextNoteTime = this.ctx.currentTime + 0.05;
      }
      while (nextNoteTime < this.ctx.currentTime + 0.2) {
        this.playMusicStep(this.step, nextNoteTime);
        this.step = (this.step + 1) % 64;
        nextNoteTime += stepInterval;
      }
      this.musicTimer = setTimeout(schedule, 50);
    };

    schedule();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playMusicStep(step, time) {
    if (!this.ctx) return;

    // Driving Drum Pattern
    const isKick = step % 8 === 0 || step % 16 === 6 || step % 32 === 26;
    const isSnare = step % 8 === 4;
    const isHat = step % 2 === 0;

    if (isKick) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.12);
    }

    if (isSnare) {
      // Snare body + snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.12);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.12);

      // Snare rattle
      if (this.sharedNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.sharedNoiseBuffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);
        const ngain = this.ctx.createGain();
        ngain.gain.setValueAtTime(0.18, time);
        ngain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        noise.connect(filter);
        filter.connect(ngain);
        ngain.connect(this.musicGain);
        noise.start(time);
        noise.stop(time + 0.1);
      }
    }

    if (isHat && this.sharedNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.sharedNoiseBuffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, time);
      const hgain = this.ctx.createGain();
      hgain.gain.setValueAtTime(0.08, time);
      hgain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      noise.connect(filter);
      filter.connect(hgain);
      hgain.connect(this.musicGain);
      noise.start(time);
      noise.stop(time + 0.04);
    }

    // Classic 16-bit Slap Bassline (E minor arcade progression: E, G, A, B, D)
    const bassline = [
      40, 40, 52, 40,  40, 40, 55, 40,
      43, 43, 55, 43,  45, 45, 57, 45,
      40, 40, 52, 40,  40, 40, 55, 40,
      47, 47, 59, 47,  45, 45, 43, 42
    ];
    const midiNote = bassline[step % 32];
    if (midiNote) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + 0.14);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.16);
    }

    // Street Fighter Lead / Arp Chords (plays on select 16th steps)
    const leadNotes = [
      64, null, 67, null, 71, null, 74, 76,
      null, 74, 71, null, 67, null, 64, null,
      69, null, 72, null, 76, null, 79, 81,
      null, 79, 76, null, 72, null, 69, null
    ];
    const leadNote = leadNotes[step % 32];
    if (leadNote) {
      const freq = 440 * Math.pow(2, (leadNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.setValueAtTime(2.0, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.22);
    }
  }
}

export const soundFX = new SoundFX();
