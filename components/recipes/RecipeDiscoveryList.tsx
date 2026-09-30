import React from 'react';
import { ArrowRight } from 'iconoir-react';
import type { RecipeAliasId } from '../../lib/recipeAliases';
import type { RecipeCatalogDisplayEntry } from '../../lib/recipeCatalog';
import { RECIPE_CARD_IMAGES } from '../../lib/recipeCardCatalog';
import {
  createRecipesGridProjection,
  groupRecipeDiscoveryEntries,
} from '../../lib/recipeDiscoveryProjection';
import type { RecipeId } from '../../types';

export interface RecipeDiscoveryListProps {
  entries?: RecipeCatalogDisplayEntry[];
  density?: 'page' | 'compact';
  selectedId?: string;
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
  onPreviewRecipe: (id: RecipeId) => void;
  onSelectDefault?: () => void;
}

export const RecipeDiscoveryList: React.FC<RecipeDiscoveryListProps> = ({
  entries,
  density = 'page',
  selectedId,
  onSelectRecipe,
  onPreviewRecipe,
  onSelectDefault,
}) => {
  const recipeDiscovery = React.useMemo(
    () => (entries ? { entries } : createRecipesGridProjection()),
    [entries],
  );
  const isCompact = density === 'compact';

  return (
    <div className={isCompact ? 'create-workflow-options' : 'grid gap-2'}>
      {groupRecipeDiscoveryEntries(recipeDiscovery.entries).map((group) => (
        <div
          key={group.label ?? group.entries[0].id}
          className={isCompact ? 'grid min-w-0 gap-1' : 'grid min-w-0 gap-2'}
          role={group.label ? 'group' : undefined}
          aria-label={group.label ?? undefined}
        >
          {group.label && (
            <div
              className={
                isCompact
                  ? 'create-popover-title'
                  : 'mt-4 mb-2 text-xs font-semibold text-[color:var(--wb-muted)]'
              }
            >
              {group.label}
            </div>
          )}
          {group.id === 'create' && onSelectDefault && (
            <button
              type="button"
              role={isCompact ? 'option' : undefined}
              aria-label="Default"
              aria-selected={isCompact ? !selectedId || selectedId === 'default' : undefined}
              tabIndex={isCompact ? -1 : undefined}
              className={isCompact ? 'create-workflow-option' : 'studio-control text-left'}
              onClick={onSelectDefault}
            >
              <span className="create-workflow-option-text">
                <strong>Default</strong>
                <small className="block">Create or edit with a prompt</small>
              </span>
            </button>
          )}
          {group.entries.map((recipe) => {
            const image = RECIPE_CARD_IMAGES[recipe.cardImageKey];
            const title =
              recipe.id === 'character'
                ? 'Character Sheet'
                : recipe.id === 'character-lab'
                  ? 'Character Lab (all modes)'
                  : recipe.title;
            return (
              <button
                key={recipe.id}
                type="button"
                role={isCompact ? 'option' : undefined}
                aria-selected={isCompact ? recipe.id === selectedId : undefined}
                tabIndex={isCompact ? -1 : undefined}
                aria-label={`Open ${title.toLowerCase()}`}
                onClick={() => onSelectRecipe(recipe.targetRecipeId, recipe.routeAliasId)}
                onFocus={() => onPreviewRecipe(recipe.targetRecipeId)}
                onPointerEnter={() => onPreviewRecipe(recipe.targetRecipeId)}
                className={
                  isCompact
                    ? 'create-workflow-option'
                    : 'flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.035] p-2 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-accent-400'
                }
              >
                {image && (
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={isCompact ? '32px' : '48px'}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={
                      isCompact
                        ? 'create-workflow-option-thumbnail'
                        : 'size-12 shrink-0 rounded-lg object-cover'
                    }
                  />
                )}
                <span className={isCompact ? 'create-workflow-option-text' : 'min-w-0 flex-1'}>
                  <span className="block truncate text-sm font-semibold capitalize">{title}</span>
                  <span className="mt-0.5 block truncate text-xs text-[color:var(--wb-muted)]">
                    {recipe.description}
                  </span>
                </span>
                <ArrowRight
                  width={16}
                  height={16}
                  className={
                    isCompact
                      ? 'create-workflow-option-arrow'
                      : 'shrink-0 text-[color:var(--wb-muted)]'
                  }
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
