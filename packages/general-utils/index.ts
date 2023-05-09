export const typed = <T>(val: T) => val;

export function groupBy<T>(
  array: Array<T>,
  groupingKeyFn: (item: T) => string
) {
  return array.reduce((result, item) => {
    const key = groupingKeyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, Array<T>>);
}

export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
