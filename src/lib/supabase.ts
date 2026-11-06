import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'baseball_watch_log_supabase_url';
const SUPABASE_PUBLISHABLE_KEY = 'baseball_watch_log_supabase_publishable_key';
const LEGACY_CONFIG_KEY = 'baseball_watch_log_supabase_config';

export interface SupabaseConnection {
  client: SupabaseClient;
  url: string;
  publishableKey: string;
}

export const getSupabaseConnection = (): SupabaseConnection | null => {
  let legacyUrl = '';
  let legacyKey = '';
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_CONFIG_KEY) || '{}') as { url?: string; anonKey?: string };
    legacyUrl = legacy.url || '';
    legacyKey = legacy.anonKey || '';
  } catch {
    // Ignore malformed legacy settings; the login screen can collect them again.
  }
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem(SUPABASE_URL_KEY) || legacyUrl;
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem(SUPABASE_PUBLISHABLE_KEY) ||
    legacyKey;

  if (!url || !publishableKey) return null;
  if (publishableKey.includes('service_role') || publishableKey.startsWith('sb_secret_')) return null;

  return {
    client: createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
    url,
    publishableKey,
  };
};

export const saveSupabaseConnection = (url: string, publishableKey: string) => {
  if (publishableKey.includes('service_role') || publishableKey.startsWith('sb_secret_')) {
    throw new Error('service_role keyやsecret keyはブラウザ設定に保存できません。Publishable Keyを使用してください。');
  }
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_PUBLISHABLE_KEY, publishableKey.trim());
};
