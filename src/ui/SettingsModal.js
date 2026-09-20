// Final Impact - Settings Engine & Customizable Controls Modal Controller
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';

export function formatKey(code) {
  if (!code) return 'NONE';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) {
    const sub = code.slice(6);
    if (sub === 'Enter') return 'NUM ENTER';
    return `NUM ${sub}`;
  }
  if (code === 'Space') return 'SPACE';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  if (code === 'Comma') return ',';
  if (code === 'Period') return '.';
  if (code === 'Slash') return '/';
  if (code === 'Backslash') return '\\';
  if (code === 'BracketLeft') return '[';
  if (code === 'BracketRight') return ']';
  if (code === 'Minus') return '-';
  if (code === 'Equal') return '=';
  if (code.startsWith('Arrow')) return code.slice(5).toUpperCase();
  if (code === 'ShiftLeft') return 'L-SHIFT';
  if (code === 'ShiftRight') return 'R-SHIFT';
  if (code === 'ControlLeft') return 'L-CTRL';
  if (code === 'ControlRight') return 'R-CTRL';
  if (code === 'AltLeft') return 'L-ALT';
  if (code === 'AltRight') return 'R-ALT';
  if (code === 'Enter') return 'ENTER';
  if (code === 'Tab') return 'TAB';
  return code.toUpperCase();
}

const ACTION_GROUPS = [
  {
    title: '— MOVEMENT —',
    actions: [
      { key: 'UP', label: 'Jump / Up' },
      { key: 'DOWN', label: 'Crouch / Down' },
      { key: 'LEFT', label: 'Move Left' },
      { key: 'RIGHT', label: 'Move Right' }
    ]
  },
  {
    title: '— NORMAL ATTACKS —',
    actions: [
      { key: 'LP', label: 'Light Punch (LP)' },
      { key: 'HP', label: 'Heavy Punch (HP)' },
      { key: 'LK', label: 'Light Kick (LK)' },
      { key: 'HK', label: 'Heavy Kick (HK)' }
    ]
  },
  {
    title: '— SPECIAL ATTACKS —',
    actions: [
      { key: 'SP1', label: 'Special 1 (QCF / Fireball)' },
      { key: 'SP2', label: 'Special 2 (DP / Uppercut)' },
      { key: 'SP3', label: 'Special 3 (Spin / Tatsu)' }
    ]
  },
  {
    title: '— TACTICAL & ULTIMATE —',
    actions: [
      { key: 'DIRTY', label: 'Dirty Tactic (Desperation)' },
      { key: 'ULTIMATE', label: 'Ultimate Secret Jutsu' }
    ]
  }
];

export class SettingsManager {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.currentTab = 'general'; // 'general' | 'controls'
    this.selectedPlayer = 1;      // 1 (P1) | 2 (P2)
    this.isRebinding = false;
    this.rebindingAction = null;
    this.listenersInitialized = false;

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

