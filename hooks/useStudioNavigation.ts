import { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Attachment, GeneratedImageWithConfig, RecipeId } from '../types';
import type { HashRouterState } from './useHashRouter';
import { startViewTransition } from '../utils/transitionUtils';

interface UseStudioNavigationProps {
  route: HashRouterState;
  activeRecipe: RecipeId;
  setActiveRecipe: Dispatch<SetStateAction<RecipeId>>;
  modalImage: GeneratedImageWithConfig | null;
  isModalOpen: boolean;
  openModal: (image: GeneratedImageWithConfig) => void;
  closeModal: () => void;
  imageToEdit: Attachment | null;
  isEditorOpen: boolean;
  setIsEditorOpen: Dispatch<SetStateAction<boolean>>;
  setImageToEdit: Dispatch<SetStateAction<Attachment | null>>;
  navigateToStudio: () => void;
  navigateToRecipes: () => void;
  navigateToRecipe: (id: Exclude<RecipeId, null>) => void;
  openModalRoute: () => void;
  closeOverlay: () => void;
}

/**
 * Synchronize page navigation with recipe selection and overlay visibility so
 * the app shell consumes one navigation module instead of scattered effects.
 */
export function useStudioNavigation({
  route,
  activeRecipe,
  setActiveRecipe,
  modalImage,
  isModalOpen,
  openModal,
  closeModal,
  imageToEdit,
  isEditorOpen,
  setIsEditorOpen,
  setImageToEdit,
  navigateToStudio,
  navigateToRecipes,
  navigateToRecipe,
  openModalRoute,
  closeOverlay,
}: UseStudioNavigationProps) {
  const [direction, setDirection] = useState(0);
  const previousViewIndexRef = useRef(0);

  useEffect(() => {
    const currentIndex = route.view === 'studio' ? 0 : route.view === 'recipes' ? 1 : 2;
    if (currentIndex !== previousViewIndexRef.current) {
      setDirection(currentIndex > previousViewIndexRef.current ? 1 : -1);
      previousViewIndexRef.current = currentIndex;
    }
  }, [route.view]);

  useEffect(() => {
    startViewTransition(() => {
      if (route.view === 'recipe' && route.activeRecipeId) {
        if (activeRecipe !== route.activeRecipeId) {
          setActiveRecipe(route.activeRecipeId);
        }
        return;
      }

      if (activeRecipe) {
        setActiveRecipe(null);
      }
    });
  }, [activeRecipe, route.activeRecipeId, route.view, setActiveRecipe]);

  useEffect(() => {
    startViewTransition(() => {
      if (route.overlay === 'editor') {
        if (!imageToEdit) {
          closeOverlay();
          return;
        }

        setIsEditorOpen(true);
        return;
      }

      if (route.overlay === 'modal') {
        if (!modalImage) {
          closeOverlay();
        }
        return;
      }

      if (isModalOpen) {
        closeModal();
      }

      if (isEditorOpen) {
        setIsEditorOpen(false);
        setImageToEdit(null);
      }
    });
  }, [
    closeModal,
    closeOverlay,
    imageToEdit,
    isEditorOpen,
    isModalOpen,
    modalImage,
    route.overlay,
    setImageToEdit,
    setIsEditorOpen,
  ]);

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
    currentView: route.view === 'studio' ? 'studio' : 'recipes',
    handleViewChange,
    handleRecipeSelection,
    handleCloseRecipe,
    handleOpenModal,
    handleCloseModal,
  };
}