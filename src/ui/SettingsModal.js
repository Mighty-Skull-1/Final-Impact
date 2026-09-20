// Final Impact - Settings Engine & Modal Controller
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';

export class SettingsManager {
  constructor(game) {
    this.game = game;
    this.isOpen = false;

    this.settings = {
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 90,
      gameSpeed: 100, // 50, 75, 100, 125
      difficulty: 'normal', // 'easy', 'normal', 'hard'
      screenShake: 'full', // 'off', 'low', 'full'
      easyInputs: false
    };

    // Load saved settings if present
    this.load();
    this.applySettings();
  }

  load() {
    try {
      const saved = localStorage.getItem('final_impact_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  save() {
    try {
      localStorage.setItem('final_impact_settings', JSON.stringify(this.settings));
    } catch (e) {}
  }

  applySettings() {
    soundFX.setMasterVolume(this.settings.masterVolume / 100);
    soundFX.setMusicVolume(this.settings.musicVolume / 100);
    soundFX.setSFXVolume(this.settings.sfxVolume / 100);

    input.easyInputs = this.settings.easyInputs;
    if (this.game && this.game.ai) {
      this.game.ai.setDifficulty(this.settings.difficulty);
    }
  }

  setGameSpeed(speed) {
    this.settings.gameSpeed = speed;
    this.save();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        this.syncUI();
      }
    }
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
  }

  syncUI() {
    const masterSlider = document.getElementById('masterVol');
    const musicSlider = document.getElementById('musicVol');
    const sfxSlider = document.getElementById('sfxVol');
    const speedSelect = document.getElementById('gameSpeedSelect');
    const diffSelect = document.getElementById('aiDiffSelect');
    const shakeSelect = document.getElementById('shakeSelect');
    const easyToggle = document.getElementById('easyInputsCheck');

    if (masterSlider) masterSlider.value = this.settings.masterVolume;
    if (musicSlider) musicSlider.value = this.settings.musicVolume;
    if (sfxSlider) sfxSlider.value = this.settings.sfxVolume;
    if (speedSelect) speedSelect.value = this.settings.gameSpeed;
    if (diffSelect) diffSelect.value = this.settings.difficulty;
    if (shakeSelect) shakeSelect.value = this.settings.screenShake;
    if (easyToggle) easyToggle.checked = this.settings.easyInputs;

    const masterLabel = document.getElementById('masterVolVal');
    const musicLabel = document.getElementById('musicVolVal');
    const sfxLabel = document.getElementById('sfxVolVal');
    if (masterLabel) masterLabel.textContent = `${this.settings.masterVolume}%`;
    if (musicLabel) musicLabel.textContent = `${this.settings.musicVolume}%`;
    if (sfxLabel) sfxLabel.textContent = `${this.settings.sfxVolume}%`;
  }
}
