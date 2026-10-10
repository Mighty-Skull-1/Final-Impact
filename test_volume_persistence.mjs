// Unit tests for Volume Persistence & Audio Channel Routing
import assert from 'assert';

const storage = {};
global.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};

// Mock Web Audio Context
class MockGain {
  constructor() {
    this.gain = {
      value: 1,
      setValueAtTime: (val) => { this.gain.value = val; },
      exponentialRampToValueAtTime: (val) => { this.gain.value = val; },
      linearRampToValueAtTime: (val) => { this.gain.value = val; },
      cancelScheduledValues: () => {}
    };
  }
  connect() {}
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
    this.sampleRate = 44100;
    this.state = 'running';
  }
  createGain() { return new MockGain(); }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createDynamicsCompressor() {
    return {
      threshold: { setValueAtTime: () => {} },
      knee: { setValueAtTime: () => {} },
      ratio: { setValueAtTime: () => {} },
      attack: { setValueAtTime: () => {} },
      release: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(100)
    };
  }
}

global.AudioContext = MockAudioContext;
const mockCtx = new Proxy({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  imageSmoothingEnabled: false,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  createImageData: () => ({ data: new Uint8ClampedArray(4) })
}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => {};
  }
});
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return { width: 80, height: 90, getContext: () => mockCtx };
    }
    return {};
  }
};
global.window = {
  AudioContext: MockAudioContext,
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: global.localStorage,
  document: global.document
};

console.log('--- STARTING VOLUME PERSISTENCE & AUDIO CHANNEL VERIFICATION ---');

// Pre-populate storage with customized volumes (e.g. Master 40%, Music 25%, SFX 60%)
localStorage.setItem('final_impact_settings', JSON.stringify({
  masterVolume: 40,
  musicVolume: 25,
  sfxVolume: 60
}));

const { soundFX } = await import('./src/audio/SoundFX.js');
const { Announcer } = await import('./src/audio/Announcer.js');
const { CharacterSelect } = await import('./src/ui/CharacterSelect.js');

// Test 1: SoundFX initialization restores saved volumes
soundFX.init();
assert.strictEqual(soundFX.masterVolumeVal, 0.40, 'Master volume value must restore to 0.40 from localStorage');
assert.strictEqual(soundFX.musicVolumeVal, 0.25, 'Music volume value must restore to 0.25 from localStorage');
assert.strictEqual(soundFX.sfxVolumeVal, 0.60, 'SFX volume value must restore to 0.60 from localStorage');

assert.strictEqual(soundFX.masterGain.gain.value, 0.40, 'Master gain must be initialized to 0.40');
assert.strictEqual(soundFX.musicGain.gain.value, 0.25 * 0.45, 'Music gain must be initialized to 0.25 * 0.45');
assert.strictEqual(soundFX.sfxGain.gain.value, 0.60 * 0.9, 'SFX gain must be initialized to 0.60 * 0.9');
console.log('✓ [PASS] Saved volume settings accurately restored on Audio initialization');

// Test 2: Set volume updates gain nodes and persists to localStorage
soundFX.setMasterVolume(0.55);
assert.strictEqual(soundFX.masterGain.gain.value, 0.55, 'setMasterVolume updates master gain node');
let savedSettings = JSON.parse(localStorage.getItem('final_impact_settings'));
assert.strictEqual(savedSettings.masterVolume, 55, 'setMasterVolume persists 55% to localStorage');

soundFX.setMusicVolume(0.10);
assert.strictEqual(soundFX.musicGain.gain.value, 0.10 * 0.45, 'setMusicVolume updates music gain node');
savedSettings = JSON.parse(localStorage.getItem('final_impact_settings'));
assert.strictEqual(savedSettings.musicVolume, 10, 'setMusicVolume persists 10% to localStorage');

soundFX.setSFXVolume(0.30);
assert.strictEqual(soundFX.sfxGain.gain.value, 0.30 * 0.9, 'setSFXVolume updates sfx gain node');
savedSettings = JSON.parse(localStorage.getItem('final_impact_settings'));
assert.strictEqual(savedSettings.sfxVolume, 30, 'setSFXVolume persists 30% to localStorage');
console.log('✓ [PASS] Volume updates correctly adjust gain nodes and write to localStorage');

// Test 3: startMusic does NOT override user music setting with 0.35
soundFX.startMusic('fight');
assert.strictEqual(soundFX.musicGain.gain.value, 0.10 * 0.45, 'startMusic preserves user configured music volume');
soundFX.stopMusic();
console.log('✓ [PASS] Match music start respects configured music volume without resetting');

// Test 4: Announcer speech scaling
const announcer = new Announcer();
announcer.speechAvailable = true;
let spokeVolume = null;
global.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; this.volume = 1.0; }
};
global.window.speechSynthesis = {
  cancel: () => {},
  getVoices: () => [],
  speak: (utt) => { spokeVolume = utt.volume; }
};

announcer.speak('Fight!');
// Expected volume = 1.0 * master (0.55) * sfx (0.30) = 0.165
assert(Math.abs(spokeVolume - (0.55 * 0.30)) < 0.001, 'Announcer volume scales with master and sfx volume');
console.log('✓ [PASS] Announcer voice volume scales with master and SFX volume channels');

// Test 5: Character Select Up/Down Grid Navigation (Non-inverted)
const charSelect = new CharacterSelect();
charSelect.gridCols = () => 6;
charSelect.p1Index = 7; // Row 1, Col 1
charSelect.handleInput({ up: true }, true);
assert.strictEqual(charSelect.p1Index, 1, 'Up moves up one row (-6)');

charSelect.handleInput({ down: true }, true);
assert.strictEqual(charSelect.p1Index, 7, 'Down moves down one row (+6)');
console.log('✓ [PASS] Character select grid Up/Down navigation correctly oriented');

console.log('\n==============================================');
console.log('ALL VOLUME PERSISTENCE & AUDIO TESTS PASSED!');
console.log('==============================================');
