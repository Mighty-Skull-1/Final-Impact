// Final Impact - Mode Select Menu Screen
import { soundFX } from '../audio/SoundFX.js';
import { spriteGenerator } from '../graphics/SpriteGenerator.js';
import { input } from '../engine/Input.js';
import {
  COLORS, FONTS, ease, approach, wrapLines, cleanLabel, hexToRgba, slantPath,
  drawText, drawLabel, drawBackdrop, drawScreenHeader, drawPromptBar, drawPanel,
  drawActionButton, drawChip
} from './Theme.js';

// Preview matchups (visual only) - every id here exists in the fighter roster
const MODE_MATCHUPS = {
  campaign: { p1: 'kazuki', p2: 'riot_cop', p1Name: 'KAZUKI', p2Name: 'SGT. VANCE', subtitle: 'CHAPTER 1: STREET RAID' },
  coop_campaign: { p1: 'kazuki', p2: 'boris', p1Name: 'KAZUKI & RAVEN', p2Name: 'BORIS & VIKTOR', subtitle: '2P CO-OP BOSS RAID' },
  cpu: { p1: 'kazuki', p2: 'raven', p1Name: 'KAZUKI', p2Name: 'RAVEN', subtitle: 'ARCADE 1V1 SPARRING' },
  '2p': { p1: 'kagura', p2: 'fang', p1Name: 'KAGURA', p2Name: 'FANG', subtitle: 'LOCAL COUCH VERSUS' },
  '2v2': { p1: 'zephyr', p2: 'viktor', p1Name: 'TEAM ALPHA', p2Name: 'TEAM OMEGA', subtitle: '4-FIGHTER SIMULTANEOUS' },
  online: { p1: 'kazuki', p2: 'ronin', p1Name: 'YOU', p2Name: 'REMOTE RIVAL', subtitle: 'NETPLAY P2P ROOM' },
  training: { p1: 'kazuki', p2: 'colossus', p1Name: 'TRAINEE', p2Name: 'DOJO DUMMY', subtitle: 'COMBO LAB SPARRING' },
  shop: { p1: 'cinder', p2: 'glacier', p1Name: 'CINDER', p2Name: 'GLACIER', subtitle: 'FIGHTER SKINS SHOWCASE' },
  movelist: { p1: 'kazuki', p2: 'valka', p1Name: 'KAZUKI', p2Name: 'VALKA', subtitle: 'SPECIAL MOVES COMBOS' },
  settings: { p1: 'oracle', p2: 'bandit', p1Name: 'PLAYER 1', p2Name: 'PLAYER 2', subtitle: 'ARCADE CALIBRATION' }
};

