import { notFound } from 'next/navigation';
import getSupabaseServerClient from '@/lib/supabaseServer';
import type { Course, PaymentCurrency, PaymentMethod } from '@/lib/types';

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

function formatDate(value: string | null) {
  if (!value) return 'Por confirmar';
  return new Date(value).toLocaleDateString('es-CL');
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await getSupabaseServerClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title, description, location, date_start, date_end, price_clp, price_usd, cover_url, status')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!course || course.status !== 'published') {
    notFound();
  }

  const typedCourse: Course = {
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
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'webpay', label: 'Webpay' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'cash', label: 'Efectivo' },
  ];

  const currencies: { value: PaymentCurrency; label: string }[] = [
    { value: 'CLP', label: 'Peso chileno (CLP)' },
    { value: 'USD', label: 'Dólar estadounidense (USD)' },
  ];
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
            <dd className="text-sm text-gray-600">{formatDate(typedCourse.date_start)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-800">Fecha de término</dt>
            <dd className="text-sm text-gray-600">{typedCourse.date_end ? formatDate(typedCourse.date_end) : 'Por confirmar'}</dd>
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
              {paymentMethods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="payment_currency" className="text-sm font-medium text-gray-800">
              Moneda de pago
            </label>
            <select
              id="payment_currency"
              name="payment_currency"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none"
            >
              {currencies.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
            <button
              type="submit"
              className="mt-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
