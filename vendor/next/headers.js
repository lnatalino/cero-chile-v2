const cookieStore = new Map();

export async function cookies() {
  return {
    get(name) {
      const value = cookieStore.get(name);
      return value ? { name, value } : undefined;
    },
    set({ name, value }) {
      cookieStore.set(name, value);
    },
    delete({ name }) {
      cookieStore.delete(name);
    },
  };
}
