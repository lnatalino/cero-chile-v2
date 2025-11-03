import { createClient } from '@supabase/supabase-js';

const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
const DEFAULT_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax',
  secure: isProduction
};

function createCookieStorage(adapter) {
  if (!adapter) return undefined;

  return {
    getItem(name) {
      try {
        const value = adapter.get?.(name);
        return value ?? null;
      } catch (error) {
        console.warn('Supabase SSR cookie get failed:', error);
        return null;
      }
    },
    setItem(name, value) {
      try {
        adapter.set?.(name, value, { ...DEFAULT_COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 365 });
      } catch (error) {
        console.warn('Supabase SSR cookie set failed:', error);
      }
    },
    removeItem(name) {
      try {
        adapter.remove?.(name, { ...DEFAULT_COOKIE_OPTIONS, maxAge: 0 });
      } catch (error) {
        console.warn('Supabase SSR cookie remove failed:', error);
      }
    }
  };
}

export function createServerClient(supabaseUrl, supabaseKey, options = {}) {
  const { cookies, auth, global, ...rest } = options;
  const storage = createCookieStorage(cookies);

  return createClient(supabaseUrl, supabaseKey, {
    ...rest,
    global,
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...(auth ?? {}),
      storage: storage ?? auth?.storage
    }
  });
}

export function createBrowserClient(supabaseUrl, supabaseKey, options) {
  return createClient(supabaseUrl, supabaseKey, options);
}
