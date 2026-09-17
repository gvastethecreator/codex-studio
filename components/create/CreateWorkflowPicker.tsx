import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconSparkles } from '@tabler/icons-react';

import type { RecipeAliasId } from '../../lib/recipeAliases';
import { createRecipesGridProjection } from '../../lib/recipeDiscoveryProjection';
import type { RecipeId } from '../../types';
import { RecipeDiscoveryList } from '../recipes/RecipeDiscoveryList';

export interface CreateWorkflowPickerProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
}

export const CreateWorkflowPicker: React.FC<CreateWorkflowPickerProps> = ({
  onSelectRecipe,
  onPreviewRecipe,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const recipeDiscovery = useMemo(() => createRecipesGridProjection(), []);

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
    <section className="create-workflow-block" aria-label="Workflow">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="create-workflow-trigger"
          aria-label="Workflow: Default"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="create-workflow-list"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="create-workflow-label">Workflow</span>
          <span className="create-workflow-title">Default</span>
          <IconChevronDown
            size={16}
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
            <button
              type="button"
              role="option"
              aria-label="Default"
              aria-selected="true"
              className="create-workflow-default"
              onClick={() => setOpen(false)}
            >
              <span className="create-workflow-default-icon" aria-hidden="true">
                <IconSparkles size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Default</span>
                <span className="mt-0.5 block truncate text-xs text-zinc-400">
                  Create or edit with a prompt
                </span>
              </span>
            </button>
            <RecipeDiscoveryList
              entries={recipeDiscovery.entries}
              density="compact"
              onSelectRecipe={(id, aliasId) => {
                setOpen(false);
                onSelectRecipe(id, aliasId);
              }}
              onPreviewRecipe={onPreviewRecipe}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};
