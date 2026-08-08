import React from 'react';

import { useGenerationDraft } from '../../contexts/GenerationContext';
import {
  useGenerationToolbarConfig,
  type BuildGenerationToolbarPropsArgs,
} from '../../hooks/useGenerationToolbarConfig';
import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';
import DropZoneOverlay from '../DropZoneOverlay';
import { Toolbar } from '../Toolbar';
import { BottomToolbar } from '../ui/BottomToolbar';

export type GenerationToolbarRuntimeArgs = Omit<BuildGenerationToolbarPropsArgs, 'config'>;

interface StudioGenerationDockProps {
  isModalOpen: boolean;
  isUiChromeSuppressed: boolean;
  currentView: AppPageView;
  activeRecipe: RecipeId | null;
  isDragging: boolean;
  toolbarArgs: GenerationToolbarRuntimeArgs;
}

function ConnectedGenerationToolbar({
  activeRecipe,
  currentView,
  toolbarArgs,
}: Pick<StudioGenerationDockProps, 'activeRecipe' | 'currentView' | 'toolbarArgs'>) {
  const draft = useGenerationDraft();
  const toolbarProps = useGenerationToolbarConfig({
    ...toolbarArgs,
    config: {
      generationConfig: draft.generationConfig,
      updateConfig: draft.updateGenerationConfig,
      updateAttachment: draft.updateAttachment,
      onFileSelect: draft.handleFileSelect,
      onFilesDrop: draft.handlePastedFiles,
      onRemoveAttachment: draft.handleRemoveAttachment,
      maxAttachments: draft.maxAttachments,
      codexModelCatalog: draft.codexModelCatalog,
      isLoadingCodexModelCatalog: draft.isLoadingCodexModelCatalog,
      codexModelCatalogError: draft.codexModelCatalogError,
    },
  });

  return (
    <Toolbar
      {...toolbarProps}
      activeRecipe={activeRecipe}
      mode={activeRecipe === 'animation-sequence' ? 'context-only' : 'full'}
      interactionScope={`${currentView}:${activeRecipe ?? 'studio'}`}
    />
  );
}

const StudioGenerationDockFn: React.FC<StudioGenerationDockProps> = ({
  isModalOpen,
  isUiChromeSuppressed,
  currentView,
  activeRecipe,
  isDragging,
  toolbarArgs,
}) => {
  const isVisible =
    !isModalOpen && !isUiChromeSuppressed && (currentView === 'studio' || !!activeRecipe);

  if (!isVisible) {
    return null;
  }

  return (
    <BottomToolbar className="w-full relative z-30 shrink-0">
      <DropZoneOverlay isVisible={isDragging} />
      <ConnectedGenerationToolbar
        activeRecipe={activeRecipe}
        currentView={currentView}
        toolbarArgs={toolbarArgs}
      />
    </BottomToolbar>
  );
};

export const StudioGenerationDock = React.memo(StudioGenerationDockFn);
