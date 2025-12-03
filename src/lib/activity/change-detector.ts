const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null) return false;
  if (typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;
};

const normalizeComparableValue = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

const areArraysEqual = (a: unknown[], b: unknown[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (!areValuesEqual(a[index], b[index])) {
      return false;
    }
  }
  return true;
};

const areObjectsEqual = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!areValuesEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
};

export const areValuesEqual = (rawA: unknown, rawB: unknown): boolean => {
  const a = normalizeComparableValue(rawA);
  const b = normalizeComparableValue(rawB);

  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b);
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    return areObjectsEqual(a, b);
  }

  return false;
};

export function extractChangedFields<T extends Record<string, unknown>>(
  previous: T | undefined,
  updates: Partial<T> | undefined
): string[] {
  if (!updates) {
    return [];
  }

  if (!previous) {
    return Object.keys(updates as Record<string, unknown>);
  }

  const changed: string[] = [];
  const entries = Object.entries(updates as Record<string, unknown>);

  for (const [key, nextValue] of entries) {
    if (!Object.prototype.hasOwnProperty.call(updates, key)) {
      continue;
    }
    const previousValue = (previous as Record<string, unknown>)[key];
    if (!areValuesEqual(previousValue, nextValue)) {
      changed.push(key);
    }
  }

  return changed;
}
