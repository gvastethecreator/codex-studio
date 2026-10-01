import { useCallback, useEffect, useRef } from 'react';
import type { PreferredWorkflow } from '../packages/shared/src/workflowCatalog';
import { resolveRecipeAlias, type RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';
import { isWorkflowEnabled } from '../lib/workflowModuleState';

export function usePreferredWorkflow(
  preferred: PreferredWorkflow | undefined,
  navigateToDefault: () => void,
  navigateToRecipe: (id: Exclude<RecipeId, null>, aliasId?: RecipeAliasId | null) => void,
  hasInitialLibraryLink: boolean,
) {
  const waiting = useRef(!window.location.hash && !hasInitialLibraryLink);
  const initialHash = useRef(window.location.hash);
  const latest = useRef(preferred);
  // Runs before the effect below that calls open(), so open() reads the current preference.
  useEffect(() => {
    latest.current = preferred;
  }, [preferred]);
  const open = useCallback(() => {
    const id = latest.current;
    if (!id) {
      waiting.current = true;
      initialHash.current = window.location.hash;
      return;
    }
    waiting.current = false;
    // A preferred workflow whose module is turned off falls back to Create.
    if (id === 'default' || !isWorkflowEnabled(id)) navigateToDefault();
    else {
      const alias = resolveRecipeAlias(id);
      navigateToRecipe(alias?.targetRecipeId ?? (id as Exclude<RecipeId, null>), alias?.id);
    }
  }, [navigateToDefault, navigateToRecipe]);
  useEffect(() => {
    const cancel = () => {
      waiting.current = false;
    };
    window.addEventListener('studio-navigation', cancel);
    return () => window.removeEventListener('studio-navigation', cancel);
  }, []);
  useEffect(() => {
    if (preferred && waiting.current && window.location.hash === initialHash.current) open();
  }, [preferred, open]);
  return open;
}
