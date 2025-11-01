import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';

async function resolveRole(userId: string | null) {
  if (!userId) return null;
  const client = await getSupabaseServerClient();
  const { data } = await client.from('profiles').eq('id', userId).maybeSingle();
  return (data?.role as 'admin' | 'gestor' | 'faculty' | 'student' | null) ?? null;
}

export default async function NavBar() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  const role = await resolveRole(user?.id ?? null);

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CERO Chile
        </Link>
        <ul className="flex list-none items-center gap-5 text-sm font-medium">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/cursos">Cursos</Link></li>
          <li><Link href="/galeria">Galería</Link></li>
          <li><Link href="/sobre">Sobre</Link></li>
          <li><Link href="/contacto">Contacto</Link></li>
          {user ? (
            <>
              {(role === 'admin' || role === 'gestor' || role === 'faculty') && (
                <li><Link href="/admin">Admin</Link></li>
              )}
              <li className="text-xs font-normal text-gray-500">{user.email}</li>
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
