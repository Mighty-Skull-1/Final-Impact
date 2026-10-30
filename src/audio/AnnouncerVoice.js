// Final Impact - Announcer speech helper
// Shared by SoundFX.playAnnouncer() and the Announcer class so both use the same
// deep English voice and don't talk over each other. Fails silently wherever
// speechSynthesis is missing (Node tests, some Electron builds).

const DEEP_VOICE_PATTERNS = [
  /Microsoft (Guy|Davis|Christopher|Eric|Roger|Steffan|Andrew|Brian|Ryan|Thomas).*Natural/i,
  /Google UK English Male/i,
  /Microsoft (David|Mark|George|James|Richard|Sean)/i,
  /\b(Daniel|Alex|Fred|Arthur|Aaron|Gordon|Lee|Oliver|Rishi)\b/i,
  /\bMale\b/i
];
const FEMALE_HINTS = /(Zira|Hazel|Susan|Samantha|Victoria|Karen|Moira|Tessa|Fiona|Veena|Aria|Jenny|Libby|Sonia|Natasha|Clara|Emma|Michelle|Ava|Allison|Female|Kate|Serena|Martha)/i;

export function speechSupported() {
  return typeof window !== 'undefined' && !!window && !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function scoreVoice(v) {
  if (!v || !v.lang) return -1;
  const lang = String(v.lang).toLowerCase();
  if (!lang.startsWith('en')) return -1;
  let score = 10;
  if (lang === 'en-us' || lang === 'en_us') score += 3;
  if (lang === 'en-gb' || lang === 'en_gb') score += 2;
  const name = String(v.name || '');
  DEEP_VOICE_PATTERNS.forEach((re, i) => { if (re.test(name)) score += 40 - i * 6; });
  if (FEMALE_HINTS.test(name)) score -= 30;
  if (v.localService) score += 2; // local voices honour pitch more reliably
  return score;
}

export function pickDeepVoice(voices) {
  if (!voices || !voices.length) return null;
  let best = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) { best = v; bestScore = s; }
  }
  return best || voices[0] || null;
}

const state = { voice: null, hooked: false, lastText: '', lastAt: 0 };

export function getAnnouncerVoice() {
  if (!speechSupported()) return null;
  try {
    if (!state.voice) state.voice = pickDeepVoice(window.speechSynthesis.getVoices());
    if (!state.hooked && typeof window.speechSynthesis.addEventListener === 'function') {
      state.hooked = true;
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        try { state.voice = pickDeepVoice(window.speechSynthesis.getVoices()); } catch (e) {}
      });
    }
  } catch (e) {}
  return state.voice;
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

// True when `text` was (or is contained in) a line spoken within `windowMs`.
export function recentlySpoken(text, windowMs = 900) {
  if (!state.lastText) return false;
  if (nowMs() - state.lastAt > windowMs) return false;
  const a = norm(text);
  return !!a && state.lastText.includes(a);
}

export function markSpoken(text) {
  state.lastText = norm(text);
  state.lastAt = nowMs();
}

// Speak one line with the dramatic arcade voice. volume is already scaled (0..1).
export function speakLine(text, { pitch = 0.45, rate = 0.82, volume = 1, voice = undefined, interrupt = true } = {}) {
  if (typeof window === 'undefined' || !window || !window.speechSynthesis) return false;
  if (typeof SpeechSynthesisUtterance === 'undefined') return false;
  try {
    if (volume <= 0.001) return false;
    if (interrupt && typeof window.speechSynthesis.cancel === 'function') window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const v = voice !== undefined ? voice : getAnnouncerVoice();
    if (v) utt.voice = v;
    if (v && v.lang) utt.lang = v.lang;
    utt.pitch = Math.max(0, Math.min(2, pitch));
    utt.rate = Math.max(0.1, Math.min(2, rate));
    utt.volume = Math.max(0, Math.min(1, volume));
    window.speechSynthesis.speak(utt);
    markSpoken(text);
    return true;
  } catch (e) {
    return false;
  }
}
