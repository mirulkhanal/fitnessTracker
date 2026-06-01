/** Parse category IDs from wrAuth (JSON string) or a native JSON array. */
export const parseCategoryIds = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (!Array.isArray(parsed)) {
          return [];
        }
        return parsed.map(item => String(item)).filter(Boolean);
      } catch {
        return [];
      }
    }
    return [trimmed];
  }

  return [];
};

export const serializeCategoryIds = (categoryIds: string[]): string =>
  JSON.stringify(categoryIds.map(id => String(id)).filter(Boolean));
