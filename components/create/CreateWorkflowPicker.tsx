import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconSitemap, IconSparkles } from '@tabler/icons-react';

import type { RecipeAliasId } from '../../lib/recipeAliases';
import { createRecipesGridProjection } from '../../lib/recipeDiscoveryProjection';
import { preloadRecipeComponent } from '../../lib/recipeRouteModules';
import { buildRecipeIntentPreloadPlan } from '../../lib/routePreloadBudget';
import { preloadStudioViewportSurface } from '../../lib/studioViewportRouteSurfaces';
import type { RecipeId } from '../../types';
import { RecipeDiscoveryList } from '../recipes/RecipeDiscoveryList';

export interface CreateWorkflowPickerProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe?: (id: RecipeId) => void;
  onSelectDefault?: () => void;
  selectedLabel?: string;
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
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const recipeDiscovery = useMemo(() => createRecipesGridProjection(), []);
  const isDefaultSelected = selectedLabel === 'Default';

  const handlePreviewRecipe = useCallback(
    (recipeId: RecipeId) => {
      preloadRecipeIntent(recipeId);
      onPreviewRecipe?.(recipeId);
    },
    [onPreviewRecipe],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <section className="create-workflow-block is-header" aria-label="Workflow">
      <div ref={rootRef} className="create-workflow-row">
        <button
          type="button"
          className="create-workflow-quiet-select studio-control"
          aria-label={`Workflow: ${selectedLabel}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="create-workflow-list"
          onClick={() => setOpen((value) => !value)}
        >
          <IconSitemap size={16} aria-hidden="true" />
          <span id="create-workflow-value">{selectedLabel}</span>
          <IconChevronDown
            size={14}
            className={`create-workflow-chevron${open ? ' is-open' : ''}`}
            aria-hidden="true"
          />
        </button>
        {open ? (
          <div
            id="create-workflow-list"
            role="listbox"
            aria-label="Workflows"
            className="create-workflow-popover custom-scrollbar"
          >
            <div className="create-popover-title">Workflow</div>
            <button
              type="button"
              role="option"
              aria-label="Default"
              aria-selected={isDefaultSelected}
              className="create-workflow-default"
              onClick={() => {
                setOpen(false);
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
              density="compact"
              onSelectRecipe={(id, aliasId) => {
                setOpen(false);
                onSelectRecipe(id, aliasId);
              }}
              onPreviewRecipe={handlePreviewRecipe}
            />
            <div className="create-popover-note">
              Default stays on this canvas. Recipes open their own workspace.
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
