import { STAGE_CATALOG } from '../graphics/StageCatalog.js';
// Final Impact - Character Select Screen
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { soundFX } from '../audio/SoundFX.js';
import { input } from '../engine/Input.js';
import { isMightyUnlocked, setMightyUnlocked, isStealthMode, isAdminAuthenticated } from '../utils/CryptoAuth.js';
import { EconomyManager, SKIN_CATALOG } from '../shop/SkinCatalog.js';
import { FIGHTER_CATALOG } from '../fighters/FighterCatalog.js';
import {
  COLORS, FONTS, ease, approach, wrapLines, cleanLabel, hexToRgba, slantPath,
  drawText, drawBackdrop, drawScreenHeader, drawPromptBar, drawStatPips, drawCornerBrackets,
  drawPlatform, drawFighterSprite, drawActionButton, drawStatusBar, drawChip
} from './Theme.js';

const MODE_LABELS = {
  campaign: 'CAMPAIGN · 8 BOSSES',
  coop_campaign: 'CO-OP CAMPAIGN · ONLINE RAID',
  cpu: 'VS CPU',
  '2p': 'LOCAL VERSUS',
  '2v2': '2V2 TEAM BRAWL',
  online: 'ONLINE VERSUS',
  training: 'TRAINING DOJO',
  tutorial: 'TUTORIAL · PICK YOUR FIGHTER'
};

// Panel geometry (640x360 logical canvas)
const SIDE_W = 206;          // width of each fighter showcase column
const GROUND_Y = 222;        // where showcase fighters stand
const BTN = { w: 236, h: 20, y: 318 };
const BACK = { w: 64, h: 18, y: 14 };      // anchored to the right edge
const ADMIN = { w: 96, h: 18, y: 14 };     // sits left of BACK

export class CharacterSelect {
  constructor() {
    this.characters = FIGHTER_CATALOG;

    this.stages = STAGE_CATALOG;

    this.p1Index = 0;
    this.p2Index = 1;
    this.stageIndex = 0;
    this.gameMode = 'campaign'; // 'campaign', 'cpu', '2p', '2v2', 'training', 'coop_campaign'
    this.cpuDifficulty = 'normal';
    this.localPlayerNum = 1;
    this.p1Locked = false;
    this.p2Locked = false;
    this.animTimer = 0;
    this.animFrame = 0;
    this.showCodeModal = false;

    // Admin feedback state
    this.codeFeedback = '';
    this.codeFeedbackColor = '#38bdf8';
    this.onOpenAdmin = null;

    // Visual-only animation state
    this._cur = { 1: null, 2: null };
    this._last = { 1: -1, 2: -1 };
    this._changed = { 1: -100, 2: -100 };
    this._feedbackSeen = '';
    this._feedbackT = 0;

    // Cache sprites for previews (taking into account equipped skins)
    this.previewSprites = {};
    this.refreshPreviews();
  }

  refreshPreviews() {
    this.characters.forEach(c => {
      const equippedSkin = EconomyManager.getEquippedSkin(c.id);
      this.previewSprites[c.id] = spriteGenerator.generateFighterSprites(c.id, equippedSkin);
    });
  }

  isMightyUnlocked() {
    return isMightyUnlocked();
  }

  unlockMighty() {
    setMightyUnlocked(true);
    const equipped = EconomyManager.getEquippedSkin('mighty');
    this.previewSprites['mighty'] = spriteGenerator.generateFighterSprites('mighty', equipped);
  }

  lockMighty() {
    setMightyUnlocked(false);
  }

  openAdminPortal() {
    if (typeof this.onOpenAdmin === 'function') {
      this.onOpenAdmin();
    } else if (typeof window !== 'undefined' && typeof window.openAdminPortal === 'function') {
      window.openAdminPortal();
    }
  }

  // Gamepad X on this screen (Game.js) - the old secret-code modal now routes to the admin portal.
  openCodeModal() {
    const isStealth = isStealthMode() && !isAdminAuthenticated();
    if (isStealth) return;
    this.showCodeModal = false;
    this.openAdminPortal();
  }

