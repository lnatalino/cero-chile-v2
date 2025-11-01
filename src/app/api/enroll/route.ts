import { NextResponse } from 'next/server';
import getSupabaseServerClient from '@/lib/supabaseServer';

const PAYMENT_METHODS = new Set(['webpay', 'transfer', 'cash'] as const);

type PaymentMethod = 'webpay' | 'transfer' | 'cash';

interface EnrollPayload {
  course_id: number;
  full_name: string;
  email: string;
  method: PaymentMethod;
}

function parseFormData(formData: URLSearchParams | FormData): Partial<EnrollPayload> {
  const get = (name: string) => (formData instanceof URLSearchParams ? formData.get(name) : formData.get(name)?.toString());
  const courseIdRaw = get('course_id');
  return {
    course_id: courseIdRaw ? Number(courseIdRaw) : undefined,
    full_name: get('full_name') ?? undefined,
    email: get('email') ?? undefined,
    method: (get('method') as PaymentMethod | undefined) ?? undefined,
  };
}

async function readPayload(request: Request): Promise<Partial<EnrollPayload>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = (await request.json()) as Partial<EnrollPayload>;
    return json;
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await request.text();
    return parseFormData(new URLSearchParams(body));
  }
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    return parseFormData(form);
  }
  return {};
}

function validate(payload: Partial<EnrollPayload>): payload is EnrollPayload {
  if (!payload.course_id || Number.isNaN(payload.course_id) || payload.course_id <= 0) {
    return false;
  }
  if (!payload.full_name || payload.full_name.trim().length < 3) {
    return false;
  }
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return false;
  }
  if (!payload.method || !PAYMENT_METHODS.has(payload.method)) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const payload = await readPayload(request);

  if (!validate(payload)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', payload.course_id)
    .maybeSingle();

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
  }

  await supabase.from('enrollments').insert({
    course_id: payload.course_id,
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    method: payload.method,
    payment_status: 'pending',
    payment_currency: 'CLP',
  });

  if (payload.method === 'webpay') {
    return NextResponse.redirect('https://www.transbank.cl/webpay-placeholder', 302);
  }

  const instructions =
    payload.method === 'transfer'
      ? 'Recibirás un correo con los datos bancarios para transferir.'
      : 'Nuestro equipo te contactará para coordinar el pago en efectivo el día del curso.';

  return NextResponse.json({
    status: 'pending',
    course: { id: course.id, title: course.title },
    message: instructions,
  });
}
