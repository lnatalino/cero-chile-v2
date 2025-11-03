import Link from 'next/link';
import { redirect } from 'next/navigation';
import getSupabaseServerClient from '@/lib/supabaseServer';
import type { AdminRole } from '@/lib/types';

const ADMIN_ROLES = new Set<AdminRole>(['admin', 'gestor', 'faculty']);

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();
  const role = profile?.role as AdminRole | undefined;

  if (!role || !ADMIN_ROLES.has(role)) {
    redirect('/');
  }

  const tabs = [
    { key: 'courses', label: 'Cursos', description: 'Gestiona programas y calendario académico.' },
    { key: 'enrollments', label: 'Inscritos', description: 'Revisa postulaciones y estados de pago.' },
    { key: 'gallery', label: 'Galería', description: 'Organiza material audiovisual para difundir.' },
  ];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Panel administrativo</p>
        <h1 className="text-3xl font-semibold text-gray-900">Bienvenido, {profile?.full_name ?? user.email}</h1>
        <p className="text-sm text-gray-600">Rol asignado: {role}</p>
      </header>
      <nav className="grid gap-4 md:grid-cols-3">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200"
          >
            <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
            <p className="mt-2 text-sm text-gray-600">{tab.description}</p>
            <Link
              href={`/admin/${tab.key}`}
              className="mt-4 inline-flex text-sm font-semibold text-orange-600 transition hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Abrir sección
            </Link>
          </div>
        ))}
      </nav>
    </section>
  );
}
