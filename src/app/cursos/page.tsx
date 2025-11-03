import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';
import type { Course } from '@/lib/types';

export type CourseRow = {
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
  status: 'draft' | 'published';
};

function formatCurrency(value: number | null, currency: 'CLP' | 'USD'): string {
  if (value == null) return 'Por confirmar';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return 'Por confirmar';
  return new Date(value).toLocaleDateString('es-CL');
}

export default async function CoursesPage() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('courses')
    .select('id, slug, title, description, location, date_start, date_end, price_clp, price_usd, cover_url, status')
    .eq('status', 'published')
    .order('date_start', { ascending: true });

  const courses: Course[] = (data ?? []).map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description ?? null,
    location: course.location ?? null,
    date_start: course.date_start,
    date_end: course.date_end,
    price_clp: course.price_clp ?? null,
    price_usd: course.price_usd ?? null,
    cover_url: course.cover_url ?? null,
    status: course.status,
  }));
    .select('*')
    .eq('status', 'published')
    .order('date_start', { ascending: true });

  const courses: CourseRow[] = Array.isArray(data) ? (data as CourseRow[]) : [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Cursos disponibles</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Explora las experiencias formativas con foco en terreno, investigación aplicada y acompañamiento docente especializado.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {courses.map((course) => (
          <article
            key={course.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="aspect-[16/9] bg-gray-100">
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Imagen en preparación</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                <p className="text-sm text-gray-500">{course.location ?? 'Ubicación por definir'}</p>
              </div>
              <p className="flex-1 text-sm text-gray-600">{course.description ?? 'Descripción en preparación.'}</p>
              <dl className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <dt className="font-semibold text-gray-800">Fecha de inicio</dt>
                  <dd>{formatDate(course.date_start)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">Fecha de cierre</dt>
                  <dd>{course.date_end ? formatDate(course.date_end) : 'Por confirmar'}</dd>
                  <dd>{course.date_start ? new Date(course.date_start).toLocaleDateString('es-CL') : 'Por confirmar'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">Fecha de cierre</dt>
                  <dd>{course.date_end ? new Date(course.date_end).toLocaleDateString('es-CL') : 'Por confirmar'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">Valor CLP</dt>
                  <dd>{formatCurrency(course.price_clp, 'CLP')}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">Valor USD</dt>
                  <dd>{formatCurrency(course.price_usd, 'USD')}</dd>
                </div>
              </dl>
              <div className="flex justify-end">
                <Link
                  href={`/cursos/${course.slug}`}
                  className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                <Link href={`/cursos/${course.slug}`} className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white">
                  Ver detalles
                </Link>
              </div>
            </div>
          </article>
        ))}
        {courses.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            Estamos preparando nuevos programas. Suscríbete para recibir noticias.
          </p>
        )}
      </div>
    </section>
  );
}
