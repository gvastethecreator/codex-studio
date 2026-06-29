import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

import type { CameraAnglesRecipe as CameraAnglesRecipeComponent } from './recipes/CameraAnglesRecipe';
import type { CharacterLabRecipe as CharacterLabRecipeComponent } from './recipes/CharacterLabRecipe';
import type { CharacterSheetRecipe as CharacterSheetRecipeComponent } from './recipes/CharacterSheetRecipe';
import type { CinematicRecipe as CinematicRecipeComponent } from './recipes/CinematicRecipe';
import type { RemasterRecipe as RemasterRecipeComponent } from './recipes/RemasterRecipe';
import type { SpritesheetRecipe as SpritesheetRecipeComponent } from './recipes/SpritesheetRecipe';
import type { StylesRecipe as StylesRecipeComponent } from './recipes/StylesRecipe';
import type { TimelineRecipe as TimelineRecipeComponent } from './recipes/TimelineRecipe';
import type {
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  Attachment,
  RecipeId,
} from '../types';
import type { RecipeAliasId } from '../lib/recipeAliases';
import { LazySurfaceFallback } from './ui/LazySurfaceFallback';

type CameraAnglesRecipeProps = React.ComponentProps<typeof CameraAnglesRecipeComponent>;
type CharacterLabRecipeProps = React.ComponentProps<typeof CharacterLabRecipeComponent>;
type CharacterSheetRecipeProps = React.ComponentProps<typeof CharacterSheetRecipeComponent>;
type CinematicRecipeProps = React.ComponentProps<typeof CinematicRecipeComponent>;
type RemasterRecipeProps = React.ComponentProps<typeof RemasterRecipeComponent>;
type SpritesheetRecipeProps = React.ComponentProps<typeof SpritesheetRecipeComponent>;
type StylesRecipeProps = React.ComponentProps<typeof StylesRecipeComponent>;
type TimelineRecipeProps = React.ComponentProps<typeof TimelineRecipeComponent>;

function createPreloadableRecipe<TProps>(
  loader: () => Promise<{ default: React.ComponentType<TProps> }>,
) {
  let loadedComponent: React.ComponentType<TProps> | null = null;
  let loadingPromise: Promise<{ default: React.ComponentType<TProps> }> | null = null;

  const load = () => {
    if (loadedComponent) return Promise.resolve({ default: loadedComponent });

    loadingPromise ??= loader().then((module) => {
      loadedComponent = module.default;
      return module;
    });

    return loadingPromise;
  };

  return {
    Component: React.lazy(load),
    getLoaded: () => loadedComponent,
    load,
  };
}

const remasterRecipe = createPreloadableRecipe<RemasterRecipeProps>(() =>
  import('./recipes/RemasterRecipe').then((module) => ({ default: module.RemasterRecipe })),
);
const spritesheetRecipe = createPreloadableRecipe<SpritesheetRecipeProps>(() =>
  import('./recipes/SpritesheetRecipe').then((module) => ({ default: module.SpritesheetRecipe })),
);
const cinematicRecipe = createPreloadableRecipe<CinematicRecipeProps>(() =>
  import('./recipes/CinematicRecipe').then((module) => ({ default: module.CinematicRecipe })),
);
const characterSheetRecipe = createPreloadableRecipe<CharacterSheetRecipeProps>(() =>
  import('./recipes/CharacterSheetRecipe').then((module) => ({
    default: module.CharacterSheetRecipe,
  })),
);
const characterLabRecipe = createPreloadableRecipe<CharacterLabRecipeProps>(() =>
  import('./recipes/CharacterLabRecipe').then((module) => ({
    default: module.CharacterLabRecipe,
  })),
);
const stylesRecipe = createPreloadableRecipe<StylesRecipeProps>(() =>
  import('./recipes/StylesRecipe').then((module) => ({ default: module.StylesRecipe })),
);
const cameraAnglesRecipe = createPreloadableRecipe<CameraAnglesRecipeProps>(() =>
  import('./recipes/CameraAnglesRecipe').then((module) => ({
    default: module.CameraAnglesRecipe,
  })),
);
const timelineRecipe = createPreloadableRecipe<TimelineRecipeProps>(() =>
  import('./recipes/TimelineRecipe').then((module) => ({ default: module.TimelineRecipe })),
);

const RemasterRecipe = remasterRecipe.Component;
const SpritesheetRecipe = spritesheetRecipe.Component;
const CinematicRecipe = cinematicRecipe.Component;
const CharacterSheetRecipe = characterSheetRecipe.Component;
const CharacterLabRecipe = characterLabRecipe.Component;
const StylesRecipe = stylesRecipe.Component;
const CameraAnglesRecipe = cameraAnglesRecipe.Component;
const TimelineRecipe = timelineRecipe.Component;

const RECIPE_PRELOADERS = {
  styles: stylesRecipe.load,
  remaster: remasterRecipe.load,
  camera: cameraAnglesRecipe.load,
  timeline: timelineRecipe.load,
  spritesheet: spritesheetRecipe.load,
  cinematic: cinematicRecipe.load,
  character: characterSheetRecipe.load,
  'character-lab': characterLabRecipe.load,
} satisfies Record<Exclude<RecipeId, null>, () => Promise<unknown>>;

export function preloadRecipeComponent(recipeId: RecipeId | null) {
  if (!recipeId) return Promise.resolve();

  return RECIPE_PRELOADERS[recipeId]();
}

export function preloadAllRecipeComponents() {
  return Promise.all(Object.values(RECIPE_PRELOADERS).map((preload) => preload())).then(() => {});
}

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
    options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
  ) => void;
  isGenerating: boolean;
  imagesWithConfig: GeneratedImageWithConfig[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
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
}) => {
  if (!activeRecipe) return null;

  const LoadedStylesRecipe = stylesRecipe.getLoaded() ?? StylesRecipe;
  const LoadedRemasterRecipe = remasterRecipe.getLoaded() ?? RemasterRecipe;
  const LoadedCameraAnglesRecipe = cameraAnglesRecipe.getLoaded() ?? CameraAnglesRecipe;
  const LoadedTimelineRecipe = timelineRecipe.getLoaded() ?? TimelineRecipe;
  const LoadedSpritesheetRecipe = spritesheetRecipe.getLoaded() ?? SpritesheetRecipe;
  const LoadedCinematicRecipe = cinematicRecipe.getLoaded() ?? CinematicRecipe;
  const LoadedCharacterSheetRecipe = characterSheetRecipe.getLoaded() ?? CharacterSheetRecipe;
  const LoadedCharacterLabRecipe = characterLabRecipe.getLoaded() ?? CharacterLabRecipe;

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
        {activeRecipe === 'styles' && (
          <LoadedStylesRecipe
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
