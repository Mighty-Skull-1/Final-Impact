// Final Impact - Campaign Pre-Fight Dialogue & Story Banter Engine
import { soundFX } from '../audio/SoundFX.js';
import { COLORS, FONTS, ease, wrapLines, hexToRgba, slantPath, drawText, drawKeyCap } from '../ui/Theme.js';

export const CAMPAIGN_SCRIPTS = {
  riot_cop: {
    stageTitle: 'STAGE 1 / 8 : CYBER-CITY CURFEW',
    bossName: 'SGT. VANCE',
    bossTitle: 'Cyber-Enforcer Unit 09',
    bossColor: '#38bdf8',
    lines: [
      { speaker: 'boss', text: 'Halt, street rat! Curfew was called at sundown. Lay down your fists or face maximum kinetic suppression!' },
      { speaker: 'player', text: 'This city doesn\'t belong to your megacorp badges, Vance. Try and stop me.' },
      { speaker: 'boss', text: 'Target deemed hostile! Engaging non-lethal neutralization protocol... with lethal force!' }
    ]
  },
  promoter: {
    stageTitle: 'STAGE 2 / 8 : THE MEAT GRINDER',
    bossName: 'THE PROMOTER',
    bossTitle: 'Syndicate Matchmaker',
    bossColor: '#f59e0b',
    lines: [
      { speaker: 'boss', text: 'Welcome to the real meat grinder, kid! The audience paid top dollar to watch your blood splatter across the canvas.' },
      { speaker: 'player', text: 'Tell your betting syndicates to empty their vaults. I\'m wrecking your main event.' },
      { speaker: 'boss', text: 'Hah! Big mouth! Let\'s see how funny you look once my heavyweights cash in your dental plan!' }
    ]
  },
  bouncer_twins: {
    stageTitle: 'STAGE 3 / 8 : VIP SECTOR GATES',
    bossName: 'BORIS & VIKTOR',
    bossTitle: 'The Iron Gatekeepers',
    bossColor: '#ef4444',
    lines: [
      { speaker: 'boss', text: 'Boris: "Nobody enters the VIP sector without VIP clearance."' },
      { speaker: 'boss', text: 'Viktor: "And your face doesn\'t look VIP at all, runt. Time to break you in half!"' },
      { speaker: 'player', text: 'Two against one? Just means twice the fun. Step aside before I break you both.' },
      { speaker: 'boss', text: 'Boris & Viktor: "CRUSH HIM!"' }
    ]
  },
  matriarch: {
    stageTitle: 'STAGE 4 / 8 : CLAN OF NIGHTBLADE',
    bossName: 'THE MATRIARCH',
    bossTitle: 'Nightblade Clan High Priestess',
    bossColor: '#c084fc',
    lines: [
      { speaker: 'boss', text: 'You move with reckless arrogance. Power without poise is nothing more than slow suicide.' },
      { speaker: 'player', text: 'Keep your lecture, Matriarch. Let\'s see if your blade is sharper than your tongue.' },
      { speaker: 'boss', text: 'Fools only learn when their shadow bleeds into the earth. Draw your weapon!' }
    ]
  },
  street_lord: {
    stageTitle: 'STAGE 5 / 8 : UNDERWORLD EMPIRE',
    bossName: 'STREET LORD',
    bossTitle: 'Kingpin of the Underworld',
    bossColor: '#10b981',
    lines: [
      { speaker: 'boss', text: 'You\'ve chewed through my pawns, but every king sits upon a throne of skulls. Kneel!' },
      { speaker: 'player', text: 'A throne built on paper money and fear. Watch it crumble right before your eyes.' },
      { speaker: 'boss', text: 'Insolent dog! I\'ll feed your remains to the harbor rats!' }
    ]
  },
  urban_legend: {
    stageTitle: 'STAGE 6 / 8 : GHOST OF THE CAGES',
    bossName: 'URBAN LEGEND',
    bossTitle: 'Phantom of the Slums',
    bossColor: '#6366f1',
    lines: [
      { speaker: 'boss', text: 'They say I died in the underground cage matches ten years ago... Are you ready to join the whispers?' },
      { speaker: 'player', text: 'Ghosts don\'t bleed. We\'ll find out what you\'re really made of right now.' },
      { speaker: 'boss', text: 'The void has no mercy... and neither do I!' }
    ]
  },
  champion: {
    stageTitle: 'STAGE 7 / 8 : APEX TOURNAMENT FINALS',
    bossName: 'REX GANNON',
    bossTitle: 'Reigning Apex Grandmaster',
    bossColor: '#fbbf24',
    lines: [
      { speaker: 'boss', text: 'So you\'re the one tearing through the circuit. Finally, a contender worthy of my knuckles!' },
      { speaker: 'player', text: 'Don\'t blink, Rex. Your championship reign ends in this ring.' },
      { speaker: 'boss', text: 'That\'s the spirit! Give me everything you\'ve got! Let\'s set this arena on fire!' }
    ]
  },
  endless_dragon: {
    stageTitle: 'FINAL STAGE : THE PRIMORDIAL WYRM',
    bossName: 'THE ENDLESS DRAGON',
    bossTitle: 'Mythic Deity of Cataclysm',
    bossColor: '#f43f5e',
    lines: [
      { speaker: 'boss', text: 'MORTAL DUST... THOU DAREST AWAKEN THE ANCIENT FLAME? THY FLESH SHALL FUEL ETERNITY!' },
      { speaker: 'player', text: 'I came to slay legends. Burn if you must—I will never yield!' },
      { speaker: 'boss', text: 'ROARRRRRR! PERISH IN CALAMITY!' }
    ]
  }
};

