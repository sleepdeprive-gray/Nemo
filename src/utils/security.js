/**
 * Security utilities for Nemo Cloud File Storage
 */

// Constant Salt for hashing passcodes locally
const PASSCODE_SALT = 'NEMO_OBSIDIAN_VAULT_SALT_2026_v1';
const LEGACY_STORAGE_KEY = 'nemo_access_password';
const HASH_STORAGE_KEY = 'nemo_passcode_hash';

/**
 * Hash a text string using SHA-256 via Web Crypto API
 */
export async function hashString(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + PASSCODE_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the currently stored passcode hash.
 * Automatically migrates legacy plain-text password to hash if found.
 */
export async function getStoredPasscodeHash() {
  let storedHash = localStorage.getItem(HASH_STORAGE_KEY);
  
  if (!storedHash) {
    const legacyPass = localStorage.getItem(LEGACY_STORAGE_KEY);
    const defaultPass = legacyPass || 'nemo';
    storedHash = await hashString(defaultPass);
    localStorage.setItem(HASH_STORAGE_KEY, storedHash);
    if (legacyPass) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  return storedHash;
}

/**
 * Verify input passcode against stored hash
 */
export async function verifyPasscode(inputPassword) {
  if (!inputPassword) return false;
  const inputHash = await hashString(inputPassword.trim());
  const storedHash = await getStoredPasscodeHash();
  return inputHash === storedHash;
}

/**
 * Update the access passcode (stores as SHA-256 hash)
 */
export async function updatePasscode(newPassword) {
  if (!newPassword || !newPassword.trim()) return false;
  const newHash = await hashString(newPassword.trim());
  localStorage.setItem(HASH_STORAGE_KEY, newHash);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  return true;
}

/**
 * Sanitize filename to prevent path traversal and dangerous characters
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'unnamed_file';
  // Remove directory traversal characters
  let cleanName = filename.replace(/\\/g, '/').split('/').pop();
  // Remove control characters and invalid filename chars
  cleanName = cleanName.replace(/[^\w\s\.\-\(\)\[\]]/gi, '_');
  // Avoid leading dots (hidden files)
  if (cleanName.startsWith('.')) {
    cleanName = 'file_' + cleanName;
  }
  return cleanName || 'unnamed_file';
}

/**
 * Check if a file extension is prohibited (executable/script dangerous extensions)
 */
export function isAllowedFileType(filename) {
  if (!filename) return false;
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif', 
    '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.ps2', 
    '.jar', '.reg', '.inf', '.application', '.gadget', '.hta', '.cpl'
  ];
  const lower = filename.toLowerCase();
  return !dangerousExtensions.some(ext => lower.endsWith(ext));
}

/**
 * Validate and sanitize preview/download URL
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Prevent dangerous protocol execution
  if (
    trimmed.toLowerCase().startsWith('javascript:') || 
    trimmed.toLowerCase().startsWith('vbscript:') || 
    trimmed.toLowerCase().startsWith('data:text/html')
  ) {
    return '';
  }
  
  return trimmed;
}

/**
 * Sanitize user input tag
 */
export function sanitizeTag(tag) {
  if (!tag) return '';
  return tag.trim().replace(/[^\w\s\-]/gi, '').slice(0, 30);
}
