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

    // Leave game / return to menu handlers
    const handleLeave = (target) => {
      if (this.game && typeof this.game.leaveGame === 'function') {
        this.game.leaveGame(target);
      } else {
        this.close();
      }
    };

    const leaveFightBtn = document.getElementById('leaveFightBtn');
    if (leaveFightBtn) leaveFightBtn.addEventListener('click', () => handleLeave('MODE_SELECT'));

    const charSelectBtn = document.getElementById('charSelectBtn');
    if (charSelectBtn) charSelectBtn.addEventListener('click', () => handleLeave('CHAR_SELECT'));

    const genLeaveBtn = document.getElementById('generalLeaveMatchBtn');
    if (genLeaveBtn) genLeaveBtn.addEventListener('click', () => handleLeave('MODE_SELECT'));

    const genCharBtn = document.getElementById('generalCharSelectBtn');
    if (genCharBtn) genCharBtn.addEventListener('click', () => handleLeave('CHAR_SELECT'));

    // Secret Unlock Code handlers
    const codeInput = document.getElementById('secretCodeInput');
    const submitCodeBtn = document.getElementById('submitSecretCodeBtn');
    const relockCodeBtn = document.getElementById('relockSecretCodeBtn');
    const codeFeedback = document.getElementById('secretCodeFeedback');

    const handleSecretCodeSubmit = () => {
      if (!codeInput || !codeFeedback) return;
      const val = (codeInput.value || '').trim().toUpperCase();
      if (val === 'M1GHTY') {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('final_impact_unlocked_mighty', 'true');
          }
          if (soundFX && typeof soundFX.playUltimateActivation === 'function') {
            soundFX.playUltimateActivation();
          }
        } catch (err) {}
        codeFeedback.style.color = '#4ade80';
        codeFeedback.textContent = '✨ CODE ACCEPTED! SECRET FIGHTER "M1GHTY" UNLOCKED! ✨';
        codeInput.value = '';
        if (this.game && this.game.charSelect && typeof this.game.charSelect.unlockMighty === 'function') {
          this.game.charSelect.unlockMighty();
        }
      } else {
        codeFeedback.style.color = '#ef4444';
        codeFeedback.textContent = '❌ INVALID CODE. TRY AGAIN.';
        try { if (soundFX && typeof soundFX.playBlock === 'function') soundFX.playBlock(); } catch (err) {}
      }
    };

    if (submitCodeBtn) {
      submitCodeBtn.addEventListener('click', handleSecretCodeSubmit);
    }
    if (codeInput) {
      codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSecretCodeSubmit();
        }
      });
    }
    if (relockCodeBtn) {
      relockCodeBtn.addEventListener('click', () => {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('final_impact_unlocked_mighty');
          }
          if (soundFX && typeof soundFX.playWhoosh === 'function') soundFX.playWhoosh('light');
        } catch (err) {}
        if (codeFeedback) {
          codeFeedback.style.color = '#fbbf24';
          codeFeedback.textContent = '🔒 M1GHTY HAS BEEN RE-LOCKED.';
        }
        if (this.game && this.game.charSelect && typeof this.game.charSelect.lockMighty === 'function') {
          this.game.charSelect.lockMighty();
        }
      });
    }

    // Global keydown listener for rebind capture (runs in capture phase)
    window.addEventListener('keydown', (e) => {
      if (!this.isRebinding || !this.rebindingAction) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        this.cancelRebinding();
        try { if (soundFX && typeof soundFX.playBlock === 'function') soundFX.playBlock(); } catch (err) {}
        return;
      }

      // Rebind to captured code
      this.finishRebinding(e.code);
    }, true);

    // Click delegation for keybinds list (click row or button to rebind)
    const container = document.getElementById('keybindsContainer');
    if (container) {
      container.addEventListener('click', (e) => {
        const row = e.target.closest('.keybind-row');
        if (!row) return;
        const actionKey = row.getAttribute('data-action');
        if (!actionKey) return;

        e.preventDefault();
        e.stopPropagation();

        if (this.isRebinding && this.rebindingAction === actionKey) {
          this.cancelRebinding();
          return;
        }

        this.startRebinding(actionKey);
      });
    }
  }

  getActionLabel(actionKey) {
    for (const g of ACTION_GROUPS) {
      const found = g.actions.find(a => a.key === actionKey);
      if (found) return found.label;
    }
    return actionKey;
  }

  startRebinding(actionKey) {
    const container = document.getElementById('keybindsContainer');
    const pKey = this.selectedPlayer === 1 ? 'P1' : 'P2';
    const activeControls = input.controls[pKey] || {};

    // Clear previous rebinding styling without destroying DOM or resetting scroll position
    if (container) {
      const allRows = container.querySelectorAll('.keybind-row');
      allRows.forEach(r => {
        r.classList.remove('rebinding-active');
        const btn = r.querySelector('.keybind-key-btn');
        const act = r.getAttribute('data-action');
        if (btn && act) {
          btn.classList.remove('rebinding');
          btn.textContent = formatKey(activeControls[act]);
        }
      });

      const targetRow = container.querySelector(`.keybind-row[data-action="${actionKey}"]`);
      if (targetRow) {
        targetRow.classList.add('rebinding-active');
        const targetBtn = targetRow.querySelector('.keybind-key-btn');
        if (targetBtn) {
          targetBtn.classList.add('rebinding');
          targetBtn.textContent = 'PRESS KEY...';
        }
      }
    }

    this.isRebinding = true;
    this.rebindingAction = actionKey;

    const hintEl = document.querySelector('.controls-hint');
    if (hintEl) {
      const label = this.getActionLabel(actionKey);
      hintEl.innerHTML = `<span style="color: #facc15; animation: pulse-rebinding 0.8s infinite alternate;">🎯 REBINDING: [ ${label.toUpperCase()} ]<br>PRESS ANY KEY ON YOUR KEYBOARD (ESC TO CANCEL)</span>`;
    }

    try {
      if (soundFX && typeof soundFX.playHitLight === 'function') soundFX.playHitLight();
    } catch (e) {}
  }

  finishRebinding(keyCode) {
    if (!this.rebindingAction) return;
    const actionKey = this.rebindingAction;
    const hintEl = document.querySelector('.controls-hint');

    // Reserved keys protection
    if (keyCode === 'KeyP') {
      if (hintEl) {
        hintEl.innerHTML = `<span style="color: #ef4444; font-weight: bold;">⚠ [P] IS RESERVED FOR PAUSE / SETTINGS. CHOOSE ANOTHER KEY.</span>`;
      }
      try { if (soundFX && typeof soundFX.playBlock === 'function') soundFX.playBlock(); } catch (e) {}
      return;
    }
    if (keyCode === 'F11') {
      if (hintEl) {
        hintEl.innerHTML = `<span style="color: #ef4444; font-weight: bold;">⚠ [F11] IS RESERVED FOR FULLSCREEN. CHOOSE ANOTHER KEY.</span>`;
      }
      try { if (soundFX && typeof soundFX.playBlock === 'function') soundFX.playBlock(); } catch (e) {}
      return;
    }

    // Save customized keybind
    input.setKeybind(this.selectedPlayer, actionKey, keyCode);

    const container = document.getElementById('keybindsContainer');
    if (container) {
      const targetRow = container.querySelector(`.keybind-row[data-action="${actionKey}"]`);
      if (targetRow) {
        targetRow.classList.remove('rebinding-active');
        const targetBtn = targetRow.querySelector('.keybind-key-btn');
        if (targetBtn) {
          targetBtn.classList.remove('rebinding');
          targetBtn.textContent = formatKey(keyCode);
        }
      }
    }

    const label = this.getActionLabel(actionKey);
    if (hintEl) {
      hintEl.innerHTML = `<span style="color: #4ade80;">✓ BOUND [ ${label.toUpperCase()} ] ➔ ${formatKey(keyCode)}</span>`;
    }

    this.isRebinding = false;
    this.rebindingAction = null;

    try {
      if (soundFX && typeof soundFX.playHitLight === 'function') soundFX.playHitLight();
    } catch (e) {}

    // Blur active element to prevent Space / Enter from triggering synthetic click events
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  cancelRebinding() {
    if (this.rebindingAction) {
      const container = document.getElementById('keybindsContainer');
      const pKey = this.selectedPlayer === 1 ? 'P1' : 'P2';
      const activeControls = input.controls[pKey] || {};
      if (container) {
        const targetRow = container.querySelector(`.keybind-row[data-action="${this.rebindingAction}"]`);
        if (targetRow) {
          targetRow.classList.remove('rebinding-active');
          const targetBtn = targetRow.querySelector('.keybind-key-btn');
          if (targetBtn) {
            targetBtn.classList.remove('rebinding');
            targetBtn.textContent = formatKey(activeControls[this.rebindingAction]);
          }
        }
      }
    }

    this.isRebinding = false;
    this.rebindingAction = null;

    const hintEl = document.querySelector('.controls-hint');
    if (hintEl) {
      hintEl.innerHTML = `CLICK ANY ROW OR BUTTON BELOW, THEN PRESS A KEY TO REBIND. ESCAPE TO CANCEL.`;
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
    try {
      if (soundFX && typeof soundFX.playHitHeavy === 'function') soundFX.playHitHeavy();
    } catch (e) {}
    this.cancelRebinding();
    this.renderKeybinds();
  }

  renderKeybinds() {
    const container = document.getElementById('keybindsContainer');
    if (!container) return;

    this.cancelRebinding();

    const hintEl = document.querySelector('.controls-hint');
    if (hintEl) {
      hintEl.innerHTML = `CLICK ANY ROW OR BUTTON BELOW, THEN PRESS A KEY TO REBIND. ESCAPE TO CANCEL.`;
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
        row.setAttribute('data-action', action.key);

        const nameLabel = document.createElement('span');
        nameLabel.className = 'keybind-action-name';
        nameLabel.textContent = action.label;

        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'keybind-key-btn';
        keyBtn.setAttribute('data-action', action.key);
        keyBtn.textContent = formatKey(activeControls[action.key]);

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

    const codeFeedback = document.getElementById('secretCodeFeedback');
    if (codeFeedback) {
      const isUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_unlocked_mighty') === 'true';
      codeFeedback.style.color = isUnlocked ? '#4ade80' : '#94a3b8';
      codeFeedback.textContent = isUnlocked ? '👑 "M1GHTY" IS CURRENTLY UNLOCKED' : '🔒 "M1GHTY" IS CURRENTLY LOCKED';
    }

    this.renderKeybinds();

    // Dynamic Leave Game buttons in modal footer and general tab
    const inFight = this.game && (
      this.game.screen === 'FIGHT' ||
      this.game.screen === 'ROUND_OVER' ||
      this.game.screen === 'VICTORY'
    );
    const inCharSelect = this.game && (
      this.game.screen === 'CHAR_SELECT' ||
      this.game.screen === 'ONLINE_LOBBY'
    );

    const leaveBtn = document.getElementById('leaveFightBtn');
    const charBtn = document.getElementById('charSelectBtn');
    const resumeBtn = document.getElementById('closeSettingsBtn');
    const matchGroup = document.getElementById('matchActionsGroup');
    const genLeaveBtn = document.getElementById('generalLeaveMatchBtn');
    const genCharBtn = document.getElementById('generalCharSelectBtn');

    if (inFight) {
      if (leaveBtn) {
        leaveBtn.style.display = 'inline-block';
        leaveBtn.textContent = '🚪 LEAVE GAME';
      }
      if (charBtn) {
        charBtn.style.display = (this.game && this.game.isOnline) ? 'none' : 'inline-block';
        charBtn.textContent = '👥 CHAR SELECT';
      }
      if (resumeBtn) {
        resumeBtn.textContent = 'RESUME FIGHT [P]';
      }
      if (matchGroup) {
        matchGroup.style.display = 'flex';
      }
      if (genLeaveBtn) {
        genLeaveBtn.textContent = '🚪 LEAVE GAME (QUIT TO MENU)';
      }
      if (genCharBtn) {
        genCharBtn.style.display = (this.game && this.game.isOnline) ? 'none' : 'inline-block';
      }
    } else if (inCharSelect) {
      if (leaveBtn) {
        leaveBtn.style.display = 'inline-block';
        leaveBtn.textContent = '🚪 BACK TO MODES';
      }
      if (charBtn) {
        charBtn.style.display = 'none';
      }
      if (resumeBtn) {
        resumeBtn.textContent = 'CLOSE [P]';
      }
      if (matchGroup) {
        matchGroup.style.display = 'flex';
      }
      if (genLeaveBtn) {
        genLeaveBtn.textContent = '🚪 BACK TO MODE SELECT';
      }
      if (genCharBtn) {
        genCharBtn.style.display = 'none';
      }
    } else {
      if (leaveBtn) {
        leaveBtn.style.display = 'none';
      }
      if (charBtn) {
        charBtn.style.display = 'none';
      }
      if (resumeBtn) {
        resumeBtn.textContent = 'CLOSE [P]';
      }
      if (matchGroup) {
        matchGroup.style.display = 'none';
      }
    }
  }
}
