import React from 'react';
import type {
  Attachment,
  GeneratedImageWithConfig,
  ImageGenerationConfig,
  RecipeId,
} from '../types';
import { RecipeRouter } from './RecipeRouter';

export interface RecipePageProps {
  activeRecipe: RecipeId;
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
    options?: { force?: boolean; preventModal?: boolean },
  ) => void;
  isGenerating: boolean;
  imagesWithConfig: GeneratedImageWithConfig[];
  openModal: (image: GeneratedImageWithConfig) => void;
  handleAddToContext: (image: GeneratedImageWithConfig) => void;
}

export const RecipePage: React.FC<RecipePageProps> = ({
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
  return (
    <RecipeRouter
      activeRecipe={activeRecipe}
      generationConfig={generationConfig}
      updateGenerationConfig={updateGenerationConfig}
      updateAttachment={updateAttachment}
      handlePastedFiles={handlePastedFiles}
      handleGenerate={handleGenerate}
      isGenerating={isGenerating}
      imagesWithConfig={imagesWithConfig}
      openModal={openModal}
      handleAddToContext={handleAddToContext}
    />
  );
};
