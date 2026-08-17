import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type {
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  Attachment,
  RecipeId,
} from '../types';
import type { GenerationProviderId } from '../packages/shared/src';
import type { RecipeAliasId } from '../lib/recipeAliases';
import { LazySurfaceFallback } from './ui/LazySurfaceFallback';
import {
  AnimationSequenceRecipe,
  CameraAnglesRecipe,
  CharacterLabRecipe,
  CharacterSheetRecipe,
  CinematicRecipe,
  RemasterRecipe,
  SpriteAtlasRecipe,
  SpritesheetRecipe,
  StylesRecipe,
  TimelineRecipe,
} from '../lib/recipeRouteModules';

interface RecipeRouterProps {
  activeRecipe: RecipeId | null;
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

export const RecipeRouter: React.FC<RecipeRouterProps> = ({
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
  activeProviderId = 'codex',
  grokCanExecute = false,
}) => {
  if (!activeRecipe) return null;

  const LoadedStylesRecipe = StylesRecipe;
  const LoadedRemasterRecipe = RemasterRecipe;
  const LoadedCameraAnglesRecipe = CameraAnglesRecipe;
  const LoadedTimelineRecipe = TimelineRecipe;
  const LoadedSpritesheetRecipe = SpritesheetRecipe;
  const LoadedSpriteAtlasRecipe = SpriteAtlasRecipe;
  const LoadedCinematicRecipe = CinematicRecipe;
  const LoadedCharacterSheetRecipe = CharacterSheetRecipe;
  const LoadedCharacterLabRecipe = CharacterLabRecipe;
  const LoadedAnimationSequenceRecipe = AnimationSequenceRecipe;

  return (
    <ErrorBoundary fallbackMessage="A critical error occurred while rendering this recipe.">
      <React.Suspense
        fallback={
          <LazySurfaceFallback
            label="Loading recipe"
            className="grid h-full min-h-[420px] place-items-center bg-transparent text-zinc-500"
          />
        }
      >
        {activeRecipe === 'animation-sequence' && (
          <LoadedAnimationSequenceRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            onSelectImage={openModal}
          />
        )}
        {activeRecipe === 'styles' && (
          <LoadedStylesRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            activeProviderId={activeProviderId}
            grokCanExecute={grokCanExecute}
          />
        )}
        {activeRecipe === 'remaster' && (
          <LoadedRemasterRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'camera' && (
          <LoadedCameraAnglesRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={(prompt) => handleGenerate(prompt, undefined, { preventModal: true })}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            onSelectImage={openModal}
          />
        )}
        {activeRecipe === 'timeline' && (
          <LoadedTimelineRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={(prompt) => handleGenerate(prompt, undefined, { preventModal: true })}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            onSelectImage={(img) => handleAddToContext(img)}
          />
        )}
        {activeRecipe === 'spritesheet' && (
          <LoadedSpritesheetRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'sprite-atlas' && (
          <LoadedSpriteAtlasRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'cinematic' && (
          <LoadedCinematicRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'character' && (
          <LoadedCharacterSheetRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'character-lab' && (
          <LoadedCharacterLabRecipe
            recipeAliasId={activeRecipeAliasId}
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            onSelectImage={openModal}
            onUseAsSource={handleAddToContext}
          />
        )}
      </React.Suspense>
    </ErrorBoundary>
  );
};
