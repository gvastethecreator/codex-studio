const ASSUMED_GENERATION_DURATION_MS = 120_000;

export function resolveQueueProgressPercent(generationStartTime: number | null, now: number) {
  if (!generationStartTime) return 18;
  return Math.min(
    Math.max(((now - generationStartTime) / ASSUMED_GENERATION_DURATION_MS) * 100, 6),
    100,
  );
}

export function shouldScheduleQueueProgress(
  generationStartTime: number | null,
  progressPercent: number,
) {
  return generationStartTime !== null && progressPercent < 100;
}
