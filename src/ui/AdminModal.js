// Final Impact - Administrator Portal (Admin Side)
// Cryptographically secured admin interface for restricted character management,
// coin treasury adjustments, skin catalog overrides, and combat test cheats.

import { verifyAdminPassword, isAdminAuthenticated, setAdminAuthenticated, isMightyUnlocked, setMightyUnlocked, getAdminCheats, setAdminCheats } from '../utils/CryptoAuth.js';
import { EconomyManager } from '../shop/SkinCatalog.js';
import { soundFX } from '../audio/SoundFX.js';

export class AdminModal {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.domModal = null;
    this.initDOM();
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    // Check if element already exists
    let modal = document.getElementById('adminModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'adminModal';
      modal.className = 'modal-backdrop';
      modal.style.display = 'none';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(5, 2, 8, 0.88)';
      modal.style.backdropFilter = 'blur(6px)';
      modal.style.zIndex = '9999';
      modal.style.display = 'none';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.padding = '16px';
      modal.style.boxSizing = 'border-box';

      document.body.appendChild(modal);
    }
    this.domModal = modal;
    this.renderModalContent();
  }

  open() {
    this.isOpen = true;
    if (this.domModal) {
      this.domModal.style.display = 'flex';
      this.renderModalContent();
      const pwdInput = document.getElementById('adminKeyInput');
      if (pwdInput) {
        setTimeout(() => pwdInput.focus(), 50);
      }
    }
    try { soundFX.playMenuSelect(); } catch (e) {}
  }

  close() {
    this.isOpen = false;
    if (this.domModal) {
      this.domModal.style.display = 'none';
    }
    try { soundFX.playWhoosh('light'); } catch (e) {}
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderModalContent() {
    if (!this.domModal) return;

    const isAuthed = isAdminAuthenticated();

    if (!isAuthed) {
      this.renderLoginView();
    } else {
      this.renderDashboardView();
    }
  }

  renderLoginView() {
    this.domModal.innerHTML = `
      <div class="admin-card" style="
        background: #09090b;
        border: 2px solid #ef4444;
        box-shadow: 0 0 35px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(220, 38, 38, 0.1);
        width: 100%;
        max-width: 520px;
        border-radius: 8px;
        padding: 24px;
        color: #f8fafc;
        font-family: 'Press Start 2P', monospace;
        box-sizing: border-box;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="color: #ef4444; font-size: 13px; font-weight: bold; letter-spacing: 1px;">⚡ ADMIN PORTAL</div>
            <div style="color: #94a3b8; font-size: 7px; margin-top: 4px;">CRYPTOGRAPHIC SECURITY CHECKPOINT</div>
          </div>
          <button id="adminCloseBtn" style="background: transparent; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 4px 8px;">✕</button>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 10px 12px; margin-bottom: 18px; font-size: 8px; line-height: 1.5; color: #fca5a5;">
          🔒 RESTRICTED TERMINAL — ENTER ADMINISTRATOR MASTER SECURITY KEY TO PROCEED.
        </div>

        <div style="margin-bottom: 16px;">
          <label for="adminKeyInput" style="display: block; font-size: 8px; color: #fbbf24; margin-bottom: 8px;">SECURITY PASSWORD:</label>
          <div style="display: flex; gap: 8px;">
            <input type="password" id="adminKeyInput" placeholder="ENTER ADMIN KEY" autocomplete="off" style="
              flex: 1;
              background: #0f172a;
              border: 1px solid #ef4444;
              color: #fde047;
              padding: 10px 12px;
              font-family: monospace;
              font-size: 14px;
              border-radius: 4px;
              outline: none;
            ">
            <button id="adminToggleShowPwd" type="button" style="
              background: #1e293b;
              border: 1px solid #475569;
              color: #cbd5e1;
              padding: 0 10px;
              font-size: 12px;
              cursor: pointer;
              border-radius: 4px;
            ">👁</button>
          </div>
        </div>

        <div id="adminLoginFeedback" style="min-height: 20px; font-size: 8px; margin-bottom: 14px; color: #ef4444;"></div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="adminCancelBtn" style="
            background: #27272a;
            border: 1px solid #52525b;
            color: #d4d4d8;
            padding: 10px 14px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
          ">CANCEL</button>
          <button id="adminLoginSubmitBtn" style="
            background: #dc2626;
            border: 1px solid #ef4444;
            color: #ffffff;
            padding: 10px 18px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
          ">AUTHENTICATE ⚡</button>
        </div>
      </div>
    `;

    // Event listeners for login view
    const closeBtn = document.getElementById('adminCloseBtn');
    const cancelBtn = document.getElementById('adminCancelBtn');
    const submitBtn = document.getElementById('adminLoginSubmitBtn');
    const pwdInput = document.getElementById('adminKeyInput');
    const togglePwdBtn = document.getElementById('adminToggleShowPwd');
    const feedback = document.getElementById('adminLoginFeedback');

    if (closeBtn) closeBtn.onclick = () => this.close();
    if (cancelBtn) cancelBtn.onclick = () => this.close();

    if (togglePwdBtn && pwdInput) {
      togglePwdBtn.onclick = () => {
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          togglePwdBtn.textContent = '🔒';
        } else {
          pwdInput.type = 'password';
          togglePwdBtn.textContent = '👁';
        }
      };
    }

    const doAuth = async () => {
      const val = pwdInput.value;
      if (!val) {
        feedback.style.color = '#ef4444';
        feedback.textContent = '❌ PLEASE ENTER SECURITY KEY.';
        return;
      }

      feedback.style.color = '#38bdf8';
      feedback.textContent = 'VERIFYING CREDENTIALS...';

      const valid = await verifyAdminPassword(val);
      if (valid) {
        setAdminAuthenticated(true);
        feedback.style.color = '#4ade80';
        feedback.textContent = '✅ ACCESS GRANTED. WELCOME ADMINISTRATOR.';
        try { soundFX.playUltimateActivation(); } catch (e) {}
        setTimeout(() => this.renderDashboardView(), 400);
      } else {
        feedback.style.color = '#ef4444';
        feedback.textContent = '❌ ACCESS DENIED: INVALID SECURITY KEY.';
        try { soundFX.playBlock(); } catch (e) {}
      }
    };

    if (submitBtn) submitBtn.onclick = doAuth;
    if (pwdInput) {
      pwdInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doAuth();
        }
      };
    }
  }

  renderDashboardView() {
    const isMightyOpen = isMightyUnlocked();
    const coins = EconomyManager.getCoins();
    const cheats = getAdminCheats();

    this.domModal.innerHTML = `
      <div class="admin-card" style="
        background: #09090b;
        border: 2px solid #22c55e;
        box-shadow: 0 0 35px rgba(34, 197, 94, 0.35), inset 0 0 20px rgba(22, 101, 52, 0.15);
        width: 100%;
        max-width: 620px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 8px;
        padding: 22px;
        color: #f8fafc;
        font-family: 'Press Start 2P', monospace;
        box-sizing: border-box;
      ">
        <!-- Dashboard Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="color: #4ade80; font-size: 13px; font-weight: bold; letter-spacing: 1px;">⚡ ADMIN CONTROL CENTER</div>
            <div style="color: #86efac; font-size: 7px; margin-top: 4px;">🟢 MASTER SESSION ACTIVE & VERIFIED</div>
          </div>
          <button id="adminCloseBtn" style="background: transparent; border: none; color: #4ade80; font-size: 16px; cursor: pointer; padding: 4px 8px;">✕</button>
        </div>

        <!-- Section 1: M1GHTY Secret Character Toggle -->
        <div style="background: #18181b; border: 1px solid ${isMightyOpen ? '#eab308' : '#3f3f46'}; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; color: #fbbf24; font-weight: bold;">👑 SECRET FIGHTER: M1GHTY</span>
            <span id="mightyStatusBadge" style="
              font-size: 7px;
              padding: 4px 8px;
              border-radius: 3px;
              background: ${isMightyOpen ? '#14532d' : '#450a0a'};
              color: ${isMightyOpen ? '#4ade80' : '#f87171'};
              border: 1px solid ${isMightyOpen ? '#22c55e' : '#dc2626'};
            ">${isMightyOpen ? 'STATUS: UNLOCKED' : 'STATUS: LOCKED'}</span>
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            M1GHTY is an exclusive divine admin character with 9999 one-hit KO power and celestial animations.
          </p>
          <div style="display: flex; gap: 8px;">
            <button id="toggleMightyBtn" style="
              background: ${isMightyOpen ? '#7f1d1d' : '#ca8a04'};
              border: 1px solid ${isMightyOpen ? '#dc2626' : '#eab308'};
              color: #ffffff;
              padding: 8px 14px;
              font-size: 8px;
              font-family: inherit;
              cursor: pointer;
              border-radius: 4px;
            ">${isMightyOpen ? '🔒 LOCK M1GHTY (HIDE FROM ROSTER)' : '🔓 UNLOCK M1GHTY FOR ROSTER'}</button>
          </div>
        </div>

        <!-- Section 2: Economy & Currency Treasury -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; color: #fde047; font-weight: bold;">🪙 TREASURY & TOURNAMENT COINS</span>
            <span id="adminCoinCount" style="font-size: 8px; color: #fde047;">${coins.toLocaleString()} COINS</span>
          </div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            Adjust player coin wallet balance for testing shop purchases and unlock flows.
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="add1kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+1,000 COINS</button>
            <button id="add5kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+5,000 COINS</button>
            <button id="add50kCoinsBtn" class="admin-action-btn" style="background: #1e293b; border: 1px solid #475569; color: #fde047; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">+50,000 COINS</button>
            <button id="resetCoinsBtn" class="admin-action-btn" style="background: #27272a; border: 1px solid #52525b; color: #cbd5e1; padding: 6px 10px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">RESET (500)</button>
          </div>
        </div>

        <!-- Section 3: Skin Catalog Master Control -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
          <div style="font-size: 9px; color: #c084fc; font-weight: bold; margin-bottom: 8px;">🛍️ SKIN CATALOG MASTER OVERRIDE</div>
          <p style="font-size: 7px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
            Instantly grant ownership of all roster skins or relock unpurchased cosmetics.
          </p>
          <div style="display: flex; gap: 8px;">
            <button id="unlockAllSkinsBtn" style="background: #581c87; border: 1px solid #a855f7; color: #f3e8ff; padding: 8px 12px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">👑 UNLOCK ALL SKINS</button>
            <button id="resetSkinsBtn" style="background: #27272a; border: 1px solid #52525b; color: #cbd5e1; padding: 8px 12px; font-size: 7px; font-family: inherit; cursor: pointer; border-radius: 3px;">🔒 RELOCK SKINS</button>
          </div>
        </div>

        <!-- Section 4: Combat Cheats & Dev Modifiers -->
        <div style="background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 9px; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">🎮 COMBAT TESTING CHEATS (OFFLINE/DEV)</div>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 7px; color: #cbd5e1;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatGodMode" ${cheats.godMode ? 'checked' : ''}>
              <span>🛡️ GOD MODE (P1 Takes 0 Damage)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatInfiniteSuper" ${cheats.infiniteSuper ? 'checked' : ''}>
              <span>⚡ INFINITE SUPER METER (Always 100%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="cheatOneHitKO" ${cheats.oneHitKO ? 'checked' : ''}>
              <span>💀 1-HIT KO P1 ATTACKS (Instant Elimination)</span>
            </label>
          </div>
        </div>

        <!-- Status & Logout -->
        <div id="adminActionFeedback" style="min-height: 18px; font-size: 7px; margin-bottom: 12px; color: #4ade80;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #27272a; padding-top: 12px;">
          <button id="adminLogoutBtn" style="
            background: #450a0a;
            border: 1px solid #dc2626;
            color: #fca5a5;
            padding: 8px 14px;
            font-size: 7px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
          ">🚪 LOGOUT ADMIN</button>
          <button id="adminCloseDashBtn" style="
            background: #15803d;
            border: 1px solid #22c55e;
            color: #ffffff;
            padding: 8px 16px;
            font-size: 8px;
            font-family: inherit;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
          ">DONE / RETURN [ESC]</button>
        </div>
      </div>
    `;

    // Wire Dashboard Listeners
    const closeBtn = document.getElementById('adminCloseBtn');
    const closeDashBtn = document.getElementById('adminCloseDashBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const toggleMightyBtn = document.getElementById('toggleMightyBtn');
    const add1kBtn = document.getElementById('add1kCoinsBtn');
    const add5kBtn = document.getElementById('add5kCoinsBtn');
    const add50kBtn = document.getElementById('add50kCoinsBtn');
    const resetCoinsBtn = document.getElementById('resetCoinsBtn');
    const unlockAllSkinsBtn = document.getElementById('unlockAllSkinsBtn');
    const resetSkinsBtn = document.getElementById('resetSkinsBtn');
    const cheatGod = document.getElementById('cheatGodMode');
    const cheatSuper = document.getElementById('cheatInfiniteSuper');
    const cheatKO = document.getElementById('cheatOneHitKO');
    const feedback = document.getElementById('adminActionFeedback');

    const showMsg = (msg, col = '#4ade80') => {
      if (feedback) {
        feedback.style.color = col;
        feedback.textContent = msg;
        setTimeout(() => { if (feedback) feedback.textContent = ''; }, 2500);
      }
    };

    if (closeBtn) closeBtn.onclick = () => this.close();
    if (closeDashBtn) closeDashBtn.onclick = () => this.close();

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        setAdminAuthenticated(false);
        try { soundFX.playBlock(); } catch (e) {}
        this.renderLoginView();
      };
    }

    if (toggleMightyBtn) {
      toggleMightyBtn.onclick = () => {
        const currentlyUnlocked = isMightyUnlocked();
        const nextState = !currentlyUnlocked;
        setMightyUnlocked(nextState);
        try {
          if (nextState) soundFX.playUltimateActivation();
          else soundFX.playWhoosh('light');
        } catch (e) {}
        showMsg(nextState ? '✨ M1GHTY UNLOCKED & ADDED TO ROSTER!' : '🔒 M1GHTY LOCKED & HIDDEN FROM ROSTER.');
        this.renderDashboardView();
      };
    }

    if (add1kBtn) {
      add1kBtn.onclick = () => {
        EconomyManager.addCoins(1000);
        try { soundFX.playUltimateActivation(); } catch (e) {}
        showMsg('🪙 +1,000 COINS GRANTED!');
        this.renderDashboardView();
      };
    }

    if (add5kBtn) {
      add5kBtn.onclick = () => {
        EconomyManager.addCoins(5000);
        try { soundFX.playUltimateActivation(); } catch (e) {}
        showMsg('🪙 +5,000 COINS GRANTED!');
        this.renderDashboardView();
      };
    }

    if (add50kBtn) {
      add50kBtn.onclick = () => {
        EconomyManager.addCoins(50000);
        try { soundFX.playUltimateActivation(); } catch (e) {}
        showMsg('🪙 +50,000 COINS GRANTED!');
        this.renderDashboardView();
      };
    }

    if (resetCoinsBtn) {
      resetCoinsBtn.onclick = () => {
        EconomyManager.setCoins(500);
        try { soundFX.playWhoosh('light'); } catch (e) {}
        showMsg('🪙 WALLET RESET TO 500 COINS.');
        this.renderDashboardView();
      };
    }

    if (unlockAllSkinsBtn) {
      unlockAllSkinsBtn.onclick = () => {
        const count = EconomyManager.unlockAllSkins();
        try { soundFX.playUltimateActivation(); } catch (e) {}
        showMsg(`👑 ALL ${count} SKINS UNLOCKED!`);
      };
    }

    if (resetSkinsBtn) {
      resetSkinsBtn.onclick = () => {
        EconomyManager.resetOwnedSkins();
        try { soundFX.playWhoosh('light'); } catch (e) {}
        showMsg('🔒 ALL PURCHASED SKINS RESET.');
      };
    }

    const updateCheats = () => {
      const updated = {
        godMode: !!(cheatGod && cheatGod.checked),
        infiniteSuper: !!(cheatSuper && cheatSuper.checked),
        oneHitKO: !!(cheatKO && cheatKO.checked)
      };
      setAdminCheats(updated);
      showMsg('⚙️ COMBAT MODIFIERS UPDATED.');
    };

    if (cheatGod) cheatGod.onchange = updateCheats;
    if (cheatSuper) cheatSuper.onchange = updateCheats;
    if (cheatKO) cheatKO.onchange = updateCheats;
  }
}