export class ModeSelect {
  constructor() {
    this.modes = [
      {
        id: 'campaign',
        badge: 'STORY MODE',
        title: '🏆 CAMPAIGN',
        subtitle: 'THE 8 BOSS CHAPTERS & ELDER DRAGON',
        description: 'Battle through 8 escalating arena masters and face the 2-Phase Primeval Apex & Endless Dragon.',
        color: '#facc15'
      },
      {
        id: 'coop_campaign',
        badge: '2P CO-OP RAID',
        title: '🤝 CO-OP CAMPAIGN',
        subtitle: 'ONLINE 2-PLAYER BOSS RAID',
        description: 'Team up with an online friend to conquer all 8 campaign bosses together in simultaneous 2v1 and 2v2 boss battles.',
        color: '#a855f7'
      },
      {
        id: 'cpu',
        badge: 'SOLO BATTLE',
        title: '⚔️ 1V1 VS CPU',
        subtitle: 'ARCADE SINGLE MATCH',
        description: 'Classic 1v1 fighting game match against tactical AI. Choose your opponent, arena, and calibrate AI reaction speed.',
        color: '#38bdf8'
      },
      {
        id: '2p',
        badge: 'LOCAL VERSUS',
        title: '🥊 1V1 VS FRIEND',
        subtitle: 'COUCH 2-PLAYER VERSUS',
        description: 'Settle the score on one keyboard or twin gamepads. Player 1 (WASD + UIJK) vs Player 2 (Arrows + Numpad).',
        color: '#ec4899'
      },
      {
        id: '2v2',
        badge: 'SIMULTANEOUS',
        title: '🔥 2V2 TEAM BRAWL',
        subtitle: '4-FIGHTER TAG WAR',
        description: 'Two teams of two battle simultaneously on-screen with cel-shaded rim lighting and team pushboxes.',
        color: '#f97316'
      },
      {
        id: 'online',
        badge: 'NETPLAY P2P',
        title: '🌐 ONLINE VERSUS',
        subtitle: 'BATTLE A FRIEND VIA ROOM CODE',
        description: 'Connect directly with a friend online using zero-setup WebRTC peer-to-peer. Low-latency input streaming with room codes.',
        color: '#c084fc'
      },
      {
        id: 'training',
        badge: 'DOJO LAB',
        title: '🥋 PRACTICE MODE',
        subtitle: 'TRAINING & COMBO LAB',
        description: 'Unlimited health, infinite EX super gauge, and stamina. Master special moves, frame traps, and cancel strings.',
        color: '#4ade80'
      },
      {
        id: 'shop',
        badge: 'CUSTOM SKINS',
        title: '🛍️ ITEM SHOP',
        subtitle: 'PREVIEW & EQUIP SKINS',
        description: 'Browse, unlock, and equip custom fighter skins, auras, hitsparks, and titles with your earned tournament fight coins.',
        color: '#eab308'
      },
      {
        id: 'movelist',
        badge: 'COMMAND GUIDE',
        title: '📖 MOVE LIST & COMBOS',
        subtitle: 'FULL ROSTER SPECIALS & ULTIMATES',
        description: 'View complete moves, special inputs (fireballs, dragon punches, charge attacks), ultimates, fatalities, and frame tips for all 18 fighters.',
        color: '#38bdf8'
      },
      {
        id: 'settings',
        badge: 'ARCADE CONFIG',
        title: '⚙️ SETTINGS',
        subtitle: 'DISPLAY, AUDIO & CONTROLS',
        description: 'Configure Fullscreen / Windowed display, CRT scanlines, hitbox viewer, keybindings, audio volumes, and game pacing.',
        color: '#38bdf8'
      }
    ];

    this.selectedIndex = 0;
    this.difficultyOptions = ['easy', 'normal', 'hard', 'nightmare'];
    this.difficultyIndex = 1; // 'normal'
    this.animTimer = 0;
    this.spriteCache = {};

    // Animation state (purely visual)
    this._barY = null;
    this._lastIndex = -1;
    this._changeT = 0;
    this._diffX = null;
  }

  getFighterSprites(fighterId) {
    if (this.spriteCache[fighterId]) return this.spriteCache[fighterId];
    if (typeof document === 'undefined') return null;
    try {
      const sprites = spriteGenerator.generateFighterSprites(fighterId);
      if (sprites) this.spriteCache[fighterId] = sprites;
      return sprites;
    } catch (e) {
      return null;
    }
  }

  get selectedMode() {
    return this.modes[this.selectedIndex].id;
  }

  get currentDifficulty() {
    return this.difficultyOptions[this.difficultyIndex];
  }

  handleInput(inputState) {
    if (inputState.up) {
      this.selectedIndex = (this.selectedIndex - 1 + this.modes.length) % this.modes.length;
      soundFX.playWhoosh('light');
    } else if (inputState.down) {
      this.selectedIndex = (this.selectedIndex + 1) % this.modes.length;
      soundFX.playWhoosh('light');
    }

    // Toggle CPU difficulty with Left / Right if 1v1 vs CPU is highlighted
    if (this.selectedMode === 'cpu') {
      if (inputState.left) {
        this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
        soundFX.playWhoosh('light');
      } else if (inputState.right) {
        this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
        soundFX.playWhoosh('light');
      }
    }
  }

