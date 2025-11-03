import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

export type CookieSameSite = 'lax' | 'strict' | 'none';

export interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: CookieSameSite;
  secure?: boolean;
}

export interface CookieAdapter {
  get?: (name: string) => string | undefined | null | Promise<string | undefined | null>;
  set?: (name: string, value: string, options?: CookieOptions) => void | Promise<void>;
  remove?: (name: string, options?: CookieOptions) => void | Promise<void>;
}

export interface ServerClientOptions<Database = any, SchemaName extends string = 'public'>
  extends SupabaseClientOptions<Database, SchemaName> {
  cookies?: CookieAdapter;
}

export declare function createServerClient<
  Database = any,
  SchemaName extends string = 'public'
>(
  supabaseUrl: string,
  supabaseKey: string,
  options?: ServerClientOptions<Database, SchemaName>
): SupabaseClient<Database, SchemaName>;

export declare function createBrowserClient<
  Database = any,
  SchemaName extends string = 'public'
>(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<Database, SchemaName>
): SupabaseClient<Database, SchemaName>;