export class CampaignDialogue {
  constructor() {
    this.active = false;
    this.stageKey = null;
    this.script = null;
    this.currentLineIndex = 0;
    this.charIndex = 0;
    this.typeTimer = 0;
    this.p1Fighter = null;
    this.p2Fighter = null;
    this.onComplete = null;
    this.letterboxProgress = 0;
  }

  start(bossKey, p1Fighter, p2Fighter, onComplete) {
    this.stageKey = bossKey || 'riot_cop';
    this.script = CAMPAIGN_SCRIPTS[this.stageKey] || CAMPAIGN_SCRIPTS.riot_cop;
    this.p1Fighter = p1Fighter;
    this.p2Fighter = p2Fighter;
    this.onComplete = onComplete;
    this.currentLineIndex = 0;
    this.charIndex = 0;
    this.typeTimer = 0;
    this.active = true;
    this.letterboxProgress = 0;

    try {
      soundFX.playMenuMove();
    } catch (e) {}
  }

  update(inputNav) {
    if (!this.active) return false;

    // Animate cinematic letterbox
    if (this.letterboxProgress < 1) {
      this.letterboxProgress = Math.min(1, this.letterboxProgress + 0.1);
    }

    const currentLine = this.script.lines[this.currentLineIndex];
    if (!currentLine) {
      this.finish();
      return true;
    }

    // Typewriter effect
    this.typeTimer++;
    if (this.charIndex < currentLine.text.length) {
      if (this.typeTimer % 2 === 0) {
        this.charIndex += 2;
        if (this.charIndex > currentLine.text.length) {
          this.charIndex = currentLine.text.length;
        }
      }
    }

    // Input handlers
    if (inputNav) {
      if (inputNav.back) {
        // Skip entirely
        try { soundFX.playMenuSelect(); } catch (e) {}
        this.finish();
        return true;
      }

      if (inputNav.confirm) {
        if (this.charIndex < currentLine.text.length) {
          // Complete current line immediately
          this.charIndex = currentLine.text.length;
        } else {
          // Advance to next line
          this.advance();
        }
      }
    }

    return false;
  }

  skip() {
    if (!this.active) return false;
    try { soundFX.playMenuSelect(); } catch (e) {}
    this.finish();
    return true;
  }

  advanceOrComplete() {
    if (!this.active || !this.script) return false;
    const currentLine = this.script.lines[this.currentLineIndex];
    if (!currentLine) {
      this.finish();
      return true;
    }
    if (this.charIndex < currentLine.text.length) {
      // Complete current line typewriter immediately
      this.charIndex = currentLine.text.length;
    } else {
      // Advance to next line
      this.advance();
    }
    return true;
  }

