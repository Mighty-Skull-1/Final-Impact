// Final Impact - Authentic Street Fighter II Arcade HUD & FX Engine

export class HUD {
  constructor() {
    this.timer = 99;
    this.timerTicks = 0;
    this.announcement = null;
    this.announcementTimer = 0;
    this.hitSparks = [];
    this.screenShake = 0;
    this.p1RedHealth = 1000;
    this.p2RedHealth = 1000;
    this.comboP1 = 0;
    this.comboTimerP1 = 0;
    this.comboP2 = 0;
    this.comboTimerP2 = 0;

    // Naruto Anime Ultimate Cinematic Cut-in State
    this.ultimateCinematic = null;
    window.addEventListener('ultimate-activated', (e) => {
      this.triggerUltimateCinematic(e.detail);
    });
  }

  triggerUltimateCinematic(detail) {
    this.ultimateCinematic = {
      ...detail,
      frame: 0,
      maxFrames: 42
    };
    this.triggerShake(12);
  }

  reset(roundNumber = 1) {
    this.timer = 99;
    this.timerTicks = 0;
    this.hitSparks = [];
    this.screenShake = 0;
    this.ultimateCinematic = null;
    this.setAnnouncement(roundNumber === 1 ? 'ROUND 1' : (roundNumber === 2 ? 'ROUND 2' : 'FINAL ROUND'), 90);
  }

  setAnnouncement(text, duration = 90) {
    this.announcement = text;
    this.announcementTimer = duration;
  }

  addHitSpark(x, y, type = 'hit') {
    this.hitSparks.push({
      x,
      y,
      type,
      frame: 0,
      maxFrames: type === 'block' ? 8 : 12,
      particles: Array.from({ length: 10 }, () => ({
        vx: (Math.random() * 2 - 1) * 4,
        vy: (Math.random() * 2 - 1) * 4,
        size: Math.random() * 3 + 2,
        color: type === 'block' ? (Math.random() < 0.5 ? '#38bdf8' : '#ffffff') : (Math.random() < 0.6 ? '#facc15' : '#ef4444')
      }))
    });
  }

  triggerShake(intensity = 8) {
    this.screenShake = intensity;
  }

  recordHit(attackerPlayerNum) {
    if (attackerPlayerNum === 1) {
      this.comboP1++;
      this.comboTimerP1 = 50;
    } else {
      this.comboP2++;
      this.comboTimerP2 = 50;
    }
  }

  update(f1, f2) {
    // Round timer countdown
    this.timerTicks++;
    if (this.timerTicks >= 60 && this.timer > 0 && !f1.isDead && !f2.isDead) {
      this.timerTicks = 0;
      this.timer--;
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.85;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // Smooth lingering red health bar update
    if (this.p1RedHealth > f1.health) {
      this.p1RedHealth -= 3;
    } else {
      this.p1RedHealth = f1.health;
    }

    if (this.p2RedHealth > f2.health) {
      this.p2RedHealth -= 3;
    } else {
      this.p2RedHealth = f2.health;
    }

    // Announcement timer
    if (this.announcementTimer > 0) {
      this.announcementTimer--;
      if (this.announcementTimer === 0) {
        if (this.announcement?.startsWith('ROUND')) {
          this.setAnnouncement('FIGHT!', 60);
        } else {
          this.announcement = null;
        }
      }
    }

    // Hit Sparks update
    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      const spark = this.hitSparks[i];
      spark.frame++;
      spark.particles.forEach(p => {
        p.x = (p.x || spark.x) + p.vx;
        p.y = (p.y || spark.y) + p.vy;
        p.size = Math.max(0, p.size - 0.2);
      });
      if (spark.frame >= spark.maxFrames) {
        this.hitSparks.splice(i, 1);
      }
    }

    // Combo timers
    if (this.comboTimerP1 > 0) {
      this.comboTimerP1--;
      if (this.comboTimerP1 === 0) this.comboP1 = 0;
    }
    if (this.comboTimerP2 > 0) {
      this.comboTimerP2--;
      if (this.comboTimerP2 === 0) this.comboP2 = 0;
    }

    // Ultimate Cinematic Timer
    if (this.ultimateCinematic) {
      this.ultimateCinematic.frame++;
      if (this.ultimateCinematic.frame >= this.ultimateCinematic.maxFrames) {
        this.ultimateCinematic = null;
      }
    }
  }

