import { useCallback, useEffect, useState } from 'react';
import type { RecipeId } from '../types';

export type AppPageView = 'studio' | 'recipes' | 'recipe';
export type AppOverlayView = 'none' | 'editor' | 'modal';

export interface HashRouterState {
  view: AppPageView;
  activeRecipeId: RecipeId;
  overlay: AppOverlayView;
}

const DEFAULT_ROUTE: HashRouterState = {
  view: 'studio',
  activeRecipeId: null,
  overlay: 'none',
};

export function resolveHashRouterState(
  previous: HashRouterState,
  rawHash: string,
): HashRouterState {
  const hash = rawHash.replace(/^#/, '');

  if (!hash) {
    return DEFAULT_ROUTE;
  }

  if (hash === 'editor') {
    return { ...previous, overlay: 'editor' };
  }

  if (hash === 'modal') {
    return { ...previous, overlay: 'modal' };
  }

  if (hash === 'recipes') {
    return {
      view: 'recipes',
      activeRecipeId: null,
      overlay: 'none',
    };
  }

  if (hash.startsWith('recipe-')) {
    return {
      view: 'recipe',
      activeRecipeId: hash.replace('recipe-', '') as RecipeId,
      overlay: 'none',
    };
  }

  return DEFAULT_ROUTE;
}

function replaceHash(hash: string) {
  const target = hash ? `#${hash}` : '';
  const current = window.location.hash;
  if (current === target) {
    return;
  }

  if (!target) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }

  window.location.hash = hash;
}

export function useHashRouter() {
  const [route, setRoute] = useState<HashRouterState>(() =>
    resolveHashRouterState(DEFAULT_ROUTE, window.location.hash),
  );

  useEffect(() => {
    const syncRoute = () => {
      setRoute((previous) => resolveHashRouterState(previous, window.location.hash));
    };

    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const navigateToStudio = useCallback(() => {
    replaceHash('');
  }, []);

  const navigateToRecipes = useCallback(() => {
    replaceHash('recipes');
  }, []);

  const navigateToRecipe = useCallback((recipeId: Exclude<RecipeId, null>) => {
    replaceHash(`recipe-${recipeId}`);
  }, []);

  const openEditor = useCallback(() => {
    replaceHash('editor');
  }, []);

  const openModal = useCallback(() => {
    replaceHash('modal');
  }, []);

  const closeOverlay = useCallback(() => {
    if (route.view === 'recipe' && route.activeRecipeId) {
      replaceHash(`recipe-${route.activeRecipeId}`);
      return;
    }

    if (route.view === 'recipes') {
      replaceHash('recipes');
      return;
    }

    replaceHash('');
  }, [route.activeRecipeId, route.view]);

  return {
    route,
    navigateToStudio,
    navigateToRecipes,
    navigateToRecipe,
    openEditor,
    openModal,
    closeOverlay,
  };
}
