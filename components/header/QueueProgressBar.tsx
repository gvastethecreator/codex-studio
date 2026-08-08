import React from 'react';

import { resolveQueueProgressPercent, shouldScheduleQueueProgress } from './queueProgressBarPolicy';

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
