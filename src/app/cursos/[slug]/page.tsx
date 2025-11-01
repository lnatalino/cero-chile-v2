import { notFound } from 'next/navigation';
import getSupabaseServerClient from '@/lib/supabaseServer';

interface CourseDetail {
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
}

function formatCurrency(value: number | null, currency: 'CLP' | 'USD') {
  if (value == null) return 'Por confirmar';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(value);
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await getSupabaseServerClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const typedCourse = course as CourseDetail;

  return (
    <section className="space-y-8">
      <article className="space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">Curso</span>
          <h1 className="text-3xl font-semibold text-gray-900">{typedCourse.title}</h1>
          <p className="text-sm text-gray-600">{typedCourse.location ?? 'Ubicación por confirmar'}</p>
        </div>
        {typedCourse.cover_url && (
          <img src={typedCourse.cover_url} alt={typedCourse.title} className="w-full rounded-3xl border border-gray-200 object-cover" />
        )}
        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-gray-800">Fecha de inicio</dt>
            <dd className="text-sm text-gray-600">
              {typedCourse.date_start ? new Date(typedCourse.date_start).toLocaleDateString('es-CL') : 'Por confirmar'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-800">Fecha de término</dt>
            <dd className="text-sm text-gray-600">
              {typedCourse.date_end ? new Date(typedCourse.date_end).toLocaleDateString('es-CL') : 'Por confirmar'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-800">Valor CLP</dt>
            <dd className="text-sm text-gray-600">{formatCurrency(typedCourse.price_clp, 'CLP')}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-800">Valor USD</dt>
            <dd className="text-sm text-gray-600">{formatCurrency(typedCourse.price_usd, 'USD')}</dd>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-gray-700">{typedCourse.description ?? 'Descripción en preparación.'}</p>
      </article>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inscríbete</h2>
          <p className="text-sm text-gray-600">
            Completa el formulario para reservar tu cupo. Nos contactaremos contigo para confirmar tu inscripción.
          </p>
        </div>
        <form action="/api/enroll" method="post" className="grid gap-4">
          <input type="hidden" name="course_id" value={typedCourse.id} />
          <div className="grid gap-1">
            <label htmlFor="full_name" className="text-sm font-medium text-gray-800">
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              placeholder="Nombre y apellido"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-800">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@correo.cl"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="method" className="text-sm font-medium text-gray-800">
              Método de pago preferido
            </label>
            <select
              id="method"
              name="method"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="webpay">Webpay</option>
              <option value="transfer">Transferencia</option>
              <option value="cash">Efectivo</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700"
          >
            Enviar inscripción
          </button>
        </form>
      </section>
    </section>
  );
}
