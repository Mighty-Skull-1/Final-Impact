// Final Impact - Daily Challenges
// Three challenges a day (same for everyone on that date), each paying out coins.
// Progress is fed by gameplay events and saved in localStorage.
import { EconomyManager } from '../shop/SkinCatalog.js';
import { achievements } from '../engine/Achievements.js';
import { COLORS, FONTS, drawText, drawBackdrop, drawScreenHeader, drawPromptBar, slantPath, hexToRgba, ease } from '../ui/Theme.js';

const STORAGE_KEY = 'final_impact_daily';
const ROSTER = ['kazuki', 'raven', 'kagura', 'fang', 'zephyr', 'colossus', 'cinder', 'glacier', 'oracle', 'bandit',
  'confessor', 'valka', 'convict', 'prophet', 'ronin', 'vagabond', 'warden', 'wretch', 'echo', 'glitch', 'tempo', 'atlas'];

// event: which gameplay event counts; test(info) optionally filters it
const TEMPLATES = [
  { id: 'win2', text: 'Win 2 matches (any mode)', event: 'matchWin', target: 2, reward: 150, icon: '🏆' },
  { id: 'winAs', text: 'Win a match as {FIGHTER}', event: 'matchWin', target: 1, reward: 200, icon: '🥋', fighter: true },
  { id: 'combo5', text: 'Land a 5+ hit combo', event: 'combo5', target: 1, reward: 120, icon: '🔥' },
  { id: 'throws', text: 'Land 5 throws', event: 'throw', target: 5, reward: 120, icon: '🤼' },
  { id: 'breaker', text: 'Break 2 combos with Combo Breaker', event: 'breaker', target: 2, reward: 130, icon: '💥' },
  { id: 'ultimate', text: 'Land 2 Ultimates', event: 'ultimateLock', target: 2, reward: 160, icon: '⚡' },
  { id: 'counters', text: 'Land 8 counter hits', event: 'counter', target: 8, reward: 120, icon: '🎯' },
  { id: 'crit', text: 'Land a Critical Riposte on a dazed foe', event: 'crit', target: 1, reward: 160, icon: '🗡️' },
  { id: 'flawless', text: 'Win a round without taking damage', event: 'flawlessRound', target: 1, reward: 250, icon: '👑' },
  { id: 'hardWin', text: 'Beat the CPU on Hard or Nightmare', event: 'hardWin', target: 1, reward: 250, icon: '😈' },
  { id: 'campaign3', text: 'Clear 3 Campaign stages', event: 'campaignStage', target: 3, reward: 220, icon: '🏯' },
  { id: 'techs', text: 'Tech 3 throws', event: 'tech', target: 3, reward: 110, icon: '✋' }
];

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Small deterministic PRNG so everyone gets the same challenges on the same day
function seeded(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class DailyChallenges {
  constructor() {
    this.state = null;
    this.time = 0;
    this.ensureToday();
  }

  ensureToday() {
    const today = dateKey();
    if (this.state && this.state.date === today) return;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.date === today && Array.isArray(saved.list)) {
      this.state = saved;
      return;
    }
    const rnd = seeded('final-impact-' + today);
    const pool = TEMPLATES.slice();
    const list = [];
    while (list.length < 3 && pool.length) {
      const t = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      const entry = { id: t.id, progress: 0, done: false };
      if (t.fighter) entry.fighter = ROSTER[Math.floor(rnd() * ROSTER.length)];
      list.push(entry);
    }
    this.state = { date: today, list };
    this.save();
  }

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (e) {}
  }

  getList() {
    this.ensureToday();
    return this.state.list.map(e => {
      const t = TEMPLATES.find(x => x.id === e.id) || TEMPLATES[0];
      const name = e.fighter ? e.fighter.toUpperCase() : '';
      return { ...t, ...e, text: t.text.replace('{FIGHTER}', name) };
    });
  }

  // Gameplay events from the fight (only the local player's achievements count)
  record(event, info = {}) {
    this.ensureToday();
    let changed = false;
    for (const e of this.state.list) {
      if (e.done) continue;
      const t = TEMPLATES.find(x => x.id === e.id);
      if (!t || t.event !== event) continue;
      if (t.fighter && info.fighter !== e.fighter) continue;
      e.progress = Math.min(t.target, e.progress + (info.amount || 1));
      changed = true;
      if (e.progress >= t.target) {
        e.done = true;
        EconomyManager.addCoins(t.reward);
        try {
          achievements.toast({ icon: t.icon, header: 'DAILY CHALLENGE COMPLETE', title: `+${t.reward} COINS`, desc: t.text.replace('{FIGHTER}', (e.fighter || '').toUpperCase()) });
        } catch (err) {}
      }
    }
    if (changed) this.save();
  }

  msUntilReset() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return next - now;
  }

  // ---------- Screen ----------
  render(ctx, W, H, hasGamepad = false) {
    this.time++;
    const t = this.time;
    drawBackdrop(ctx, W, H, t, { tint: '#5b2a86' });
    drawScreenHeader(ctx, W, 'DAILY CHALLENGES', 'NEW EVERY DAY · EARN COINS', t);
    const list = this.getList();
    const ms = this.msUntilReset();
    const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000);
    drawText(ctx, `RESETS IN ${hh}H ${String(mm).padStart(2, '0')}M`, W - 22, 33, { font: FONTS.ui(8.5, 900), color: COLORS.textDim, align: 'right', letterSpacing: 1 });
    drawText(ctx, `COINS  ${EconomyManager.getCoins().toLocaleString()}`, W - 22, 62, { font: FONTS.ui(9, 900), color: COLORS.gold, align: 'right' });

    list.forEach((c, i) => {
      const enter = ease.outCubic(Math.min(1, Math.max(0, (t - i * 5) / 16)));
      const x = 40 + (1 - enter) * 60, y = 82 + i * 78, w = W - 80, h = 66;
      ctx.save();
      ctx.globalAlpha = enter;
      ctx.fillStyle = c.done ? 'rgba(60, 207, 142, 0.14)' : 'rgba(14, 12, 20, 0.88)';
      slantPath(ctx, x, y, w, h, 12); ctx.fill();
      ctx.strokeStyle = c.done ? hexToRgba(COLORS.good, 0.7) : 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '26px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(c.icon, x + 42, y + h / 2 + 1);
      ctx.textBaseline = 'alphabetic';
      drawText(ctx, c.text, x + 76, y + 26, { font: FONTS.display(16), color: c.done ? COLORS.good : COLORS.text });
      // progress bar
      const pw = w - 250, pct = Math.min(1, c.progress / c.target);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      slantPath(ctx, x + 76, y + 38, pw, 9, 3); ctx.fill();
      ctx.fillStyle = c.done ? COLORS.good : COLORS.meter;
      slantPath(ctx, x + 76, y + 38, Math.max(6, pw * pct), 9, 3); ctx.fill();
      drawText(ctx, `${c.progress} / ${c.target}`, x + 82 + pw, y + 46, { font: FONTS.ui(8.5, 900), color: COLORS.textDim });
      drawText(ctx, c.done ? 'COMPLETE' : 'REWARD', x + w - 30, y + 26, { font: FONTS.ui(7.5, 900), color: c.done ? COLORS.good : COLORS.textDim, align: 'right', letterSpacing: 1.5 });
      drawText(ctx, `${c.reward}`, x + w - 46, y + 48, { font: FONTS.display(20), color: COLORS.goldPale, align: 'right' });
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath(); ctx.arc(x + w - 36, y + 42, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    drawText(ctx, 'Progress counts in every offline and online match. Rewards are paid automatically.', W / 2, 330, { font: FONTS.ui(8, 700), color: COLORS.textMute, align: 'center' });
    drawPromptBar(ctx, [{ key: hasGamepad ? 'B' : 'ESC', label: 'Back' }], W / 2, H - 8);
  }
}

export const dailyChallenges = new DailyChallenges();
export const CHALLENGE_TEMPLATES = TEMPLATES;
