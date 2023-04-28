const cache = new Map();

/** Save object to in-memory cache. If object is already in cache, retrieve its value. */
export const withMemoryCache = <T extends object>(
  objectGetter: () => T,
  cacheKey: string
): T => {
  const cachedValue = cache.get(cacheKey);

  if (cachedValue) return cachedValue;

  const val = objectGetter();

  cache.set(cacheKey, val);

  return val;
};
