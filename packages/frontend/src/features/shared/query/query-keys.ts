type QueryKeyObject = { [key: string]: unknown };
type QueryKeyPart = string | number | boolean | null | undefined | QueryKeyObject | unknown[];

function normalizePart(part: QueryKeyPart): QueryKeyPart {
  if (Array.isArray(part)) {
    return part.map((entry) => normalizePart(entry as QueryKeyPart));
  }

  if (part && typeof part === 'object') {
    return Object.keys(part)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        const value = (part as Record<string, unknown>)[key];
        if (value !== undefined) {
          acc[key] = normalizePart(value as QueryKeyPart);
        }
        return acc;
      }, {});
  }

  return part;
}

export const businessQueryKeys = {
  feature: (feature: string) => ['business', feature] as const,
  list: <T extends object>(feature: string, params?: T) =>
    ['business', feature, 'list', normalizePart((params ?? {}) as QueryKeyObject)] as const,
  detail: <T extends object>(feature: string, id: string | number, params?: T) =>
    ['business', feature, 'detail', String(id), normalizePart((params ?? {}) as QueryKeyObject)] as const,
  stats: <T extends object>(feature: string, params?: T) =>
    ['business', feature, 'stats', normalizePart((params ?? {}) as QueryKeyObject)] as const,
  meta: <T extends object>(feature: string, key: string, params?: T) =>
    ['business', feature, key, normalizePart((params ?? {}) as QueryKeyObject)] as const,
};
