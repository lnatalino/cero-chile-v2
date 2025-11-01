import Link from 'next/link';
import getSupabaseServerClient from '@/lib/supabaseServer';

export type Post = {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  published_at: string | null;
  status: 'draft' | 'published';
};

export type Course = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  cover_url: string | null;
  date_start: string | null;
  date_end: string | null;
  status: 'draft' | 'published';
};

function PostsCarousel({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.slug}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="aspect-[16/9] bg-gray-100" aria-hidden>
            {post.cover_url ? (
              <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">Sin portada</div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 px-4 py-3">
            <span className="text-xs uppercase tracking-wide text-orange-500">Novedad</span>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-600">{post.title}</h3>
            {post.published_at && (
              <p className="text-xs text-gray-500">Publicado el {new Date(post.published_at).toLocaleDateString('es-CL')}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const [{ data: courses }, { data: posts }] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('date_start', { ascending: true })
      .limit(3),
    supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(4),
  ]);

  const safeCourses: Course[] = Array.isArray(courses) ? (courses as Course[]) : [];
  const safePosts: Post[] = Array.isArray(posts) ? (posts as Post[]) : [];

  return (
    <section className="space-y-12">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-12 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Centro de Entrenamiento en Recursos y Operaciones</h1>
        <p className="mt-4 max-w-2xl text-lg text-orange-50">
          Formación continua para profesionales de las ciencias de la tierra, con foco en experiencias de terreno, laboratorios y
          herramientas digitales.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cursos" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow">
            Ver cursos disponibles
          </Link>
          <Link href="/contacto" className="rounded-full bg-orange-700/70 px-4 py-2 text-sm font-semibold text-white shadow">
            Agenda una reunión
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Próximos cursos</h2>
          <Link href="/cursos" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {safeCourses.map((course) => (
            <Link
              key={course.id}
              href={`/cursos/${course.slug}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-gray-100" aria-hidden>
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">Sin imagen</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-4 py-4">
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                {course.date_start && (
                  <p className="text-sm text-gray-500">
                    {new Date(course.date_start).toLocaleDateString('es-CL')}
                    {course.date_end ? ` — ${new Date(course.date_end).toLocaleDateString('es-CL')}` : ''}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {safeCourses.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              Aún no hay cursos publicados. ¡Vuelve pronto!
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Novedades</h2>
          <Link href="/posts" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Explorar blog
          </Link>
        </div>
        <PostsCarousel posts={safePosts} />
      </div>
    </section>
  );
}
