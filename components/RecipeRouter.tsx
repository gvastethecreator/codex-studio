import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

import type {
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  Attachment,
  RecipeId,
} from '../types';

const RemasterRecipe = React.lazy(() =>
  import('./recipes/RemasterRecipe').then((module) => ({ default: module.RemasterRecipe })),
);
const SpritesheetRecipe = React.lazy(() =>
  import('./recipes/SpritesheetRecipe').then((module) => ({ default: module.SpritesheetRecipe })),
);
const CinematicRecipe = React.lazy(() =>
  import('./recipes/CinematicRecipe').then((module) => ({ default: module.CinematicRecipe })),
);
const CharacterSheetRecipe = React.lazy(() =>
  import('./recipes/CharacterSheetRecipe').then((module) => ({
    default: module.CharacterSheetRecipe,
  })),
);
const CharacterLabRecipe = React.lazy(() =>
  import('./recipes/CharacterLabRecipe').then((module) => ({
    default: module.CharacterLabRecipe,
  })),
);
const StylesRecipe = React.lazy(() =>
  import('./recipes/StylesRecipe').then((module) => ({ default: module.StylesRecipe })),
);
const CameraAnglesRecipe = React.lazy(() =>
  import('./recipes/CameraAnglesRecipe').then((module) => ({
    default: module.CameraAnglesRecipe,
  })),
);
const TimelineRecipe = React.lazy(() =>
  import('./recipes/TimelineRecipe').then((module) => ({ default: module.TimelineRecipe })),
);

interface RecipeRouterProps {
  activeRecipe: RecipeId | null;
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
    options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
  ) => void;
  isGenerating: boolean;
  imagesWithConfig: GeneratedImageWithConfig[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
}

const RecipeLoadingSurface: React.FC = () => (
  <div className="flex h-full min-h-[420px] items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
    Loading recipe
  </div>
);

export const RecipeRouter: React.FC<RecipeRouterProps> = ({
  activeRecipe,
  generationConfig,
  updateGenerationConfig,
  updateAttachment,
  handlePastedFiles,
  handleGenerate,
  isGenerating,
  imagesWithConfig,
  openModal,
  handleAddToContext,
}) => {
  if (!activeRecipe) return null;

  return (
    <ErrorBoundary fallbackMessage="A critical error occurred while rendering this recipe.">
      <React.Suspense fallback={<RecipeLoadingSurface />}>
        {activeRecipe === 'styles' && (
          <StylesRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            images={imagesWithConfig}
          />
        )}
        {activeRecipe === 'remaster' && (
          <RemasterRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'camera' && (
          <CameraAnglesRecipe
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
          <TimelineRecipe
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
          <SpritesheetRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'cinematic' && (
          <CinematicRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'character' && (
          <CharacterSheetRecipe
            config={generationConfig}
            updateConfig={updateGenerationConfig}
            updateAttachment={updateAttachment}
            onFileSelect={handlePastedFiles}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}
        {activeRecipe === 'character-lab' && (
          <CharacterLabRecipe
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
