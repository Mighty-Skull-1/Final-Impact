// Final Impact - Campaign endings
// Every playable fighter gets their own epilogue after felling the Endless Dragon.
import { COLORS, FONTS, drawText, drawTitleText, drawPromptBar, hexToRgba, ease } from '../ui/Theme.js';
import { FIGHTER_DESIGNS } from '../graphics/FighterDesigns.js';

export const ENDINGS = {
  kazuki: ['The dragon\'s flame dies in Kazuki\'s fist — and something answers inside him.', 'He returns to the mountain dojo, not as a champion, but as a student again.', '"The strongest opponent," he writes on the wall, "is the one who wakes up tomorrow."'],
  raven: ['Mission complete. Raven files the report and redacts the word "dragon" eleven times.', 'Command offers her a medal. She asks for the satellite access codes instead.', 'Somewhere in orbit, a targeting laser quietly changes owners.'],
  kagura: ['Kagura vanishes from the arena before the crowd can see her face.', 'By dawn, every crime lord in Neo Tokyo has found a single lotus petal on his pillow.', 'The message is clear: the shadows have a new master.'],
  fang: ['Fang hangs his gloves above the old gym in Bangkok where he learned to fight.', 'The prize money rebuilds it — eight new rings, one for each limb.', 'Kids line up around the block. He makes every one of them run first.'],
  zephyr: ['Zephyr turns the victory into a street festival that lasts three days.', 'The berimbau never stops. The champions\' belt ends up on a statue in the favela square.', '"Fighting is just dancing," he grins, "with worse music."'],
  colossus: ['The bell rings and Colossus, for once, does not get back up — he sits on the ring apron and laughs.', 'He spends his winnings on a boxing league for kids nobody else would train.', 'They call it the Iron Fist Club. Nobody is allowed to quit.'],
  cinder: ['The dragon\'s embers drift into Cinder\'s open palm and refuse to go out.', 'Ash Province finally has a fire that warms instead of burns.', 'She still burns bright and fast — she just chooses what to burn now.'],
  glacier: ['Glacier freezes the dragon\'s last breath into a single blue crystal.', 'He carries it north, to the frozen temple where his order was wiped out.', 'Set upon the altar, it begins — impossibly — to glow warm.'],
  oracle: ['Oracle reads the stars one last time and finds a future she had never seen.', 'For the first time in her life, it is not written yet.', 'She smiles, closes her eyes, and walks into it.'],
  bandit: ['Bandit pockets the trophy, the prize purse, and the tournament director\'s watch.', 'By the time anyone notices, the wastelands have a new road — paved with dragon scales.', 'Toll: one story about how you lost to him.'],
  confessor: ['The Confessor kneels before the fallen dragon and prays for its soul.', 'The cathedral bells ring across the city for the first time in a century.', 'Penance, he decides, can finally end. Mostly.'],
  valka: ['Valka\'s war cry echoes off the mountains for a full minute.', 'The skalds will sing of this for a thousand years — she has already written the first verse.', 'It rhymes "dragon" with "dragon". She is very proud of it.'],
  convict: ['The Convict snaps his last chain on the dragon\'s horn.', 'Free, and with a full pardon, he stands outside the prison gates and does not know where to go.', 'So he goes back in — to teach the others how to hit back.'],
  prophet: ['The Prophet saw this ending decades ago, in the sand.', 'What he never saw was what came after — and that terrifies and delights him.', 'He walks into the desert to listen for new visions.'],
  ronin: ['The ronin sheathes his blade for the last time and bows to the fallen beast.', 'A lord offers him a castle. He asks only for a quiet room and a whetstone.', 'A masterless blade, it turns out, can choose its own master.'],
  vagabond: ['The Vagabond plants his greatsword where the dragon fell.', 'Around it, the ruins of his fallen kingdom slowly begin to rebuild.', 'He will not stay to see it finished. There is always another road.'],
  warden: ['The Warden stands guard over the dragon\'s grave for seven days and seven nights.', 'When he finally leaves, the Sand Citadel\'s gates are open to all travellers.', '"The wall does not break," he says. "But it can open."'],
  wretch: ['Nobody bet on the Wretch. Nobody.', 'Now every gutter in the city has a crude drawing of a scrawny kid standing on a dragon.', 'He sleeps in a real bed. He still keeps a knife under the pillow.'],
  mighty: ['Reality reboots itself around M1GHTY with a polite cough.', 'The Endless Dragon is now the Ended Dragon. The arena is now a crater.', 'Somewhere, an announcer quietly updates his résumé.']
};

export class EndingScreen {
  constructor() {
    this.active = false;
    this.t = 0;
    this.fighter = null;
  }

  start(fighter, onDone) {
    this.active = true;
    this.t = 0;
    this.fighter = fighter;
    this.onDone = onDone;
  }

  lines() {
    const id = this.fighter ? this.fighter.id : 'kazuki';
    return ENDINGS[id] || ENDINGS.kazuki;
  }

  // Returns true when finished
  advance() {
    const total = this.lines().join(' ').length;
    const shown = this.t * 1.4;
    if (shown < total) { this.t = Math.ceil(total / 1.4) + 1; return false; }
    this.active = false;
    if (this.onDone) this.onDone();
    return true;
  }

  render(ctx, W, H, hasGamepad = false) {
    this.t++;
    const t = this.t;
    const f = this.fighter;
    const d = f ? FIGHTER_DESIGNS[f.id] : null;
    const glow = (d && d.glow) || COLORS.gold;
    // Backdrop: night sky with a fading dragon-fire horizon
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05040a');
    g.addColorStop(0.7, '#14081a');
    g.addColorStop(1, hexToRgba(glow, 0.35));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5) % W, sy = (i * 71.3) % (H * 0.6);
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 0.03 + i);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.globalAlpha = 1;
    // Fighter silhouette, large
    const sprites = f && f.sprites ? (f.sprites.VICTORY || f.sprites.IDLE) : null;
    if (sprites && sprites.length) {
      const img = sprites[Math.floor(t / 12) % sprites.length];
      const sc = 3;
      const enter = ease.outCubic(Math.min(1, t / 40));
      ctx.save();
      ctx.globalAlpha = enter;
      ctx.imageSmoothingEnabled = false;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 26;
      ctx.drawImage(img, 30 - (1 - enter) * 40, H - 90 * sc + 20, 80 * sc, 90 * sc);
      ctx.restore();
    }
    const x = 280;
    drawText(ctx, 'EPILOGUE', x, 58, { font: FONTS.ui(9, 900), color: glow, letterSpacing: 3 });
    drawTitleText(ctx, f ? f.name : '', x, 98, 34, { align: 'left' });
    // Typewriter text
    const lines = this.lines();
    let budget = Math.floor(t * 1.4);
    let y = 128;
    ctx.font = `italic 600 11px ${'"Bahnschrift", "Segoe UI", "Inter", sans-serif'}`;
    for (const line of lines) {
      if (budget <= 0) break;
      const part = line.slice(0, budget);
      budget -= line.length;
      y = wrap(ctx, part, x, y, W - x - 30, 15, COLORS.text) + 10;
    }
    const total = lines.join(' ').length;
    if (t * 1.4 >= total && Math.floor(t / 30) % 2 === 0) {
      drawText(ctx, 'THE END', x, y + 14, { font: FONTS.display(14), color: COLORS.gold });
    }
    drawPromptBar(ctx, [{ key: hasGamepad ? 'A' : 'ENTER', label: t * 1.4 >= total ? 'Continue' : 'Skip text' }], W / 2, H - 8);
  }
}

function wrap(ctx, text, x, y, maxW, lh, color) {
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}
