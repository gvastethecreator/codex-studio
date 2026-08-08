import React, { createContext, use, ReactNode, useMemo, useState } from 'react';
import type { CodexModelCatalogResponse, Job as StudioJob } from '../packages/shared/src';
import {
  ImageGenerationConfig,
  Attachment,
  GeneratedImageWithConfig,
  GenerationExecutionOutcome,
  RecipeId,
} from '../types';
import { useGenerationConfig } from '../hooks/useGenerationConfig';
import { useGenerationPipeline } from '../hooks/useGenerationPipeline';
import { useRuntimeLogActions, useToastUi, useWorkspaceState } from './GlobalContext';
import { useModalManager } from '../hooks/useModalManager';
import { useLatestRef } from '../hooks/useLatestRef';

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
    codexModelCatalog: CodexModelCatalogResponse | null;
    isLoadingCodexModelCatalog: boolean;
    codexModelCatalogError: string | null;
  };
  pipeline: {
    isGenerating: boolean;
    generationStartTime: number | null;
    executeGeneration: (
      configOverrides: Partial<ImageGenerationConfig>,
      options?: {
        preventModal?: boolean;
        workspaceId?: string;
        signal?: AbortSignal;
        onJobCreated?: (job: StudioJob) => void;
      },
    ) => Promise<GenerationExecutionOutcome>;
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

type GenerationDraftContextType = GenerationContextType['config'];
type GenerationShellContextType = Omit<GenerationDraftContextType, 'generationConfig'> & {
  generationConfigRef: React.RefObject<ImageGenerationConfig>;
  aspectRatio: ImageGenerationConfig['aspectRatio'];
};
type GenerationRunContextType = GenerationContextType['pipeline'];
type GenerationChromeContextType = Pick<GenerationContextType, 'recipe' | 'ui'>;
type GenerationModalContextType = GenerationContextType['modal'];

const GenerationDraftContext = createContext<GenerationDraftContextType | undefined>(undefined);
const GenerationShellContext = createContext<GenerationShellContextType | undefined>(undefined);
const GenerationRunContext = createContext<GenerationRunContextType | undefined>(undefined);
const GenerationChromeContext = createContext<GenerationChromeContextType | undefined>(undefined);
const GenerationModalContext = createContext<GenerationModalContextType | undefined>(undefined);

interface GenerationProviderProps {
  children: ReactNode;
}

export const GenerationProvider: React.FC<GenerationProviderProps> = ({ children }) => {
  const { activeWorkspaceId } = useWorkspaceState();
  const { log } = useRuntimeLogActions();
  const { addToast } = useToastUi();

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
  const generationConfigRef = useLatestRef(configHook.generationConfig);

  const pipelineHook = useGenerationPipeline({
    generationConfig: configHook.generationConfig,
    activeWorkspaceId,
    addToast,
    log,
    activeRecipe,
    openModal,
    setIsInteractingWithToolbar,
  });

  const draftValue = useMemo<GenerationDraftContextType>(
    () => ({
      generationConfig: configHook.generationConfig,
      setGenerationConfig: configHook.setGenerationConfig,
      updateGenerationConfig: configHook.updateGenerationConfig,
      updateAttachment: configHook.updateAttachment,
      handleFileSelect: configHook.handleFileSelect,
      handlePastedFiles: configHook.handlePastedFiles,
      handleRemoveAttachment: configHook.handleRemoveAttachment,
      handleAddToContext: configHook.handleAddToContext,
      maxAttachments: configHook.maxAttachments,
      codexModelCatalog: configHook.codexModelCatalog,
      isLoadingCodexModelCatalog: configHook.isLoadingCodexModelCatalog,
      codexModelCatalogError: configHook.codexModelCatalogError,
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
      configHook.codexModelCatalog,
      configHook.isLoadingCodexModelCatalog,
      configHook.codexModelCatalogError,
    ],
  );
  const runValue = useMemo<GenerationRunContextType>(
    () => ({
      isGenerating: pipelineHook.isGenerating,
      generationStartTime: pipelineHook.generationStartTime,
      executeGeneration: pipelineHook.executeGeneration,
      executeEdit: pipelineHook.executeEdit,
      activeGenerationConfig: pipelineHook.activeGenerationConfig,
    }),
    [
      pipelineHook.isGenerating,
      pipelineHook.generationStartTime,
      pipelineHook.executeGeneration,
      pipelineHook.executeEdit,
      pipelineHook.activeGenerationConfig,
    ],
  );
  const shellValue = useMemo<GenerationShellContextType>(
    () => ({
      generationConfigRef,
      aspectRatio: configHook.generationConfig.aspectRatio,
      setGenerationConfig: configHook.setGenerationConfig,
      updateGenerationConfig: configHook.updateGenerationConfig,
      updateAttachment: configHook.updateAttachment,
      handleFileSelect: configHook.handleFileSelect,
      handlePastedFiles: configHook.handlePastedFiles,
      handleRemoveAttachment: configHook.handleRemoveAttachment,
      handleAddToContext: configHook.handleAddToContext,
      maxAttachments: configHook.maxAttachments,
      codexModelCatalog: configHook.codexModelCatalog,
      isLoadingCodexModelCatalog: configHook.isLoadingCodexModelCatalog,
      codexModelCatalogError: configHook.codexModelCatalogError,
    }),
    [
      generationConfigRef,
      configHook.generationConfig.aspectRatio,
      configHook.setGenerationConfig,
      configHook.updateGenerationConfig,
      configHook.updateAttachment,
      configHook.handleFileSelect,
      configHook.handlePastedFiles,
      configHook.handleRemoveAttachment,
      configHook.handleAddToContext,
      configHook.maxAttachments,
      configHook.codexModelCatalog,
      configHook.isLoadingCodexModelCatalog,
      configHook.codexModelCatalogError,
    ],
  );
  const chromeValue = useMemo<GenerationChromeContextType>(
    () => ({
      recipe: { activeRecipe, setActiveRecipe },
      ui: {
        isInteractingWithToolbar,
        setIsInteractingWithToolbar,
        isKeyPopoverOpen,
        setIsKeyPopoverOpen,
      },
    }),
    [
      activeRecipe,
      setActiveRecipe,
      isInteractingWithToolbar,
      setIsInteractingWithToolbar,
      isKeyPopoverOpen,
      setIsKeyPopoverOpen,
    ],
  );
  const modalValue = useMemo<GenerationModalContextType>(
    () => ({
      modalImage,
      activeCarouselId,
      setActiveCarouselId,
      transitioningImageId,
      openModal,
      closeModal,
      isModalOpen,
      setModalImage,
    }),
    [
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

  return (
    <GenerationShellContext.Provider value={shellValue}>
      <GenerationDraftContext.Provider value={draftValue}>
        <GenerationRunContext.Provider value={runValue}>
          <GenerationChromeContext.Provider value={chromeValue}>
            <GenerationModalContext.Provider value={modalValue}>
              {children}
            </GenerationModalContext.Provider>
          </GenerationChromeContext.Provider>
        </GenerationRunContext.Provider>
      </GenerationDraftContext.Provider>
    </GenerationShellContext.Provider>
  );
};

function useRequiredGenerationContext<T>(context: React.Context<T | undefined>, hookName: string) {
  const value = use(context);
  if (value === undefined) {
    throw new Error(`${hookName} must be used within a GenerationProvider`);
  }
  return value;
}

export const useGenerationDraft = () =>
  useRequiredGenerationContext(GenerationDraftContext, 'useGenerationDraft');

export const useGenerationShell = () =>
  useRequiredGenerationContext(GenerationShellContext, 'useGenerationShell');

export const useGenerationRun = () =>
  useRequiredGenerationContext(GenerationRunContext, 'useGenerationRun');

export const useGenerationChrome = () =>
  useRequiredGenerationContext(GenerationChromeContext, 'useGenerationChrome');

export const useGenerationModal = () =>
  useRequiredGenerationContext(GenerationModalContext, 'useGenerationModal');

export const useGeneration = () => {
  const config = useGenerationDraft();
  const pipeline = useGenerationRun();
  const { recipe, ui } = useGenerationChrome();
  const modal = useGenerationModal();
  const context: GenerationContextType = { config, pipeline, recipe, ui, modal };
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};
