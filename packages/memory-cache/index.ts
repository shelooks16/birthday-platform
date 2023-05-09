const cache = new Map();

export const MemoryCache = {
  getOrSet: <T>(cacheKey: string, objectGetter: () => T): T => {
    const cachedValue = cache.get(cacheKey);

    if (cachedValue) return cachedValue;

    const val = objectGetter();

    if (val instanceof Promise) {
      return val.then((v) => {
        cache.set(cacheKey, val);
        return v;
      }) as any;
    }

    cache.set(cacheKey, val);

    return val;
  },
  get: <T>(key: string, fallbackValue?: any): T => {
    const val = cache.get(key);

    return val === undefined ? fallbackValue : val;
  },
  set: <T>(key: string, value: T): T => {
    cache.set(key, value);

    return value;
  }
};
