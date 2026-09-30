const DAY_MS = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LEVEL_COLORS = ["#0a1710", "#0e4429", "#006d32", "#26a641", "#57e56c"];

function utcDate(value) {
  return new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
}

function dateKey(value) {
  return value.toISOString().slice(0, 10);
}

export function availableActivityYears(days, generatedAt) {
  const years = new Set((days ?? []).map((day) => Number(day.date.slice(0, 4))));
  years.add(new Date(generatedAt).getUTCFullYear());
  return [...years].filter(Number.isFinite).sort((left, right) => right - left);
}

export function daysForYear(days, year) {
  return (days ?? []).filter((day) => Number(day.date.slice(0, 4)) === year);
}

export function longestActiveStreak(days) {
  const active = new Set((days ?? []).filter((day) => day.count > 0).map((day) => day.date));
  if (!active.size) return 0;
  const ordered = [...active].sort();
  let longest = 0;
  let current = 0;
  let previous = null;
  for (const value of ordered) {
    const day = utcDate(value);
    current = previous && day.getTime() - previous.getTime() === DAY_MS ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  return longest;
}

export function buildHeatmapWeeks(days, year, generatedAt) {
  const counts = new Map((days ?? []).map((day) => [day.date, day.count]));
  const maxCount = Math.max(1, ...(days ?? []).map((day) => day.count));
  const start = new Date(Date.UTC(year, 0, 1));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const generated = new Date(generatedAt);
  const visibleEnd = generated.getUTCFullYear() === year && generated < yearEnd ? generated : yearEnd;
  const end = new Date(Date.UTC(visibleEnd.getUTCFullYear(), visibleEnd.getUTCMonth(), visibleEnd.getUTCDate()));
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
  const weeks = [];

  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const week = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(cursor);
      day.setUTCDate(day.getUTCDate() + offset);
      const key = dateKey(day);
      const count = counts.get(key) ?? 0;
      const ratio = count / maxCount;
      const level = count === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
      week.push({
        date: key,
        count,
        level,
        inYear: day.getUTCFullYear() === year,
        isFuture: day > generated,
        outside: day.getUTCFullYear() !== year || day > generated,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

export function heatmapMonthMarkers(weeks) {
  const markers = [];
  let previousMonth = -1;
  weeks.forEach((week, index) => {
    const inMonth = week.find((cell) => cell.inYear && utcDate(cell.date).getUTCDate() <= 7);
    if (!inMonth) return;
    const date = utcDate(inMonth.date);
    const month = date.getUTCMonth();
    if (month === previousMonth) return;
    previousMonth = month;
    markers.push({
      label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      index,
      left: `${index * 17}px`,
    });
  });
  return markers;
}

export function buildFolioWeeks(days) {
  const ordered = [...(days ?? [])].sort((left, right) => left.date.localeCompare(right.date));
  if (!ordered.length) return [];
  const grouped = new Map();
  for (const day of ordered) {
    const date = utcDate(day.date);
    if (Number.isNaN(date.getTime())) continue;
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    const start = date.toISOString().slice(0, 10);
    const endDate = new Date(date);
    endDate.setUTCDate(endDate.getUTCDate() + 6);
    const current = grouped.get(start) ?? { start, end: endDate.toISOString().slice(0, 10), count: 0 };
    current.count += day.count;
    grouped.set(start, current);
  }
  const keys = [...grouped.keys()].sort();
  const first = keys[0];
  const last = keys.at(-1);
  if (!first || !last) return [];
  const weeks = [];
  const cursor = utcDate(first);
  const end = utcDate(last);
  while (cursor <= end) {
    const start = cursor.toISOString().slice(0, 10);
    const endDate = new Date(cursor);
    endDate.setUTCDate(endDate.getUTCDate() + 6);
    weeks.push(grouped.get(start) ?? { start, end: endDate.toISOString().slice(0, 10), count: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return weeks;
}

export function buildDetailedHeatmap(source, generatedAt, windowDays = 365) {
  const observed = new Date(generatedAt);
  const toTimestamp = Date.UTC(observed.getUTCFullYear(), observed.getUTCMonth(), observed.getUTCDate());
  const fromTimestamp = toTimestamp - Math.max(0, windowDays - 1) * DAY_MS;
  const gridStart = fromTimestamp - new Date(fromTimestamp).getUTCDay() * DAY_MS;
  const gridEnd = toTimestamp + (6 - new Date(toTimestamp).getUTCDay()) * DAY_MS;
  const sourceByDate = new Map((source ?? []).map((day) => [day.date, day]));
  const days = [];

  for (let timestamp = gridStart, index = 0; timestamp <= gridEnd; timestamp += DAY_MS, index += 1) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const value = sourceByDate.get(date);
    days.push({
      date,
      count: value?.count ?? 0,
      level: value?.level ?? 0,
      index,
      weekday: new Date(timestamp).getUTCDay(),
      weekdayLabel: WEEKDAYS[new Date(timestamp).getUTCDay()],
      week: Math.floor(index / 7),
      inWindow: timestamp >= fromTimestamp && timestamp <= toTimestamp,
    });
  }

  const window = days.filter((day) => day.inWindow);
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const months = [];
  let previousMonth = "";
  for (const day of days) {
    const month = day.date.slice(0, 7);
    if (month === previousMonth || !day.inWindow) continue;
    previousMonth = month;
    months.push({
      label: new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      week: day.week,
      left: `${78 + day.week * 47}px`,
    });
  }

  let longestStreak = 0;
  let currentStreak = 0;
  for (const day of window) {
    currentStreak = day.count > 0 ? currentStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, currentStreak);
  }
  const bestDay = [...window].sort((left, right) => right.count - left.count || right.date.localeCompare(left.date))[0] ?? null;
  return {
    from: new Date(fromTimestamp).toISOString().slice(0, 10),
    to: new Date(toTimestamp).toISOString().slice(0, 10),
    days,
    weeks,
    months,
    total: window.reduce((sum, day) => sum + day.count, 0),
    activeDays: window.filter((day) => day.count > 0).length,
    bestDay,
    longestStreak,
    gridWidth: `${weeks.length * 47 + 78}px`,
  };
}

function dateLevel(count, maximum) {
  if (count <= 0 || maximum <= 0) return 0;
  const ratio = Math.log1p(count) / Math.log1p(maximum);
  if (ratio > 0.78) return 4;
  if (ratio > 0.54) return 3;
  if (ratio > 0.3) return 2;
  return 1;
}

export function buildOrbitTerrain(sourceDays, year, generatedAt, milestones = []) {
  const observed = Date.parse(generatedAt);
  const start = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);
  const end = new Date(observed).getUTCFullYear() === year ? Math.min(yearEnd, observed) : yearEnd;
  const counts = new Map(
    (sourceDays ?? []).filter((day) => Number(day.date.slice(0, 4)) === year).map((day) => [day.date, day.count]),
  );
  const maximum = Math.max(0, ...counts.values());
  const startOffset = new Date(start).getUTCDay();
  const dayCount = Math.max(0, Math.floor((end - start) / DAY_MS) + 1);
  const weekCount = Math.max(1, Math.ceil((startOffset + dayCount) / 7));
  const surveyWidth = 820;
  const surveyHeight = 166;
  const points = [];

  for (let timestamp = start, index = 0; timestamp <= end; timestamp += DAY_MS, index += 1) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const count = counts.get(date) ?? 0;
    const weekday = new Date(timestamp).getUTCDay();
    const week = Math.floor((startOffset + index) / 7);
    const level = dateLevel(count, maximum);
    const height = count > 0 ? Math.min(8.62, 0.22 + (Math.log1p(count) / Math.log1p(Math.max(1, maximum))) * 8.4) : 0.08;
    points.push({
      index,
      date,
      count,
      level,
      week,
      weekday,
      weekdayLabel: WEEKDAYS[weekday],
      height,
      color: LEVEL_COLORS[level],
      surveyX: 42 + (week / Math.max(1, weekCount - 1)) * (surveyWidth - 68),
      surveyY: 34 + weekday * 16,
    });
  }

  const byDate = new Map(points.map((point) => [point.date, point]));
  const markers = milestones
    .filter((milestone) => Number(milestone.date.slice(0, 4)) === year && byDate.has(milestone.date))
    .map((milestone) => ({ ...milestone, point: byDate.get(milestone.date) }))
    .sort((left, right) => left.date.localeCompare(right.date) || left.repository.localeCompare(right.repository));

  return {
    year,
    points,
    markers,
    maximum,
    activeDays: points.filter((point) => point.count > 0).length,
    total: points.reduce((sum, point) => sum + point.count, 0),
    weekCount,
    surveyWidth,
    surveyHeight,
  };
}

export function chartGeometry(days, width = 760, height = 210) {
  const maximum = Math.max(1, ...(days ?? []).map((day) => day.count));
  const points = (days ?? []).map((day, index) => ({
    ...day,
    x: days.length <= 1 ? 0 : (index / (days.length - 1)) * width,
    y: height - (Math.log1p(day.count) / Math.log1p(maximum)) * (height - 18),
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const area = points.length ? `${line} L${width},${height} L0,${height} Z` : "";
  return { points, line, area, width, height, maximum };
}

export function normalizeYearDays(days, year, generatedAt) {
  const counts = new Map(
    (days ?? []).filter((day) => Number(day.date.slice(0, 4)) === year).map((day) => [day.date, day]),
  );
  const start = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);
  const observed = Date.parse(generatedAt);
  const end = new Date(observed).getUTCFullYear() === year ? Math.min(yearEnd, observed) : yearEnd;
  const result = [];
  for (let timestamp = start, index = 0; timestamp <= end; timestamp += DAY_MS, index += 1) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const observedDay = counts.get(date);
    result.push({ date, count: observedDay?.count ?? 0, level: observedDay?.level ?? 0, index });
  }
  return result;
}

export function summarizeMonths(days, year) {
  const months = new Map();
  for (const day of (days ?? []).filter((entry) => Number(entry.date.slice(0, 4)) === year)) {
    const month = day.date.slice(0, 7);
    const current = months.get(month) ?? { month, count: 0, activeDays: 0 };
    current.count += day.count;
    current.activeDays += Number(day.count > 0);
    months.set(month, current);
  }
  return [...months.values()].sort((left, right) => left.month.localeCompare(right.month));
}

export function periodThesis(months, noun) {
  if (!months.length || months.every((month) => month.count === 0)) {
    return `No ${noun} were recorded in this period.`;
  }
  const peak = [...months].sort((left, right) => right.count - left.count || left.month.localeCompare(right.month))[0];
  const month = new Date(`${peak.month}-01T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${month} holds the highest visible ${noun} count in this period.`;
}

export { WEEKDAYS, LEVEL_COLORS };
