const textDecoder = new TextDecoder();

function normalizeMaybePromise(value) {
  if (value && typeof value.then === 'function') {
    return value.then((resolved) => resolved ?? null).catch(() => null);
  }
  return Promise.resolve(value ?? null);
}

function encodeFilterValue(value) {
  if (value === null || value === undefined) {
    return 'is.null';
  }
  return `eq.${encodeURIComponent(value)}`;
}

function buildSearchParams(state) {
  const search = new URLSearchParams();
  search.set('select', state.columns || '*');
  for (const [column, value] of state.filters) {
    search.append(column, encodeFilterValue(value));
  }
  if (state.orderBy) {
    const direction = state.orderBy.ascending ? 'asc' : 'desc';
    search.set('order', `${state.orderBy.column}.${direction}`);
  }
  if (typeof state.limit === 'number') {
    search.set('limit', String(state.limit));
  }
  return search;
}

async function parseError(response) {
  try {
    const buffer = await response.arrayBuffer();
    const text = textDecoder.decode(buffer);
    return { message: text || response.statusText, status: response.status };
  } catch (error) {
    return { message: response.statusText || String(error), status: response.status };
  }
}

function createAuth(apiKey, restHeaders, authStorage, baseUrl) {
  async function getAccessToken() {
    if (!authStorage?.getItem) return null;
    return normalizeMaybePromise(authStorage.getItem('sb-access-token'));
  }

  return {
    async getUser() {
      const token = await getAccessToken();
      if (!token) {
        return { data: { user: null }, error: null };
      }

      const response = await fetch(`${baseUrl}/auth/v1/user`, {
        headers: {
          ...restHeaders,
          apikey: apiKey,
          Authorization: `Bearer ${await token}`
        }
      });

      if (!response.ok) {
        const error = await parseError(response);
        return { data: { user: null }, error };
      }

      const data = await response.json();
      return { data: { user: data }, error: null };
    }
  };
}

function createQueryBuilder(restUrl, restHeaders) {
  return function query(table) {
    const state = {
      columns: '*',
      filters: [],
      orderBy: undefined,
      limit: undefined
    };

    const builder = {
      select(columns = '*') {
        state.columns = columns;
        return builder;
      },
      eq(column, value) {
        state.filters.push([column, value]);
        return builder;
      },
      order(column, options = {}) {
        state.orderBy = { column, ascending: options.ascending !== false };
        return builder;
      },
      limit(value) {
        state.limit = value;
        return builder;
      },
      maybeSingle() {
        return execute(true);
      },
      single() {
        return execute(true);
      },
      insert(values) {
        return mutate('POST', values);
      },
      update(values) {
        return mutate('PATCH', values);
      },
      delete() {
        return mutate('DELETE');
      },
      then(onFulfilled, onRejected) {
        return execute(false).then(onFulfilled, onRejected);
      }
    };

    async function execute(expectSingle) {
      const search = buildSearchParams(state);
      const response = await fetch(`${restUrl}/${table}?${search.toString()}`, {
        headers: restHeaders
      });

      if (!response.ok) {
        const error = await parseError(response);
        return { data: expectSingle ? null : [], error };
      }

      const data = await response.json();
      if (expectSingle) {
        const record = Array.isArray(data) ? data[0] ?? null : data ?? null;
        return { data: record, error: null };
      }
      return { data: Array.isArray(data) ? data : [data], error: null };
    }

    async function mutate(method, payload) {
      const response = await fetch(`${restUrl}/${table}`, {
        method,
        headers: {
          ...restHeaders,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: payload !== undefined ? JSON.stringify(payload) : undefined
      });

      if (!response.ok) {
        const error = await parseError(response);
        return { data: null, error };
      }

      if (response.status === 204) {
        return { data: null, error: null };
      }

      const data = await response.json().catch(() => null);
      return { data, error: null };
    }

    return builder;
  };
}

export function createClient(supabaseUrl, supabaseKey, options = {}) {
  if (!supabaseUrl) {
    throw new Error('Supabase URL is required');
  }
  if (!supabaseKey) {
    throw new Error('Supabase anon/service key is required');
  }

  const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const restHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...(options.global?.headers ?? {})
  };

  const queryBuilder = createQueryBuilder(restUrl, restHeaders);
  const auth = createAuth(supabaseKey, restHeaders, options.auth?.storage, supabaseUrl.replace(/\/$/, ''));

  return {
    auth,
    from(table) {
      return queryBuilder(table);
    }
  };
}
