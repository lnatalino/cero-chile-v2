const data = {
  profiles: [
    { id: 'user-admin', email: 'admin@cero.cl', role: 'admin', full_name: 'Admin CERO' },
    { id: 'user-guest', email: 'guest@cero.cl', role: 'student', full_name: 'Invitado' }
  ],
  courses: [
    {
      id: 1,
      slug: 'geologia-andina',
      title: 'Geología Andina Aplicada',
      description: 'Explora las formaciones de la cordillera en terreno y laboratorio.',
      location: 'Santiago, Chile',
      date_start: '2025-03-01',
      date_end: '2025-03-05',
      price_clp: 450000,
      price_usd: 520,
      cover_url: 'https://images.example.com/geologia.jpg',
      status: 'published',
      published_at: '2024-10-10T10:00:00Z'
    },
    {
      id: 2,
      slug: 'hidrogeologia-patagonica',
      title: 'Hidrogeología Patagónica',
      description: 'Estudia las cuencas australes con especialistas en glaciares.',
      location: 'Punta Arenas, Chile',
      date_start: '2025-04-12',
      date_end: '2025-04-18',
      price_clp: 520000,
      price_usd: 600,
      cover_url: 'https://images.example.com/hidrogeologia.jpg',
      status: 'draft',
      published_at: null
    }
  ],
  posts: [
    {
      id: 10,
      slug: 'primer-bootcamp-cero',
      title: 'Primer bootcamp geológico CERO',
      cover_url: 'https://images.example.com/bootcamp.jpg',
      status: 'published',
      published_at: '2024-09-01T12:00:00Z'
    },
    {
      id: 11,
      slug: 'alianza-universidad',
      title: 'Nueva alianza académica con universidades chilenas',
      cover_url: 'https://images.example.com/alianza.jpg',
      status: 'published',
      published_at: '2024-09-20T12:00:00Z'
    }
  ],
  enrollments: []
};

const counters = {
  enrollments: 1
};

module.exports = { data, counters };
