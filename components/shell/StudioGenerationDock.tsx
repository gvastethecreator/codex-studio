import React from 'react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';
import DropZoneOverlay from '../DropZoneOverlay';
import { Toolbar, type ToolbarProps } from '../Toolbar';
import { BottomToolbar } from '../ui/BottomToolbar';

interface StudioGenerationDockProps {
    isModalOpen: boolean;
    currentView: AppPageView;
    activeRecipe: RecipeId | null;
    isDragging: boolean;
    toolbarProps: ToolbarProps;
}

export const StudioGenerationDock: React.FC<StudioGenerationDockProps> = ({
    isModalOpen,
    currentView,
    activeRecipe,
    isDragging,
    toolbarProps,
}) => {
    const isVisible = !isModalOpen && (currentView === 'studio' || !!activeRecipe);

    if (!isVisible) {
        return null;
    }

    return (
        <BottomToolbar className="w-full relative z-30 shrink-0">
            <DropZoneOverlay isVisible={isDragging} />
            <Toolbar {...toolbarProps} />
        </BottomToolbar>
    );
};
