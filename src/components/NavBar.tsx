import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';

export default async function NavBar() {
  const s = getSupabaseServerClient();
  const {
    data: { user }
  } = await s.auth.getUser();

  let role: 'admin' | 'faculty' | 'student' | null = null;
  if (user) {
    const { data } = await s.from('profiles').select('role').eq('id', user.id).maybeSingle();
    role = (data?.role ?? null) as any;
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur">
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
