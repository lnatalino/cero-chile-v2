import type { CourseRow, PostRow, ProfileRow } from './database.types';

export type Post = Pick<PostRow, 'id' | 'slug' | 'title' | 'cover_url' | 'published_at' | 'status'>;

export type Course = Pick<
  CourseRow,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'location'
  | 'date_start'
  | 'date_end'
  | 'price_clp'
  | 'price_usd'
  | 'cover_url'
  | 'status'
>;

export type AdminRole = Extract<ProfileRow['role'], 'admin' | 'gestor' | 'faculty'>;

export type PaymentMethod = 'webpay' | 'transfer' | 'cash';

export type PaymentCurrency = 'CLP' | 'USD';
