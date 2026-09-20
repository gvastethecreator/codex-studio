import { useEffect, useState } from 'react';
import { getCatalogImageDetail } from '../../services/studio-api/catalog';
import { resolveCatalogEntryPreviewUrl } from '../../lib/studioCatalogImageAdapter';

interface PreviewFrame {
  id: string;
  catalogImageId?: string | null;
  src?: string;
}

/** Playback is opt-in and includes gaps; exporting still uses the run's full-frame gate. */
export function AnimationFramePreview({ frames, fps }: { frames: PreviewFrame[]; fps: number }) {
  const [playing, setPlaying] = useState(false);
  const [previewFps, setPreviewFps] = useState(fps);
  const [loop, setLoop] = useState(true);
  const [index, setIndex] = useState(0);
  const [sources, setSources] = useState<Record<string, string>>({});
  const missingIds = frames
    .filter((frame) => !frame.src && frame.catalogImageId)
    .map((frame) => frame.catalogImageId!)
    .join('|');
  useEffect(() => {
    let cancelled = false;
    const ids = missingIds ? missingIds.split('|') : [];
    void Promise.all(
      ids.map(async (id) => {
        try {
          return [id, resolveCatalogEntryPreviewUrl(await getCatalogImageDetail(id))] as const;
        } catch {
          return [id, ''] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setSources(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [missingIds]);
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
  const src = frame?.src || sources[frame?.catalogImageId ?? ''];
  const available = frames.filter((item) => item.src || sources[item.catalogImageId ?? '']).length;
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
            {frame?.catalogImageId ? 'Image unavailable' : 'Not generated yet'}
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
            value={previewFps}
            onChange={(event) =>
              setPreviewFps(Math.max(1, Math.min(60, Number(event.target.value) || 1)))
            }
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
