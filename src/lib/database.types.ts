export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: number;
          slug: string;
          title: string;
          description: string | null;
          location: string | null;
          date_start: string | null;
          date_end: string | null;
          price_clp: number | null;
          price_usd: number | null;
          cover_url: string | null;
          status: 'draft' | 'published' | 'archived' | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          description?: string | null;
          location?: string | null;
          date_start?: string | null;
          date_end?: string | null;
          price_clp?: number | null;
          price_usd?: number | null;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: number;
          slug: string;
          title: string;
          cover_url: string | null;
          published_at: string | null;
          status: 'draft' | 'published' | 'archived' | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          cover_url?: string | null;
          published_at?: string | null;
          status?: 'draft' | 'published' | 'archived' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: number;
          course_id: number;
          full_name: string;
          email: string;
          method: 'webpay' | 'transfer' | 'cash';
          payment_currency: 'CLP' | 'USD';
          payment_status: string;
          payment_amount: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          course_id: number;
          full_name: string;
          email: string;
          method: 'webpay' | 'transfer' | 'cash';
          payment_currency: 'CLP' | 'USD';
          payment_status?: string;
          payment_amount?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'gestor' | 'faculty' | 'student' | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'gestor' | 'faculty' | 'student' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type PostRow = Database['public']['Tables']['posts']['Row'];
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