  handleClick(x, y, W, H) {
    if (!this.active) return false;
    const boxX = 24;
    const boxY = H - 100;
    const boxW = W - 48;
    const boxH = 76;

    // Check if clicked in or around the SKIP button / prompt (right portion of dialogue box)
    const skipAreaLeft = boxX + boxW - 140;
    const skipAreaTop = boxY + boxH - 28;
    const skipAreaRight = boxX + boxW;
    const skipAreaBottom = boxY + boxH;

    if (x >= skipAreaLeft && x <= skipAreaRight && y >= skipAreaTop && y <= skipAreaBottom) {
      return this.skip();
    }

    // Clicking anywhere else on the screen or dialogue box advances or completes typewriter
    return this.advanceOrComplete();
  }

  advance() {
    this.currentLineIndex++;
    this.charIndex = 0;
    this.typeTimer = 0;

    if (this.currentLineIndex >= this.script.lines.length) {
      this.finish();
    } else {
      try { soundFX.playMenuMove(); } catch (e) {}
    }
  }

  finish() {
    this.active = false;
    if (typeof this.onComplete === 'function') {
      const cb = this.onComplete;
      this.onComplete = null;
      cb();
    }
  }

  // Head-and-shoulders portrait from a fighter's idle sprite (falls back to a monogram)
  drawPortrait(ctx, fighter, x, y, size, color, mirror) {
    ctx.save();
    slantPath(ctx, x, y, size, size, 8);
    const bg = ctx.createLinearGradient(0, y, 0, y + size);
    bg.addColorStop(0, hexToRgba(color, 0.35));
    bg.addColorStop(1, 'rgba(8,8,12,0.95)');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();
    const frames = fighter && fighter.sprites ? (fighter.sprites.IDLE || fighter.sprites.idle || []) : [];
    const img = frames[0];
    if (img && img.width) {
      ctx.imageSmoothingEnabled = false;
      const crop = 36;
      if (mirror) {
        ctx.translate(x + size, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 40 - crop / 2 + 3, 12, crop, crop, 0, 2, size, size);
      } else {
        ctx.drawImage(img, 40 - crop / 2 + 3, 12, crop, crop, x, y + 2, size, size);
      }
    } else {
      const initial = String((fighter && fighter.name) || '?').charAt(0).toUpperCase();
      drawText(ctx, initial, x + size / 2, y + size / 2 + 10, { font: FONTS.display(30), color, align: 'center' });
    }
    ctx.restore();
    ctx.save();
    slantPath(ctx, x + 0.5, y + 0.5, size - 1, size - 1, 8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  render(ctx, W, H) {
    if (!this.active || !this.script) return;
    this._t = (this._t || 0) + 1;
    const t = this._t;
    const lb = ease.outCubic(this.letterboxProgress);

    ctx.save();

    // 1. Cinematic letterbox bars
    const barHeight = 40 * lb;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, W, barHeight);
    ctx.fillRect(0, H - barHeight, W, barHeight);
    ctx.fillStyle = hexToRgba(COLORS.gold, 0.35 * lb);
    ctx.fillRect(0, barHeight, W, 1);

    // Stage title ("STAGE 1 / 8 : CYBER-CITY CURFEW" -> small label + big title)
    if (this.letterboxProgress >= 0.8) {
      const parts = String(this.script.stageTitle || '').split(' : ');
      const label = parts.length > 1 ? parts[0] : '';
      const title = parts.length > 1 ? parts.slice(1).join(' : ') : parts[0];
      if (label) drawText(ctx, label, W / 2, 13, { font: FONTS.ui(8, 800), color: COLORS.gold, align: 'center', letterSpacing: 2.5 });
      drawText(ctx, title, W / 2, label ? 31 : 26, { font: FONTS.display(15), color: '#fff', align: 'center', letterSpacing: 0.5 });
    }

    // 2. Dialogue box (geometry matches handleClick)
    const boxX = 24;
    const boxY = H - 100;
    const boxW = W - 48;
    const boxH = 76;
    const currentLine = this.script.lines[this.currentLineIndex];
    const isBoss = currentLine ? (currentLine.speaker === 'boss') : true;
    const accentColor = isBoss ? (this.script.bossColor || COLORS.p2) : COLORS.p1;

    // slide the panel up as the letterbox opens
    ctx.translate(0, (1 - lb) * 20);
    ctx.globalAlpha = lb;
    slantPath(ctx, boxX, boxY, boxW, boxH, 12);
    const bg = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
    bg.addColorStop(0, 'rgba(16, 14, 24, 0.96)');
    bg.addColorStop(1, 'rgba(7, 6, 11, 0.96)');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // speaker-side accent edge
    const eg = ctx.createLinearGradient(isBoss ? boxX : boxX + boxW, 0, isBoss ? boxX + boxW * 0.6 : boxX + boxW * 0.4, 0);
    eg.addColorStop(0, accentColor);
    eg.addColorStop(1, hexToRgba(accentColor, 0));
    ctx.fillStyle = eg;
    ctx.fillRect(boxX + 12, boxY, boxW - 12, 2);

    // 3. Speaker portrait (boss on the left, player on the right)
    const portSize = 48;
    const portX = isBoss ? (boxX + 16) : (boxX + boxW - portSize - 18);
    const portY = boxY + 9;
    this.drawPortrait(ctx, isBoss ? this.p2Fighter : this.p1Fighter, portX, portY, portSize, accentColor, !isBoss);

    // 4. Speaker name + subtitle
    const p1Name = this.p1Fighter && this.p1Fighter.name ? this.p1Fighter.name.toUpperCase() : 'CHALLENGER';
    const speakerName = isBoss ? this.script.bossName : p1Name;
    const speakerSub = isBoss ? this.script.bossTitle : 'Contender';
    const textX = isBoss ? (boxX + portSize + 28) : (boxX + 22);
    const textW = boxW - portSize - 60;
    drawText(ctx, speakerName, textX, boxY + 22, { font: FONTS.display(14), color: accentColor });
    ctx.font = FONTS.display(14);
    const nameWidth = ctx.measureText(speakerName).width;
    drawText(ctx, String(speakerSub).toUpperCase(), textX + nameWidth + 10, boxY + 21, { font: FONTS.ui(8, 700), color: COLORS.textDim, letterSpacing: 1 });

    // 5. Dialogue body (typewriter)
    if (currentLine) {
      const displayText = currentLine.text.substring(0, this.charIndex);
      ctx.font = FONTS.ui(10, 600);
      const lines = wrapLines(ctx, displayText, textW).slice(0, 3);
      lines.forEach((ln, i) => {
        drawText(ctx, ln, textX, boxY + 37 + i * 12, { font: FONTS.ui(10, 600), color: COLORS.text });
      });
      const done = this.charIndex >= currentLine.text.length;
      if (done) {
        // bouncing continue marker
        const by = Math.sin(t * 0.18) * 1.5;
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        const mx = isBoss ? boxX + boxW - 26 : portX - 14;
        ctx.moveTo(mx - 4, boxY + 26 + by);
        ctx.lineTo(mx + 4, boxY + 26 + by);
        ctx.lineTo(mx, boxY + 31 + by);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 6. Prompts (bottom-right of the box; this region is the click-to-skip area)
    const promptY = boxY + boxH - 7;
    ctx.font = FONTS.ui(8, 800);
    const skipW = ctx.measureText('SKIP').width;
    const escW = Math.max(12, Math.ceil(ctx.measureText('ESC').width) + 8);
    let px = boxX + boxW - 14 - skipW;
    drawText(ctx, 'SKIP', px, promptY, { font: FONTS.ui(8, 800), color: COLORS.textDim });
    px -= escW + 4;
    drawKeyCap(ctx, 'ESC', px, promptY - 9);
    const nextW = ctx.measureText('NEXT').width;
    px -= 12 + nextW;
    drawText(ctx, 'NEXT', px, promptY, { font: FONTS.ui(8, 800), color: COLORS.textDim });
    const entW = Math.max(12, Math.ceil(ctx.measureText('ENTER').width) + 8);
    px -= entW + 4;
    drawKeyCap(ctx, 'ENTER', px, promptY - 9, { border: hexToRgba(COLORS.gold, 0.7), color: COLORS.goldPale });

    // line progress pips
    const n = this.script.lines.length;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i === this.currentLineIndex ? accentColor : (i < this.currentLineIndex ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)');
      slantPath(ctx, textX + i * 10, boxY + boxH - 11, 7, 3, 1.5);
      ctx.fill();
    }

    ctx.restore();
  }
}
