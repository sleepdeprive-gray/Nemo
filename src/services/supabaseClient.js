import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'nemo_supabase_url';
const STORAGE_KEY_KEY = 'nemo_supabase_key';
const BUCKET_NAME = 'nemo-files';

export const getStoredCredentials = () => {
  const url = localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key, bucketName: BUCKET_NAME };
};

export const saveCredentials = (url, key) => {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);
  
  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);
};

export const isSupabaseConfigured = () => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http'));
};

let supabaseInstance = null;

export const getSupabase = () => {
  const { url, key } = getStoredCredentials();
  if (!url || !key) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};
