export interface SupabaseError {
  message: string;
  status: number;
}

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  data: { user: AuthUser | null };
  error: SupabaseError | null;
}

export interface PostgrestResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface PostgrestQueryBuilder<T> {
  select(columns?: string): PostgrestQueryBuilder<T>;
  eq(column: string, value: unknown): PostgrestQueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): PostgrestQueryBuilder<T>;
  limit(value: number): PostgrestQueryBuilder<T>;
  maybeSingle(): Promise<PostgrestResponse<T | null>>;
  single(): Promise<PostgrestResponse<T | null>>;
  insert(values: T | T[] | Partial<T> | Partial<T>[]): Promise<PostgrestResponse<T[] | null>>;
  update(values: Partial<T>): Promise<PostgrestResponse<T[] | null>>;
  delete(): Promise<PostgrestResponse<T[] | null>>;
  then<TResult1 = PostgrestResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface SupabaseClientOptions {
  global?: {
    headers?: Record<string, string>;
  };
  auth?: {
    storage?: {
      getItem?: (name: string) => string | null | Promise<string | null>;
      setItem?: (name: string, value: string) => void | Promise<void>;
      removeItem?: (name: string) => void | Promise<void>;
    };
  };
}

export interface SupabaseClient {
  auth: {
    getUser(): Promise<AuthResponse>;
  };
  from<T = Record<string, unknown>>(table: string): PostgrestQueryBuilder<T>;
}

export declare function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions
): SupabaseClient;
