#!/usr/bin/env bash
set -e

# 1) Next + TS si el repo está vacío (README-only)
if [ ! -f package.json ]; then
  npm create next-app@latest . -- --typescript --eslint --import-alias "@/*"
fi

# 2) Dependencias
npm i @supabase/ssr
npm i -D tailwindcss postcss autoprefixer json

# 3) Tailwind scaffold
npx tailwindcss init -p

# 4) Ajustar tailwind.config.js
cat > tailwind.config.js <<'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
EOF

# 5) Estructura y CSS global
mkdir -p src/app src/components src/lib src/app/login src/app/logout src/app/cursos src/app/cursos/[slug] src/app/galeria src/app/sobre src/app/contacto db
cat > src/app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 6) Scripts package.json (puerto 3004)
npx json -I -f package.json -e 'this.scripts.dev="next dev -p 3004"; this.scripts.start="next start -p 3004"'

# 7) .env.example
cat > .env.example <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF

# 8) Código base (libs, layout, navbar, páginas)
cat > src/lib/supabaseServer.ts <<'EOF'
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function getSupabaseServerClient() {
  return createServerClient(url, key, {
    cookies: {
      get: async (name: string) => (await cookies()).get(name)?.value,
      set: async (name: string, value: string, options?: any) => { (await cookies()).set({ name, value, ...options }); },
      remove: async (name: string, options?: any) => { (await cookies()).delete({ name, ...options }); },
    },
  });
}
EOF

cat > src/lib/supabaseBrowser.ts <<'EOF'
'use client';
import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function getSupabaseBrowserClient() {
  return createBrowserClient(url, key);
}
EOF

cat > src/components/NavBar.tsx <<'EOF'
import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';

