const memStore = new Map<string, string>();

export const Storage = {
  get<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item !== null ? (JSON.parse(item) as T) : fallback;
      }
      if (memStore.has(key)) {
        return JSON.parse(memStore.get(key)!) as T;
      }
      return fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, json);
      }
      memStore.set(key, json);
    } catch {
      // Ignored for quota exceeded or private browsing restrictions
    }
  },

  clearMemoryStore(): void {
    memStore.clear();
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignored
    }
    memStore.clear();
  }
};
