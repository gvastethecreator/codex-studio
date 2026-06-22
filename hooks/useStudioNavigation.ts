import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Attachment, GeneratedImageWithConfig, RecipeId } from '../types';
import type { HashRouterState } from './useHashRouter';
import { startViewTransition } from '../utils/transitionUtils';

interface UseStudioNavigationProps {
  route: HashRouterState;
  recipe: {
    active: RecipeId;
    setActive: Dispatch<SetStateAction<RecipeId>>;
    navigateToRecipes: () => void;
    navigateToRecipe: (id: Exclude<RecipeId, null>) => void;
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
    navigateToStudio: () => void;
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
    startViewTransition(() => {
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
    });
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

  useEffect(() => {
    syncRouteState();
    return () => {};
  }, [syncRouteState]);

  const handleViewChange = useCallback(
    (newView: 'studio' | 'recipes') => {
      if (newView === 'studio') {
        navigateToStudio();
        return;
      }

      navigateToRecipes();
    },
    [navigateToRecipes, navigateToStudio],
  );

  const handleRecipeSelection = useCallback(
    (id: RecipeId) => {
      if (!id) return;
      navigateToRecipe(id);
    },
    [navigateToRecipe],
  );

  const handleCloseRecipe = useCallback(() => {
    navigateToRecipes();
  }, [navigateToRecipes]);

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
