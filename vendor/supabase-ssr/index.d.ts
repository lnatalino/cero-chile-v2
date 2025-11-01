export interface SupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: { id: string; email: string; user_metadata?: Record<string, unknown> } | null }; error: Error | null }>;
  };
  from<T extends keyof DatabaseTables>(table: T): SupabaseQueryBuilder<DatabaseTables[T]>;
}

export interface DatabaseTables {
  profiles: ProfileRow;
  courses: CourseRow;
  posts: PostRow;
  enrollments: EnrollmentRow;
}

export interface ProfileRow {
  id: string;
  email: string;
  role: string;
  full_name?: string | null;
}

export interface CourseRow {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  location?: string | null;
  date_start: string | null;
  date_end: string | null;
  price_clp: number | null;
  price_usd: number | null;
  cover_url?: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
}

export interface PostRow {
  id: number;
  slug: string;
  title: string;
  cover_url?: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
}

export interface EnrollmentRow {
  id: number;
  course_id: number;
  full_name: string;
  email: string;
  method: 'webpay' | 'transfer' | 'cash';
  payment_currency: 'CLP' | 'USD';
  payment_status: string;
  payment_amount?: number | null;
  created_at?: string | null;
}

export interface SupabaseQueryBuilder<Row> {
  select(columns?: string): SupabaseQueryBuilder<Row>;
  eq(column: keyof Row, value: Row[keyof Row]): SupabaseQueryBuilder<Row>;
  order(column: keyof Row, options?: { ascending?: boolean }): SupabaseQueryBuilder<Row>;
  limit(count: number): SupabaseQueryBuilder<Row>;
  range(from: number, to: number): SupabaseQueryBuilder<Row>;
  maybeSingle(): Promise<{ data: Row | null; error: Error | null }>;
  single(): Promise<{ data: Row | null; error: Error | null }>;
  insert(payload: Partial<Row> | Partial<Row>[]): Promise<{ data: Partial<Row>[]; error: Error | null }>;
  then<TResult1 = { data: Row[]; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: Row[]; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export function createServerClient(url: string, key: string, options?: { cookies?: {
  get?(name: string): Promise<string | undefined> | string | undefined;
  set?(name: string, value: string, options?: Record<string, unknown>): Promise<void> | void;
  remove?(name: string): Promise<void> | void;
} }): SupabaseClient;

export function createBrowserClient(url: string, key: string): SupabaseClient;
