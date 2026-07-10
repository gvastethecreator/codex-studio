import React from 'react';
import type { RecipeId } from '../types';
import type { CameraAnglesRecipe as CameraAnglesRecipeComponent } from '../components/recipes/CameraAnglesRecipe';
import type { CharacterLabRecipe as CharacterLabRecipeComponent } from '../components/recipes/CharacterLabRecipe';
import type { CharacterSheetRecipe as CharacterSheetRecipeComponent } from '../components/recipes/CharacterSheetRecipe';
import type { CinematicRecipe as CinematicRecipeComponent } from '../components/recipes/CinematicRecipe';
import type { AnimationSequenceRecipe as AnimationSequenceRecipeComponent } from '../components/recipes/AnimationSequenceRecipe';
import type { RemasterRecipe as RemasterRecipeComponent } from '../components/recipes/RemasterRecipe';
import type { SpriteAtlasRecipe as SpriteAtlasRecipeComponent } from '../components/recipes/SpriteAtlasRecipe';
import type { SpritesheetRecipe as SpritesheetRecipeComponent } from '../components/recipes/SpritesheetRecipe';
import type { StylesRecipe as StylesRecipeComponent } from '../components/recipes/StylesRecipe';
import type { TimelineRecipe as TimelineRecipeComponent } from '../components/recipes/TimelineRecipe';

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
  return { Component: React.lazy(load), load };
}

const modules = {
  remaster: createPreloadableRecipe<React.ComponentProps<typeof RemasterRecipeComponent>>(() =>
    import('../components/recipes/RemasterRecipe').then((module) => ({
      default: module.RemasterRecipe,
    })),
  ),
  spritesheet: createPreloadableRecipe<React.ComponentProps<typeof SpritesheetRecipeComponent>>(
    () =>
      import('../components/recipes/SpritesheetRecipe').then((module) => ({
        default: module.SpritesheetRecipe,
      })),
  ),
  'sprite-atlas': createPreloadableRecipe<React.ComponentProps<typeof SpriteAtlasRecipeComponent>>(
    () =>
      import('../components/recipes/SpriteAtlasRecipe').then((module) => ({
        default: module.SpriteAtlasRecipe,
      })),
  ),
  cinematic: createPreloadableRecipe<React.ComponentProps<typeof CinematicRecipeComponent>>(() =>
    import('../components/recipes/CinematicRecipe').then((module) => ({
      default: module.CinematicRecipe,
    })),
  ),
  character: createPreloadableRecipe<React.ComponentProps<typeof CharacterSheetRecipeComponent>>(
    () =>
      import('../components/recipes/CharacterSheetRecipe').then((module) => ({
        default: module.CharacterSheetRecipe,
      })),
  ),
  'character-lab': createPreloadableRecipe<
    React.ComponentProps<typeof CharacterLabRecipeComponent>
  >(() =>
    import('../components/recipes/CharacterLabRecipe').then((module) => ({
      default: module.CharacterLabRecipe,
    })),
  ),
  styles: createPreloadableRecipe<React.ComponentProps<typeof StylesRecipeComponent>>(() =>
    import('../components/recipes/StylesRecipe').then((module) => ({
      default: module.StylesRecipe,
    })),
  ),
  camera: createPreloadableRecipe<React.ComponentProps<typeof CameraAnglesRecipeComponent>>(() =>
    import('../components/recipes/CameraAnglesRecipe').then((module) => ({
      default: module.CameraAnglesRecipe,
    })),
  ),
  timeline: createPreloadableRecipe<React.ComponentProps<typeof TimelineRecipeComponent>>(() =>
    import('../components/recipes/TimelineRecipe').then((module) => ({
      default: module.TimelineRecipe,
    })),
  ),
  'animation-sequence': createPreloadableRecipe<
    React.ComponentProps<typeof AnimationSequenceRecipeComponent>
  >(() =>
    import('../components/recipes/AnimationSequenceRecipe').then((module) => ({
      default: module.AnimationSequenceRecipe,
    })),
  ),
};

export const RemasterRecipe = modules.remaster.Component;
export const SpritesheetRecipe = modules.spritesheet.Component;
export const SpriteAtlasRecipe = modules['sprite-atlas'].Component;
export const CinematicRecipe = modules.cinematic.Component;
export const CharacterSheetRecipe = modules.character.Component;
export const CharacterLabRecipe = modules['character-lab'].Component;
export const StylesRecipe = modules.styles.Component;
export const CameraAnglesRecipe = modules.camera.Component;
export const TimelineRecipe = modules.timeline.Component;
export const AnimationSequenceRecipe = modules['animation-sequence'].Component;

export function preloadRecipeComponent(recipeId: RecipeId | null) {
  return recipeId ? modules[recipeId].load() : Promise.resolve();
}
