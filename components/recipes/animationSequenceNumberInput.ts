import { useState, type ChangeEvent } from 'react';

export function parseBoundedNumberInput(rawValue: string, min: number, max: number) {
  if (rawValue.trim() === '') return null;
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) return null;
  return Math.min(max, Math.max(min, Math.round(parsedValue)));
}

/** Keeps the typed text while editing, commits in-range whole numbers live, and clamps on blur. */
export function useBoundedNumberInput(
  value: number,
  min: number,
  max: number,
  onCommit: (value: number) => void,
) {
  const [draft, setDraft] = useState<string | null>(null);
  return {
    value: draft ?? String(value),
    onChange(event: ChangeEvent<HTMLInputElement>) {
      const rawValue = event.target.value;
      setDraft(rawValue);
      const parsedValue = parseBoundedNumberInput(rawValue, min, max);
      if (parsedValue !== null && parsedValue === Number(rawValue)) onCommit(parsedValue);
    },
    onBlur() {
      if (draft === null) return;
      const parsedValue = parseBoundedNumberInput(draft, min, max);
      if (parsedValue !== null && parsedValue !== value) onCommit(parsedValue);
      setDraft(null);
    },
  };
}
