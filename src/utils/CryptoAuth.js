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

/**
 * Checks if the secret character M1GHTY is unlocked.
 */
export function isMightyUnlocked() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(M1GHTY_STORAGE_KEY) === 'true';
    }
  } catch (e) {}
  return false;
}

/**
 * Sets M1GHTY's unlock status. Only permissible via Admin Portal.
 */
export function setMightyUnlocked(unlocked) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (unlocked) {
        localStorage.setItem(M1GHTY_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(M1GHTY_STORAGE_KEY);
      }
    }
  } catch (e) {}
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
