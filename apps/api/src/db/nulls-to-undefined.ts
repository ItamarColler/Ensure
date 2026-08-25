export type NullsToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

export function nullsToUndefined<T extends object>(
  row: T,
): NullsToUndefined<T> {
  const entries = Object.entries(row) as [string, unknown][];
  const mapped: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    mapped[key] = value === null ? undefined : value;
  }

  return mapped as NullsToUndefined<T>;
}
