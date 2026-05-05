import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

import { RemasterRecipe } from './recipes/RemasterRecipe';
import { SpritesheetRecipe } from './recipes/SpritesheetRecipe';
import { CinematicRecipe } from './recipes/CinematicRecipe';
import { CharacterSheetRecipe } from './recipes/CharacterSheetRecipe';
import { StylesRecipe } from './recipes/StylesRecipe';
import { CameraAnglesRecipe } from './recipes/CameraAnglesRecipe';
import { TimelineRecipe } from './recipes/TimelineRecipe';

import type { ImageGenerationConfig, GeneratedImageWithConfig, Attachment, RecipeId } from '../types';

interface RecipeRouterProps {
    activeRecipe: RecipeId | null;
    generationConfig: ImageGenerationConfig;
    updateGenerationConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
    updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
    handlePastedFiles: (files: File[]) => void;
    handleGenerate: (promptOverride?: string, configOverrides?: Partial<ImageGenerationConfig>, options?: { force?: boolean; preventModal?: boolean }) => void;
    isGenerating: boolean;
    imagesWithConfig: GeneratedImageWithConfig[];
    openModal: (image: GeneratedImageWithConfig) => void;
    handleAddToContext: (image: GeneratedImageWithConfig) => void;
}

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
            {activeRecipe === 'styles' && (
                <StylesRecipe
                    config={generationConfig}
                    updateConfig={updateGenerationConfig}
                    updateAttachment={updateAttachment}
                    onFileSelect={handlePastedFiles}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    images={imagesWithConfig}
                    onOpenImage={openModal}
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
        </ErrorBoundary>
    );
};
