import React, { createContext, useContext, ReactNode, useState } from 'react';
import { ImageGenerationConfig, Attachment, GeneratedImageWithConfig, GenerationBatch, RecipeId } from '../types';
import { useGenerationConfig } from '../hooks/useGenerationConfig';
import { useGenerationPipeline } from '../hooks/useGenerationPipeline';
import { useGlobal } from './GlobalContext';
import { useModalManager } from '../hooks/useModalManager';

interface GenerationContextType {
    generationConfig: ImageGenerationConfig;
    setGenerationConfig: React.Dispatch<React.SetStateAction<ImageGenerationConfig>>;
    updateGenerationConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
    updateAttachment: (id: string, updates: Partial<Attachment>) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePastedFiles: (files: File[]) => void;
    handleRemoveAttachment: (id: string) => void;
    handleAddToContext: (img: GeneratedImageWithConfig) => void;
    maxAttachments: number;
    
    isGenerating: boolean;
    generationStartTime: number | null;
    executeGeneration: (configOverrides: Partial<ImageGenerationConfig>, options?: { preventModal?: boolean }) => Promise<void>;
    activeGenerationConfig: ImageGenerationConfig | null;

    activeRecipe: RecipeId;
    setActiveRecipe: React.Dispatch<React.SetStateAction<RecipeId>>;
    isInteractingWithToolbar: boolean;
    setIsInteractingWithToolbar: React.Dispatch<React.SetStateAction<boolean>>;
    isKeyPopoverOpen: boolean;
    setIsKeyPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;

    modalImage: GeneratedImageWithConfig | null;
    activeCarouselId: string | null;
    setActiveCarouselId: React.Dispatch<React.SetStateAction<string | null>>;
    transitioningImageId: string | null;
    openModal: (img: GeneratedImageWithConfig) => void;
    closeModal: () => void;
    isModalOpen: boolean;
    setModalImage: React.Dispatch<React.SetStateAction<GeneratedImageWithConfig | null>>;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

interface GenerationProviderProps {
    children: ReactNode;
}

export const GenerationProvider: React.FC<GenerationProviderProps> = ({
    children
}) => {
    const { 
        log, 
        activeWorkspaceId, 
        setBatches, 
        setTrash,
        addToast
    } = useGlobal();

    const [activeRecipe, setActiveRecipe] = useState<RecipeId>(null);
    const [isInteractingWithToolbar, setIsInteractingWithToolbar] = useState(false);
    const [isKeyPopoverOpen, setIsKeyPopoverOpen] = useState(false);

    const { 
        modalImage, 
        activeCarouselId, 
        setActiveCarouselId, 
        transitioningImageId, 
        openModal, 
        closeModal, 
        isModalOpen,
        setModalImage 
    } = useModalManager(activeRecipe);

    const configHook = useGenerationConfig({ log });
    
    const pipelineHook = useGenerationPipeline({
        generationConfig: configHook.generationConfig,
        activeWorkspaceId,
        setBatches,
        setTrash,
        addToast,
        log,
        activeRecipe,
        openModal,
        setIsInteractingWithToolbar
    });

    const value = {
        ...configHook,
        ...pipelineHook,
        activeRecipe,
        setActiveRecipe,
        isInteractingWithToolbar,
        setIsInteractingWithToolbar,
        isKeyPopoverOpen,
        setIsKeyPopoverOpen,
        modalImage,
        activeCarouselId,
        setActiveCarouselId,
        transitioningImageId,
        openModal,
        closeModal,
        isModalOpen,
        setModalImage
    };

    return (
        <GenerationContext.Provider value={value}>
            {children}
        </GenerationContext.Provider>
    );
};

export const useGeneration = () => {
    const context = useContext(GenerationContext);
    if (context === undefined) {
        throw new Error('useGeneration must be used within a GenerationProvider');
    }
    return context;
};
