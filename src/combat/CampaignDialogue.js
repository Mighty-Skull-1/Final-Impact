// Final Impact - Campaign Pre-Fight Dialogue & Story Banter Engine
import { soundFX } from '../audio/SoundFX.js';

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

  render(ctx, W, H) {
    if (!this.active || !this.script) return;

    ctx.save();

    // 1. Cinematic letterbox bars
    const barHeight = 40 * this.letterboxProgress;
    ctx.fillStyle = '#05030a';
    ctx.fillRect(0, 0, W, barHeight);
    ctx.fillRect(0, H - barHeight, W, barHeight);

    // Stage Title Banner at top
    if (this.letterboxProgress >= 0.8) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.fillText(this.script.stageTitle, W / 2, 20);
      ctx.shadowBlur = 0;
    }

    // 2. Dialogue Box at bottom
    const boxX = 24;
    const boxY = H - 100;
    const boxW = W - 48;
    const boxH = 76;

    // Dark glass background
    ctx.fillStyle = 'rgba(8, 6, 16, 0.92)';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    const currentLine = this.script.lines[this.currentLineIndex];
    const isBoss = currentLine ? (currentLine.speaker === 'boss') : true;

    // Border with speaker-themed accent
    const accentColor = isBoss ? this.script.bossColor : '#38bdf8';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Inner gold hairline
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);

    // 3. Speaker Portrait Box
    const portSize = 56;
    const portX = isBoss ? (boxX + 10) : (boxX + boxW - portSize - 10);
    const portY = boxY + 10;

    ctx.fillStyle = '#110f22';
    ctx.fillRect(portX, portY, portSize, portSize);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(portX, portY, portSize, portSize);

    // Pixel Avatar Emblem
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = isBoss ? '👹' : '⚔️';
    ctx.fillText(icon, portX + portSize / 2, portY + portSize / 2);
    ctx.restore();

    // 4. Speaker Name Plaque
    const p1Name = this.p1Fighter ? this.p1Fighter.name.toUpperCase() : 'CHALLENGER';
    const speakerName = isBoss ? this.script.bossName : p1Name;
    const speakerSub = isBoss ? this.script.bossTitle : 'CONTENDER';

    const textX = isBoss ? (boxX + portSize + 22) : (boxX + 18);
    const textW = boxW - portSize - 40;

    ctx.font = 'bold 10px "Press Start 2P", monospace';
    const nameWidth = ctx.measureText(speakerName).width;
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(speakerName, textX, boxY + 12);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`// ${speakerSub}`, textX + nameWidth + 12, boxY + 14);

    // 5. Dialogue Body Text
    if (currentLine) {
      const displayText = currentLine.text.substring(0, this.charIndex);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';

      // Simple word wrapping
      const words = displayText.split(' ');
      let line = '';
      let curY = boxY + 32;
      const lineHeight = 16;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > textW && n > 0) {
          ctx.fillText(line, textX, curY);
          line = words[n] + ' ';
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, textX, curY);
    }

    // 6. Navigation Prompts at bottom right (Next & Skip interactive badges)
    const promptRight = boxX + boxW - 8;
    const promptBottom = boxY + boxH - 6;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    // Interactive pill badge for SKIP
    const skipText = '[ESC / B] SKIP';
    ctx.font = '7px "Press Start 2P", monospace';
    const skipWidth = ctx.measureText(skipText).width;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.fillRect(promptRight - skipWidth - 6, promptBottom - 13, skipWidth + 10, 15);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(promptRight - skipWidth - 6, promptBottom - 13, skipWidth + 10, 15);

    ctx.fillStyle = '#fca5a5';
    ctx.fillText(skipText, promptRight - 1, promptBottom - 2);

    // Interactive pill badge for NEXT
    const nextText = '[ENTER / A / LP] NEXT';
    const nextWidth = ctx.measureText(nextText).width;
    const nextRight = promptRight - skipWidth - 18;

    ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
    ctx.fillRect(nextRight - nextWidth - 6, promptBottom - 13, nextWidth + 10, 15);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    ctx.strokeRect(nextRight - nextWidth - 6, promptBottom - 13, nextWidth + 10, 15);

    ctx.fillStyle = '#fef08a';
    ctx.fillText(nextText, nextRight - 1, promptBottom - 2);

    ctx.restore();
  }
}
