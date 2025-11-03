import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://stub.supabase.local';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'stub-key';

export default async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => cookieStore.get(name)?.value,
      set: async (name: string, value: string) => {
        try {
          cookieStore.set({ name, value });
        } catch (error) {
          console.warn('Supabase cookie set warning:', error);
        }
      },
      remove: async (name: string) => {
        try {
          cookieStore.delete({ name });
        } catch (error) {
          console.warn('Supabase cookie remove warning:', error);
        }
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => store.get(name)?.value,
      set: async (name: string, value: string, _options?: Record<string, unknown>) => {
        store.set({ name, value });
      },
      remove: async (name: string) => {
        store.delete({ name });
      },
    },
  });
}