export default async function NavBar() {
  const s = getSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();

  let role: 'admin'|'faculty'|'student'|null = null;
  if (user) {
    const { data: p } = await s.from('profiles').select('role').eq('id', user.id).maybeSingle();
    role = (p?.role ?? null) as any;
  }

  return (
    <header className="border-b">
      <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">CERO-CHILE</Link>
        <ul className="flex gap-4 text-sm">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/cursos">Cursos</Link></li>
          <li><Link href="/galeria">Galería</Link></li>
          <li><Link href="/sobre">Sobre</Link></li>
          <li><Link href="/contacto">Contacto</Link></li>
          {user ? (
            <>
              {role === 'admin' && <li><Link href="/admin">Admin</Link></li>}
              {role === 'faculty' && <li><Link href="/mis-cursos">Mis cursos</Link></li>}
              <li className="opacity-70">{user.email}</li>
              <li><Link href="/logout">Salir</Link></li>
            </>
          ) : (
            <li><Link href="/login">Ingresar</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}
EOF

cat > src/app/layout.tsx <<'EOF'
import './globals.css';
import NavBar from '@/components/NavBar';
export const metadata = { title: 'CERO Chile' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
EOF

cat > src/app/page.tsx <<'EOF'
import getSupabaseServerClient from '@/lib/supabaseServer';
import Link from 'next/link';

function PostsCarousel({ posts }: { posts: any[] }) {
  if (!posts?.length) return <p className="text-sm text-gray-500">No hay novedades publicadas.</p>;
  return (
    <div className="overflow-x-auto">
      <ul className="flex gap-4">
        {posts.map(p => (
          <li key={p.id} className="min-w-[260px] border rounded p-3">
            <div className="font-semibold">{p.title}</div>
            <div className="text-xs text-gray-500">{new Date(p.published_at).toLocaleString()}</div>
            {p.cover_url && <img src={p.cover_url} className="mt-2 rounded" alt={p.title} />}
            <div className="mt-2"><Link className="text-blue-600 text-sm" href={`/novedades/${p.slug}`}>Ver</Link></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Home() {
  const s = getSupabaseServerClient();
  const { data: posts = [] } = await s.from('posts')
    .select('id, slug, title, cover_url, published_at, status')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Novedades</h2>
      <PostsCarousel posts={posts} />
      <Link href="/novedades" className="text-blue-600 text-sm">Ver todas →</Link>
    </section>
  );
}
EOF

cat > src/app/login/page.tsx <<'EOF'
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const supa = getSupabaseBrowserClient();
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    const { error } = await supa.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace(redirect);
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold mb-3">Ingresar</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="block text-sm">Email</label>
          <input className="border rounded px-2 py-1 w-full" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div><label className="block text-sm">Contraseña</label>
          <input className="border rounded px-2 py-1 w-full" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={loading} className="bg-black text-white rounded px-3 py-1 text-sm">{loading?'Ingresando...':'Ingresar'}</button>
      </form>
    </div>
  );
}
EOF

cat > src/app/logout/page.tsx <<'EOF'
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getSupabaseBrowserClient from '@/lib/supabaseBrowser';

export default function LogoutPage() {
  const supa = getSupabaseBrowserClient();
  const router = useRouter();
  useEffect(() => { (async () => { await supa.auth.signOut(); router.replace('/'); })(); }, [router, supa]);
  return <p className="text-sm text-gray-600">Cerrando sesión...</p>;
}
EOF

cat > src/app/cursos/page.tsx <<'EOF'
import getSupabaseServerClient from '@/lib/supabaseServer';
import Link from 'next/link';

export default async function CursosList() {
  const s = getSupabaseServerClient();
  const { data: courses = [] } = await s.from('courses')
    .select('id, title, slug, date_start, status')
    .eq('status','published')
    .order('date_start', { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cursos</h1>
      <ul className="space-y-2">
        {courses.map((c:any)=>(
          <li key={c.id} className="border-b pb-2">
            <Link href={`/cursos/${c.slug}`} className="text-blue-600">{c.title}</Link>
            <div className="text-xs text-gray-500">{c.date_start? new Date(c.date_start).toLocaleDateString('es-CL'):''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

cat > src/app/cursos/[slug]/page.tsx <<'EOF'
import getSupabaseServerClient from '@/lib/supabaseServer';

export default async function CursoDetalle({ params }: { params: { slug: string } }) {
  const s = getSupabaseServerClient();
  const { data: course } = await s.from('courses')
    .select('id, title, description, location, date_start, date_end, price_clp, price_usd, slug')
    .eq('slug', params.slug).maybeSingle();

  if (!course) return <p>Curso no encontrado.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-gray-700">{course.description}</p>
        <div className="text-sm mt-2">
          <div><b>Lugar:</b> {course.location}</div>
          <div><b>Fecha:</b> {course.date_start ? new Date(course.date_start).toLocaleDateString('es-CL') : ''}{course.date_end ? ` – ${new Date(course.date_end).toLocaleDateString('es-CL')}`:''}</div>
          <div><b>CLP:</b> {Number(course.price_clp ?? 0).toLocaleString('es-CL')}</div>
          <div><b>USD:</b> {Number(course.price_usd ?? 0).toLocaleString('en-US')}</div>
        </div>
      </div>

      <form action="/api/enroll" method="post" className="space-y-3 border rounded p-4">
        <input type="hidden" name="course_id" value={course.id} />
        <div>
          <label className="block text-sm">Nombre completo</label>
          <input name="full_name" required className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" required className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Moneda</label>
          <select name="payment_currency" className="border rounded px-2 py-1 w-full">
            <option value="CLP">CLP</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Método de pago</label>
          <select name="method" className="border rounded px-2 py-1 w-full">
            <option value="webpay">Webpay (CLP)</option>
            <option value="transfer">Transferencia</option>
            <option value="cash">Efectivo el día del curso</option>
          </select>
        </div>
        <button className="bg-black text-white text-sm rounded px-3 py-1">Inscribirme</button>
      </form>
    </div>
  );
}
EOF

cat > src/app/galeria/page.tsx <<'EOF'
import getSupabaseServerClient from '@/lib/supabaseServer';
import Link from 'next/link';

export default async function GaleriaIndex() {
  const s = getSupabaseServerClient();
  const { data: courses = [] } = await s.from('courses')
    .select('id, slug, title, cover_url, date_start, status')
    .eq('status', 'published')
    .order('date_start', { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Galería</h1>
      <ul className="space-y-2">
        {courses.map((c:any)=>(
          <li key={c.id} className="border-b pb-2">
            <Link href={`/galeria/${c.slug}`} className="text-blue-600">{c.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

cat > src/app/sobre/page.tsx <<'EOF'
export default function Page() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Sobre nosotros</h1>
      <p className="text-sm text-gray-700">
        Formación práctica en reconstrucción de tobillo y pie para equipos clínicos de Chile y LATAM.
      </p>
    </div>
  );
}
EOF

cat > src/app/contacto/page.tsx <<'EOF'
export default function Page() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Contacto</h1>
      <p className="text-sm text-gray-700">contacto@cero-chile.cl — Santiago, Chile</p>
    </div>
  );
}
EOF

# 9) SQL de esquema
cat > db/schema.sql <<'EOF'
-- Perfiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin','faculty','student')) default 'student',
  phone text,
  workplace text,
  instagram text,
  linkedin text,
  extra_links jsonb default '[]'::jsonb
);

-- Cursos
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

-- Relación curso-faculty
create table if not exists course_faculty (
  id bigserial primary key,
  course_id bigint references courses(id) on delete cascade,
  faculty_id uuid references profiles(id) on delete cascade
);

-- Novedades
create table if not exists posts (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  cover_url text,
  body text,
  status text check (status in ('draft','published')) default 'draft',
  published_at timestamptz
);

-- Inscripciones
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

-- Galería (fase 2)
create table if not exists gallery_images (
  id bigserial primary key,
  course_id bigint references courses(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- Certificados (fase 2)
create table if not exists certificates (
  id bigserial primary key,
  course_id bigint references courses(id) on delete cascade,
  user_email text not null,
  person_id text not null, -- RUT/pasaporte
  code text unique not null, -- código verificación
  file_url text not null,
  issued_at timestamptz default now()
);

-- RLS básico
alter table profiles enable row level security;
alter table courses enable row level security;
alter table posts enable row level security;
alter table enrollments enable row level security;
alter table course_faculty enable row level security;
alter table gallery_images enable row level security;
alter table certificates enable row level security;

-- Políticas mínimas
do $$
begin
  if not exists (select 1 from pg_policies where tablename='courses' and policyname='courses_select_all') then
    create policy courses_select_all on courses for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='posts' and policyname='posts_select_all') then
    create policy posts_select_all on posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_select_all') then
    create policy profiles_select_all on profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='enrollments' and policyname='enrollments_insert') then
    create policy enrollments_insert on enrollments for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='enrollments' and policyname='enrollments_select') then
    create policy enrollments_select on enrollments for select using (true);
  end if;
end $$;
EOF

echo "✅ Scaffold listo. Ahora commitea y empuja."
