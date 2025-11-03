import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';
import type { AdminRole } from '@/lib/types';

const NAV_LINK_CLASSES =
  'rounded-full px-3 py-1 text-sm font-medium transition-colors hover:bg-orange-100 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/galeria', label: 'Galería' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contacto', label: 'Contacto' },
];

export default async function NavBar() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  let role: AdminRole | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const candidate = profile?.role ?? null;
    if (candidate === 'admin' || candidate === 'gestor' || candidate === 'faculty') {
      role = candidate;
    }
  }

  return (
    <header className="border-b border-orange-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-orange-700">
          CERO Chile
        </Link>
        <ul className="flex list-none items-center gap-3 text-sm font-medium text-gray-700">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={NAV_LINK_CLASSES}>
                {item.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              {role && (
                <li>
                  <Link href="/admin" className={NAV_LINK_CLASSES}>
                    Admin
                  </Link>
                </li>
              )}
              <li className="hidden text-xs font-normal text-gray-500 sm:block">{user.email}</li>
              <li>
                <Link href="/logout" className={NAV_LINK_CLASSES}>
                  Salir
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className={NAV_LINK_CLASSES}>
                Ingresar
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
