type LS_KEY = 'uid';

const withCatch = <T>(cb: () => T): T | undefined => {
  try {
    return cb();
  } catch (error) {
    console.log('Local storage err', {
      type: error.name,
      msg: error.message
    });
  }
};

const resolveKey = (key: string) => `app:${key}`;

export const LocalStorage = {
  get<T = string>(key: LS_KEY, fallback?: T): T {
    const val = withCatch(() => localStorage.getItem(resolveKey(key)));
    const deserialized =
      typeof val === 'string' ? withCatch<T>(() => JSON.parse(val)) : val;

    return deserialized ?? fallback ?? (val as any);
  },
  set(key: LS_KEY, value: any): void {
    withCatch(() =>
      localStorage.setItem(resolveKey(key), JSON.stringify(value))
    );
  },
  remove(key: LS_KEY): void {
    withCatch(() => localStorage.removeItem(resolveKey(key)));
  }
};