  // Menu column geometry (shared by rendering and hit-testing)
  static get LIST() { return { x: 20, y: 58, w: 228, h: 22, gap: 5.2 }; }
  // Info card + its interactive parts
  static get CARD() { return { x: 266, y: 58, w: 356, h: 270 }; }
  static get BACK() { return { x: 640 - 92, y: 14, w: 74, h: 18 }; }

  diffRect(W = 640) {
    const C = ModeSelect.CARD;
    return { x: C.x + 16, y: C.y + 212, w: C.w - 32, h: 20 };
  }

  handleClick(x, y, onBack, onConfirm, W = 640) {
    // 1. Back chip (top-right)
    const B = ModeSelect.BACK;
    const bx = W - (640 - B.x);
    if (x >= bx - 4 && x <= bx + B.w + 4 && y >= B.y - 4 && y <= B.y + B.h + 4) {
      soundFX.playWhoosh('light');
      if (onBack) onBack();
      return true;
    }

    // 2. Menu column
    const L = ModeSelect.LIST;
    if (x >= L.x - 8 && x <= L.x + L.w + 8) {
      for (let idx = 0; idx < this.modes.length; idx++) {
        const cy = L.y + idx * (L.h + L.gap);
        if (y >= cy - L.gap / 2 && y <= cy + L.h + L.gap / 2) {
          const wasSelected = (this.selectedIndex === idx);
          this.selectedIndex = idx;
          soundFX.playWhoosh('light');
          if (wasSelected) {
            // Second click on the highlighted item launches it
            soundFX.playGong();
            if (onConfirm) onConfirm();
          }
          return true;
        }
      }
    }

    // 3. Info card: difficulty segments (CPU) or launch
    const C = ModeSelect.CARD;
    if (x >= C.x && x <= C.x + C.w && y >= C.y && y <= C.y + C.h) {
      if (this.selectedMode === 'cpu') {
        const D = this.diffRect(W);
        if (y >= D.y - 4 && y <= D.y + D.h + 4 && x >= D.x && x <= D.x + D.w) {
          const seg = Math.max(0, Math.min(this.difficultyOptions.length - 1,
            Math.floor((x - D.x) / (D.w / this.difficultyOptions.length))));
          this.difficultyIndex = seg;
          soundFX.playWhoosh('light');
          return true;
        }
      }
      soundFX.playGong();
      if (onConfirm) onConfirm();
      return true;
    }

    return false;
  }

  wrapText(ctx, text, maxW) {
    return wrapLines(ctx, text, maxW);
  }

  drawFightPreview(ctx, modeId, ax, ay, aw, ah, t, accentColor) {
    const match = MODE_MATCHUPS[modeId] || MODE_MATCHUPS.campaign;
    const sp1 = this.getFighterSprites(match.p1);
    const sp2 = this.getFighterSprites(match.p2);

    const cycle = t % 180;
    // health drains with the choreography so the mini HUD feels alive
    const cycle_hp = (tt, side) => {
      const c = tt % 180;
      if (side === 1) return c < 61 ? 1 : (c < 141 ? 0.86 : 0.7);
      return c < 88 ? 1 : 0.93;
    };
    ctx.save();
    // Clip inside the mini arena boundary
    ctx.beginPath();
    ctx.rect(ax, ay, aw, ah);
    ctx.clip();

    // 1. Arena Background
    const bgGrad = ctx.createLinearGradient(ax, ay, ax, ay + ah);
    bgGrad.addColorStop(0, '#0a0910');
    bgGrad.addColorStop(0.7, '#15101a');
    bgGrad.addColorStop(1, hexToRgba(accentColor || COLORS.crimson, 0.25));
    ctx.fillStyle = bgGrad;
    ctx.fillRect(ax, ay, aw, ah);

    // Floor perspective grid & glowing ring
    const groundY = ay + ah - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(ax, groundY, aw, 12);

    ctx.strokeStyle = accentColor || '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, groundY);
    ctx.lineTo(ax + aw, groundY);
    ctx.stroke();

    // Subtle arena perspective lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let lx = ax + 20; lx < ax + aw; lx += 45) {
      ctx.beginPath();
      ctx.moveTo(lx, groundY);
      ctx.lineTo(lx - 12, ay + ah);
      ctx.stroke();
    }

