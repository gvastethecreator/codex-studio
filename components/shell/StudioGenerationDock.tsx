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

export type GenerationToolbarLayout = 'dock' | 'rail';

export interface StudioGenerationDockProps {
  isModalOpen: boolean;
  isUiChromeSuppressed: boolean;
  currentView: AppPageView;
  activeRecipe: RecipeId | null;
  isDragging: boolean;
  toolbarArgs: GenerationToolbarRuntimeArgs;
  layout?: GenerationToolbarLayout;
}

function ConnectedGenerationToolbar({
  activeRecipe,
  currentView,
  toolbarArgs,
  layout = 'dock',
}: Pick<StudioGenerationDockProps, 'activeRecipe' | 'currentView' | 'toolbarArgs' | 'layout'>) {
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
      layout={layout}
      activeRecipe={activeRecipe}
      mode={
        ['animation-sequence', 'sprite-atlas', 'character-lab'].includes(activeRecipe ?? '')
          ? 'context-only'
          : 'full'
      }
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
  layout = 'dock',
}) => {
  const isVisible =
    !isModalOpen && !isUiChromeSuppressed && (currentView === 'recipes' || !!activeRecipe);

  if (!isVisible) {
    return null;
  }

  const toolbar = (
    <ConnectedGenerationToolbar
      activeRecipe={activeRecipe}
      currentView={currentView}
      toolbarArgs={toolbarArgs}
      layout={layout}
    />
  );

  if (layout === 'rail') {
    return (
      <div className="create-tool-dock relative z-30 flex min-h-0 flex-1 flex-col">
        <DropZoneOverlay isVisible={isDragging} />
        {toolbar}
      </div>
    );
  }

  return (
    <BottomToolbar className="w-full relative z-30 shrink-0">
      <DropZoneOverlay isVisible={isDragging} />
      {toolbar}
    </BottomToolbar>
  );
};

export const StudioGenerationDock = React.memo(StudioGenerationDockFn);
