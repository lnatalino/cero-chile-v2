const { data, counters } = require('./data.js');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class SupabaseQueryBuilder {
  constructor(tableName, dataset) {
    this.tableName = tableName;
    this.dataset = dataset;
    this._filters = [];
    this._order = null;
    this._limit = null;
  }

  select() {
    return this;
  }

  eq(column, value) {
    this._filters.push((row) => row[column] === value);
    return this;
  }

  gte(column, value) {
    this._filters.push((row) => row[column] >= value);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this._order = { column, ascending };
    return this;
  }

  limit(value) {
    this._limit = value;
    return this;
  }

  range(from, to) {
    this._limit = to - from + 1;
    return this;
  }

  then(onFulfilled, onRejected) {
    const result = Promise.resolve({ data: this._execute(), error: null });
    return result.then(onFulfilled, onRejected);
  }

  maybeSingle() {
    const list = this._execute();
    return { data: list[0] ?? null, error: null };
  }

  single() {
    const list = this._execute();
    if (list.length === 0) {
      return { data: null, error: new Error('No rows found') };
    }
    if (list.length > 1) {
      return { data: null, error: new Error('Multiple rows found') };
    }
    return { data: list[0], error: null };
  }

  insert(payload) {
    const rows = Array.isArray(payload) ? payload : [payload];
    const target = data[this.tableName];
    const inserted = rows.map((row) => {
      const copy = { ...row };
      if (copy.id == null) {
        counters[this.tableName] = (counters[this.tableName] ?? target.length + 1) + 1;
        copy.id = counters[this.tableName];
      }
      target.push(copy);
      return clone(copy);
    });
    return Promise.resolve({ data: inserted, error: null });
  }

  _execute() {
    let list = data[this.tableName] ?? [];
    if (this._filters.length) {
      list = list.filter((row) => this._filters.every((filter) => filter(row)));
    }
    if (this._order) {
      const { column, ascending } = this._order;
      list = [...list].sort((a, b) => {
        const av = a[column];
        const bv = b[column];
        if (av === bv) return 0;
        if (av == null) return ascending ? 1 : -1;
        if (bv == null) return ascending ? -1 : 1;
        return ascending ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
    }
    if (typeof this._limit === 'number') {
      list = list.slice(0, this._limit);
    }
    return list.map(clone);
  }
}

class SupabaseClient {
  constructor(cookieAdapter) {
    this.cookieAdapter = cookieAdapter;
    this.auth = {
      getUser: async () => {
        const cookieValue = cookieAdapter?.get ? await cookieAdapter.get('sb-user-id') : undefined;
        if (!cookieValue) {
          return { data: { user: null }, error: null };
        }
        const profile = data.profiles.find((profile) => profile.id === cookieValue);
        if (!profile) {
          return { data: { user: null }, error: null };
        }
        return {
          data: {
            user: {
              id: profile.id,
              email: profile.email,
              user_metadata: { full_name: profile.full_name },
            },
          },
          error: null,
        };
      },
    };
  }

  from(tableName) {
    return new SupabaseQueryBuilder(tableName, data);
  }
}

function createServerClient(_url, _key, { cookies } = {}) {
  return new SupabaseClient(cookies);
}

function createBrowserClient() {
  return new SupabaseClient();
}

module.exports = { createServerClient, createBrowserClient };
