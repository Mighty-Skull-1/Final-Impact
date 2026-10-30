// Final Impact - Cryptographic Administrator Authentication
// All credential verification is performed via one-way cryptographic SHA-256 hashing.
// Plaintext administrator credentials are never stored or exposed in source control.

// SHA-256 hash digest of the authorized administrator security key
const ADMIN_DIGEST = 'f3bdf0246bdfe126001c15c48d12b05610eee4475d3e7afe9c10cf56a0ac1f01';

const AUTH_STORAGE_KEY = 'final_impact_admin_auth_session';
const M1GHTY_STORAGE_KEY = 'final_impact_unlocked_mighty';
const CHEATS_STORAGE_KEY = 'final_impact_admin_cheats';

/**
 * Computes a SHA-256 hex digest for any string.
 * Supports Web Crypto API in browsers and Node.js crypto in test environments.
 */
export async function computeSha256(str) {
  if (typeof str !== 'string') return '';

  // Browser Web Crypto API
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js environment (for automated tests / server)
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(str).digest('hex');
  } catch (err) {}

  // Pure JS fallback (FNV-1a 64-bit simulator as absolute fallback if no crypto available)
  let h1 = 0x811c9dc5, h2 = 0x27d4eb2f;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code >> 4), 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Verifies an input administrator password against the encrypted SHA-256 hash digest.
 * @param {string} inputPassword
 * @returns {Promise<boolean>}
 */
export async function verifyAdminPassword(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string') return false;
  const hash = await computeSha256(inputPassword);
  return hash.toLowerCase() === ADMIN_DIGEST.toLowerCase();
}

/**
 * Checks if an administrator session is currently active.
 * Uses sessionStorage (or localStorage fallback).
 */
export function isAdminAuthenticated() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    }
  } catch (e) {}
  return false;
}

/**
 * Sets the administrator authentication session state.
 */
export function setAdminAuthenticated(authenticated) {
  try {
    if (authenticated) {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      if (typeof localStorage !== 'undefined') localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(AUTH_STORAGE_KEY);
      if (typeof localStorage !== 'undefined') localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {}
}

// ---------- M1GHTY: the creator's personal fighter ----------
// M1GHTY only unlocks with the owner's private key. Only its SHA-256 fingerprint
// lives in the code, so the public source can't be used to work the key out, and
// flipping a localStorage flag is no longer enough.
const M1GHTY_OWNER_DIGEST = 'e95328e3924dbb6bb3e616067e8abdb924ab1495453543b1ad19892ebeb703c3';
const M1GHTY_KEY_SALT = 'final-impact-m1ghty-owner:';
const M1GHTY_KEY_STORAGE = 'final_impact_m1ghty_owner_key';
const LEGACY_M1GHTY_FLAG = 'final_impact_unlocked_mighty';

// The creator's private admin build may still toggle M1GHTY with the old flag.
const ADMIN_BUILD = (() => {
  try { return process.env.ADMIN_ENABLED === true || process.env.ADMIN_ENABLED === 'true'; } catch (e) { return false; }
})();

// Synchronous SHA-256 (used every frame by the character select, so it can't be async)
export function sha256Sync(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = [];
  const utf8 = unescape(encodeURIComponent(String(str)));
  for (let i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000), lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const W = new Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

function isValidOwnerKey(key) {
  if (!key || typeof key !== 'string') return false;
  return sha256Sync(M1GHTY_KEY_SALT + key.trim().toUpperCase()) === M1GHTY_OWNER_DIGEST;
}

let _keyCache = { raw: null, ok: false };

/**
 * True only on a device where the owner's private key has been entered.
 */
export function isMightyUnlocked() {
  try {
    if (typeof localStorage === 'undefined') return false;
    if (ADMIN_BUILD && localStorage.getItem(LEGACY_M1GHTY_FLAG) === 'true') return true;
    const raw = localStorage.getItem(M1GHTY_KEY_STORAGE);
    if (raw !== _keyCache.raw) _keyCache = { raw, ok: isValidOwnerKey(raw) };
    return _keyCache.ok;
  } catch (e) {}
  return false;
}

/**
 * Unlocks M1GHTY on this device if the owner key is correct. Returns true on success.
 */
export function unlockMightyWithKey(key) {
  if (!isValidOwnerKey(key)) return false;
  try { localStorage.setItem(M1GHTY_KEY_STORAGE, key.trim().toUpperCase()); } catch (e) { return false; }
  return true;
}

/**
 * Locks M1GHTY on this device. Unlocking (true) only works in the creator's private admin build;
 * everywhere else use unlockMightyWithKey().
 */
export function setMightyUnlocked(unlocked) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (unlocked) {
      if (ADMIN_BUILD) localStorage.setItem(LEGACY_M1GHTY_FLAG, 'true');
    } else {
      localStorage.removeItem(LEGACY_M1GHTY_FLAG);
      localStorage.removeItem(M1GHTY_KEY_STORAGE);
    }
  } catch (e) {}
}

/**
 * Reads a one-time "?m1ghty=KEY" link, saves the key if it is valid and
 * strips it from the address bar so it doesn't linger on screen.
 */
export function consumeMightyKeyFromUrl() {
  try {
    if (typeof window === 'undefined' || !window.location || !window.location.search) return null;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('m1ghty')) return null;
    const ok = unlockMightyWithKey(params.get('m1ghty') || '');
    params.delete('m1ghty');
    const qs = params.toString();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
    return ok;
  } catch (e) {}
  return null;
}

/**
 * Admin developer combat cheats (god mode, infinite super, 1-hit KO)
 */
export function getAdminCheats() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(CHEATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {}
  return {
    godMode: false,
    infiniteSuper: false,
    oneHitKO: false
  };
}

export function setAdminCheats(cheats) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHEATS_STORAGE_KEY, JSON.stringify(cheats));
    }
  } catch (e) {}
}

/**
 * Steam & Production Retail Stealth Mode:
 * In stealth mode, all public UI elements for the Admin Portal are completely hidden.
 * Only the developer knowing the secret combo (Ctrl+Shift+Alt+A or secret title sequence)
 * can summon the encrypted cryptographic portal.
 */
const STEALTH_MODE_STORAGE_KEY = 'final_impact_steam_stealth_mode';
let _inMemoryStealth = null;

export function isStealthMode() {
  if (_inMemoryStealth !== null) return _inMemoryStealth;
  try {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      if (window.location.search.includes('dev=1') || window.location.search.includes('admin=show')) {
        return false; // Explicitly unhide via URL dev flag
      }
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STEALTH_MODE_STORAGE_KEY);
      if (stored !== null) return stored === 'true';
    }
  } catch (e) {}
  // Default to true for Steam / commercial public security
  return true;
}

export function setStealthMode(enabled) {
  _inMemoryStealth = !!enabled;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STEALTH_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    }
  } catch (e) {}
}