    // Wire DOM event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => this.initDomListeners());
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.initDomListeners();
      }
    }
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('final_impact_settings');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      }
    } catch (e) {}
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_settings', JSON.stringify(this.settings));
      }
    } catch (e) {}
  }

  applySettings() {
    try {
      soundFX.setMasterVolume(this.settings.masterVolume / 100);
      soundFX.setMusicVolume(this.settings.musicVolume / 100);
      soundFX.setSFXVolume(this.settings.sfxVolume / 100);
    } catch (e) {}

    input.easyInputs = this.settings.easyInputs;
    if (this.game && this.game.ai) {
      this.game.ai.setDifficulty(this.settings.difficulty);
    }
  }

  setGameSpeed(speed) {
    this.settings.gameSpeed = speed;
    this.save();
  }

  initDomListeners() {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    // Tab switching
    const tabGenBtn = document.getElementById('tabGeneralBtn');
    const tabCtrlBtn = document.getElementById('tabControlsBtn');
    if (tabGenBtn) tabGenBtn.addEventListener('click', () => this.switchTab('general'));
    if (tabCtrlBtn) tabCtrlBtn.addEventListener('click', () => this.switchTab('controls'));

    // Player subtabs
    const p1Btn = document.getElementById('p1ControlsBtn');
    const p2Btn = document.getElementById('p2ControlsBtn');
    if (p1Btn) p1Btn.addEventListener('click', () => this.switchPlayer(1));
    if (p2Btn) p2Btn.addEventListener('click', () => this.switchPlayer(2));

    // Reset controls button
    const resetBtn = document.getElementById('resetKeybindsBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetKeybinds());
    }

    // Global keydown listener for rebind capture (runs in capture phase)
    window.addEventListener('keydown', (e) => {
      if (!this.isRebinding || !this.rebindingAction) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        this.cancelRebinding();
        try { soundFX.playBlock(); } catch (err) {}
        this.renderKeybinds();
        return;
      }

      // Rebind to captured code
      this.finishRebinding(e.code);
    }, true);
  }

  startRebinding(actionKey) {
    this.isRebinding = true;
    this.rebindingAction = actionKey;
    try { soundFX.playHitLight(); } catch (e) {}
    this.renderKeybinds();
  }

  finishRebinding(keyCode) {
    if (!this.rebindingAction) return;
    input.setKeybind(this.selectedPlayer, this.rebindingAction, keyCode);
    try { soundFX.playHitLight(); } catch (e) {}
    this.isRebinding = false;
    this.rebindingAction = null;
    this.renderKeybinds();

    // Blur active element to prevent Space / Enter from triggering synthetic click events
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.cancelRebinding();

    const tabGenBtn = document.getElementById('tabGeneralBtn');
    const tabCtrlBtn = document.getElementById('tabControlsBtn');
    const genPane = document.getElementById('tabGeneralContent');
    const ctrlPane = document.getElementById('tabControlsContent');

    if (tabGenBtn) tabGenBtn.classList.toggle('active', tab === 'general');
    if (tabCtrlBtn) tabCtrlBtn.classList.toggle('active', tab === 'controls');

    if (genPane) genPane.style.display = tab === 'general' ? 'flex' : 'none';
    if (ctrlPane) ctrlPane.style.display = tab === 'controls' ? 'flex' : 'none';

    if (tab === 'controls') {
      this.renderKeybinds();
    }
  }

  switchPlayer(playerNum) {
    this.selectedPlayer = playerNum;
    this.cancelRebinding();

    const p1Btn = document.getElementById('p1ControlsBtn');
    const p2Btn = document.getElementById('p2ControlsBtn');
    if (p1Btn) p1Btn.classList.toggle('active', playerNum === 1);
    if (p2Btn) p2Btn.classList.toggle('active', playerNum === 2);

    this.renderKeybinds();
  }

  cancelRebinding() {
    this.isRebinding = false;
    this.rebindingAction = null;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        this.cancelRebinding();
        this.syncUI();
      }
    }
  }

  close() {
    this.isOpen = false;
    this.cancelRebinding();
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
  }

  resetKeybinds() {
    input.resetDefaultControls();
    try { soundFX.playHitHeavy(); } catch (e) {}
    this.cancelRebinding();
    this.renderKeybinds();
  }

  renderKeybinds() {
    const container = document.getElementById('keybindsContainer');
    if (!container) return;

    // Update dynamic hint banner
    const hintEl = document.querySelector('.controls-hint');
    if (hintEl) {
      if (this.isRebinding && this.rebindingAction) {
        let actionName = this.rebindingAction;
        for (const g of ACTION_GROUPS) {
          const found = g.actions.find(a => a.key === this.rebindingAction);
          if (found) { actionName = found.label; break; }
        }
        hintEl.innerHTML = `<span style="color: #facc15; animation: pulse-rebinding 0.8s infinite alternate;">🎯 REBINDING: [ ${actionName.toUpperCase()} ]<br>PRESS ANY KEY ON YOUR KEYBOARD (ESC TO CANCEL)</span>`;
      } else {
        hintEl.innerHTML = `CLICK ANY ROW OR BUTTON BELOW, THEN PRESS A KEY TO REBIND. ESCAPE TO CANCEL.`;
      }
    }

    container.innerHTML = '';
    const pKey = this.selectedPlayer === 1 ? 'P1' : 'P2';
    const activeControls = input.controls[pKey] || {};

    ACTION_GROUPS.forEach(group => {
      const header = document.createElement('div');
      header.className = 'keybind-group-header';
      header.textContent = group.title;
      container.appendChild(header);

      group.actions.forEach(action => {
        const row = document.createElement('div');
        row.className = 'keybind-row';
        const isThisRebinding = this.isRebinding && this.rebindingAction === action.key;
        if (isThisRebinding) {
          row.classList.add('rebinding-active');
        }

        const nameLabel = document.createElement('span');
        nameLabel.className = 'keybind-action-name';
        nameLabel.textContent = action.label;

        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'keybind-key-btn';

        if (isThisRebinding) {
          keyBtn.classList.add('rebinding');
          keyBtn.textContent = 'PRESS KEY...';
        } else {
          const currentCode = activeControls[action.key];
          keyBtn.textContent = formatKey(currentCode);
        }

        // Clicking either the button OR the entire row activates rebinding!
        const triggerRebind = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.startRebinding(action.key);
        };

        row.addEventListener('click', triggerRebind);
        keyBtn.addEventListener('click', triggerRebind);

        row.appendChild(nameLabel);
        row.appendChild(keyBtn);
        container.appendChild(row);
      });
    });
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

    this.renderKeybinds();
  }
}
