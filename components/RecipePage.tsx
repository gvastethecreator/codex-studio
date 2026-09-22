import React from 'react';
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
  intentionalStylesV1?: boolean;
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

export const RecipePage: React.FC<RecipePageProps> = (props) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <RecipeRouter {...props} />
    </div>
  );
};
