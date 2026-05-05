
import { useState, useCallback } from 'react';
import type { ImageGenerationConfig, GenerationBatch, GeneratedImageWithConfig, RecipeId } from '../types';
import { startViewTransition } from '../utils/transitionUtils';
import { runLocalGeneration } from '../services/localGenerationRun';

interface GenerationOptions {
    preventModal?: boolean;
    signal?: AbortSignal;
}

interface UseGenerationPipelineProps {
    generationConfig: ImageGenerationConfig;
    activeWorkspaceId: string;
    setBatches: (val: GenerationBatch[] | ((prev: GenerationBatch[]) => GenerationBatch[])) => void;
    setTrash: (val: GenerationBatch[] | ((prev: GenerationBatch[]) => GenerationBatch[])) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    log: (msg: string) => void;
    activeRecipe: RecipeId;
    openModal: (img: GeneratedImageWithConfig) => void;
    setIsInteractingWithToolbar: (val: boolean) => void;
}

export const useGenerationPipeline = ({
    generationConfig,
    activeWorkspaceId,
    setBatches,
    addToast,
    log,
    activeRecipe,
    openModal,
    setIsInteractingWithToolbar
}: UseGenerationPipelineProps) => {
    
    const [activeCount, setActiveCount] = useState(0);
    const isGenerating = activeCount > 0;
    const [activeGenerationConfig, setActiveGenerationConfig] = useState<ImageGenerationConfig | null>(null);
    const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);

    const executeGeneration = useCallback(async (configOverrides: Partial<ImageGenerationConfig>, options?: GenerationOptions) => {
        const configToUse = { ...generationConfig, ...configOverrides };

        setActiveGenerationConfig(configToUse);
        setActiveCount(prev => prev + 1);
        const startTime = Date.now();
        setGenerationStartTime(startTime);
        
        try {
            // Validate Recipe Requirements
            if (activeRecipe && configToUse.attachments.length === 0 && !configToUse.prompt?.trim()) {
                throw new Error("This recipe requires a reference image or a prompt to synthesize.");
            }

            const { batch, generatedCount } = await runLocalGeneration({
                config: configToUse,
                workspaceId: activeWorkspaceId,
                signal: options?.signal,
                onProgress: log,
            });

            startViewTransition(() => {
                setBatches(prevBatches => {
                    const newBatches = [batch, ...prevBatches];
                    
                    return newBatches;
                });
            });
            
            if (batch.images.length > 0 && !options?.preventModal) {
                const resultImage = { ...batch.images[0], config: configToUse } as GeneratedImageWithConfig;
                openModal(resultImage);
                setIsInteractingWithToolbar(false);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            log(`Batch synthesized: ${batch.id} (${generatedCount} asset(s)) in ${duration}s`);
            addToast(`Matrix update: ${generatedCount} assets ready in ${duration}s`, "success");

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            addToast(message, 'error');
            log(`Generation Error: ${message}`);
            // Re-throw so the queue manager knows it failed
            throw error;
        } finally {
            setActiveCount(prev => Math.max(0, prev - 1));
            setActiveGenerationConfig(null);
            setGenerationStartTime(null);
        }
    }, [
        generationConfig, activeWorkspaceId, activeRecipe, setBatches, addToast, log,
        openModal, setIsInteractingWithToolbar
    ]);

    return {
        isGenerating,
        activeGenerationConfig,
        generationStartTime,
        executeGeneration
    };
};
