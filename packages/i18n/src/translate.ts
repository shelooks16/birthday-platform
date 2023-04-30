/**
 * Access deep values in an object via a string path seperated by `.`

 * @example
 * ```js
 * const obj = { a: { b : { c: 'hello' } } };
 *
 * const value = deepReadObject(obj, 'a.b.c');
 * // => 'hello'
 * const notFound = deepReadObject(obj, 'a.b.d');
 * // => undefined
 * const notFound = deepReadObject(obj, 'a.b.d', 'not found');
 * // => 'not found'
 * ```
 */
function deepReadObject<T = any>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): T {
  const value = path
    .trim()
    .split('.')
    .reduce<any>((a, b) => (a ? a[b] : undefined), obj);
  return value !== undefined ? value : defaultValue;
}

/**
 * Provided a string template it will replace dynamics parts in place of variables.
 *
 * This util is largely inspired by [templite](https://github.com/lukeed/templite/blob/master/src/index.js)
 *
 * @param str The string to use as template
 * @param params The params to inject into the template
 * @param reg The RegExp used to find and replace
 *
 * @returns The fully injected template
 *
 * @example
 * ```js
 * const txt = template('Hello {{ name }}', { name: 'Tom' });
 * // => 'Hello Tom'
 * ```
 */
const template = (
  str: string,
  params: Record<string, string>,
  reg = /{{([^{}]+)}}/g
): any => str.replace(reg, (_, key) => deepReadObject(params, key, ''));

export const translate = <T extends Record<string, any>>(
  dictionary: T,
  key: string,
  params?: Record<string, any>,
  defaultValue?: string
): string => {
  const val = deepReadObject(dictionary, key, defaultValue || '');
  if (typeof val === 'string') return template(val, params || {});
  return val as string;
};
