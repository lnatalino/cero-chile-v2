import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://stub.supabase.local';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'stub-key';

export default function getSupabaseServerClient() {
  const cookieStore = cookies();
  const mutableCookies = cookieStore as unknown as {
    set: (options: { name: string; value: string } & Partial<CookieOptions>) => void;
    delete: (options: { name: string } & Partial<CookieOptions>) => void;
  };

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          mutableCookies.set({ name, value, ...(options ?? {}) });
        } catch (error) {
          console.warn('Supabase cookie set warning:', error);
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          mutableCookies.delete({ name, ...(options ?? {}) });
        } catch (error) {
          console.warn('Supabase cookie remove warning:', error);
        }
      },
    },
  });
}
