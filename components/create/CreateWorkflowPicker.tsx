import { AnimatePresence } from '../../lib/gsapMotion';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconSitemap, IconSparkles } from '@tabler/icons-react';

import type { RecipeAliasId } from '../../lib/recipeAliases';
import { createRecipeDiscoveryProjection } from '../../lib/recipeDiscoveryProjection';
import { preloadRecipeComponent } from '../../lib/recipeRouteModules';
import { buildRecipeIntentPreloadPlan } from '../../lib/routePreloadBudget';
import { preloadStudioViewportSurface } from '../../lib/studioViewportRouteSurfaces';
import type { RecipeId } from '../../types';
import { RecipeDiscoveryList } from '../recipes/RecipeDiscoveryList';
import Tooltip from '../Tooltip';

export interface CreateWorkflowPickerProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe?: (id: RecipeId) => void;
  onSelectDefault?: () => void;
  selectedLabel?: string;
  selectedId?: string | null;
}

function preloadRecipeIntent(recipeId: RecipeId) {
  const plan = buildRecipeIntentPreloadPlan(recipeId);
  for (const surface of plan.surfaces) {
    void preloadStudioViewportSurface(surface);
  }
  for (const id of plan.recipeIds) {
    void preloadRecipeComponent(id);
  }
}

export const CreateWorkflowPicker: React.FC<CreateWorkflowPickerProps> = ({
  onSelectRecipe,
  onPreviewRecipe,
  onSelectDefault,
  selectedLabel = 'Default',
  selectedId,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const recipeDiscovery = useMemo(() => createRecipeDiscoveryProjection(), []);
  const isDefaultSelected = selectedLabel === 'Default';
  const activeId =
    selectedId ??
    recipeDiscovery.entries.find(
      (entry) => entry.title.toLowerCase() === selectedLabel.toLowerCase(),
    )?.id;

  const handlePreviewRecipe = useCallback(
    (recipeId: RecipeId) => {
      preloadRecipeIntent(recipeId);
      onPreviewRecipe?.(recipeId);
    },
    [onPreviewRecipe],
  );

  useLayoutEffect(() => {
    if (!open) return;
    const updatePopoverPosition = () => {
      if (!rootRef.current || !popoverRef.current) return;
      popoverRef.current.style.setProperty(
        '--create-workflow-popover-top',
        `${rootRef.current.getBoundingClientRect().bottom + 7}px`,
      );
    };
    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    rootRef.current?.querySelector<HTMLElement>('[role=option][aria-selected=true]')?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup]')?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const closeAndFocus = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-haspopup]')?.focus();
  };

  return (
    <section className="create-workflow-block is-header" aria-label="Workflow">
      <div ref={rootRef} className="create-workflow-row">
        <Tooltip content="Workflow" position="bottom">
          <button
            type="button"
            className="create-workflow-quiet-select studio-control"
            aria-label={`Workflow: ${selectedLabel}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="create-workflow-list"
            onClick={() => setOpen((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            <IconSitemap size={16} aria-hidden="true" />
            <span id="create-workflow-value">{selectedLabel}</span>
            <IconChevronDown
              size={14}
              className={`create-workflow-chevron${open ? ' is-open' : ''}`}
              aria-hidden="true"
            />
          </button>
        </Tooltip>
        <AnimatePresence>
          {open ? (
            <div
              ref={popoverRef}
              id="create-workflow-list"
              role="listbox"
              aria-label="Workflows"
              className="create-workflow-popover custom-scrollbar"
              onKeyDown={(event) => {
                const options = Array.from(
                  event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=option]'),
                );
                const index = options.indexOf(document.activeElement as HTMLButtonElement);
                const last = options.length - 1;
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? last
                      : event.key === 'ArrowDown'
                        ? (index + 1) % options.length
                        : event.key === 'ArrowUp'
                          ? (index - 1 + options.length) % options.length
                          : null;
                if (next !== null) {
                  event.preventDefault();
                  options[next]?.focus();
                }
                if (event.key === 'Tab') setOpen(false);
              }}
            >
              <div className="create-popover-title">Workflow</div>
              <button
                type="button"
                role="option"
                aria-label="Default"
                aria-selected={isDefaultSelected}
                tabIndex={-1}
                className="create-workflow-default"
                onClick={() => {
                  closeAndFocus();
                  onSelectDefault?.();
                }}
              >
                <span className="create-workflow-default-icon" aria-hidden="true">
                  <IconSparkles size={14} />
                </span>
                <span className="create-workflow-option-copy">
                  <strong>Default</strong>
                  <small>Create or edit with a prompt</small>
                </span>
              </button>
              <RecipeDiscoveryList
                entries={recipeDiscovery.entries}
                selectedId={activeId}
                density="compact"
                onSelectRecipe={(id, aliasId) => {
                  closeAndFocus();
                  onSelectRecipe(id, aliasId);
                }}
                onPreviewRecipe={handlePreviewRecipe}
              />
              <div className="create-popover-note">Each workflow adds tools to Create.</div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
};
