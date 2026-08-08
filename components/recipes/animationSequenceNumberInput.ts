export function parseBoundedNumberInput(rawValue: string, min: number, max: number) {
  if (rawValue.trim() === '') return null;
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) return null;
  return Math.min(max, Math.max(min, parsedValue));
}
