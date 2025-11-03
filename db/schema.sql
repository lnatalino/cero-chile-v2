-- Esquema de referencia para Supabase
create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin','gestor','faculty','student')) default 'student'
);

create table if not exists courses (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  description text,
  location text,
  date_start date,
  date_end date,
  price_clp numeric,
  price_usd numeric,
  cover_url text,
  status text check (status in ('draft','published')) default 'draft',
  published_at timestamptz
);

create table if not exists posts (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  cover_url text,
  status text check (status in ('draft','published')) default 'draft',
  published_at timestamptz
);

create table if not exists enrollments (
  id bigserial primary key,
  course_id bigint references courses(id) on delete cascade,
  full_name text not null,
  email text not null,
  method text check (method in ('webpay','transfer','cash')) not null,
  payment_currency text check (payment_currency in ('CLP','USD')) default 'CLP',
  payment_status text default 'pending',
  payment_amount numeric,
  created_at timestamptz default now()
);
