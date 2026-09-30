const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const precise = new Intl.NumberFormat("en");

export function formatCount(value) {
  return Math.abs(value) >= 10_000 ? compact.format(value) : precise.format(value);
}

export function formatMetric(value) {
  return value === null || value === undefined ? "—" : formatCount(value);
}

export function formatBytes(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

export function formatDate(value, options) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    ...(options ?? { month: "short", day: "numeric", year: "numeric" }),
    timeZone: "UTC",
  }).format(date);
}

export function relativeDate(value, from = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unknown";
  const days = Math.round((from.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function githubYears(joinedAt, generatedAt) {
  const joined = new Date(joinedAt);
  const generated = new Date(generatedAt);
  if (Number.isNaN(joined.getTime()) || Number.isNaN(generated.getTime())) return 0;
  const years = generated.getUTCFullYear() - joined.getUTCFullYear();
  const anniversaryPassed =
    generated.getUTCMonth() > joined.getUTCMonth() ||
    (generated.getUTCMonth() === joined.getUTCMonth() && generated.getUTCDate() >= joined.getUTCDate());
  return Math.max(0, years - (anniversaryPassed ? 0 : 1));
}

export function externalLabel(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function shortRepository(value) {
  return String(value).split("/").at(-1) ?? value;
}