    // 2. Mini HUD: two health bars + timer, names underneath (8px minimum)
    const hudY = ay + 7;
    const barW = (aw - 56) / 2;
    const barH = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(ax + 10, hudY, barW, barH);
    ctx.fillRect(ax + aw - 10 - barW, hudY, barW, barH);
    const p1hp = cycle_hp(t, 0);
    const p2hp = cycle_hp(t, 1);
    ctx.fillStyle = COLORS.p1;
    ctx.fillRect(ax + 10 + barW * (1 - p1hp), hudY, barW * p1hp, barH);
    ctx.fillStyle = COLORS.p2;
    ctx.fillRect(ax + aw - 10 - barW, hudY, barW * p2hp, barH);
    drawText(ctx, '99', ax + aw / 2, hudY + 6, { font: FONTS.display(10), color: COLORS.gold, align: 'center' });
    drawText(ctx, match.p1Name, ax + 10, hudY + 15, { font: FONTS.ui(8, 800), color: COLORS.text, letterSpacing: 0.5 });
    drawText(ctx, match.p2Name, ax + aw - 10, hudY + 15, { font: FONTS.ui(8, 800), color: COLORS.text, align: 'right', letterSpacing: 0.5 });

    // 3. Combat Choreography (180-frame loop)
    const baseP1X = ax + aw * 0.3;
    const baseP2X = ax + aw * 0.7;
    const scale = 0.72;

    let p1X = baseP1X;
    let p2X = baseP2X;
    let p1Frame = null;
    let p2Frame = null;
    let hitSpark = null;
    let guardSpark = null;
    let fireball = null;

    if (cycle < 45) {
      // Neutral Stance (Idle bounce)
      const f1 = sp1?.idle || sp1?.IDLE || [];
      const f2 = sp2?.idle || sp2?.IDLE || [];
      p1Frame = f1[Math.floor(t / 8) % Math.max(1, f1.length)];
      p2Frame = f2[Math.floor(t / 8) % Math.max(1, f2.length)];
    } else if (cycle < 80) {
      // P1 Dash & Punch / P2 Hit
      const progress = cycle - 45;
      p1X = baseP1X + Math.min(26, progress * 2.8);
      if (progress < 10) {
        p1Frame = (sp1?.walk || sp1?.WALK_FWD || sp1?.idle)?.[0];
      } else {
        const punches = sp1?.heavy_punch || sp1?.light_punch || sp1?.ATTACK_HP || [];
        p1Frame = punches[Math.min(punches.length - 1, Math.floor((progress - 10) / 4))];
      }
      if (progress >= 16) {
        p2X = baseP2X + 8;
        const hits = sp2?.hit || sp2?.HIT || sp2?.idle || [];
        p2Frame = hits[0];
        hitSpark = { x: p1X + 26, y: groundY - 32, size: 10 + (progress % 4) * 3 };
      } else {
        const idles = sp2?.idle || sp2?.IDLE || [];
        p2Frame = idles[0];
      }
    } else if (cycle < 115) {
      // P2 Counter Kick / P1 Guard Block
      const progress = cycle - 80;
      p1X = baseP1X + Math.max(0, 18 - progress);
      p2X = baseP2X - Math.min(20, progress * 2);
      if (progress < 8) {
        p2Frame = (sp2?.walk || sp2?.WALK_FWD || sp2?.idle)?.[0];
        p1Frame = sp1?.idle?.[0];
      } else {
        const kicks = sp2?.heavy_kick || sp2?.light_kick || sp2?.ATTACK_HK || [];
        p2Frame = kicks[Math.min(kicks.length - 1, Math.floor((progress - 8) / 4))];
        const blocks = sp1?.block || sp1?.BLOCK || sp1?.idle || [];
        p1Frame = blocks[0];
        guardSpark = { x: p1X + 18, y: groundY - 26, size: 8 + (progress % 3) * 3 };
      }
    } else if (cycle < 155) {
      // P1 Special Fireball / Blast
      const progress = cycle - 115;
      p1X = baseP1X;
      const specials = sp1?.special_1 || sp1?.SPECIAL_1 || sp1?.heavy_punch || [];
      p1Frame = specials[Math.min(specials.length - 1, Math.floor(progress / 5))];

      if (progress >= 8 && progress <= 28) {
        const fbDist = (progress - 8) * 8.5;
        fireball = { x: p1X + 20 + fbDist, y: groundY - 28 };
      }
      if (progress > 26) {
        p2X = baseP2X + 16;
        const hits = sp2?.hit || sp2?.knockdown || sp2?.HIT || [];
        p2Frame = hits[0];
        hitSpark = { x: p2X - 8, y: groundY - 28, size: 14 + (progress % 4) * 3 };
      } else {
        p2Frame = sp2?.idle?.[0];
      }
    } else {
      // Recovery back to stance
      const f1 = sp1?.idle || sp1?.IDLE || [];
      const f2 = sp2?.idle || sp2?.IDLE || [];
      p1Frame = f1[0];
      p2Frame = f2[0];
    }

