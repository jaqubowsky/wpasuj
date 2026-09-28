type Cookie = { name: string; value: string; httpOnly?: boolean; sameSite?: string; path?: string; maxAge?: number; secure?: boolean };

export function fakeCookies() {
  const jar = new Map<string, Cookie>();

  return {
    get: (name: string) => jar.get(name),
    getAll: () => [...jar.values()],
    set: (name: string, value: string, options: Omit<Cookie, "name" | "value"> = {}) => {
      jar.set(name, { name, value, ...options });
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  };
}
