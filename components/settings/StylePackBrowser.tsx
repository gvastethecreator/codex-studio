import { IconArrowLeft as ArrowLeft, IconPhoto as ImageIcon } from '@tabler/icons-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  previewImageUrl,
  type StylePackPreviewResponse,
} from '../../services/studio-api/extensions';

/** A pack the browser can show, installed or published by a remote source. */
export interface BrowsablePack {
  key: string;
  title: string;
  subtitle: string;
  loadPreview: () => Promise<StylePackPreviewResponse>;
}

// Previews are small and change only with a new pack version, so one fetch per session is enough.
const previewCache = new Map<string, Promise<StylePackPreviewResponse>>();

function loadCachedPreview(pack: BrowsablePack) {
  let pending = previewCache.get(pack.key);
  if (!pending) {
    pending = pack.loadPreview();
    previewCache.set(pack.key, pending);
    pending.catch(() => previewCache.delete(pack.key));
  }
  return pending;
}

type PreviewState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; value: StylePackPreviewResponse }
  | { status: 'error'; message: string };

/** Loads a pack preview once the element scrolls into view, or right away when `eager`. */
function usePackPreview(pack: BrowsablePack, eager = false) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<PreviewState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      setState({ status: 'loading' });
      loadCachedPreview(pack)
        .then((value) => !cancelled && setState({ status: 'ready', value }))
        .catch(
          (reason: unknown) =>
            !cancelled &&
            setState({
              status: 'error',
              message: reason instanceof Error ? reason.message : String(reason),
            }),
        );
    };
    if (eager || !ref.current || typeof IntersectionObserver === 'undefined') {
      load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    });
    observer.observe(ref.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [eager, pack]);

  return { ref, state };
}

function PackCover({ pack, onOpen }: { pack: BrowsablePack; onOpen: () => void }) {
  const { ref, state } = usePackPreview(pack);
  const cover =
    state.status === 'ready' && state.value.preview.cover
      ? previewImageUrl(state.value.imageBase, state.value.preview.cover)
      : null;
  return (
    <button
      ref={(element) => {
        ref.current = element;
      }}
      type="button"
      onClick={onOpen}
      className="studio-list-row group grid overflow-hidden text-left"
      aria-label={`Open ${pack.title}`}
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-[color:var(--wb-well)]">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid size-full place-items-center text-[color:var(--wb-muted)]">
            <ImageIcon size={22} />
          </span>
        )}
      </span>
      <span className="grid gap-0.5 px-2.5 py-2">
        <span className="truncate text-sm font-semibold">{pack.title}</span>
        <span className="truncate text-xs studio-muted">{pack.subtitle}</span>
      </span>
    </button>
  );
}

export function PackCoverGrid({
  packs,
  onOpen,
}: {
  packs: readonly BrowsablePack[];
  onOpen: (pack: BrowsablePack) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {packs.map((pack) => (
        <PackCover key={pack.key} pack={pack} onOpen={() => onOpen(pack)} />
      ))}
    </div>
  );
}

/** One pack's description, categories and sample cards, with install or remove actions. */
export function PackDetail({
  pack,
  actions,
  onBack,
}: {
  pack: BrowsablePack;
  actions?: ReactNode;
  onBack: () => void;
}) {
  const { state } = usePackPreview(pack, true);
  const preview = state.status === 'ready' ? state.value.preview : null;
  return (
    <section className="grid gap-3" aria-label={`${pack.title} preview`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="studio-ghost-control flex items-center gap-2 px-3"
        >
          <ArrowLeft size={14} />
          Back to packs
        </button>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div>
        <h3 className="text-base font-semibold">{pack.title}</h3>
        <p className="text-xs studio-muted">{pack.subtitle}</p>
        {preview?.description ? <p className="mt-2 text-sm">{preview.description}</p> : null}
      </div>
      {state.status === 'loading' || state.status === 'idle' ? (
        <p className="text-xs studio-muted">Loading preview…</p>
      ) : null}
      {state.status === 'error' ? (
        <p role="alert" className="text-xs text-[color:var(--wb-danger)]">
          {state.message}
        </p>
      ) : null}
      {preview ? (
        <>
          <ul className="flex flex-wrap gap-1.5" aria-label="Categories">
            {preview.categories.map((category) => (
              <li key={category.name} className="studio-list-row px-2 py-1 text-xs">
                {category.name.replace(/^\d+\.\s*/, '')}{' '}
                <span className="studio-muted">{category.presetCount}</span>
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Sample styles">
            {preview.samples.map((sample) => (
              <li key={sample.presetId} className="grid gap-1">
                <img
                  src={previewImageUrl(
                    state.status === 'ready' ? state.value.imageBase : '',
                    sample.image,
                  )}
                  alt={sample.name}
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-[var(--wb-radius)] object-cover"
                />
                <span className="line-clamp-2 text-[11px] leading-tight studio-muted">
                  {sample.name}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
