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
import { findWorkflowModuleForRecipe } from '../packages/shared/src/workflowModules';
import { isRecipeEnabled } from '../lib/workflowModuleState';
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
  workspaceId?: string;
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
    options?: {
      preventModal?: boolean;
      useCurrentAttachments?: boolean;
      onJobCreated?: (job: import('../packages/shared/src/types').Job) => void;
    },
  ) => void;
  isGenerating: boolean;
  imagesWithConfig: GeneratedImageWithConfig[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
  activeProviderId?: GenerationProviderId;
  grokCanExecute?: boolean;
  intentionalStylesV1?: boolean;
}

export const RecipeRouter: React.FC<RecipeRouterProps> = ({
  activeRecipe,
  activeRecipeAliasId = null,
  workspaceId,
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
  intentionalStylesV1 = false,
}) => {
  // A turned-off workflow module never loads its code; say how to turn it back on.
  if (!isRecipeEnabled(activeRecipe)) {
    const workflowModule = findWorkflowModuleForRecipe(activeRecipe);
    return (
      <div
        role="status"
        className="grid h-full min-h-[420px] place-items-center p-6 text-center text-[color:var(--wb-muted)]"
      >
        <div className="grid max-w-sm gap-2">
          <strong className="text-sm text-[color:var(--wb-ink)]">
            {workflowModule?.title ?? activeRecipe} is turned off
          </strong>
          <span className="text-xs">
            Turn it on in Settings, Extensions, then reload Studio. Its jobs and images stay in your
            library.
          </span>
        </div>
      </div>
    );
  }

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
            className="grid h-full min-h-[420px] place-items-center bg-transparent text-[color:var(--wb-muted)]"
          />
        }
      >
        {activeRecipe === 'animation-sequence' && (
          <LoadedAnimationSequenceRecipe
            workspaceId={workspaceId}
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            images={imagesWithConfig}
            onSelectImage={openModal}
          />
        )}
        {(!activeRecipe || activeRecipe === 'styles') && (
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
            intentionalStylesV1={intentionalStylesV1}
            onSelectImage={openModal}
          />
        )}
        {activeRecipe === 'remaster' && (
          <LoadedRemasterRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'camera' && (
          <LoadedCameraAnglesRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            isGenerating={isGenerating}
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
            workspaceId={workspaceId}
            images={imagesWithConfig}
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            activeProviderId={activeProviderId}
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
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'character-lab' && (
          <LoadedCharacterLabRecipe
            recipeAliasId={activeRecipeAliasId}
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
      </React.Suspense>
    </ErrorBoundary>
  );
};
