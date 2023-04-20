export type FlattenObjectKeys<
  T extends Record<string, unknown>,
  Key = keyof T
> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
  : never;

// ====
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : '';

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

export type FlattenInterfaceKeys<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]?: T[K] extends Array<infer U>
        ? // @ts-expect-error okay
          `${K}` | Join<K, Paths<U, Prev[D]>>
        : K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : '';
