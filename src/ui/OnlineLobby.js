// Final Impact - Online Netplay Lobby UI Screen
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';
import {
  COLORS, FONTS, approach, hexToRgba, slantPath,
  drawText, drawBackdrop, drawScreenHeader, drawPromptBar, drawPanel,
  drawActionButton, drawChip, drawKeyCap, drawCornerBrackets
} from './Theme.js';

// Layout (640x360 logical canvas) shared by rendering and hit-testing
const LOBBY = {
  back: { x: 640 - 16 - 74, y: 14, w: 74, h: 18 },
  pill: { x: 320 - 130, y: 54, w: 260, h: 20 },
  options: { x: 320 - 200, y: 94, w: 400, h: 54, gap: 14 },
  card: { x: 320 - 210, y: 88, w: 420, h: 196 },
  code: { x: 320 - 140, y: 128, w: 280, h: 52 },
  btn: { x: 320 - 100, y: 252, w: 200, h: 20 }
};

export class OnlineLobby {
  constructor(netplay, game) {
    this.netplay = netplay;
    this.game = game;

    this.subState = 'MENU'; // 'MENU' | 'HOSTING' | 'JOINING' | 'CONNECTED'
    this.menuIndex = 0; // 0: Host, 1: Join
    this.matchMode = 'versus'; // 'versus' | 'coop_campaign'
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

  reset(preserveMode = false) {
    this.subState = 'MENU';
    this.menuIndex = 0;
    this.joinInputCode = '';
    this.copiedToastTimer = 0;
    if (!preserveMode) {
      this.matchMode = 'versus';
    }
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
    if (inputState.toggleMode && (this.subState === 'MENU' || this.subState === 'HOSTING')) {
      this.matchMode = (this.matchMode === 'versus') ? 'coop_campaign' : 'versus';
      soundFX.playWhoosh('light');
    }

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
    // Click coordinates arrive in the 640x360 logical space (the canvas backing store is 2x)
    const inR = (r, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;

    // Back / cancel chip (top-right)
    if (inR(LOBBY.back, 3)) {
      if (this.subState === 'MENU') {
        if (this.game) this.game.screen = 'MODE_SELECT';
        soundFX.playWhoosh('light');
      } else {
        this.netplay.disconnect();
        this.subState = 'MENU';
        soundFX.playWhoosh('light');
      }
      return true;
    }

    // Match-type toggle (MENU or HOSTING)
    if ((this.subState === 'MENU' || this.subState === 'HOSTING') && inR(LOBBY.pill, 2)) {
      this.matchMode = (this.matchMode === 'versus') ? 'coop_campaign' : 'versus';
      soundFX.playWhoosh('light');
      return true;
    }

    if (this.subState === 'MENU') {
      const O = LOBBY.options;
      for (let idx = 0; idx < 2; idx++) {
        const r = { x: O.x, y: O.y + idx * (O.h + O.gap), w: O.w, h: O.h };
        if (inR(r)) {
          this.menuIndex = idx;
          this.handleInput({ confirm: true });
          return true;
        }
      }
    } else if (this.subState === 'HOSTING') {
      if (inR(LOBBY.code, 4) || inR(LOBBY.btn, 2)) {
        this.copyInviteLink();
        return true;
      }
    } else if (this.subState === 'JOINING') {
      if ((inR(LOBBY.code, 4) || inR(LOBBY.btn, 2)) && this.joinInputCode.length >= 4) {
        this.netplay.joinMatch(this.joinInputCode);
        soundFX.playMenuSelect();
        return true;
      }
    }
    return false;
  }

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  // Row of character slots (room code display / entry)
  drawCodeSlots(ctx, W, text, slots, color, t, cursor = false) {
    const C = LOBBY.code;
    const gap = 8;
    const sw = Math.min(40, (C.w - gap * (slots - 1)) / slots);
    const total = slots * sw + gap * (slots - 1);
    const x0 = W / 2 - total / 2;
    for (let i = 0; i < slots; i++) {
      const x = x0 + i * (sw + gap);
      const ch = text[i] || '';
      const active = cursor && i === Math.min(text.length, slots - 1) && text.length < slots;
      slantPath(ctx, x, C.y, sw, C.h, 6);
      ctx.fillStyle = ch ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.45)';
      ctx.fill();
      ctx.strokeStyle = active ? color : (ch ? hexToRgba(color, 0.55) : 'rgba(255,255,255,0.12)');
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.stroke();
      if (ch) {
        drawText(ctx, ch, x + sw / 2, C.y + C.h / 2 + 11, { font: FONTS.display(30), color: '#fff', align: 'center', outline: 3 });
      } else if (active && Math.floor(t / 20) % 2 === 0) {
        ctx.fillStyle = color;
        ctx.fillRect(x + sw / 2 - 7, C.y + C.h - 12, 14, 2);
      }
    }
  }

  drawStatus(ctx, W, y, msg, t) {
    if (!msg) return;
    const bad = /ERROR|NOT FOUND|FAILED|CLOSED|NOT LOADED/.test(msg);
    const good = /CONNECTED/.test(msg) && !bad;
    const color = bad ? COLORS.bad : (good ? COLORS.good : COLORS.p1);
    if (!bad && !good) {
      // small spinner
      ctx.save();
      ctx.font = FONTS.ui(9, 800);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
      const mw = ctx.measureText(msg).width;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(W / 2 - mw / 2 - 10, y - 3, 4, t * 0.15, t * 0.15 + Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();
    }
    drawText(ctx, msg, W / 2, y, { font: FONTS.ui(9, 800), color, align: 'center', letterSpacing: 1 });
  }

  render(ctx, W, H) {
    this.animTimer++;
    if (this.copiedToastTimer > 0) this.copiedToastTimer--;
    const t = this.animTimer;
    const gp = this.hasGamepad();
    const isCoop = this.matchMode === 'coop_campaign';
    const accent = isCoop ? COLORS.gold : COLORS.p1;

    drawBackdrop(ctx, W, H, t, { tint: isCoop ? '#5b3a0a' : COLORS.p1Deep });
    drawScreenHeader(ctx, W, 'ONLINE', isCoop ? 'CO-OP BOSS RAID' : 'PEER-TO-PEER VERSUS', t);
    const B = LOBBY.back;
    drawChip(ctx, B.x, B.y, B.w, B.h, gp ? 'B' : 'ESC', this.subState === 'MENU' ? 'MODES' : 'CANCEL');

    // Match-type toggle
    if (this.subState === 'MENU' || this.subState === 'HOSTING') {
      const P = LOBBY.pill;
      const half = P.w / 2;
      slantPath(ctx, P.x, P.y, P.w, P.h, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      this._pillX = approach(this._pillX, P.x + (isCoop ? half : 0), 0.3);
      slantPath(ctx, this._pillX + 1, P.y + 1, half - 2, P.h - 2, 7);
      ctx.fillStyle = hexToRgba(accent, 0.3);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.stroke();
      drawText(ctx, '1V1 VERSUS', P.x + half / 2, P.y + 14, { font: FONTS.display(11), color: !isCoop ? '#fff' : COLORS.textMute, align: 'center' });
      drawText(ctx, 'CO-OP RAID', P.x + half * 1.5, P.y + 14, { font: FONTS.display(11), color: isCoop ? '#fff' : COLORS.textMute, align: 'center' });
      drawKeyCap(ctx, 'M', P.x + P.w + 8, P.y + 4);
    }

    if (this.subState === 'MENU') {
      const O = LOBBY.options;
      this._selY = approach(this._selY, O.y + this.menuIndex * (O.h + O.gap), 0.3);
      const options = [
        { title: 'HOST A MATCH', desc: isCoop ? 'Create a co-op raid room and share the code with your ally' : 'Create a room and share the code with your rival' },
        { title: 'JOIN A MATCH', desc: isCoop ? "Enter your ally's room code to join their raid" : "Enter your rival's room code to connect" }
      ];
      options.forEach((opt, idx) => {
        const y = O.y + idx * (O.h + O.gap);
        slantPath(ctx, O.x, y, O.w, O.h, 14);
        ctx.fillStyle = 'rgba(14,13,20,0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      // selection plate glides between the two options
      const sy = this._selY;
      const g = ctx.createLinearGradient(O.x, 0, O.x + O.w, 0);
      g.addColorStop(0, hexToRgba(COLORS.crimson, 0.92));
      g.addColorStop(1, hexToRgba(COLORS.crimsonDeep, 0.3));
      slantPath(ctx, O.x, sy, O.w, O.h, 14);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(O.x + 14, sy, O.w - 14, 1);
      options.forEach((opt, idx) => {
        const y = O.y + idx * (O.h + O.gap);
        const sel = this.menuIndex === idx;
        drawText(ctx, opt.title, O.x + 34, y + 25, { font: FONTS.display(20), color: sel ? '#fff' : COLORS.textDim, shadow: sel ? { color: 'rgba(0,0,0,0.5)', x: 1, y: 1 } : null });
        drawText(ctx, opt.desc, O.x + 34, y + 41, { font: FONTS.ui(9, 600), color: sel ? COLORS.text : COLORS.textMute, maxWidth: O.w - 90 });
        drawText(ctx, '0' + (idx + 1), O.x + O.w - 24, y + 34, { font: FONTS.display(24), color: sel ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)', align: 'right' });
      });
      drawText(ctx, 'Direct WebRTC connection · no account needed · invite links work too', W / 2, 252, {
        font: FONTS.ui(8, 600), color: COLORS.textMute, align: 'center'
      });
      const items = gp
        ? [{ key: 'D-PAD', label: 'SELECT' }, { key: 'A', label: 'CONFIRM' }, { key: 'B', label: 'BACK' }]
        : [{ key: 'W/S', label: 'SELECT' }, { key: 'M', label: 'MATCH TYPE' }, { key: 'ENTER', label: 'CONFIRM' }, { key: 'ESC', label: 'BACK' }];
      drawPromptBar(ctx, items, W / 2, H - 8);
    } else if (this.subState === 'HOSTING' || this.subState === 'JOINING') {
      const hosting = this.subState === 'HOSTING';
      const C = LOBBY.card;
      drawPanel(ctx, C.x, C.y, C.w, C.h, { fill: 'rgba(12, 11, 18, 0.9)', stroke: 'rgba(255,255,255,0.08)' });
      ctx.fillStyle = accent;
      ctx.fillRect(C.x, C.y, C.w, 2);
      drawText(ctx, hosting ? 'YOUR ROOM CODE' : 'ENTER ROOM CODE', W / 2, C.y + 26, {
        font: FONTS.ui(9, 800), color: accent, align: 'center', letterSpacing: 3
      });
      const K = LOBBY.code;
      if (hosting) {
        const code = String(this.netplay.roomCode || '');
        this.drawCodeSlots(ctx, W, code, Math.max(5, code.length), accent, t, !code);
        drawCornerBrackets(ctx, K.x - 6, K.y - 6, K.w + 12, K.h + 12, { color: hexToRgba(COLORS.gold, 0.6), len: 8, lw: 1.5 });
        this.drawStatus(ctx, W, C.y + 124, this.netplay.statusMessage || 'WAITING FOR CHALLENGER...', t);
        drawText(ctx, isCoop ? 'Your ally picks Online → Join and enters this code' : 'Your rival picks Online → Join and enters this code', W / 2, C.y + 142, {
          font: FONTS.ui(8, 600), color: COLORS.textMute, align: 'center'
        });
        const b = LOBBY.btn;
        const copied = this.copiedToastTimer > 0;
        drawActionButton(ctx, b.x, b.y, b.w, b.h, copied ? 'LINK COPIED!' : 'COPY INVITE LINK', {
          key: 'C', time: t, size: 11,
          color: copied ? '#22a35a' : COLORS.crimson,
          deep: copied ? '#14532d' : COLORS.crimsonDeep
        });
        const items = gp ? [{ key: 'B', label: 'CANCEL' }] : [{ key: 'C', label: 'COPY LINK' }, { key: 'M', label: 'MATCH TYPE' }, { key: 'ESC', label: 'CANCEL' }];
        drawPromptBar(ctx, items, W / 2, H - 8);
      } else {
        const slots = this.joinInputCode.length >= 6 ? 6 : 5;
        this.drawCodeSlots(ctx, W, this.joinInputCode, slots, accent, t, true);
        drawCornerBrackets(ctx, K.x - 6, K.y - 6, K.w + 12, K.h + 12, { color: hexToRgba(accent, 0.6), len: 8, lw: 1.5 });
        if (this.netplay.statusMessage) {
          this.drawStatus(ctx, W, C.y + 124, this.netplay.statusMessage, t);
        } else {
          drawText(ctx, 'Type the code on your keyboard · Ctrl+V to paste', W / 2, C.y + 124, {
            font: FONTS.ui(9, 600), color: COLORS.textDim, align: 'center'
          });
        }
        const b = LOBBY.btn;
        const ready = this.joinInputCode.length >= 4 && this.netplay.status !== 'CONNECTING';
        drawActionButton(ctx, b.x, b.y, b.w, b.h, 'CONNECT', { key: gp ? 'A' : 'ENTER', time: t, size: 11, disabled: !ready });
        const items = [{ key: 'ENTER', label: 'CONNECT' }, { key: 'BKSP', label: 'DELETE' }, { key: 'ESC', label: 'CANCEL' }];
        drawPromptBar(ctx, items, W / 2, H - 8);
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
