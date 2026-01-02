/**
 * Cryptographic utilities for puzzle hashing
 */

/**
 * Create SHA-256 hash of a string (browser-compatible)
 */
export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

/**
 * Simple hash for non-cryptographic purposes (faster)
 */
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}
