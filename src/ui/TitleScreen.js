// Final Impact - Title Screen Engine
import { input } from '../engine/Input.js';

export class TitleScreen {
  constructor() {
    this.time = 0;
  }

  render(ctx, W, H) {
    this.time++;
    const t = this.time;
    const cx = W / 2;

    // Blood-red sky with a huge pulsing sun behind the logo
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0000');
    bg.addColorStop(0.55, '#3b0808');
    bg.addColorStop(1, '#0a0101');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const pulse = Math.sin(t * 0.04) * 0.5 + 0.5;
    const sun = ctx.createRadialGradient(cx, 130, 10, cx, 130, 210);
    sun.addColorStop(0, `rgba(251, 191, 36, ${0.55 + pulse * 0.2})`);
    sun.addColorStop(0.4, 'rgba(220, 38, 38, 0.35)');
    sun.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H);

    // Mountain silhouettes
    ctx.fillStyle = '#120202';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, 250);
    ctx.lineTo(90, 200);
    ctx.lineTo(170, 245);
    ctx.lineTo(260, 190);
    ctx.lineTo(340, 240);
    ctx.lineTo(430, 195);
    ctx.lineTo(520, 245);
    ctx.lineTo(580, 205);
    ctx.lineTo(W, 250);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Rising embers
    for (let i = 0; i < 50; i++) {
      const ex = (i * 83 + Math.sin(t * 0.02 + i * 1.7) * 18 + W) % W;
      const ey = H - ((t * (0.5 + (i % 6) * 0.18) + i * 47) % H);
      ctx.globalAlpha = 0.3 + (i % 4) * 0.15;
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#fb923c';
      ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Cinematic black bars
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, 22);
    ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 22, W, 2);
    ctx.fillRect(0, H - 24, W, 2);

    // Dragon emblem medallion
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.35 + pulse * 0.15;
    ctx.fillStyle = '#facc15';
    ctx.font = '900 150px serif';
    ctx.fillText('龍', cx, 150);
    ctx.globalAlpha = 1;

    // Logo (two stacked words, slashed look)
    ctx.save();
    ctx.translate(cx, 0);
    ctx.transform(1, 0, -0.12, 1, 0, 0);
    ctx.font = '900 56px monospace';
    ctx.fillStyle = '#000';
    ctx.fillText('FINAL', 4, 96);
    ctx.fillText('IMPACT', 4, 150);
    const grad = ctx.createLinearGradient(0, 50, 0, 152);
    grad.addColorStop(0, '#fef9c3');
    grad.addColorStop(0.45, '#facc15');
    grad.addColorStop(0.75, '#dc2626');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fillText('FINAL', 0, 92);
    ctx.fillText('IMPACT', 0, 146);
    ctx.restore();

    // Tagline
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('~  THE ULTIMATE TOURNAMENT  ~', cx, 176);

    // Press start
    if (Math.floor(t / 25) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      const hasGp = input.hasGamepadConnected();
      const prompt = hasGp ? 'PRESS [A], [START], OR [SPACE]' : 'PRESS [SPACE] OR [ENTER]';
      ctx.fillText(prompt, cx, 214);
    }

    // Slim controls strip
    const boxW = 460;
    const boxH = 58;
    const boxX = cx - boxW / 2;
    const boxY = 262;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('MOVE  W A S D     PUNCH  U I O     KICK  J K L', cx, boxY + 20);
    ctx.fillStyle = input.hasGamepadConnected() ? '#4ade80' : '#d6d3d1';
    ctx.font = '9px monospace';
    ctx.fillText(
      input.hasGamepadConnected() ? 'GAMEPAD CONNECTED & READY' : 'CONTROLLERS (XBOX / PS / USB) & 2P KEYBOARD SUPPORTED',
      cx, boxY + 38
    );
    ctx.fillStyle = '#a8a29e';
    ctx.fillText('FINISH HIM: SPACE / HP+HK', cx, boxY + 51);

    // Credits
    ctx.fillStyle = '#78716c';
    ctx.font = '9px monospace';
    ctx.fillText('© 2026 FINAL IMPACT ARCADE', cx, H - 8);

    ctx.textAlign = 'left';
  }
}
