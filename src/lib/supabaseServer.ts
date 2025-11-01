import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://stub.supabase.local';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'stub-key';

export default async function getSupabaseServerClient() {
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
