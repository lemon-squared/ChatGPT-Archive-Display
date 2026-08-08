export function formatTimestamp(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "Unknown date";
  const ms = value > 1e12 ? value : value * 1000;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

export function formatShortDate(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const ms = value > 1e12 ? value : value * 1000;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
