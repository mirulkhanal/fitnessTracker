/** Normalize wrAuth / SQLite timestamps to epoch ms for stats and sorting. */
export const parseTimestampMs = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? value : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric) && /^\d+(\.\d+)?$/.test(trimmed)) {
      return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const toLocalDateString = (timestampMs: number) => {
  const date = new Date(timestampMs);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};
