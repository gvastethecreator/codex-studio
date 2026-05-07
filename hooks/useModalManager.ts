import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { GeneratedImageWithConfig, RecipeId } from '../types';
import { isGlobalTransitioning, setIsGlobalTransitioning } from '../utils/transitionUtils';

export const useModalManager = (activeRecipe: RecipeId = null) => {
  const [modalImage, setModalImage] = useState<GeneratedImageWithConfig | null>(null);
  const [activeCarouselId, setActiveCarouselId] = useState<string | null>(null);
  const [transitioningImageId, setTransitioningImageId] = useState<string | null>(null);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  const openModal = useCallback((image: GeneratedImageWithConfig) => {
    window.location.hash = 'modal';

    const update = () => {
      setModalImage(image);
      setActiveCarouselId(image.id);
      setTransitioningImageId(null);
    };

    if (
      isGlobalTransitioning ||
      isTransitioningRef.current ||
      !document.startViewTransition ||
      document.visibilityState !== 'visible'
    ) {
      update();
      return;
    }

    isTransitioningRef.current = true;
    setIsGlobalTransitioning(true);
    setIsViewTransitioning(true);
    document.documentElement.dataset.transitionType = 'open-modal';

    // Set the transitioning ID *before* the transition starts to apply the view-transition-name CSS
    flushSync(() => {
      setTransitioningImageId(image.id);
    });

    const transition = document.startViewTransition(() => {
      flushSync(update);
    });

    transition.ready.catch(() => {});
    transition.finished.catch(() => {});

    transition.finished.finally(() => {
      isTransitioningRef.current = false;
      setIsGlobalTransitioning(false);
      setIsViewTransitioning(false);
      document.documentElement.removeAttribute('data-transition-type');
      setTransitioningImageId(null);
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!modalImage) return;

    if (window.location.hash === '#modal') {
      const newHash = activeRecipe ? `#/recipe/${activeRecipe}` : '';
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search + newHash,
      );
    }

    const update = () => {
      setModalImage(null);
      // We keep transitioningImageId momentarily to allow the exit transition
      setTransitioningImageId(activeCarouselId);
      setActiveCarouselId(null);
    };

    if (
      isGlobalTransitioning ||
      isTransitioningRef.current ||
      !document.startViewTransition ||
      document.visibilityState !== 'visible'
    ) {
      update();
      return;
    }

    isTransitioningRef.current = true;
    setIsGlobalTransitioning(true);
    setIsViewTransitioning(true);
    document.documentElement.dataset.transitionType = 'close-modal';

    const transition = document.startViewTransition(() => {
      flushSync(update);
    });

    transition.ready.catch(() => {});
    transition.finished.catch(() => {});

    transition.finished.finally(() => {
      isTransitioningRef.current = false;
      setIsGlobalTransitioning(false);
      setIsViewTransitioning(false);
      setTransitioningImageId(null);
      setActiveCarouselId(null);
      document.documentElement.removeAttribute('data-transition-type');
    });
  }, [modalImage, activeCarouselId, activeRecipe]);

  return {
    modalImage,
    activeCarouselId,
    setActiveCarouselId,
    transitioningImageId,
    openModal,
    closeModal,
    isModalOpen: !!modalImage,
    setModalImage, // Exposed for specific direct updates if needed (e.g. generation finish)
  };
};
