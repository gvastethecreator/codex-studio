import React from 'react';

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

export const QueueProgressBar = React.memo(function QueueProgressBar({
  generationStartTime,
}: {
  generationStartTime: number | null;
}) {
  const [progressPercent, setProgressPercent] = React.useState(() =>
    resolveQueueProgressPercent(generationStartTime, Date.now()),
  );

  React.useEffect(() => {
    const initialProgress = resolveQueueProgressPercent(generationStartTime, Date.now());
    setProgressPercent(initialProgress);
    if (!shouldScheduleQueueProgress(generationStartTime, initialProgress)) return;

    const interval = window.setInterval(() => {
      const nextProgress = resolveQueueProgressPercent(generationStartTime, Date.now());
      setProgressPercent(nextProgress);
      if (nextProgress >= 100) window.clearInterval(interval);
    }, 250);

    return () => window.clearInterval(interval);
  }, [generationStartTime]);

  return (
    <span className="absolute inset-x-1 bottom-1 h-0.5 overflow-hidden rounded-full bg-black/60">
      <span
        className="block h-full w-full origin-left rounded-full bg-accent-300 transition-transform duration-200 ease-linear"
        style={{ transform: `scaleX(${progressPercent / 100})` }}
      />
    </span>
  );
});
