import { useCallback, useLayoutEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { preloadStudioViewportRoute } from '../components/shell/StudioViewport';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { Attachment, GeneratedImageWithConfig, RecipeId } from '../types';
import type { HashRouterState } from './useHashRouter';

interface UseStudioNavigationProps {
  route: HashRouterState;
  recipe: {
    active: RecipeId;
    setActive: Dispatch<SetStateAction<RecipeId>>;
    navigateToRecipes: (beforeCommit?: () => void) => void;
    navigateToRecipe: (
      id: Exclude<RecipeId, null>,
      aliasId?: RecipeAliasId | null,
      beforeCommit?: () => void,
    ) => void;
  };
  modal: {
    isOpen: boolean;
    open: (image: GeneratedImageWithConfig) => void;
    close: () => void;
    openRoute: () => void;
  };
  editor: {
    image: Attachment | null;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    closeState: () => void;
  };
  shell: {
    navigateToStudio: (beforeCommit?: () => void) => void;
    closeOverlay: () => void;
  };
}

export function shouldCloseModalForOverlay(
  routeOverlay: HashRouterState['overlay'],
  isModalOpen: boolean,
) {
  return routeOverlay !== 'modal' && isModalOpen;
}

/**
 * Synchronize page navigation with recipe selection and overlay visibility so
 * the app shell consumes one navigation module instead of scattered effects.
 */
// react-doctor-disable-next-line react-doctor/no-event-handler -- route-to-UI synchronization is intentionally centralized in this hook
export function useStudioNavigation({
  route,
  recipe,
  modal,
  editor,
  shell,
}: UseStudioNavigationProps) {
  const {
    active: activeRecipe,
    setActive: setActiveRecipe,
    navigateToRecipes,
    navigateToRecipe,
  } = recipe;
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
    openRoute: openModalRoute,
  } = modal;
  const {
    image: imageToEdit,
    isOpen: isEditorOpen,
    setIsOpen: setIsEditorOpen,
    closeState: closeEditorState,
  } = editor;
  const { navigateToStudio, closeOverlay } = shell;

  const previousViewIndexRef = useRef(0);
  const currentView: 'studio' | 'recipes' = route.view === 'studio' ? 'studio' : 'recipes';
  const currentViewIndex = route.view === 'studio' ? 0 : route.view === 'recipes' ? 1 : 2;
  let direction = 0;
  if (currentViewIndex !== previousViewIndexRef.current) {
    direction = currentViewIndex > previousViewIndexRef.current ? 1 : -1;
    previousViewIndexRef.current = currentViewIndex;
  }

  const activeRecipeRef = useRef(activeRecipe);
  activeRecipeRef.current = activeRecipe;
  const imageToEditRef = useRef(imageToEdit);
  imageToEditRef.current = imageToEdit;
  const isEditorOpenRef = useRef(isEditorOpen);
  isEditorOpenRef.current = isEditorOpen;
  // react-doctor-disable-next-line react-doctor/no-event-handler
  const isModalOpenRef = useRef(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  const syncRouteState = useCallback(() => {
    if (route.view === 'recipe' && route.activeRecipeId) {
      if (activeRecipeRef.current !== route.activeRecipeId) {
        setActiveRecipe(route.activeRecipeId);
      }
    } else if (activeRecipeRef.current) {
      setActiveRecipe(null);
    }

    // react-doctor-disable-next-line react-doctor/no-event-handler
    if (route.overlay === 'editor') {
      if (!imageToEditRef.current) {
        closeOverlay();
        return;
      }
      setIsEditorOpen(true);
      return;
    }

    if (route.overlay === 'modal') {
      return;
    }

    if (shouldCloseModalForOverlay(route.overlay, isModalOpenRef.current)) {
      closeModal();
    }

    if (isEditorOpenRef.current) {
      closeEditorState();
    }
  }, [
    route.activeRecipeId,
    route.overlay,
    route.view,
    closeEditorState,
    closeModal,
    closeOverlay,
    setActiveRecipe,
    setIsEditorOpen,
  ]);

  useLayoutEffect(() => {
    syncRouteState();
    return () => {};
  }, [syncRouteState]);

  const handleViewChange = useCallback(
    (newView: 'studio' | 'recipes') => {
      const commitViewChange = () => {
        if (newView === 'studio') {
          navigateToStudio(() => setActiveRecipe(null));
          return;
        }

        navigateToRecipes(() => setActiveRecipe(null));
      };

      void preloadStudioViewportRoute(newView, null).then(commitViewChange, commitViewChange);
    },
    [navigateToRecipes, navigateToStudio, setActiveRecipe],
  );

  const handleRecipeSelection = useCallback(
    (id: RecipeId, aliasId?: RecipeAliasId | null) => {
      if (!id) return;

      const commitRecipeSelection = () => {
        navigateToRecipe(id, aliasId ?? null, () => setActiveRecipe(id));
      };

      void preloadStudioViewportRoute('recipe', id).then(
        commitRecipeSelection,
        commitRecipeSelection,
      );
    },
    [navigateToRecipe, setActiveRecipe],
  );

  const handleCloseRecipe = useCallback(() => {
    const commitCloseRecipe = () => {
      navigateToRecipes(() => setActiveRecipe(null));
    };

    void preloadStudioViewportRoute('recipes', null).then(commitCloseRecipe, commitCloseRecipe);
  }, [navigateToRecipes, setActiveRecipe]);

  const handleOpenModal = useCallback(
    (image: GeneratedImageWithConfig) => {
      openModal(image);
      openModalRoute();
    },
    [openModal, openModalRoute],
  );

  const handleCloseModal = useCallback(() => {
    closeModal();
    closeOverlay();
  }, [closeModal, closeOverlay]);

  return {
    direction,
    currentView,
    handleViewChange,
    handleRecipeSelection,
    handleCloseRecipe,
    handleOpenModal,
    handleCloseModal,
  };
}
