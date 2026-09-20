// Final Impact - Online Netplay Lobby UI Screen
import { soundFX } from '../audio/SoundFX.js';

export class OnlineLobby {
  constructor(netplay, game) {
    this.netplay = netplay;
    this.game = game;

    this.subState = 'MENU'; // 'MENU' | 'HOSTING' | 'JOINING' | 'CONNECTED'
    this.menuIndex = 0; // 0: Host, 1: Join
    this.joinInputCode = '';
    this.copiedToastTimer = 0;
    this.animTimer = 0;

    // Listen for clipboard / keyboard paste
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', (e) => {
        if (this.game.screen === 'ONLINE_LOBBY' && this.subState === 'JOINING') {
          const text = (e.clipboardData || window.clipboardData).getData('text');
          if (text) {
            const clean = text.replace(/[^0-9a-zA-Z]/g, '').slice(0, 6);
            this.joinInputCode = clean;
            soundFX.playWhoosh('light');
          }
        }
      });
    }
  }

  reset() {
    this.subState = 'MENU';
    this.menuIndex = 0;
    this.joinInputCode = '';
    this.copiedToastTimer = 0;
  }

  copyInviteLink() {
    if (!this.netplay.roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${this.netplay.roomCode}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedToastTimer = 90;
        soundFX.playSuperReady();
      }).catch(() => {
        this.fallbackCopyText(url);
      });
    } else {
      this.fallbackCopyText(url);
    }
  }

  fallbackCopyText(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.copiedToastTimer = 90;
      soundFX.playSuperReady();
    } catch (e) {
      console.warn('Copy failed', e);
    }
  }

  handleInput(inputState) {
    // 1. MENU Substate (Select Host or Join)
    if (this.subState === 'MENU') {
      if (inputState.up || inputState.down) {
        this.menuIndex = 1 - this.menuIndex;
        soundFX.playWhoosh('light');
      }

      if (inputState.confirm) {
        if (this.menuIndex === 0) {
          // Host Match
          this.subState = 'HOSTING';
          this.netplay.hostMatch();
          soundFX.playMenuSelect();
        } else {
          // Join Match
          this.subState = 'JOINING';
          this.joinInputCode = '';
          soundFX.playMenuSelect();
        }
      }
      return;
    }

    // 2. HOSTING Substate
    if (this.subState === 'HOSTING') {
      if (inputState.copy) {
        this.copyInviteLink();
      }
      if (inputState.back) {
        this.netplay.disconnect();
        this.subState = 'MENU';
        soundFX.playWhoosh('light');
      }
      return;
    }

    // 3. JOINING Substate
    if (this.subState === 'JOINING') {
      if (inputState.back) {
        this.netplay.disconnect();
        this.subState = 'MENU';
        soundFX.playWhoosh('light');
        return;
      }

      if (inputState.key) {
        const k = inputState.key;
        if (k === 'Backspace') {
          if (this.joinInputCode.length > 0) {
            this.joinInputCode = this.joinInputCode.slice(0, -1);
            soundFX.playWhoosh('light');
          }
        } else if (/^[0-9a-zA-Z]$/.test(k) && this.joinInputCode.length < 6) {
          this.joinInputCode += k.toUpperCase();
          soundFX.playWhoosh('light');
        } else if (k === 'Enter') {
          if (this.joinInputCode.length >= 4 && this.netplay.status !== 'CONNECTING') {
            this.netplay.joinMatch(this.joinInputCode);
            soundFX.playMenuSelect();
          }
        }
      }

      if (inputState.confirm && this.joinInputCode.length >= 4 && this.netplay.status !== 'CONNECTING') {
        this.netplay.joinMatch(this.joinInputCode);
        soundFX.playMenuSelect();
      }
    }
  }

  handleClick(x, y) {
    const W = (this.game && this.game.canvas) ? this.game.canvas.width : 960;
    if (this.subState === 'MENU') {
      const boxW = 420;
      const boxH = 64;
      const startY = 100;
      const gapY = 80;
      if (x >= W / 2 - boxW / 2 && x <= W / 2 + boxW / 2 && y >= startY && y <= startY + boxH) {
        this.menuIndex = 0;
        this.handleInput({ confirm: true });
      } else if (x >= W / 2 - boxW / 2 && x <= W / 2 + boxW / 2 && y >= startY + gapY && y <= startY + gapY + boxH) {
        this.menuIndex = 1;
        this.handleInput({ confirm: true });
      }
    } else if (this.subState === 'HOSTING') {
      if (y >= 120 && y <= 260) {
        this.copyInviteLink();
      }
    }
  }

  render(ctx, W, H) {
    this.animTimer++;
    if (this.copiedToastTimer > 0) this.copiedToastTimer--;

    // 1. Neon Grid Synthwave Background
    ctx.fillStyle = '#08051a';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#27184d';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Title Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🌐 FINAL IMPACT - ONLINE VERSUS', W / 2, 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('WEBRTC ZERO-SETUP PEER-TO-PEER NETPLAY', W / 2, 54);

    // ==========================================
    // Sub-Screen: MENU (Choose Host or Join)
    // ==========================================
    if (this.subState === 'MENU') {
      const boxW = 420;
      const boxH = 64;
      const startY = 100;
      const gapY = 80;

      const options = [
        { title: '👑 HOST A MATCH', desc: 'Generate a Room Code and invite your friend' },
        { title: '⚔️ JOIN A MATCH', desc: 'Enter a 5-digit Room Code to connect' }
      ];

      options.forEach((opt, idx) => {
        const isSelected = this.menuIndex === idx;
        const y = startY + idx * gapY;

        ctx.fillStyle = isSelected ? '#1e1b4b' : '#0f0c24';
        ctx.fillRect(W / 2 - boxW / 2, y, boxW, boxH);

        ctx.strokeStyle = isSelected ? '#a855f7' : '#3b2d6b';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(W / 2 - boxW / 2, y, boxW, boxH);

        if (isSelected) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(`► ${opt.title} ◄`, W / 2, y + 26);
        } else {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(opt.title, W / 2, y + 26);
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(opt.desc, W / 2, y + 48);
      });

      ctx.fillStyle = '#facc15';
      ctx.font = '12px monospace';
      ctx.fillText('[W / S] or [↑ / ↓] TO SELECT  |  [ENTER / SPACE] CONFIRM  |  [ESC] BACK', W / 2, H - 28);
    }

    // ==========================================
    // Sub-Screen: HOSTING
    // ==========================================
    else if (this.subState === 'HOSTING') {
      const code = this.netplay.roomCode || '.....';

      ctx.fillStyle = '#170f36';
      ctx.fillRect(W / 2 - 200, 85, 400, 190);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 200, 85, 400, 190);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('SHARE THIS ROOM CODE WITH YOUR FRIEND:', W / 2, 115);

      // Large Room Code Display Box
      ctx.fillStyle = '#090518';
      ctx.fillRect(W / 2 - 130, 130, 260, 52);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 130, 130, 260, 52);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(code, W / 2, 166);

      // Status indicator / spinner
      const pulse = Math.floor(Date.now() / 350) % 2 === 0;
      ctx.fillStyle = pulse ? '#38bdf8' : '#0284c7';
      ctx.font = '12px monospace';
      ctx.fillText(this.netplay.statusMessage || 'WAITING FOR CHALLENGER TO CONNECT...', W / 2, 215);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('PRESS [C] TO COPY INVITE LINK  |  [ESC] CANCEL & RETURN', W / 2, 248);

      if (this.copiedToastTimer > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('✓ INVITE LINK COPIED TO CLIPBOARD!', W / 2, 298);
      }
    }

    // ==========================================
    // Sub-Screen: JOINING
    // ==========================================
    else if (this.subState === 'JOINING') {
      ctx.fillStyle = '#170f36';
      ctx.fillRect(W / 2 - 200, 85, 400, 190);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 200, 85, 400, 190);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('ENTER 5-DIGIT ROOM CODE:', W / 2, 115);

      // Input Field Box
      ctx.fillStyle = '#090518';
      ctx.fillRect(W / 2 - 130, 130, 260, 52);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 130, 130, 260, 52);

      const displayCode = (this.joinInputCode + '_____').slice(0, 5);
      const cursor = Math.floor(Date.now() / 400) % 2 === 0 ? '|' : '';

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(this.joinInputCode + cursor, W / 2, 166);

      // Status
      if (this.netplay.statusMessage) {
        ctx.fillStyle = this.netplay.statusMessage.includes('ERROR') || this.netplay.statusMessage.includes('NOT FOUND') ? '#ef4444' : '#facc15';
        ctx.font = '12px monospace';
        ctx.fillText(this.netplay.statusMessage, W / 2, 215);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('TYPE DIGITS ON KEYBOARD (OR CTRL+V TO PASTE)', W / 2, 215);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('[ENTER] CONNECT  |  [BACKSPACE] DELETE  |  [ESC] CANCEL', W / 2, 248);
    }

    ctx.textAlign = 'left';
  }
}