    // 4. Render Fighter 1 (Left, Facing Right)
    if (p1Frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(p1X, groundY);
      ctx.scale(scale, scale);
      ctx.drawImage(p1Frame, -40, -88);
      ctx.restore();
    } else {
      // Fallback articulated silhouette
      this.drawFighterSilhouette(ctx, p1X, groundY, scale, false, '#facc15');
    }

    // 5. Render Fighter 2 (Right, Facing Left)
    if (p2Frame) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(p2X, groundY);
      ctx.scale(-scale, scale); // Mirror facing left
      ctx.drawImage(p2Frame, -40, -88);
      ctx.restore();
    } else {
      // Fallback articulated silhouette
      this.drawFighterSilhouette(ctx, p2X, groundY, scale, true, '#ef4444');
    }

    // 6. Projectile & Visual Impact Sparks
    if (fireball && fireball.x < p2X) {
      ctx.save();
      const fbGrad = ctx.createRadialGradient(fireball.x, fireball.y, 1, fireball.x, fireball.y, 9);
      fbGrad.addColorStop(0, '#ffffff');
      fbGrad.addColorStop(0.4, '#38bdf8');
      fbGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
      ctx.fillStyle = fbGrad;
      ctx.beginPath();
      ctx.arc(fireball.x, fireball.y, 9, 0, Math.PI * 2);
      ctx.fill();

      // Core flame
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fireball.x, fireball.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (hitSpark) {
      ctx.save();
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      const sz = hitSpark.size;
      ctx.beginPath();
      ctx.moveTo(hitSpark.x - sz, hitSpark.y);
      ctx.lineTo(hitSpark.x, hitSpark.y - sz / 2);
      ctx.lineTo(hitSpark.x + sz, hitSpark.y);
      ctx.lineTo(hitSpark.x, hitSpark.y + sz / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (guardSpark) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(guardSpark.x, guardSpark.y, guardSpark.size, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // Restore clip
  }

  drawFighterSilhouette(ctx, cx, cy, scale, mirror, color) {
    ctx.save();
    ctx.translate(cx, cy);
    if (mirror) ctx.scale(-1, 1);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -56, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-8, -46, 16, 26);
    ctx.fillRect(-7, -20, 6, 20);
    ctx.fillRect(1, -20, 6, 20);
    ctx.fillRect(-14, -42, 6, 18);
    ctx.fillRect(8, -42, 6, 18);
    ctx.restore();
  }

  hasGamepad() {
    try { return input.hasGamepadConnected(); } catch (e) { return false; }
  }

  actionVerb(m) {
    if (m.id === 'shop') return 'ENTER ITEM SHOP';
    if (m.id === 'settings') return 'OPEN SETTINGS';
    if (m.id === 'movelist') return 'VIEW MOVE LIST';
    if (m.id === 'online' || m.id === 'coop_campaign') return 'OPEN LOBBY';
    return 'START ' + cleanLabel(m.title).replace(/^1V1 /, '');
  }

  drawCampaignRoadmap(ctx, x, y, w, t, color) {
    const nodes = 8;
    const step = (w - 24) / (nodes - 1);
    const lineY = y + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x + 12, lineY - 0.5, w - 24, 1);
    // travelling spark along the path
    const sp = ((t * 0.8) % (w - 24));
    const sg = ctx.createLinearGradient(x + 12 + sp - 30, 0, x + 12 + sp, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0)');
    sg.addColorStop(1, hexToRgba(COLORS.gold, 0.8));
    ctx.fillStyle = sg;
    ctx.fillRect(x + 12 + Math.max(0, sp - 30), lineY - 0.5, Math.min(30, sp), 1);
    for (let i = 0; i < nodes; i++) {
      const nx = x + 12 + i * step;
      const last = i === nodes - 1;
      const r = last ? 7 : 5.5;
      ctx.save();
      ctx.translate(nx, lineY);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = last ? COLORS.crimson : '#1a1722';
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeStyle = last ? COLORS.gold : hexToRgba(color, 0.8);
      ctx.lineWidth = 1;
      ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.restore();
      drawText(ctx, String(i + 1), nx, lineY + 3, { font: FONTS.ui(8, 800), color: last ? '#fff' : COLORS.text, align: 'center' });
    }
    drawText(ctx, '8 ARENA MASTERS', x + 4, y + 27, { font: FONTS.ui(8, 800), color: COLORS.textDim, letterSpacing: 1 });
    drawText(ctx, 'FINAL BOSS: THE ENDLESS DRAGON', x + w - 4, y + 27, { font: FONTS.ui(8, 800), color: COLORS.gold, align: 'right', letterSpacing: 1 });
  }

  drawDifficulty(ctx, W, t) {
    const D = this.diffRect(W);
    const n = this.difficultyOptions.length;
    const segW = D.w / n;
    const colors = { easy: COLORS.good, normal: COLORS.warn, hard: COLORS.bad, nightmare: '#c084fc' };
    drawLabel(ctx, 'CPU DIFFICULTY', D.x, D.y - 6, { color: COLORS.textDim, size: 8 });
    const blurbs = {
      easy: 'Forgiving AI · learn the basics',
      normal: 'Balanced tournament opponent',
      hard: 'Fast reactions · punishes mistakes',
      nightmare: 'No mercy · reads and punishes everything'
    };
    const curD = this.difficultyOptions[this.difficultyIndex];
    drawText(ctx, blurbs[curD] || '', D.x + D.w, D.y - 6, {
      font: FONTS.ui(8, 700), color: colors[curD] || COLORS.textDim, align: 'right', maxWidth: D.w - 110
    });
    // track
    slantPath(ctx, D.x, D.y, D.w, D.h, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // animated selected segment
    const targetX = D.x + this.difficultyIndex * segW;
    this._diffX = approach(this._diffX, targetX, 0.3);
    const cur = this.difficultyOptions[this.difficultyIndex];
    const c = colors[cur] || COLORS.gold;
    const g = ctx.createLinearGradient(0, D.y, 0, D.y + D.h);
    g.addColorStop(0, hexToRgba(c, 0.55));
    g.addColorStop(1, hexToRgba(c, 0.2));
    ctx.save();
    if (cur === 'nightmare') {
      ctx.shadowColor = c;
      ctx.shadowBlur = 8 + Math.sin(t * 0.12) * 4;
    }
    slantPath(ctx, this._diffX + 1, D.y + 1, segW - 2, D.h - 2, 6);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    slantPath(ctx, this._diffX + 1, D.y + 1, segW - 2, D.h - 2, 6);
    ctx.strokeStyle = c;
    ctx.stroke();
    this.difficultyOptions.forEach((d, i) => {
      const sel = i === this.difficultyIndex;
      drawText(ctx, d.toUpperCase(), D.x + segW * i + segW / 2, D.y + D.h / 2 + 4, {
        font: FONTS.display(11), color: sel ? '#fff' : COLORS.textMute, align: 'center', maxWidth: segW - 12
      });
    });
    // arrows hint
    const nudge = Math.sin(t * 0.15) * 1.5;
    drawText(ctx, '◀', D.x - 9 - nudge, D.y + D.h / 2 + 3, { font: FONTS.ui(8, 800), color: COLORS.gold, align: 'center' });
    drawText(ctx, '▶', D.x + D.w + 9 + nudge, D.y + D.h / 2 + 3, { font: FONTS.ui(8, 800), color: COLORS.gold, align: 'center' });
  }

  render(ctx, W, H) {
    this.animTimer++;
    const t = this.animTimer;
    const cur = this.modes[this.selectedIndex];
    const accent = cur.color || COLORS.gold;
    if (this._lastIndex !== this.selectedIndex) {
      this._lastIndex = this.selectedIndex;
      this._changeT = t;
    }
    const sinceChange = t - this._changeT;

    drawBackdrop(ctx, W, H, t, { tint: COLORS.crimsonDeep });
    // soft accent glow behind the card, tinted by the highlighted mode
    const glow = ctx.createRadialGradient(W * 0.7, H * 0.52, 10, W * 0.7, H * 0.52, 300);
    glow.addColorStop(0, hexToRgba(accent, 0.13));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    drawScreenHeader(ctx, W, 'SELECT MODE', 'CHOOSE YOUR DESTINY', t);

    const gp = this.hasGamepad();
    const B = ModeSelect.BACK;
    drawChip(ctx, W - (640 - B.x), B.y, B.w, B.h, gp ? 'B' : 'ESC', 'TITLE');

    // ---- Left: menu column ------------------------------------------------
    const L = ModeSelect.LIST;
    const targetY = L.y + this.selectedIndex * (L.h + L.gap);
    this._barY = approach(this._barY, targetY, 0.32);
    const grow = ease.outCubic(sinceChange / 12);

    // selection bar (slides between items)
    {
      const by = this._barY;
      const bw = L.w * (0.82 + 0.18 * grow);
      ctx.save();
      const g = ctx.createLinearGradient(L.x, 0, L.x + bw, 0);
      g.addColorStop(0, hexToRgba(COLORS.crimson, 0.95));
      g.addColorStop(0.65, hexToRgba(COLORS.crimsonDeep, 0.85));
      g.addColorStop(1, hexToRgba(COLORS.crimsonDeep, 0.0));
      slantPath(ctx, L.x, by, bw, L.h, 9);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = COLORS.gold;
      slantPath(ctx, L.x - 7, by, 5, L.h, 4);
      ctx.fill();
      ctx.fillStyle = hexToRgba(COLORS.goldPale, 0.5);
      ctx.fillRect(L.x + 9, by, bw * 0.6, 1);
      ctx.restore();
    }

    this.modes.forEach((m, idx) => {
      const sel = idx === this.selectedIndex;
      const y = L.y + idx * (L.h + L.gap);
      const label = cleanLabel(m.title);
      const shift = sel ? 6 * grow : 0;
      drawText(ctx, String(idx + 1).padStart(2, '0'), L.x + 12, y + L.h / 2 + 3.5, {
        font: FONTS.mono(8, 700), color: sel ? COLORS.goldPale : COLORS.textMute
      });
      drawText(ctx, label, L.x + 32 + shift, y + L.h / 2 + 5, {
        font: FONTS.display(sel ? 14 : 13), color: sel ? '#ffffff' : COLORS.textDim,
        shadow: sel ? { color: 'rgba(0,0,0,0.55)', x: 1, y: 1 } : null, maxWidth: L.w - 44
      });
      if (!sel) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(L.x + 10, y + L.h + L.gap / 2, L.w - 30, 1);
      }
    });

    // ---- Right: info card -------------------------------------------------
    const C = ModeSelect.CARD;
    const k = ease.outCubic(sinceChange / 14);
    drawPanel(ctx, C.x, C.y, C.w, C.h, { fill: 'rgba(12, 11, 18, 0.88)', stroke: 'rgba(255,255,255,0.08)' });
    // accent top edge
    const tg = ctx.createLinearGradient(C.x, 0, C.x + C.w, 0);
    tg.addColorStop(0, accent);
    tg.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = tg;
    ctx.fillRect(C.x, C.y, C.w, 2);

    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * k;
    const ox = (1 - k) * 14;
    const cx = C.x + 18 + ox;

    drawLabel(ctx, cur.badge, cx, C.y + 20, { color: accent, size: 8 });
    drawText(ctx, cleanLabel(cur.title), cx, C.y + 44, {
      font: FONTS.display(24), color: '#fff', outline: 3, maxWidth: C.w - 36
    });
    drawText(ctx, cur.subtitle, cx, C.y + 57, { font: FONTS.ui(8, 700), color: COLORS.textDim, letterSpacing: 1, maxWidth: C.w - 36 });
    ctx.restore();

    // live preview arena
    const pvX = C.x + 16, pvY = C.y + 66, pvW = C.w - 32, pvH = 94;
    this.drawFightPreview(ctx, cur.id, pvX, pvY, pvW, pvH, t, accent);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pvX + 0.5, pvY + 0.5, pvW - 1, pvH - 1);

    // description
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * k;
    ctx.font = FONTS.ui(9, 600);
    const lines = wrapLines(ctx, cur.description, C.w - 36).slice(0, 2);
    lines.forEach((ln, i) => {
      drawText(ctx, ln, C.x + 18 + ox, C.y + 177 + i * 12, { font: FONTS.ui(9, 600), color: COLORS.text });
    });
    ctx.restore();

    // mode-specific feature row
    const fy = C.y + 202;
    if (cur.id === 'campaign') {
      this.drawCampaignRoadmap(ctx, C.x + 16, fy, C.w - 32, t, accent);
    } else if (cur.id === 'cpu') {
      this.drawDifficulty(ctx, W, t);
    } else {
      const tips = {
        coop_campaign: 'Requires an online partner · host or join with a room code',
        '2p': 'P1: WASD + U I J K  ·  P2: Arrows + Numpad  ·  gamepads supported',
        '2v2': 'Two teams of two fight at once · team-coloured rim lights',
        online: 'Peer-to-peer WebRTC · share a room code with your rival',
        training: 'Infinite health, super meter and stamina',
        shop: 'Spend fight coins on skins, auras, hitsparks and titles',
        movelist: 'Specials, ultimates and fatalities for every fighter',
        settings: 'Display, CRT filter, audio, keybindings and gamepad presets'
      };
      const tip = tips[cur.id];
      if (tip) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(C.x + 16, fy + 6, C.w - 32, 22);
        ctx.fillStyle = accent;
        ctx.fillRect(C.x + 16, fy + 6, 2, 22);
        drawText(ctx, tip, C.x + 26, fy + 20.5, { font: FONTS.ui(8, 700), color: COLORS.textDim, maxWidth: C.w - 46, letterSpacing: 0.3 });
      }
    }

    // launch button
    drawActionButton(ctx, C.x + 16, C.y + C.h - 29, C.w - 32, 21, this.actionVerb(cur), {
      key: gp ? 'A' : 'ENTER', time: t, size: 12
    });

    // ---- Footer prompts ---------------------------------------------------
    const items = gp
      ? [{ key: 'D-PAD', label: 'SELECT' }, { key: 'A', label: 'CONFIRM' }, { key: 'B', label: 'BACK' }]
      : [{ key: 'W/S', label: 'SELECT' }, { key: 'ENTER', label: 'CONFIRM' }, { key: 'ESC', label: 'BACK' }];
    if (cur.id === 'cpu') items.splice(1, 0, { key: gp ? '◀ ▶' : 'A/D', label: 'DIFFICULTY' });
    drawPromptBar(ctx, items, W / 2, H - 9);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
