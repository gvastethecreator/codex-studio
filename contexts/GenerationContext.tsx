import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { ImageGenerationConfig, Attachment, GeneratedImageWithConfig, RecipeId } from '../types';
import { useGenerationConfig } from '../hooks/useGenerationConfig';
import { useGenerationPipeline } from '../hooks/useGenerationPipeline';
import { useGlobal } from './GlobalContext';
import { useModalManager } from '../hooks/useModalManager';

interface GenerationContextType {
  config: {
    generationConfig: ImageGenerationConfig;
    setGenerationConfig: React.Dispatch<React.SetStateAction<ImageGenerationConfig>>;
    updateGenerationConfig: <K extends keyof ImageGenerationConfig>(
      key: K,
      value: ImageGenerationConfig[K],
    ) => void;
    updateAttachment: (id: string, updates: Partial<Attachment>) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePastedFiles: (files: File[]) => void;
    handleRemoveAttachment: (id: string) => void;
    handleAddToContext: (img: GeneratedImageWithConfig) => void;
    maxAttachments: number;
  };
  pipeline: {
    isGenerating: boolean;
    generationStartTime: number | null;
    executeGeneration: (
      configOverrides: Partial<ImageGenerationConfig>,
      options?: { preventModal?: boolean; workspaceId?: string },
    ) => Promise<void>;
    executeEdit: (original: Attachment, mask: string, prompt: string) => Promise<void>;
    activeGenerationConfig: ImageGenerationConfig | null;
  };
  recipe: {
    activeRecipe: RecipeId;
    setActiveRecipe: React.Dispatch<React.SetStateAction<RecipeId>>;
  };
  ui: {
    isInteractingWithToolbar: boolean;
    setIsInteractingWithToolbar: React.Dispatch<React.SetStateAction<boolean>>;
    isKeyPopoverOpen: boolean;
    setIsKeyPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  modal: {
    modalImage: GeneratedImageWithConfig | null;
    activeCarouselId: string | null;
    setActiveCarouselId: React.Dispatch<React.SetStateAction<string | null>>;
    transitioningImageId: string | null;
    openModal: (img: GeneratedImageWithConfig) => void;
    closeModal: () => void;
    isModalOpen: boolean;
    setModalImage: React.Dispatch<React.SetStateAction<GeneratedImageWithConfig | null>>;
  };
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

interface GenerationProviderProps {
  children: ReactNode;
}

export const GenerationProvider: React.FC<GenerationProviderProps> = ({ children }) => {
  const { log, activeWorkspaceId, addToast } = useGlobal();

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
    setModalImage,
  } = useModalManager(activeRecipe);

  const configHook = useGenerationConfig({ log });

  const pipelineHook = useGenerationPipeline({
    generationConfig: configHook.generationConfig,
    activeWorkspaceId,
    addToast,
    log,
    activeRecipe,
    openModal,
    setIsInteractingWithToolbar,
  });

  const value = useMemo<GenerationContextType>(
    () => ({
      config: {
        generationConfig: configHook.generationConfig,
        setGenerationConfig: configHook.setGenerationConfig,
        updateGenerationConfig: configHook.updateGenerationConfig,
        updateAttachment: configHook.updateAttachment,
        handleFileSelect: configHook.handleFileSelect,
        handlePastedFiles: configHook.handlePastedFiles,
        handleRemoveAttachment: configHook.handleRemoveAttachment,
        handleAddToContext: configHook.handleAddToContext,
        maxAttachments: configHook.maxAttachments,
      },
      pipeline: {
        isGenerating: pipelineHook.isGenerating,
        generationStartTime: pipelineHook.generationStartTime,
        executeGeneration: pipelineHook.executeGeneration,
        executeEdit: pipelineHook.executeEdit,
        activeGenerationConfig: pipelineHook.activeGenerationConfig,
      },
      recipe: {
        activeRecipe,
        setActiveRecipe,
      },
      ui: {
        isInteractingWithToolbar,
        setIsInteractingWithToolbar,
        isKeyPopoverOpen,
        setIsKeyPopoverOpen,
      },
      modal: {
        modalImage,
        activeCarouselId,
        setActiveCarouselId,
        transitioningImageId,
        openModal,
        closeModal,
        isModalOpen,
        setModalImage,
      },
    }),
    [
      configHook.generationConfig,
      configHook.setGenerationConfig,
      configHook.updateGenerationConfig,
      configHook.updateAttachment,
      configHook.handleFileSelect,
      configHook.handlePastedFiles,
      configHook.handleRemoveAttachment,
      configHook.handleAddToContext,
      configHook.maxAttachments,
      pipelineHook.isGenerating,
      pipelineHook.generationStartTime,
      pipelineHook.executeGeneration,
      pipelineHook.executeEdit,
      pipelineHook.activeGenerationConfig,
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
      setModalImage,
    ],
  );

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};
