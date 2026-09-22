import type { UseCatalogResult } from '../../hooks/useCatalogPage';
import { AnimatePresence } from '../../lib/gsapMotion';
import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type CanvasCompareChrome = {
  showReference: boolean;
  toggle: () => void;
} | null;

export const RecipeWorkbenchContext = createContext<{
  controls: HTMLElement | null;
  action: HTMLElement | null;
  overlay: HTMLElement | null;
  sidePanel: HTMLElement | null;
  compare: CanvasCompareChrome;
  setCompare: (compare: CanvasCompareChrome) => void;
  history?: UseCatalogResult;
  results?: React.ReactNode;
  latestResultId?: string;
}>({
  controls: null,
  action: null,
  overlay: null,
  sidePanel: null,
  compare: null,
  setCompare: () => {},
});

export function RecipeControls({ children }: { children: React.ReactNode }) {
  const { controls } = useContext(RecipeWorkbenchContext);
  return controls
    ? createPortal(<section className="recipe-controls">{children}</section>, controls)
    : children;
}

export function RecipePrimaryAction({ children }: { children: React.ReactNode }) {
  const { action } = useContext(RecipeWorkbenchContext);
  return action ? createPortal(children, action) : children;
}

export function RecipeOverlay({ children }: { children: React.ReactNode }) {
  const { overlay } = useContext(RecipeWorkbenchContext);
  return overlay ? createPortal(children, overlay) : children;
}

export function RecipeSidePanel({ children }: { children: React.ReactNode }) {
  const { sidePanel } = useContext(RecipeWorkbenchContext);
  return sidePanel ? createPortal(children, sidePanel) : null;
}

export function RecipeResults() {
  return useContext(RecipeWorkbenchContext).results ?? null;
}

/** Keep the editor mounted when viewing results so its local draft and canvas survive. */
export function RecipeEditor({ label, children }: { label: string; children: React.ReactNode }) {
  const { results, latestResultId } = useContext(RecipeWorkbenchContext);
  const [selected, setSelected] = useState<'editor' | 'results'>('editor');
  const previousResult = useRef(latestResultId);
  const id = useId();
  useEffect(() => {
    if (latestResultId && latestResultId !== previousResult.current) setSelected('results');
    previousResult.current = latestResultId;
  }, [latestResultId]);

  return (
    <div className="recipe-editor">
      <div className="recipe-stage-tabs" role="tablist" aria-label="Workflow view">
        {(['editor', 'results'] as const).map((view) => (
          <button
            key={view}
            type="button"
            role="tab"
            id={`${id}-${view}-tab`}
            aria-controls={`${id}-${view}`}
            aria-selected={selected === view}
            tabIndex={selected === view ? 0 : -1}
            onClick={() => setSelected(view)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 'editor'
                  : event.key === 'End'
                    ? 'results'
                    : view === 'editor'
                      ? 'results'
                      : 'editor';
              setSelected(next);
              document.getElementById(`${id}-${next}-tab`)?.focus();
            }}
          >
            {view === 'editor' ? label : 'Results'}
          </button>
        ))}
      </div>
      <div
        id={`${id}-editor`}
        role="tabpanel"
        aria-labelledby={`${id}-editor-tab`}
        className="recipe-editor-content"
        hidden={selected !== 'editor'}
      >
        {children}
      </div>
      <div
        id={`${id}-results`}
        role="tabpanel"
        aria-labelledby={`${id}-results-tab`}
        className="recipe-editor-content"
        hidden={selected !== 'results'}
      >
        {results}
      </div>
    </div>
  );
}

export function RecipeOptionsPanel({
  title,
  children,
  open: controlledOpen,
  onOpenChange,
  triggerRef: suppliedRef,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  const ownRef = useRef<HTMLButtonElement>(null);
  const triggerRef = suppliedRef ?? ownRef;
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, setOpen, triggerRef]);
  return (
    <>
      <RecipeControls>
        <button
          ref={triggerRef}
          type="button"
          className="recipe-options-toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {title}
        </button>
      </RecipeControls>
      <RecipeSidePanel>
        <AnimatePresence>
          {open && (
            <div
              ref={panelRef}
              id={id}
              role="dialog"
              aria-modal="false"
              aria-label={title}
              tabIndex={-1}
              className="studio-surface create-side-panel-dialog"
            >
              <div className="create-side-panel-head">
                <strong>{title}</strong>
                <button
                  type="button"
                  aria-label={`Close ${title.toLowerCase()}`}
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  ×
                </button>
              </div>
              <div className="create-side-panel-body custom-scrollbar">{children}</div>
            </div>
          )}
        </AnimatePresence>
      </RecipeSidePanel>
    </>
  );
}