  isDragonUnlocked() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_unlocked_dragon') === 'true';
    } catch (e) {
      return false;
    }
  }

  hasBeatenDragon() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('final_impact_beaten_dragon') === 'true';
    } catch (e) {
      return false;
    }
  }

  unlockDragon() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('final_impact_unlocked_dragon', 'true');
        localStorage.setItem('final_impact_beaten_dragon', 'true');
      }
      if (!this.previewSprites['endless_dragon']) {
        this.previewSprites['endless_dragon'] = spriteGenerator.generateFighterSprites('endless_dragon');
      }
    } catch (e) {}
  }

  isCurrentSelectionLocked(isP1 = true) {
    const idx = isP1 ? this.p1Index : this.p2Index;
    const char = this.characters[idx];
    if (!char) return false;
    if (char.id === 'mighty' && !this.isMightyUnlocked()) return 'mighty';
    if (char.id === 'endless_dragon' && !this.isDragonUnlocked()) return 'dragon';
    return false;
  }

  setMode(mode, difficulty = 'normal', localPlayerNum = 1) {
    this.gameMode = mode;
    this.cpuDifficulty = difficulty;
    this.localPlayerNum = localPlayerNum;
  }

  // Roster is laid out as a compact centred block (4 rows for the 20-fighter roster).
  gridCols() {
    return Math.max(4, Math.ceil(this.characters.length / 4));
  }

  /** Roster grid geometry (shared by hit-testing and rendering). */
  gridLayout(W = 640) {
    const cols = this.gridCols();
    const rows = Math.ceil(this.characters.length / cols);
    const gap = 4;
    const tileW = Math.min(40, Math.floor((W - 2 * SIDE_W - 16 - (cols - 1) * gap) / cols));
    const tileH = Math.min(40, Math.floor((168 - (rows - 1) * gap) / rows));
    const totalW = cols * tileW + (cols - 1) * gap;
    return { cols, rows, tileW, tileH, gap, x0: Math.round((W - totalW) / 2), y0: 56 };
  }

  tileRect(idx, W = 640) {
    const G = this.gridLayout(W);
    const col = idx % G.cols, row = Math.floor(idx / G.cols);
    return { x: G.x0 + col * (G.tileW + G.gap), y: G.y0 + row * (G.tileH + G.gap), w: G.tileW, h: G.tileH };
  }

  backRect(W = 640) { return { x: W - 16 - BACK.w, y: BACK.y, w: BACK.w, h: BACK.h }; }
  adminRect(W = 640) { return { x: W - 16 - BACK.w - 8 - ADMIN.w, y: ADMIN.y, w: ADMIN.w, h: ADMIN.h }; }
  buttonRect(W = 640) { return { x: (W - BTN.w) / 2, y: BTN.y, w: BTN.w, h: BTN.h }; }

  handleInput(inputState, isP1 = true) {
    if (this.showCodeModal) return;

    if (isP1) {
      if (inputState.left) {
        this.p1Index = (this.p1Index - 1 + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.p1Index = (this.p1Index + 1) % this.characters.length;
        soundFX.playWhoosh('light');
      }

      // Move between roster rows with Up / Down
      if (inputState.up) {
        this.p1Index = (this.p1Index - this.gridCols() + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.down) {
        this.p1Index = (this.p1Index + this.gridCols()) % this.characters.length;
        soundFX.playWhoosh('light');
      }
    } else {
      // Player 2 selection in 2P mode
      if (inputState.up) {
        this.p2Index = (this.p2Index - this.gridCols() + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.down) {
        this.p2Index = (this.p2Index + this.gridCols()) % this.characters.length;
        soundFX.playWhoosh('light');
      }
      if (inputState.left) {
        this.p2Index = (this.p2Index - 1 + this.characters.length) % this.characters.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.p2Index = (this.p2Index + 1) % this.characters.length;
        soundFX.playWhoosh('light');
      }
    }
  }

  handleClick(x, y, onBack, onConfirm, W = 640, H = 360) {
    const inRect = (r, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;

    // Header: Back chip (top-right)
    if (inRect(this.backRect(W), 3)) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // Header: Admin Portal chip (hidden in stealth mode)
    const isStealth = isStealthMode() && !isAdminAuthenticated();
    if (!isStealth && inRect(this.adminRect(W), 3)) {
      this.openAdminPortal();
      return true;
    }

    // Roster tiles
    for (let idx = 0; idx < this.characters.length; idx++) {
      const r = this.tileRect(idx, W);
      if (inRect(r)) {
        const char = this.characters[idx];
        const prevIdx = (this.gameMode === 'online' && this.localPlayerNum === 2) ? this.p2Index : this.p1Index;
        const wasAlreadySelected = (prevIdx === idx);

        if (this.gameMode === 'online' && this.localPlayerNum === 2) {
          this.p2Index = idx;
        } else {
          this.p1Index = idx;
        }
        soundFX.playWhoosh('light');
        if (char.id === 'mighty' && !this.isMightyUnlocked()) {
          if (isStealth) {
            this.codeFeedback = '🔒 CLASSIFIED TOURNAMENT FIGHTER: LOCKED';
            this.codeFeedbackColor = '#ef4444';
          } else {
            this.codeFeedback = '🔒 M1GHTY IS THE CREATOR\'S PERSONAL FIGHTER';
            this.codeFeedbackColor = '#fbbf24';
            this.openAdminPortal();
          }
          return true;
        } else if (char.id === 'endless_dragon' && !this.isDragonUnlocked()) {
          try { soundFX.playBlock(); } catch (e) {}
          return true;
        }

        // Clicking an already-selected fighter instantly confirms
        if (wasAlreadySelected && onConfirm && (this.gameMode !== 'online' || this.localPlayerNum === 1)) {
          onConfirm();
        }
        return true;
      }
    }

    // Clicking your own fighter showcase confirms the selection
    const focusRight = this.gameMode === 'online' && this.localPlayerNum === 2;
    const showcase = { x: focusRight ? W - SIDE_W : 0, y: 50, w: SIDE_W, h: GROUND_Y - 40 };
    if (inRect(showcase)) {
      if (this.gameMode !== 'online' || this.localPlayerNum === 1) {
        const lockedType = this.isCurrentSelectionLocked(true);
        if (!lockedType && onConfirm) {
          onConfirm();
          return true;
        }
      }
    }

    // Bottom action button
    if (inRect(this.buttonRect(W), 2)) {
      if (this.gameMode !== 'online' || this.localPlayerNum === 1) {
        // Prevent starting if current selection is locked
        const lockedType = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);
        if (lockedType) {
          try { soundFX.playBlock(); } catch (e) {}
          if (lockedType === 'mighty') {
            if (isStealth) {
              this.codeFeedback = '🔒 CLASSIFIED TOURNAMENT FIGHTER: LOCKED';
              this.codeFeedbackColor = '#ef4444';
            } else {
              this.codeFeedback = '🔒 M1GHTY IS THE CREATOR\'S PERSONAL FIGHTER';
              this.codeFeedbackColor = '#fbbf24';
              this.openAdminPortal();
            }
          }
          return true;
        }
        if (onConfirm) onConfirm();
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  idleFrame(id, offset = 0) {
    const sprites = this.previewSprites[id];
    const frames = sprites?.idle || sprites?.IDLE || [];
    if (!frames.length) return null;
    return frames[(this.animFrame + offset) % frames.length];
  }

  // Big fighter render + name/stats block for one side of the screen.
  drawShowcase(ctx, W, side, idx, tag, color, opts = {}) {
    const t = this.animTimer;
    const { locked = false, mystery = false, isStealth = false } = opts;
    const left = side === 'left';
    const pn = left ? 1 : 2;
    const ch = this.characters[idx];
    const cx = left ? SIDE_W / 2 + 4 : W - SIDE_W / 2 - 4;
    const since = t - this._changed[pn];
    const k = ease.outCubic(since / 14);
    const slide = (1 - k) * (left ? -22 : 22);
    const tx = left ? 18 : W - 18;
    const align = left ? 'left' : 'right';
    const dir = left ? 1 : -1;

    // Tag chip ("PLAYER 1" / "CPU")
    ctx.save();
    ctx.font = FONTS.ui(8, 800);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    const tagW = ctx.measureText(tag).width + 18;
    ctx.restore();
    const chipX = left ? 16 : W - 16 - tagW;
    ctx.fillStyle = color;
    slantPath(ctx, chipX, 54, tagW, 13, 5);
    ctx.fill();
    drawText(ctx, tag, chipX + tagW / 2, 63.5, { font: FONTS.ui(8, 800), color: '#08080c', align: 'center', letterSpacing: 1.5 });

    // Equipped skin badge next to the tag
    if (!locked && !mystery && ch) {
      const equippedSkinId = EconomyManager.getEquippedSkin(ch.id);
      if (equippedSkinId) {
        const skinObj = SKIN_CATALOG.find(s => s.id === equippedSkinId);
        const label = '★ ' + cleanLabel(skinObj ? skinObj.name : equippedSkinId).toUpperCase();
        drawText(ctx, label, left ? chipX + tagW + 6 : chipX - 6, 63.5, {
          font: FONTS.ui(8, 800), color: skinObj ? skinObj.tierColor : COLORS.p1, align, maxWidth: SIDE_W - tagW - 16
        });
      }
    }

    // Platform + fighter
    drawPlatform(ctx, cx, GROUND_Y, 58, color, t);
    if (mystery) {
      drawText(ctx, '?', cx, GROUND_Y - 34, { font: FONTS.display(96), color: hexToRgba(COLORS.crimson, 0.85), align: 'center', outline: 6 });
    } else {
      const img = this.idleFrame(ch.id, left ? 0 : 2);
      const drawn = drawFighterSprite(ctx, img, cx + slide, GROUND_Y + 2, 2, {
        mirror: !left, rim: color, alpha: 0.3 + 0.7 * k, silhouette: locked, glow: 8
      });
      if (!drawn) {
        drawText(ctx, '?', cx, GROUND_Y - 40, { font: FONTS.display(80), color: COLORS.textMute, align: 'center' });
      }
      if (locked) {
        drawText(ctx, '?', cx + slide, GROUND_Y - 60, { font: FONTS.display(44), color: hexToRgba(color, 0.9), align: 'center', outline: 4 });
      }
    }

    // ---- Info block -------------------------------------------------------
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75 * k;
    const ix = tx + slide * 0.5;
    let name, title, sub;
    if (mystery) {
      name = 'BOSS RUSH'; title = 'THE CAMPAIGN GAUNTLET'; sub = '8 arena masters await';
    } else if (locked) {
      name = '???';
      if (ch.id === 'mighty') {
        title = isStealth ? 'ANCIENT PRIMORDIAL ENTITY' : 'CLASSIFIED ADMIN FIGHTER';
        sub = isStealth ? 'Sealed in the retro vault' : 'Restricted: admin access only';
      } else {
        title = 'FINAL BOSS';
        sub = 'Beat the Endless Dragon in Campaign';
      }
    } else {
      name = ch.name; title = ch.title; sub = `${ch.style} · ${ch.origin}`;
    }
    drawText(ctx, name, ix, 248, { font: FONTS.display(22), color: '#fff', align, outline: 3, maxWidth: SIDE_W - 20 });
    drawText(ctx, title, ix, 259, { font: FONTS.ui(8, 800), color: COLORS.gold, align, letterSpacing: 1.2, maxWidth: SIDE_W - 20 });
    drawText(ctx, sub, ix, 270, { font: FONTS.ui(8, 600), color: COLORS.textDim, align, maxWidth: SIDE_W - 20 });

    // divider
    const dg = ctx.createLinearGradient(tx, 0, tx + dir * (SIDE_W - 30), 0);
    dg.addColorStop(0, hexToRgba(color, 0.8));
    dg.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = dg;
    ctx.fillRect(left ? tx : tx - (SIDE_W - 30), 276, SIDE_W - 30, 1);

    if (mystery) {
      drawText(ctx, 'FINAL BOSS: THE ENDLESS DRAGON', ix, 290, { font: FONTS.ui(8, 800), color: COLORS.crimson, align, letterSpacing: 1, maxWidth: SIDE_W - 20 });
    } else if (locked) {
      const hint = ch.id === 'mighty'
        ? (isStealth ? 'PRIMORDIAL POWER SEALED' : 'CREATOR EXCLUSIVE')
        : 'DEFEAT THE DRAGON TO UNLOCK';
      drawText(ctx, hint, ix, 290, { font: FONTS.ui(8, 800), color: COLORS.crimson, align, letterSpacing: 1, maxWidth: SIDE_W - 20 });
    } else {
      // stats column + specials column
      const stats = [['POW', ch.power], ['SPD', ch.speed], ['DEF', ch.defense]];
      const statX = left ? tx : tx - 78;
      stats.forEach(([lbl, v], i) => {
        const y = 288 + i * 10;
        drawText(ctx, lbl, statX, y, { font: FONTS.ui(8, 800), color: COLORS.textDim, letterSpacing: 0.5 });
        drawStatPips(ctx, statX + 22, y - 6, v || 0, 5, { w: 9, h: 5, gap: 2, on: color });
      });
      const spX = left ? tx + 90 : tx - 90;
      (ch.specials || []).slice(0, 3).forEach((sp, i) => {
        const y = 288 + i * 10;
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(left ? spX + 2 : spX - 2, y - 3);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
        ctx.restore();
        drawText(ctx, sp.name, left ? spX + 8 : spX - 8, y, { font: FONTS.ui(8, 700), color: COLORS.text, align, maxWidth: SIDE_W - 108 });
      });
    }
    ctx.restore();
  }

  drawTile(ctx, idx, r, opts) {
    const { locked, isP1, isP2, t } = opts;
    const char = this.characters[idx];
    const active = isP1 || isP2;
    const slant = 4;
    ctx.save();
    slantPath(ctx, r.x, r.y, r.w, r.h, slant);
    const bg = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    bg.addColorStop(0, active ? '#2a2333' : '#17141e');
    bg.addColorStop(1, active ? '#15121b' : '#0c0b11');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();
    if (locked) {
      drawText(ctx, '?', r.x + r.w / 2, r.y + r.h / 2 + 8, { font: FONTS.display(22), color: '#4a4556', align: 'center' });
    } else {
      const img = this.idleFrame(char.id, 0);
      if (img) {
        ctx.imageSmoothingEnabled = false;
        // head-and-shoulders crop of the 80x90 idle frame, scaled 1.5x (3 device px per art px)
        const cw = r.w / 1.5, chh = r.h / 1.5;
        ctx.drawImage(img, 40 - cw / 2 + 3, 14, cw, chh, r.x, r.y, r.w, r.h);
      }
      if (char.id === 'mighty' || char.id === 'endless_dragon') {
        ctx.fillStyle = char.id === 'mighty' ? 'rgba(245, 197, 66, 0.16)' : 'rgba(168, 85, 247, 0.18)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      if (!active) {
        ctx.fillStyle = 'rgba(6,6,10,0.32)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
    }
    // team colour floor strip for the hovered tile
    if (isP1 || isP2) {
      const c = isP1 && isP2 ? null : (isP1 ? COLORS.p1 : COLORS.p2);
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(r.x, r.y + r.h - 2, r.w, 2);
      } else {
        ctx.fillStyle = COLORS.p1;
        ctx.fillRect(r.x, r.y + r.h - 2, r.w / 2, 2);
        ctx.fillStyle = COLORS.p2;
        ctx.fillRect(r.x + r.w / 2, r.y + r.h - 2, r.w / 2, 2);
      }
    }
    ctx.restore();
    ctx.save();
    slantPath(ctx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, slant);
    ctx.strokeStyle = active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  drawCursor(ctx, pn, r, color, label, t, inner = false) {
    // Smoothly glide the cursor between tiles
    const cur = this._cur[pn] || { x: r.x, y: r.y };
    cur.x = approach(cur.x, r.x, 0.35);
    cur.y = approach(cur.y, r.y, 0.35);
    this._cur[pn] = cur;
    const breathe = 1.5 + Math.sin(t * 0.15 + pn) * 1;
    const pad = inner ? -1 : breathe;
    drawCornerBrackets(ctx, cur.x - pad, cur.y - pad, r.w + pad * 2, r.h + pad * 2, {
      color, len: 7, lw: 2, glow: color
    });
    // label tab
    ctx.save();
    ctx.font = FONTS.ui(8, 800);
    const lw = ctx.measureText(label).width + 8;
    ctx.restore();
    const lx = inner ? cur.x + r.w - lw + 1 : cur.x - 1;
    const ly = inner ? cur.y + r.h + 1 : cur.y - 11;
    ctx.fillStyle = color;
    ctx.fillRect(lx, ly, lw, 10);
    drawText(ctx, label, lx + lw / 2, ly + 8, { font: FONTS.ui(8, 800), color: '#08080c', align: 'center' });
  }

  render(ctx, W, H) {
    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 4;
    }
    const t = this.animTimer;

    const mightyUnlocked = this.isMightyUnlocked();
    const dragonUnlocked = this.isDragonUnlocked();
    const hasBeatenDragon = this.hasBeatenDragon();
    const isStealth = isStealthMode() && !isAdminAuthenticated();
    const gp = this.hasGamepad();

    // Track selection changes for slide-in animations
    [[1, this.p1Index], [2, this.p2Index]].forEach(([pn, idx]) => {
      if (this._last[pn] !== idx) { this._last[pn] = idx; this._changed[pn] = t; }
    });

    drawBackdrop(ctx, W, H, t, { tint: COLORS.crimsonDeep });
    // team-coloured side washes
    const wash = (x0, color) => {
      const g = ctx.createRadialGradient(x0, 170, 10, x0, 170, 200);
      g.addColorStop(0, hexToRgba(color, 0.14));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    wash(SIDE_W / 2, COLORS.p1);

    let modeLabel = MODE_LABELS[this.gameMode] || MODE_LABELS.campaign;
    if (this.gameMode === 'cpu') modeLabel += ' · ' + (this.cpuDifficulty || 'normal').toUpperCase();
    if (hasBeatenDragon) modeLabel += '  ★';

    const showP2 = ['2p', 'online', 'coop_campaign', 'cpu', '2v2', 'training', 'tutorial'].includes(this.gameMode);
    const p2Controlled = ['2p', 'online', 'coop_campaign'].includes(this.gameMode);
    const lockedOf = (ch) => (ch.id === 'mighty' && !mightyUnlocked) || (ch.id === 'endless_dragon' && !dragonUnlocked);
    const p2Visible = showP2 && this.gameMode !== 'campaign';
    if (p2Visible || this.gameMode === 'campaign') wash(W - SIDE_W / 2, COLORS.p2);

    drawScreenHeader(ctx, W, 'SELECT FIGHTER', modeLabel, t);

    // Header chips
    const br = this.backRect(W);
    drawChip(ctx, br.x, br.y, br.w, br.h, gp ? 'B' : 'ESC', 'BACK');
    if (!isStealth) {
      const ar = this.adminRect(W);
      drawChip(ctx, ar.x, ar.y, ar.w, ar.h, gp ? 'X' : 'A', mightyUnlocked ? 'ADMIN ON' : 'ADMIN', {
        color: mightyUnlocked ? COLORS.good : COLORS.textDim,
        border: mightyUnlocked ? hexToRgba(COLORS.good, 0.5) : 'rgba(255,255,255,0.18)'
      });
    }

    // ---- Showcases --------------------------------------------------------
    let p1Tag = 'PLAYER 1', p2Tag = p2Controlled ? 'PLAYER 2' : 'CPU';
    if (this.gameMode === 'online') { p1Tag = this.localPlayerNum === 2 ? 'HOST' : 'YOU'; p2Tag = this.localPlayerNum === 2 ? 'YOU' : 'RIVAL'; }
    if (this.gameMode === 'coop_campaign') { p1Tag = this.localPlayerNum === 2 ? 'HOST' : 'YOU (P1)'; p2Tag = this.localPlayerNum === 2 ? 'YOU (ALLY)' : 'ALLY (P2)'; }
    if ((this.gameMode === 'training' || this.gameMode === 'tutorial') && !p2Controlled) p2Tag = 'DUMMY';

    const c1 = this.characters[this.p1Index];
    this.drawShowcase(ctx, W, 'left', this.p1Index, p1Tag, COLORS.p1, { locked: lockedOf(c1), isStealth });
    if (p2Visible) {
      const c2 = this.characters[this.p2Index];
      this.drawShowcase(ctx, W, 'right', this.p2Index, p2Tag, COLORS.p2, { locked: lockedOf(c2), isStealth });
    } else {
      this.drawShowcase(ctx, W, 'right', this.p2Index, 'OPPONENTS', COLORS.p2, { mystery: true, isStealth });
    }

    // ---- Roster grid ------------------------------------------------------
    const rects = this.characters.map((_, idx) => this.tileRect(idx, W));
    this.characters.forEach((char, idx) => {
      this.drawTile(ctx, idx, rects[idx], {
        locked: lockedOf(char),
        isP1: this.p1Index === idx,
        isP2: p2Visible && this.p2Index === idx,
        t
      });
    });
    const p2Label = p2Controlled ? '2P' : ((this.gameMode === 'training' || this.gameMode === 'tutorial') ? 'DMY' : 'CPU');
    if (p2Visible) {
      const same = this.p1Index === this.p2Index;
      this.drawCursor(ctx, 2, rects[this.p2Index], COLORS.p2, p2Label, t, same);
    }
    this.drawCursor(ctx, 1, rects[this.p1Index], COLORS.p1, '1P', t, false);

    // ---- Centre: quote of the fighter you are choosing ---------------------
    const focusIdx = (this.gameMode === 'online' && this.localPlayerNum === 2) ? this.p2Index : this.p1Index;
    const fc = this.characters[focusIdx];
    const G = this.gridLayout(W);
    const gridBottom = G.y0 + G.rows * (G.tileH + G.gap) - G.gap;
    if (fc && !lockedOf(fc) && fc.quote) {
      ctx.font = FONTS.ui(8, 600);
      const lines = wrapLines(ctx, fc.quote, 214).slice(0, 2);
      lines.forEach((ln, i) => {
        drawText(ctx, ln, W / 2, gridBottom + 18 + i * 11, { font: 'italic ' + FONTS.ui(8, 600), color: COLORS.textDim, align: 'center' });
      });
    }

    // ---- Feedback toast ----------------------------------------------------
    if (this.codeFeedback) {
      if (this._feedbackSeen !== this.codeFeedback) { this._feedbackSeen = this.codeFeedback; this._feedbackT = t; }
      const fk = ease.outCubic((t - this._feedbackT) / 10);
      const msg = cleanLabel(this.codeFeedback);
      const fcol = this.codeFeedbackColor || COLORS.gold;
      ctx.font = FONTS.ui(8, 800);
      const lines = wrapLines(ctx, msg, 206).slice(0, 2);
      const th = 10 + lines.length * 10;
      const ty = 306 - th - 2 + (1 - fk) * 6;
      ctx.save();
      ctx.globalAlpha = fk;
      ctx.fillStyle = 'rgba(8,8,12,0.92)';
      ctx.fillRect(W / 2 - 112, ty, 224, th);
      ctx.fillStyle = fcol;
      ctx.fillRect(W / 2 - 112, ty, 2, th);
      lines.forEach((ln, i) => {
        drawText(ctx, ln, W / 2 + 1, ty + 13 + i * 10, { font: FONTS.ui(8, 800), color: fcol, align: 'center', letterSpacing: 0.5 });
      });
      ctx.restore();
    } else {
      this._feedbackSeen = '';
    }

    // ---- Action button / status --------------------------------------------
    const bR = this.buttonRect(W);
    const currentLocked = this.isCurrentSelectionLocked(this.gameMode !== 'online' || this.localPlayerNum === 1);
    if (currentLocked === 'mighty') {
      drawStatusBar(ctx, bR.x, bR.y, bR.w, bR.h, isStealth ? 'THIS FIGHTER IS LOCKED' : 'LOCKED · CREATOR EXCLUSIVE', { color: isStealth ? '#c084fc' : COLORS.warn, time: t, size: 8 });
    } else if (currentLocked === 'dragon') {
      drawStatusBar(ctx, bR.x, bR.y, bR.w, bR.h, 'LOCKED · BEAT THE DRAGON IN CAMPAIGN', { color: '#c084fc', time: t, size: 8 });
    } else if (this.gameMode === 'online' && this.localPlayerNum === 2) {
      const dots = '.'.repeat(1 + Math.floor(t / 20) % 3);
      drawStatusBar(ctx, bR.x, bR.y, bR.w, bR.h, 'WAITING FOR HOST' + dots, { color: COLORS.p1, time: t, size: 8 });
    } else {
      const label = this.gameMode === 'tutorial' ? 'START TUTORIAL' : (['cpu', '2p', '2v2', 'training'].includes(this.gameMode) ? 'CHOOSE STAGE' : 'START BATTLE');
      drawActionButton(ctx, bR.x, bR.y, bR.w, bR.h, label, { key: gp ? 'A' : 'ENTER', time: t, size: 12 });
    }

    // ---- Footer prompts -----------------------------------------------------
    const items = gp
      ? [{ key: 'D-PAD', label: 'MOVE' }, { key: 'A', label: 'CONFIRM' }, { key: 'B', label: 'BACK' }]
      : [{ key: 'WASD', label: 'MOVE' }, { key: 'ENTER', label: 'CONFIRM' }, { key: 'ESC', label: 'BACK' }];
    if (this.gameMode === '2p') items.splice(1, 0, gp ? { key: 'PAD 2', label: 'P2 MOVE' } : { key: 'NUM 8456', label: 'P2 MOVE' });
    drawPromptBar(ctx, items, W / 2, H - 8);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
