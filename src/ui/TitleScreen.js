// Final Impact - Title Screen Engine

export class TitleScreen {
  constructor() {
    this.time = 0;
  }

  render(ctx, W, H) {
    this.time++;

    // Deep Arcade Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f051d');
    bg.addColorStop(0.5, '#1e0836');
    bg.addColorStop(1, '#08010f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Dynamic Starfield / Ki Sparks
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + this.time * 0.5) % W;
      const sy = (i * 47) % H;
      ctx.fillStyle = (i % 2 === 0) ? '#f472b6' : '#38bdf8';
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Huge Retro 16-Bit Logo: "FINAL IMPACT"
    ctx.textAlign = 'center';

    // Logo Drop Shadow
    ctx.fillStyle = '#000000';
    ctx.font = '900 48px monospace';
    ctx.fillText('FINAL IMPACT', W / 2 + 4, 114);

    // Fiery Golden Gradient Title
    const titleGrad = ctx.createLinearGradient(0, 70, 0, 120);
    titleGrad.addColorStop(0, '#fef08a');
    titleGrad.addColorStop(0.4, '#f59e0b');
    titleGrad.addColorStop(0.8, '#dc2626');
    titleGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = titleGrad;
    ctx.fillText('FINAL IMPACT', W / 2, 110);

    // Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('— 16-BIT RETRO ARCADE FIGHTING CHAMPIONSHIP —', W / 2, 140);

    // Flashing "PRESS START / SPACE TO PLAY"
    if (Math.floor(this.time / 25) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('PRESS [SPACE] OR [ENTER] TO START', W / 2, 210);
    }

    // Quick Controls Guide Box
    const boxW = 440;
    const boxH = 96;
    const boxX = (W - boxW) / 2;
    const boxY = 236;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ARCADE CONTROLS QUICK REFERENCE', W / 2, boxY + 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('• Movement: [W] Jump, [S] Crouch, [A] Back, [D] Forward', boxX + 16, boxY + 38);
    ctx.fillText('• Punches: [U] Light Punch, [I] Heavy Punch, [O] Special 1', boxX + 16, boxY + 54);
    ctx.fillText('• Kicks:   [J] Light Kick,  [K] Heavy Kick,  [L] Special 2', boxX + 16, boxY + 70);
    ctx.fillText('• Gamepads & 2-Player keyboard supported!', boxX + 16, boxY + 86);

    // Copyright / Credits
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('© 1994 / 2026 FINAL IMPACT ARCADE. ALL RIGHTS RESERVED.', W / 2, H - 10);

    ctx.textAlign = 'left';
  }
}
