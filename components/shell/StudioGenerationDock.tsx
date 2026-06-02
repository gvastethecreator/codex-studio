import React from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';
import DropZoneOverlay from '../DropZoneOverlay';
import { Toolbar, type ToolbarProps } from '../Toolbar';
import { BottomToolbar } from '../ui/BottomToolbar';

interface StudioGenerationDockProps {
  isModalOpen: boolean;
  isUiChromeSuppressed: boolean;
  currentView: AppPageView;
  activeRecipe: RecipeId | null;
  isDragging: boolean;
  toolbarProps: ToolbarProps;
}

const StudioGenerationDockFn: React.FC<StudioGenerationDockProps> = ({
  isModalOpen,
  isUiChromeSuppressed,
  currentView,
  activeRecipe,
  isDragging,
  toolbarProps,
}) => {
  const isVisible =
    !isModalOpen && !isUiChromeSuppressed && (currentView === 'studio' || !!activeRecipe);

  if (!isVisible) {
    return null;
  }

  return (
    <BottomToolbar className="w-full relative z-30 shrink-0">
      <DropZoneOverlay isVisible={isDragging} />
      <Toolbar {...toolbarProps} interactionScope={`${currentView}:${activeRecipe ?? 'studio'}`} />
    </BottomToolbar>
  );
};

export const StudioGenerationDock = React.memo(StudioGenerationDockFn);