  getShakeOffset() {
    if (this.screenShake <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * this.screenShake,
      y: (Math.random() * 2 - 1) * this.screenShake
    };
  }

  render(ctx, f1, f2, W, H) {
    ctx.save();

    // ==========================================
    // 1. Street Fighter II Health Bars
    // ==========================================
    const barW = 240;
    const barH = 14;
    const barY = 24;

    // P1 Health Bar (Left to center)
    const p1X = 30;
    // Outer border
    ctx.fillStyle = '#000000';
    ctx.fillRect(p1X - 2, barY - 2, barW + 4, barH + 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(p1X - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(p1X, barY, barW, barH);

    // P1 Red Damage Gauge (Lingering)
    const p1RedW = (this.p1RedHealth / f1.maxHealth) * barW;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(p1X + barW - p1RedW, barY, p1RedW, barH);

    // P1 Green/Yellow Current Health
    const p1CurrW = (f1.health / f1.maxHealth) * barW;
    const p1Grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
    p1Grad.addColorStop(0, '#fef08a');
    p1Grad.addColorStop(0.5, '#eab308');
    p1Grad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = p1Grad;
    ctx.fillRect(p1X + barW - p1CurrW, barY, p1CurrW, barH);

    // P2 Health Bar (Right to center)
    const p2X = W - barW - 30;
    ctx.fillStyle = '#000000';
    ctx.fillRect(p2X - 2, barY - 2, barW + 4, barH + 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(p2X - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(p2X, barY, barW, barH);

    // P2 Red Damage
    const p2RedW = (this.p2RedHealth / f2.maxHealth) * barW;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(p2X, barY, p2RedW, barH);

    // P2 Yellow Current Health
    const p2CurrW = (f2.health / f2.maxHealth) * barW;
    ctx.fillStyle = p1Grad;
    ctx.fillRect(p2X, barY, p2CurrW, barH);

    // Fighter Names
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(f1.name, p1X + 4, barY - 6);
    ctx.fillText(f2.name, p2X + barW - ctx.measureText(f2.name).width - 4, barY - 6);

    // Round Win Emblems (Golden "V" badges)
    for (let r = 0; r < f1.roundsWon; r++) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(p1X + barW - 14 - r * 16, barY + barH + 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('V', p1X + barW - 17 - r * 16, barY + barH + 13);
    }

    for (let r = 0; r < f2.roundsWon; r++) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(p2X + 14 + r * 16, barY + barH + 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('V', p2X + 11 + r * 16, barY + barH + 13);
    }

    // ==========================================
    // 2. Center Countdown Timer (99)
    // ==========================================
    const timerStr = this.timer.toString().padStart(2, '0');
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(timerStr, W / 2 - 17, barY + 16);
    ctx.fillStyle = this.timer <= 10 ? '#ef4444' : '#fde047';
    ctx.fillText(timerStr, W / 2 - 18, barY + 15);

    // ==========================================
    // 3. Super / EX Gauge (Bottom)
    // ==========================================
    const superW = 160;
    const superH = 10;
    const superY = H - 20;

    // P1 Super
    ctx.fillStyle = '#000000';
    ctx.fillRect(p1X - 1, superY - 1, superW + 2, superH + 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p1X, superY, superW, superH);
    const p1SuperFill = (f1.superMeter / f1.maxSuperMeter) * superW;
    ctx.fillStyle = f1.superMeter >= f1.maxSuperMeter ? '#38bdf8' : '#0284c7';
    ctx.fillRect(p1X, superY, p1SuperFill, superH);

    ctx.fillStyle = f1.superMeter >= f1.maxSuperMeter ? '#38bdf8' : '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(f1.superMeter >= f1.maxSuperMeter ? '★ SECRET TECHNIQUE [SPACE]' : 'EX METER', p1X, superY - 4);

    // P2 Super
    ctx.fillStyle = '#000000';
    ctx.fillRect(p2X + barW - superW - 1, superY - 1, superW + 2, superH + 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p2X + barW - superW, superY, superW, superH);
    const p2SuperFill = (f2.superMeter / f2.maxSuperMeter) * superW;
    ctx.fillStyle = f2.superMeter >= f2.maxSuperMeter ? '#38bdf8' : '#0284c7';
    ctx.fillRect(p2X + barW - p2SuperFill, superY, p2SuperFill, superH);

    ctx.fillStyle = f2.superMeter >= f2.maxSuperMeter ? '#38bdf8' : '#94a3b8';
    ctx.fillText(f2.superMeter >= f2.maxSuperMeter ? '★ SECRET TECHNIQUE' : 'EX METER', p2X + barW - 120, superY - 4);

    // Pulsing Central Alert when Super is full
    if (f1.superMeter >= f1.maxSuperMeter && Math.floor(Date.now() / 300) % 2 === 0) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('PRESS [SPACE] FOR OUGI ULTIMATE!', p1X, superY - 16);
    }

    // ==========================================
    // 4. Combo Announcements
    // ==========================================
    if (this.comboP1 > 1) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${this.comboP1} HITS!`, p1X + 20, 80);
    }
    if (this.comboP2 > 1) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`${this.comboP2} HITS!`, p2X + barW - 110, 80);
    }

    // ==========================================
    // 5. Center Round / KO Announcements
    // ==========================================
    if (this.announcement) {
      ctx.textAlign = 'center';
      // Black drop shadow
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(this.announcement, W / 2 + 2, H / 2 - 18);
      // Main text
      ctx.fillStyle = this.announcement === 'K.O.' ? '#dc2626' : (this.announcement === 'FIGHT!' ? '#f97316' : '#fde047');
      ctx.fillText(this.announcement, W / 2, H / 2 - 20);
      ctx.textAlign = 'left';
    }

    // ==========================================
    // 6. Hit Sparks & Particles
    // ==========================================
    this.hitSparks.forEach(spark => {
      spark.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      if (spark.frame < 4) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(spark.x - 4, spark.y - 4, 8, 8);
      }
    });

    // ==========================================
    // 7. Naruto Anime Ultimate Cinematic Cut-In (Ougi!)
    // ==========================================
    if (this.ultimateCinematic) {
      const u = this.ultimateCinematic;
      const progress = u.frame / u.maxFrames; // 0 to 1

      // 1. Full Screen Anime Speedlines
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      const centerX = W / 2;
      const centerY = H / 2;
      for (let a = 0; a < Math.PI * 2; a += 0.25) {
        const offset = ((u.frame * 8) % 30);
        const r1 = 60 + offset;
        const r2 = 360;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(a) * r1, centerY + Math.sin(a) * r1);
        ctx.lineTo(centerX + Math.cos(a) * r2, centerY + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // 2. High-Contrast Cinematic Letterbox Banner
      const bannerY = 120;
      const bannerH = 110;
      ctx.fillStyle = 'rgba(10, 5, 20, 0.92)';
      ctx.fillRect(0, bannerY, W, bannerH);

      // Golden Edge Lines
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, bannerY, W, 3);
      ctx.fillRect(0, bannerY + bannerH - 3, W, 3);

      // Slide offset animation
      const slideX = progress < 0.2 ? (0.2 - progress) * 500 : (progress > 0.8 ? (progress - 0.8) * 500 : 0);

      // 3. Giant Anime Eye / Face Portrait Slice
      ctx.save();
      ctx.translate(-slideX, 0);
      const winSprites = u.fighter.sprites?.VICTORY || u.fighter.sprites?.IDLE || [];
      const portraitImg = winSprites[0];
      if (portraitImg) {
        // Draw zoomed dramatic eye slice on left
        ctx.drawImage(portraitImg, 20, bannerY + 5, 100, 100);
        // Glowing cyan eye flash
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(56, bannerY + 28, 14, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(60, bannerY + 29, 6, 3);
      }

      // 4. Japanese Kanji Calligraphy & Ougi Banner
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fde047';
      ctx.font = '900 32px serif';
      ctx.fillText(`【 奥義 】 ${u.kanji}`, 130, bannerY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(u.name, 134, bannerY + 75);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(u.subtitle, 136, bannerY + 95);

      ctx.restore();
    }

    ctx.restore();
  }
}
