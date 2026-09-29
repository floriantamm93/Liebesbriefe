// @ts-nocheck

export const ITERATIONS = 600000;
const encoder = new TextEncoder();
export function toBase64(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
export function fromBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}
async function key(password, salt, usages) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, usages);
}
export async function encrypt(payload, password, hints = []) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(password, salt, ['encrypt']), encoder.encode(JSON.stringify(payload)));
  return { version: 1, iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)), hints };
}
export async function decrypt(bundle, password) {
  if (bundle.version !== 1 || bundle.iterations !== ITERATIONS) throw new Error('Unsupported envelope');
  const salt = fromBase64(bundle.salt), iv = fromBase64(bundle.iv);
  if (salt.length !== 16 || iv.length !== 12) throw new Error('Invalid envelope');
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await key(password, salt, ['decrypt']), fromBase64(bundle.ciphertext));
  return JSON.parse(new TextDecoder().decode(plaintext));
}
