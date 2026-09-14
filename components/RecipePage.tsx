import React, { useState } from 'react';
import { RecipeResultPreview } from './recipes/RecipeResultPreview';
import type {
  Attachment,
  GeneratedImageWithConfig,
  ImageGenerationConfig,
  RecipeId,
} from '../types';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { GenerationProviderId } from '../packages/shared/src';
import { RecipeRouter } from './RecipeRouter';

export interface RecipePageProps {
  activeRecipe: RecipeId;
  activeRecipeAliasId?: RecipeAliasId | null;
  generationConfig: ImageGenerationConfig;
  updateGenerationConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  handlePastedFiles: (files: File[]) => void;
  handleGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: { preventModal?: boolean; useCurrentAttachments?: boolean },
  ) => void;
  isGenerating: boolean;
  imagesWithConfig: GeneratedImageWithConfig[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  activeProviderId?: GenerationProviderId;
  grokCanExecute?: boolean;
}

export type RecipePageRuntimeProps = Omit<
  RecipePageProps,
  | 'activeRecipe'
  | 'activeRecipeAliasId'
  | 'generationConfig'
  | 'updateGenerationConfig'
  | 'updateAttachment'
  | 'handlePastedFiles'
  | 'handleAddToContext'
>;

export const RecipePage: React.FC<RecipePageProps> = ({
  activeRecipe,
  activeRecipeAliasId = null,
  generationConfig,
  updateGenerationConfig,
  updateAttachment,
  handlePastedFiles,
  handleGenerate,
  isGenerating,
  imagesWithConfig,
  openModal,
  handleAddToContext,
  activeProviderId,
  grokCanExecute,
}) => {
  const [showResults, setShowResults] = useState(false);
  const previewOnly = activeRecipe === 'remaster' || activeRecipe === 'character';
  const results = imagesWithConfig.filter((image) => image.config.recipeId === activeRecipe);
  if (activeRecipe === 'styles')
    return (
      <RecipeRouter
        activeRecipe={activeRecipe}
        activeRecipeAliasId={activeRecipeAliasId}
        generationConfig={generationConfig}
        updateGenerationConfig={updateGenerationConfig}
        updateAttachment={updateAttachment}
        handlePastedFiles={handlePastedFiles}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        imagesWithConfig={imagesWithConfig}
        openModal={openModal}
        handleAddToContext={handleAddToContext}
        activeProviderId={activeProviderId}
        grokCanExecute={grokCanExecute}
      />
    );
  return (
    <div className="flex h-full min-h-0 flex-col">
      {!previewOnly && (
        <div
          className="flex shrink-0 items-center gap-3 px-4 py-2 text-sm"
          aria-label="Recipe preview mode"
        >
          <button type="button" aria-pressed={!showResults} onClick={() => setShowResults(false)}>
            Workspace
          </button>
          <button type="button" aria-pressed={showResults} onClick={() => setShowResults(true)}>
            Results ({results.length})
          </button>
        </div>
      )}
      {(showResults || previewOnly) && (
        <RecipeResultPreview
          images={results}
          reference={generationConfig.attachments[0]}
          onOpen={openModal}
        />
      )}
      <div
        className="min-h-0 flex-1"
        style={showResults || previewOnly ? { display: 'none' } : undefined}
      >
        <RecipeRouter
          activeRecipe={activeRecipe}
          activeRecipeAliasId={activeRecipeAliasId}
          generationConfig={generationConfig}
          updateGenerationConfig={updateGenerationConfig}
          updateAttachment={updateAttachment}
          handlePastedFiles={handlePastedFiles}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
          imagesWithConfig={imagesWithConfig}
          openModal={openModal}
          handleAddToContext={handleAddToContext}
          activeProviderId={activeProviderId}
          grokCanExecute={grokCanExecute}
        />
      </div>
    </div>
  );
};
