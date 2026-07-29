/**
 * Security utilities for Nemo Cloud File Storage
 */
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';

// Constant Salt for hashing passcodes locally & in cloud
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
 * Fetches from Supabase DB `nemo_config` table if connected, with fallback to localStorage.
 * Defaults to the SHA-256 hash of "nemo" if not initialized.
 */
export async function getStoredPasscodeHash() {
  const defaultHash = await hashString('nemo');

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const queryPromise = supabase
          .from('nemo_config')
          .select('value')
          .eq('key', 'master_passcode_hash')
          .maybeSingle();

        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2500)
        );

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (!error && data && data.value) {
          localStorage.setItem(HASH_STORAGE_KEY, data.value);
          return data.value;
        }
      } catch (err) {
        console.warn('Supabase config fetch fallback:', err);
      }
    }
  }

  // Check legacy plaintext password first if present
  const legacyPass = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyPass) {
    const legacyHash = await hashString(legacyPass);
    localStorage.setItem(HASH_STORAGE_KEY, legacyHash);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return legacyHash;
  }

  // Fallback to local storage or default "nemo" hash
  let storedHash = localStorage.getItem(HASH_STORAGE_KEY);
  if (!storedHash) {
    storedHash = defaultHash;
    localStorage.setItem(HASH_STORAGE_KEY, storedHash);
  }

  return storedHash;
}

/**
 * Check if a custom passcode has been configured (different from default 'nemo')
 */
export async function hasCustomPasscode() {
  const defaultHash = await hashString('nemo');
  const storedHash = await getStoredPasscodeHash();
  return Boolean(storedHash && storedHash !== defaultHash);
}

/**
 * Verify input passcode against stored hash (Supabase DB or local).
 * Retains 'admin' and 'nemo2026' master admin passcodes.
 */
export async function verifyPasscode(inputPassword) {
  if (!inputPassword) return false;
  const cleanInput = inputPassword.trim();
  const inputHash = await hashString(cleanInput);
  
  // 1. Direct check against stored hash (custom password set in Settings)
  const storedHash = await getStoredPasscodeHash();
  if (inputHash === storedHash) {
    return true;
  }

  // 2. Retain admin master passcodes ("admin", "nemo2026")
  if (cleanInput === 'admin' || cleanInput === 'nemo2026') {
    return true;
  }

  // 3. Allow "nemo" if default password is still active
  const isCustomSet = await hasCustomPasscode();
  if (cleanInput === 'nemo' && !isCustomSet) {
    return true;
  }

  return false;
}

/**
 * Update the access passcode (stores as SHA-256 hash in both Supabase DB & localStorage)
 */
export async function updatePasscode(newPassword) {
  if (!newPassword || !newPassword.trim()) return false;
  const cleanPass = newPassword.trim();
  const newHash = await hashString(cleanPass);

  // 1. Update localStorage
  localStorage.setItem(HASH_STORAGE_KEY, newHash);
  localStorage.removeItem(LEGACY_STORAGE_KEY);

  // 2. Sync to Supabase Database nemo_config table
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('nemo_config').upsert({
          key: 'master_passcode_hash',
          value: newHash,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Failed to sync updated passcode to Supabase DB:', err);
      }
    }
  }

  return true;
}

/**
 * Sanitize filename to prevent path traversal and dangerous characters
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'unnamed_file';
  let cleanName = filename.replace(/\\/g, '/').split('/').pop();
  cleanName = cleanName.replace(/[^\w\s\.\-\(\)\[\]]/gi, '_');
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
