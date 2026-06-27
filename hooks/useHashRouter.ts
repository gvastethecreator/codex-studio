import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecipeId } from '../types';
import {
  resolveRecipeAlias,
  resolveRecipeAliasHashSegment,
  resolveRecipeRouteHashSegment,
  type RecipeAliasId,
} from '../lib/recipeAliases';

export type AppPageView = 'studio' | 'recipes' | 'recipe';
export type AppOverlayView = 'none' | 'editor' | 'modal';
export type StudioRouteTransition = 'forward' | 'back' | 'neutral';

export interface HashRouterState {
  view: AppPageView;
  activeRecipeId: RecipeId;
  activeRecipeAliasId: RecipeAliasId | null;
  overlay: AppOverlayView;
}

const DEFAULT_ROUTE: HashRouterState = {
  view: 'studio',
  activeRecipeId: null,
  activeRecipeAliasId: null,
  overlay: 'none',
};

export function areHashRouterStatesEqual(left: HashRouterState, right: HashRouterState) {
  return (
    left.view === right.view &&
    left.activeRecipeId === right.activeRecipeId &&
    left.activeRecipeAliasId === right.activeRecipeAliasId &&
    left.overlay === right.overlay
  );
}

function getPageDepth(route: HashRouterState) {
  if (route.view === 'studio') return 0;
  if (route.view === 'recipes') return 1;
  return 2;
}

function getPageKey(route: HashRouterState) {
  if (route.view === 'recipe' && route.activeRecipeId) {
    return `recipe-${route.activeRecipeAliasId ?? route.activeRecipeId}`;
  }

  return route.view;
}

export function resolveHashRouterTransition(
  previous: HashRouterState,
  next: HashRouterState,
): StudioRouteTransition | undefined {
  if (getPageKey(previous) === getPageKey(next)) {
    return undefined;
  }

  const previousDepth = getPageDepth(previous);
  const nextDepth = getPageDepth(next);

  if (nextDepth > previousDepth) return 'forward';
  if (nextDepth < previousDepth) return 'back';
  return 'neutral';
}

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
      activeRecipeAliasId: null,
      overlay: 'none',
    };
  }

  if (hash.startsWith('recipe-')) {
    const routeSegment = hash.replace('recipe-', '');
    const alias = resolveRecipeAliasHashSegment(routeSegment);
    const recipeId = alias?.targetRecipeId ?? (routeSegment.split('/')[0] as RecipeId);

    return {
      view: 'recipe',
      activeRecipeId: recipeId,
      activeRecipeAliasId: alias?.id ?? null,
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
  const routeRef = useRef(route);

  const commitRoute = useCallback((nextRoute: HashRouterState, beforeCommit?: () => void) => {
    const applyRoute = () => {
      beforeCommit?.();

      if (areHashRouterStatesEqual(routeRef.current, nextRoute)) {
        return;
      }

      routeRef.current = nextRoute;
      setRoute(nextRoute);
    };

    applyRoute();
  }, []);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    const syncRoute = () => {
      commitRoute(resolveHashRouterState(routeRef.current, window.location.hash));
    };

    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, [commitRoute]);

  const navigateToStudio = useCallback(
    (beforeCommit?: () => void) => {
      commitRoute(DEFAULT_ROUTE, beforeCommit);
      replaceHash('');
    },
    [commitRoute],
  );

  const navigateToRecipes = useCallback(
    (beforeCommit?: () => void) => {
      commitRoute(
        {
          view: 'recipes',
          activeRecipeId: null,
          activeRecipeAliasId: null,
          overlay: 'none',
        },
        beforeCommit,
      );
      replaceHash('recipes');
    },
    [commitRoute],
  );

  const navigateToRecipe = useCallback(
    (
      recipeId: Exclude<RecipeId, null>,
      aliasIdOrBeforeCommit?: RecipeAliasId | null | (() => void),
      beforeCommitArg?: () => void,
    ) => {
      const aliasId =
        typeof aliasIdOrBeforeCommit === 'function' ? null : (aliasIdOrBeforeCommit ?? null);
      const beforeCommit =
        typeof aliasIdOrBeforeCommit === 'function' ? aliasIdOrBeforeCommit : beforeCommitArg;
      const alias = resolveRecipeAlias(aliasId);
      const activeRecipeAliasId = alias?.targetRecipeId === recipeId ? alias.id : null;

      commitRoute(
        {
          view: 'recipe',
          activeRecipeId: recipeId,
          activeRecipeAliasId,
          overlay: 'none',
        },
        beforeCommit,
      );
      replaceHash(`recipe-${resolveRecipeRouteHashSegment(recipeId, activeRecipeAliasId)}`);
    },
    [commitRoute],
  );

  const openEditor = useCallback(() => {
    commitRoute({
      ...routeRef.current,
      overlay: 'editor',
    });
    replaceHash('editor');
  }, [commitRoute]);

  const openModal = useCallback(() => {
    commitRoute({
      ...routeRef.current,
      overlay: 'modal',
    });
    replaceHash('modal');
  }, [commitRoute]);

  const closeOverlay = useCallback(() => {
    const currentRoute = routeRef.current;
    const nextRoute: HashRouterState = {
      ...currentRoute,
      overlay: 'none',
    };

    if (currentRoute.view === 'recipe' && currentRoute.activeRecipeId) {
      commitRoute(nextRoute);
      replaceHash(
        `recipe-${resolveRecipeRouteHashSegment(
          currentRoute.activeRecipeId,
          currentRoute.activeRecipeAliasId,
        )}`,
      );
      return;
    }

    if (currentRoute.view === 'recipes') {
      commitRoute(nextRoute);
      replaceHash('recipes');
      return;
    }

    commitRoute(DEFAULT_ROUTE);
    replaceHash('');
  }, [commitRoute]);

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
