import { useCallback, useEffect, useRef } from 'react';
import type { PreferredWorkflow } from '../packages/shared/src/workflowCatalog';
import { resolveRecipeAlias, type RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';

export function usePreferredWorkflow(
  preferred: PreferredWorkflow | undefined,
  navigateToDefault: () => void,
  navigateToRecipe: (id: Exclude<RecipeId, null>, aliasId?: RecipeAliasId | null) => void,
) {
  const waiting = useRef(!window.location.hash);
  const initialHash = useRef(window.location.hash);
  const latest = useRef(preferred);
  latest.current = preferred;
  const open = useCallback(() => {
    const id = latest.current;
    if (!id) {
      waiting.current = true;
      initialHash.current = window.location.hash;
      return;
    }
    waiting.current = false;
    if (id === 'default') navigateToDefault();
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
