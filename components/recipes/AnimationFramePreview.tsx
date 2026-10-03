import { useEffect, useState } from 'react';
import { useBoundedNumberInput } from './animationSequenceNumberInput';

interface PreviewFrame {
  id: string;
  catalogImageId?: string | null;
  src?: string;
  unavailable?: boolean;
}

/**
 * Playback is opt-in and includes gaps; exporting still uses the run's full-frame gate.
 * The caller resolves `src` from the run's attached Catalog Entries.
 */
export function AnimationFramePreview({ frames, fps }: { frames: PreviewFrame[]; fps: number }) {
  const [playing, setPlaying] = useState(false);
  const [previewFps, setPreviewFps] = useState(fps);
  const previewFpsInput = useBoundedNumberInput(previewFps, 1, 60, setPreviewFps);
  const [loop, setLoop] = useState(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const timer = window.setTimeout(
      () => {
        if (index >= frames.length - 1 && !loop) setPlaying(false);
        else setIndex((value) => (value + 1) % frames.length);
      },
      1000 / Math.max(1, previewFps),
    );
    return () => window.clearTimeout(timer);
  }, [playing, frames.length, previewFps, loop, index]);
  const currentIndex = Math.min(index, Math.max(0, frames.length - 1));
  const frame = frames[currentIndex];
  const src = frame?.src;
  const available = frames.filter((item) => item.src).length;
  return (
    <section
      aria-label="Animation preview"
      className="mb-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] p-3"
    >
      <div className="grid h-[260px] place-items-center bg-[color:var(--wb-well)]">
        {src ? (
          <img
            src={src}
            alt={`Preview frame ${currentIndex + 1}`}
            className="size-full object-contain"
          />
        ) : (
          <p className="p-4 text-center text-sm">
            Frame {currentIndex + 1} ·{' '}
            {frame?.catalogImageId
              ? frame.unavailable
                ? 'Image unavailable'
                : 'Loading image'
              : 'Not generated yet'}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <label>
          Preview FPS{' '}
          <input
            aria-label="Preview FPS"
            type="number"
            min={1}
            max={60}
            {...previewFpsInput}
            className="w-14 bg-[color:var(--wb-well)] p-1"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={loop}
            onChange={(event) => setLoop(event.target.checked)}
          />
          Loop preview
        </label>
        <button
          type="button"
          className="studio-ghost-control px-3 py-2"
          disabled={available === 0 || frames.length < 2}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? 'Pause preview' : 'Play preview'}
        </button>
        <input
          aria-label="Preview frame"
          type="range"
          min={1}
          max={Math.max(1, frames.length)}
          value={currentIndex + 1}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value) - 1);
          }}
        />
        <span>
          {currentIndex + 1} / {frames.length} · {available} available · {frames.length - available}{' '}
          gaps
        </span>
      </div>
      <p className="mt-2 text-xs text-[color:var(--wb-muted)]">
        Preview works with partial frames. GIF export requires every frame.
      </p>
    </section>
  );
}
