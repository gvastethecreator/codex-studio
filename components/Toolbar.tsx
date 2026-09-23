import { AnimatePresence } from '../lib/gsapMotion';
import {
  getGenerationRequirement,
  getGenerationOutputSummary,
} from '../packages/shared/src/generationRequirements';
import { CreatePromptExpandDialog } from './create/CreatePromptExpandDialog';
import { ReferenceTray } from './ReferenceTray';
import {
  IconBan as Ban,
  IconRobot as Bot,
  IconBrain as BrainCircuit,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconEdit as Edit3,
  IconEraser as Eraser,
  IconHash as Hash,
  IconPhotoPlus as ImagePlus,
  IconStack as Layers,
  IconLoader2 as Loader2,
  IconMaximize as Maximize,
  IconDeviceDesktop as Monitor,
  IconDots as MoreHorizontal,
  IconCirclePlus as PlusCircle,
  IconMinus as Minus,
  IconPlus as Plus,
  IconAspectRatio as Ratio,
  IconRectangle as RectangleHorizontal,
  IconRectangleVertical as RectangleVertical,
  IconScan as Scan,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconSend as Send,
  IconShieldExclamation as ShieldAlert,
  IconSquare as Square,
  IconSparkles as Sparkles,
  IconWand as Wand,
  IconWand as Wand2,
  IconX as X,
  IconBolt as Zap,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatCodexModelLabel,
  formatCodexSpeedLabel,
  getCodexSpeedOptions,
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
} from '../lib/codexExecution';
import { buildComposerProviderProjection } from '../lib/composerProviderProjection';
import { getActiveRecipeIndicator } from '../lib/activeRecipeIndicator';
import type {
  CodexModel,
  CodexModelCatalogResponse,
  CodexServiceTier,
  GenerationProviderId,
} from '../packages/shared/src';
import type {
  CodexExecutionTransport,
  CodexHttpImageModelOption,
  CodexHttpImageSizeTier,
} from '../packages/shared/src/codexExecutionContract';
import type { AspectRatio, Attachment, ImageGenerationConfig } from '../types';
import {
  getRatioOrientation,
  getRatioShapeStyle,
  RATIO_ORIENTATION_LABELS,
} from '../utils/imageGenSizing';
import KeyPopover from './KeyPopover';
import Tooltip from './Tooltip';
import { DemandMountedGsapDropdown } from './ui/DemandMountedGsapDropdown';
import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import { ProviderQuickSwitch } from './header/ProviderQuickSwitch';
import { ProviderBrandMark } from './ProviderBrandMark';
import { GenerationElapsedStatus, LivePromptTextarea } from './ToolbarLiveStatus';

export interface ToolbarProps {
  generationConfig: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onGenerate: (
    prompt?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: { preventModal?: boolean; useCurrentAttachments?: boolean },
  ) => void;
  isGenerating: boolean;
  generationStartTime: number | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesDrop: (files: File[], replaceId?: string) => void;
  onRemoveAttachment: (id: string) => void;
  isEnhancingPrompt: boolean;
  onEnhancePrompt: () => void;
  setPreviewRatio: (ratio: AspectRatio | null) => void;
  setIsInteracting: (isInteracting: boolean) => void;
  onOpenEditor: (attachment: Attachment) => void;
  isKeyPopoverOpen: boolean;
  onOpenKeySelector: () => void;
  onSelectKey: () => Promise<void>;
  maxAttachments: number;
  interactionScope?: string;
  codexModelCatalog: CodexModelCatalogResponse | null;
  isLoadingCodexModelCatalog: boolean;
  codexModelCatalogError: string | null;
  activeProviderId: GenerationProviderId;
  codexTransport?: CodexExecutionTransport;
  codexAvailableTransports?: readonly CodexExecutionTransport[];
  grokCanExecute?: boolean;
  grokStatus?: string;
  grokDiagnostics?: string[];
  commandCenter?: StudioCommandCenterProjection;
  onSelectProvider?: (providerId: GenerationProviderId) => Promise<void> | void;
  isProviderSaving?: boolean;
  onOpenSettings?: () => void;
  activeRecipe?: ImageGenerationConfig['recipeId'];
  mode?: 'full' | 'context-only';
  railTools?: React.ReactNode;
  railAction?: React.ReactNode;
  layout?: 'dock' | 'rail';
}

const ICON_SIZE = 14;

const AspectRatioIcon: React.FC<{ ratio: AspectRatio }> = ({ ratio }) => {
  const [width = 1, height = 1] = ratio.split(':').map(Number);
  if (width === height) return <Square size={ICON_SIZE} />;
  if (width > height) return <RectangleHorizontal size={ICON_SIZE} />;
  return <RectangleVertical size={ICON_SIZE} />;
};

const BATCH_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const GENERATION_PROVIDER_LABELS: Partial<Record<GenerationProviderId, string>> = {
  codex: 'Codex',
  grok: 'Grok Imagine',
  google: 'Google',
  fal: 'fal.ai',
  comfy: 'ComfyUI',
  dry_run: 'Dry run',
};

function formatGenerationProviderLabel(providerId: GenerationProviderId) {
  return GENERATION_PROVIDER_LABELS[providerId] ?? providerId;
}

import { useToastUi } from '../contexts/GlobalContext';

export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({
    generationConfig,
    updateConfig,
    onGenerate,
    isGenerating,
    generationStartTime,
    onFileSelect,
    onFilesDrop,
    onRemoveAttachment,
    isEnhancingPrompt,
    onEnhancePrompt,
    setPreviewRatio,
    setIsInteracting,
    onOpenEditor,
    isKeyPopoverOpen,
    onOpenKeySelector,
    onSelectKey,
    maxAttachments,
    interactionScope,
    codexModelCatalog,
    isLoadingCodexModelCatalog,
    codexModelCatalogError,
    activeProviderId,
    codexTransport,
    codexAvailableTransports,
    grokCanExecute = false,
    grokStatus,
    grokDiagnostics,
    commandCenter,
    onSelectProvider,
    isProviderSaving = false,
    onOpenSettings,
    activeRecipe = null,
    mode = 'full',
    railTools,
    railAction,
    layout = 'dock',
  }) => {
    const { addToast } = useToastUi();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const negativeButtonRef = useRef<HTMLButtonElement>(null);
    const refineButtonRef = useRef<HTMLButtonElement>(null);
    const aspectRatioButtonRef = useRef<HTMLButtonElement>(null);
    const sizeButtonRef = useRef<HTMLButtonElement>(null);
    const batchButtonRef = useRef<HTMLButtonElement>(null);
    const negativeInputRef = useRef<HTMLTextAreaElement>(null);
    const executionButtonRef = useRef<HTMLButtonElement>(null);

    const [localPrompt, setLocalPrompt] = useState(generationConfig.prompt || '');
    const [quickStartError, setQuickStartError] = useState(false);
    const [quickStartErrorScope, setQuickStartErrorScope] = useState<string | undefined>();
    const [isPromptFocused, setIsPromptFocused] = useState(false);

    // Menu States
    const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
    const [isExecutionOpen, setIsExecutionOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [isBatchOpen, setIsBatchOpen] = useState(false);
    const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

    // Logic AI Popover States
    const [isNegativeOpen, setIsNegativeOpen] = useState(false);
    const [isRefineOpen, setIsRefineOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [expandedPrompt, setExpandedPrompt] = useState('');
    const [composerDragDepth, setComposerDragDepth] = useState(0);

    const [magicInstruction, setMagicInstruction] = useState('');
    const [isRefactoring, setIsRefactoring] = useState(false);

    const selectedCodexTransport =
      activeProviderId === 'chatgpt' ? 'subscription_http' : 'codex_app_server';

    const providerChrome = useMemo(
      () =>
        buildComposerProviderProjection({
          providerId: activeProviderId,
          recipeId: activeRecipe,
          aspectRatio: generationConfig.aspectRatio,
          attachments: generationConfig.attachments,
          grokCanExecute,
          grokStatus,
          grokDiagnostics,
          codexModelCatalog,
          codexTransport: selectedCodexTransport,
          codexAvailableTransports,
          codexImageModel: generationConfig.codexImageModel,
          executionModel: generationConfig.executionModel,
          executionReasoningEffort: generationConfig.executionReasoningEffort,
          executionSpeed: generationConfig.executionSpeed,
          imageSize: generationConfig.imageSize,
          catalogError: codexModelCatalogError,
        }),
      [
        activeProviderId,
        activeRecipe,
        codexModelCatalog,
        codexModelCatalogError,
        codexTransport,
        codexAvailableTransports,
        generationConfig.codexImageModel,
        selectedCodexTransport,
        generationConfig.aspectRatio,
        generationConfig.attachments,
        generationConfig.executionModel,
        generationConfig.executionReasoningEffort,
        generationConfig.executionSpeed,
        generationConfig.imageSize,
        grokCanExecute,
        grokDiagnostics,
        grokStatus,
      ],
    );
    const {
      generateBlock,
      ratios: currentRatios,
      showCodexPromptTools,
      showCodexModelChrome,
      maxOutputCount,
      execution,
    } = providerChrome;
    const codexModels = execution.models;
    const selectedExecutionModel = execution.selectedModel;
    const executionReasoningOptions = execution.reasoningOptions;
    const executionSpeedOptions = execution.speedOptions;
    const executionImageModels = execution.imageModels;
    const selectedExecutionImageModel = execution.selectedImageModel;
    const executionImageSizeOptions = execution.imageSizeOptions;
    const selectedExecutionImageSize = execution.selectedImageSize;
    const showSizeControl = execution.showImageSizeControl;
    const executionSourceMessage = execution.sourceMessage;
    const executionSummary = execution.summary;
    const executionChipLabel = formatCodexModelLabel(
      selectedExecutionModel?.id ?? generationConfig.executionModel,
      selectedExecutionModel?.displayName,
    );

    const isScrambling = isEnhancingPrompt || isRefactoring;

    const handleSelectExecutionModel = useCallback(
      (model: CodexModel) => {
        if (selectedCodexTransport === 'subscription_http') return;
        updateConfig('executionModel', model.id);
        updateConfig(
          'executionReasoningEffort',
          normalizeCodexReasoningEffort(model, generationConfig.executionReasoningEffort),
        );
        updateConfig('executionSpeed', normalizeCodexSpeed(model, generationConfig.executionSpeed));
      },
      [
        generationConfig.executionReasoningEffort,
        generationConfig.executionSpeed,
        selectedCodexTransport,
        updateConfig,
      ],
    );

    const handleSelectExecutionImageModel = useCallback(
      (model: CodexHttpImageModelOption) => {
        if (selectedCodexTransport !== 'subscription_http') return;
        updateConfig('codexImageModel', model.id);
      },
      [selectedCodexTransport, updateConfig],
    );

    const handleSelectExecutionImageSize = useCallback(
      (size: CodexHttpImageSizeTier) => {
        if (selectedCodexTransport !== 'subscription_http') return;
        updateConfig('imageSize', size);
      },
      [selectedCodexTransport, updateConfig],
    );

    const handleSelectExecutionSpeed = useCallback(
      (speed: CodexServiceTier) => {
        if (selectedCodexTransport === 'subscription_http') return;
        updateConfig('executionSpeed', normalizeCodexSpeed(selectedExecutionModel, speed));
      },
      [selectedCodexTransport, selectedExecutionModel, updateConfig],
    );

    const closeAllMenus = useCallback(() => {
      setIsAspectRatioOpen(false);
      setIsExecutionOpen(false);
      setIsSizeOpen(false);
      setIsBatchOpen(false);
      setIsInteracting(false);
      setPreviewRatio(null);
    }, [setIsInteracting, setPreviewRatio]);

    const handleToolbarMouseEnter = useCallback(() => {
      setIsInteracting(true);
    }, [setIsInteracting]);

    const handleToolbarMouseLeave = useCallback(() => {
      setIsInteracting(false);
      setPreviewRatio(null);
    }, [setIsInteracting, setPreviewRatio]);

    // Click outside
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (event.target instanceof Element && event.target.closest('[data-toolbar-popup]')) return;
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          closeAllMenus();
          setIsNegativeOpen(false);
          setIsRefineOpen(false);
          setIsMobileControlsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [closeAllMenus]);

    const lastPushedPromptRef = useRef(generationConfig.prompt);
    const debounceTimerRef = useRef<number | null>(null);

    useEffect(() => {
      const timer = debounceTimerRef.current;
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, []);

    useEffect(() => {
      if (
        generationConfig.prompt !== lastPushedPromptRef.current &&
        generationConfig.prompt !== localPrompt
      ) {
        lastPushedPromptRef.current = generationConfig.prompt;
        // react-doctor-disable-next-line react-doctor/no-chain-state-updates
        // react-doctor-disable-next-line react-doctor/no-derived-state
        setLocalPrompt(generationConfig.prompt || '');
      }
    }, [generationConfig.prompt, localPrompt]);

    useEffect(() => {
      const current = generationConfig.batchCount || 1;
      if (current > maxOutputCount) {
        updateConfig('batchCount', maxOutputCount);
      }
    }, [generationConfig.batchCount, maxOutputCount, updateConfig]);

    useEffect(() => {
      if (selectedCodexTransport === 'subscription_http') return;
      if (generationConfig.imageSize === '2K' || generationConfig.imageSize === '4K') {
        updateConfig('imageSize', '1K');
      }
    }, [generationConfig.imageSize, selectedCodexTransport, updateConfig]);

    const requirement = getGenerationRequirement({
      ...generationConfig,
      recipeId: activeRecipe,
      prompt: localPrompt,
      referenceCount: generationConfig.attachments.length,
    });
    const sourceFirst =
      activeRecipe === 'remaster' || activeRecipe === 'camera' || activeRecipe === 'character-lab';

    const handleTriggerGenerate = useCallback(() => {
      if (generateBlock) return;
      if (requirement) {
        setQuickStartErrorScope(interactionScope);
        setQuickStartError(requirement.field === 'prompt');
        const target =
          requirement.field === 'source'
            ? '[aria-label="Add image reference"]'
            : requirement.field === 'styles'
              ? '[aria-label="Add a style"]'
              : 'textarea';
        containerRef.current?.querySelector<HTMLElement>(target)?.focus();
        return;
      }
      const trimmedPrompt =
        localPrompt.trim() ||
        (activeRecipe === 'styles'
          ? 'Create a balanced composition using the selected styles.'
          : activeRecipe === 'character-lab' &&
              typeof generationConfig.recipeParams?.subject === 'string'
            ? generationConfig.recipeParams.subject
            : '');
      // Force sync immediately before generating
      updateConfig('prompt', localPrompt);
      onGenerate(trimmedPrompt, { codexTransport: selectedCodexTransport }, { preventModal: true });

      closeAllMenus();
      setIsNegativeOpen(false);
      setIsRefineOpen(false);
      setIsMobileControlsOpen(false);
    }, [
      localPrompt,
      requirement,
      activeRecipe,
      generationConfig.recipeParams,
      updateConfig,
      onGenerate,
      selectedCodexTransport,
      closeAllMenus,
      interactionScope,
      generateBlock,
    ]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (layout === 'rail') {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.preventDefault();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTriggerGenerate();
      }
    };

    const handleAnalyzeReferences = () => {
      if (generationConfig.attachments.length === 0) {
        addToast('Add an image reference before analyzing attachments', 'info');
        return;
      }
      const notes = [
        'Reference notes:',
        ...generationConfig.attachments.map(
          (attachment, index) =>
            `- ${index === 0 ? 'Source image' : `Detail reference ${index}`}: ${attachment.name}. Preserve identity, clothing, and palette.`,
        ),
        'Use the attached images as the visual source of truth.',
      ].join('\n');
      const nextPrompt = [localPrompt.trim(), notes].filter(Boolean).join('\n\n');
      setLocalPrompt(nextPrompt);
      updateConfig('prompt', nextPrompt);
      addToast('Reference notes added to the prompt', 'success');
    };

    const handleMagicEdit = async () => {
      if (!magicInstruction.trim() || isRefactoring) return;
      setIsRefactoring(true);
      try {
        const newPrompt = [
          localPrompt.trim(),
          '',
          `Codex refinement: ${magicInstruction.trim()}`,
          'Keep the original intent and apply this refinement in the next local image generation.',
        ]
          .filter(Boolean)
          .join('\n');
        setLocalPrompt(newPrompt);
        updateConfig('prompt', newPrompt);
        setMagicInstruction('');
        setIsRefineOpen(false);
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Prompt refinement failed', 'error');
      } finally {
        setIsRefactoring(false);
      }
    };

    const saveExpandedPrompt = useCallback(() => {
      const next = expandedPrompt.slice(0, 12000);
      setLocalPrompt(next);
      lastPushedPromptRef.current = next;
      updateConfig('prompt', next);
      setIsPromptExpanded(false);
    }, [expandedPrompt, updateConfig]);

    useEffect(() => {
      if (layout !== 'rail') return;
      const handleGlobalGenerate = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (document.querySelector('[aria-modal="true"]')) return;
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          handleTriggerGenerate();
        }
      };
      document.addEventListener('keydown', handleGlobalGenerate);
      return () => document.removeEventListener('keydown', handleGlobalGenerate);
    }, [handleTriggerGenerate, layout]);

    const currentSizes = executionImageSizeOptions;

    const btnClass =
      'studio-ghost-control h-10 min-h-10 w-full touch-manipulation sm:w-auto flex items-center justify-center gap-2 px-3 text-[length:var(--wbp-label)] font-semibold leading-none tracking-normal transition-[color,background-color,border-color,opacity,transform] hover:text-[color:var(--wb-ink)] active:scale-95 disabled:opacity-30 group whitespace-nowrap cursor-pointer';
    const iconBtnClass =
      'studio-ghost-control size-10 min-w-10 flex-shrink-0 touch-manipulation flex items-center justify-center transition-[color,background-color,border-color,opacity,transform] hover:text-[color:var(--wb-ink)] active:scale-90 relative cursor-pointer disabled:cursor-not-allowed';
    const activeIconBtnClass =
      'bg-gradient-to-b from-accent-800 to-accent-950 border border-accent-700/2 text-accent-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-pointer';

    const hasAttachments = generationConfig.attachments.length > 0;
    const isContextOnly = mode === 'context-only';
    const isNearLimit = generationConfig.attachments.length >= maxAttachments;
    const hasQuickStartInput = localPrompt.trim().length > 0 || hasAttachments;
    const activeRecipeIndicator = getActiveRecipeIndicator(activeRecipe);

    if (quickStartError && (quickStartErrorScope !== interactionScope || hasQuickStartInput)) {
      setQuickStartError(false);
    }

    const shouldShowQuickStartError =
      quickStartError && quickStartErrorScope === interactionScope && !hasQuickStartInput;
    const showQuickStartErrorText = shouldShowQuickStartError && isPromptFocused;
    const isRail = layout === 'rail';
    const currentBatch = Math.min(generationConfig.batchCount || 1, maxOutputCount);
    const batchCounts = BATCH_COUNTS.filter((count) => count <= maxOutputCount);
    const outputSummary = getGenerationOutputSummary(
      activeRecipe,
      generationConfig.recipeParams,
      currentBatch,
    );
    const nextBatchCount = Math.min(maxOutputCount, currentBatch + 1);
    const previousBatchCount = Math.max(1, currentBatch - 1);
    const formatOrientation =
      RATIO_ORIENTATION_LABELS[getRatioOrientation(generationConfig.aspectRatio)];
    const shortcutHint =
      typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)
        ? '⌘ ↵'
        : 'Ctrl ↵';
    const acceptRailImageDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const files = Array.from(event.dataTransfer.files as any as Iterable<File>).filter((file) =>
          file.type.startsWith('image/'),
        );
        if (files.length === 0) return;
        onFilesDrop(files);
      },
      [onFilesDrop],
    );

    const fileInput = (
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        aria-label="Upload images"
        className="hidden"
        accept="image/*"
        multiple
      />
    );

    const promptField = (
      <LivePromptTextarea
        textareaRef={textareaRef}
        id={isRail ? 'create-prompt-input' : undefined}
        variant={isRail ? 'rail' : 'dock'}
        prompt={localPrompt}
        isScrambling={isScrambling}
        isHidden={isContextOnly}
        onFocus={() => {
          setIsInteracting(true);
          setIsPromptFocused(true);
        }}
        onBlur={() => {
          setIsPromptFocused(false);
          updateConfig('prompt', localPrompt);
          closeAllMenus();
        }}
        onChange={(e) => {
          const next = e.target.value;
          setLocalPrompt(next);
          setIsInteracting(true);
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = window.setTimeout(() => {
            lastPushedPromptRef.current = next;
            updateConfig('prompt', next);
          }, 300);
        }}
        onKeyDown={handleKeyDown}
        onPaste={(e) => {
          const items = e.clipboardData?.items;
          if (!items) return;
          const files = Array.from(items as any as Iterable<DataTransferItem>).reduce<File[]>(
            (acc, item) => {
              if (!item.type.startsWith('image/')) return acc;
              const file = item.getAsFile();
              if (file !== null) acc.push(file);
              return acc;
            },
            [],
          );
          if (files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            onFilesDrop(files);
          }
        }}
        onDrop={(e) => {
          const files = Array.from(e.dataTransfer.files as any as Iterable<File>).filter((f) =>
            f.type.startsWith('image/'),
          );
          if (files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            onFilesDrop(files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    );

    const referenceField = (
      <div className="create-reference-area" aria-label="Reference images">
        <div className="create-reference-heading">
          <span>{sourceFirst ? 'Source image' : 'References'}</span>
          <span className="create-reference-count">
            {generationConfig.attachments.length} / {maxAttachments}
          </span>
        </div>
        <div className="create-reference-list">
          {hasAttachments ? (
            <ReferenceTray
              attachments={generationConfig.attachments}
              onEdit={onOpenEditor}
              onRemove={onRemoveAttachment}
              onFiles={onFilesDrop}
              density="thumbs"
            />
          ) : (
            <span className="create-reference-empty">
              Drop an image or paste it into the prompt.
            </span>
          )}
          {isNearLimit ? null : (
            <button
              type="button"
              className="create-add-reference"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add image reference"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    );

    return (
      <div
        ref={containerRef}
        data-toolbar-mode={mode}
        data-toolbar-layout={layout}
        onMouseEnter={handleToolbarMouseEnter}
        onMouseMove={handleToolbarMouseEnter}
        onMouseLeave={handleToolbarMouseLeave}
        className={
          isRail
            ? 'create-tool-composer relative z-50 flex h-full min-h-0 w-full flex-col'
            : 'w-full flex flex-col justify-end z-50 transition-colors duration-200 ease-out relative'
        }
      >
        {isRail ? null : (
          <div className="absolute inset-x-0 bottom-0 h-[106px] pointer-events-none bg-black/80 transition-colors duration-200 ease-out sm:h-[56px]" />
        )}

        <div
          className={
            isRail
              ? 'relative z-10 flex min-h-0 w-full flex-1 flex-col'
              : 'relative z-10 flex w-full flex-col items-stretch gap-1 px-2 py-1.5 sm:flex-row sm:items-end sm:gap-1.5'
          }
        >
          {fileInput}

          {isRail ? (
            <div className="create-tool-scroll min-h-0 flex-1" onScroll={() => closeAllMenus()}>
              {!sourceFirst || isContextOnly ? railTools : null}
              {isContextOnly ? (
                <>
                  <section className="create-tool-block" aria-label="Attachments">
                    <div className="create-section-header">
                      <span>References</span>
                      <span className="create-reference-count">
                        {generationConfig.attachments.length} / {maxAttachments}
                      </span>
                    </div>
                    <div
                      className={`create-composer ${composerDragDepth > 0 ? 'is-dragover' : ''}`}
                      onDragEnter={(event) => {
                        if (!event.dataTransfer?.types.includes('Files')) return;
                        event.preventDefault();
                        setComposerDragDepth((depth) => depth + 1);
                      }}
                      onDragOver={(event) => {
                        if (!event.dataTransfer?.types.includes('Files')) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragLeave={() => setComposerDragDepth((depth) => Math.max(0, depth - 1))}
                      onDrop={(event) => {
                        setComposerDragDepth(0);
                        acceptRailImageDrop(event);
                      }}
                    >
                      <div className="create-reference-area">
                        <div className="create-reference-list">
                          {hasAttachments ? (
                            <ReferenceTray
                              attachments={generationConfig.attachments}
                              onEdit={onOpenEditor}
                              onRemove={onRemoveAttachment}
                              onFiles={onFilesDrop}
                              density="thumbs"
                            />
                          ) : (
                            <span className="create-reference-empty">
                              Drop an image or paste it into the prompt.
                            </span>
                          )}
                          {isNearLimit ? null : (
                            <button
                              type="button"
                              className="create-add-reference"
                              onClick={() => fileInputRef.current?.click()}
                              aria-label="Add image reference"
                            >
                              <Plus size={16} aria-hidden="true" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                  <p className="create-tool-hint">
                    Add references here. Use the selected task action above to continue.
                  </p>
                </>
              ) : (
                <>
                  <section className="create-prompt-section" aria-label="Prompt">
                    <div className="create-section-header">
                      <label htmlFor="create-prompt-input">Prompt</label>
                      <div className="create-prompt-tools">
                        <Tooltip content="Analyze references">
                          <button
                            type="button"
                            onClick={handleAnalyzeReferences}
                            aria-label="Analyze references"
                            className="create-icon-button"
                          >
                            <Scan size={16} />
                          </button>
                        </Tooltip>
                        <div className="relative">
                          <Tooltip content="Edit with AI (Refine)">
                            <button
                              ref={refineButtonRef}
                              type="button"
                              onClick={() => {
                                setIsRefineOpen(!isRefineOpen);
                                setIsNegativeOpen(false);
                              }}
                              aria-label="Open edit instructions"
                              aria-haspopup="dialog"
                              aria-expanded={isRefineOpen}
                              className={`create-icon-button ${isRefineOpen ? 'is-active' : ''}`}
                            >
                              <Edit3 size={16} />
                            </button>
                          </Tooltip>
                          <DemandMountedGsapDropdown
                            portal
                            data-toolbar-popup
                            open={isRefineOpen}
                            onOpenChange={setIsRefineOpen}
                            triggerRef={refineButtonRef}
                            placement="bottom-right"
                            role="dialog"
                            aria-label="Edit instructions"
                            className="studio-mobile-popover z-[100] w-72 p-3"
                          >
                            <label
                              htmlFor="rail-magic-edit-input"
                              className="mb-2 block text-[length:var(--wbp-label)] font-bold tracking-normal text-zinc-500"
                            >
                              Instructions to Edit
                            </label>
                            <div className="flex gap-2">
                              <input
                                id="rail-magic-edit-input"
                                type="text"
                                value={magicInstruction}
                                onChange={(e) => setMagicInstruction(e.target.value)}
                                placeholder="e.g. Make it cyberpunk style..."
                                autoComplete="off"
                                onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
                                aria-label="Edit instructions"
                                className="h-10 flex-1 rounded-[var(--wb-radius)] border border-white/2 bg-black/40 px-3 text-xs text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/2"
                              />
                              <button
                                type="button"
                                onClick={handleMagicEdit}
                                disabled={isRefactoring}
                                aria-label="Apply edit instructions"
                                className="flex size-10 touch-manipulation items-center justify-center rounded-[var(--wb-radius)] border border-accent-400/2 bg-accent-600 text-white transition-colors hover:bg-accent-500"
                              >
                                {isRefactoring ? (
                                  <div className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                ) : (
                                  <Send size={12} />
                                )}
                              </button>
                            </div>
                          </DemandMountedGsapDropdown>
                        </div>
                        <Tooltip content="Auto Enhance Prompt">
                          <button
                            type="button"
                            onClick={onEnhancePrompt}
                            disabled={isEnhancingPrompt}
                            aria-label="Enhance prompt"
                            className={`create-icon-button ${isEnhancingPrompt ? 'is-active' : ''}`}
                          >
                            {isEnhancingPrompt ? (
                              <div className="size-3 animate-spin rounded-full border-2 border-accent-400/30 border-t-accent-400" />
                            ) : (
                              <Wand2 size={16} />
                            )}
                          </button>
                        </Tooltip>
                        <Tooltip content="Expand editor">
                          <button
                            type="button"
                            className="create-icon-button"
                            aria-label="Expand prompt editor"
                            onClick={() => {
                              setExpandedPrompt(localPrompt);
                              setIsPromptExpanded(true);
                              setIsRefineOpen(false);
                            }}
                          >
                            <Maximize size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <div
                      data-composer-input
                      className={`create-composer ${composerDragDepth > 0 ? 'is-dragover' : ''} ${shouldShowQuickStartError ? 'quick-start-error-frame' : ''}`}
                      onDragEnter={(event) => {
                        if (!event.dataTransfer?.types.includes('Files')) return;
                        event.preventDefault();
                        setComposerDragDepth((depth) => depth + 1);
                      }}
                      onDragOver={(event) => {
                        if (!event.dataTransfer?.types.includes('Files')) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragLeave={() => setComposerDragDepth((depth) => Math.max(0, depth - 1))}
                      onDrop={(event) => {
                        setComposerDragDepth(0);
                        acceptRailImageDrop(event);
                      }}
                    >
                      {showQuickStartErrorText ? (
                        <div className="quick-start-error-float pointer-events-none absolute -top-5 left-4 z-[120] text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)]">
                          {requirement?.message ?? 'Add a prompt or image.'}
                        </div>
                      ) : null}
                      {sourceFirst ? referenceField : null}
                      {promptField}
                      {!sourceFirst ? referenceField : null}
                    </div>
                    {shouldShowQuickStartError ? (
                      <p id="generation-requirement" className="create-prompt-error" role="status">
                        {requirement?.message ?? 'Add a prompt or image.'}
                      </p>
                    ) : null}
                  </section>

                  {sourceFirst ? railTools : null}
                  <div
                    className="create-output-grid"
                    data-has-size={showSizeControl ? 'true' : undefined}
                  >
                    <div className="create-field">
                      <span className="create-field-label" id="create-format-label">
                        Format
                      </span>
                      <button
                        ref={aspectRatioButtonRef}
                        type="button"
                        className="create-select-field"
                        aria-haspopup="listbox"
                        aria-expanded={isAspectRatioOpen}
                        aria-label={`Format: ${generationConfig.aspectRatio}, ${formatOrientation}`}
                        onClick={() => {
                          setIsAspectRatioOpen(!isAspectRatioOpen);
                          setIsExecutionOpen(false);
                          setIsSizeOpen(false);
                          setIsBatchOpen(false);
                        }}
                      >
                        <span className="create-ratio-symbol" aria-hidden="true">
                          <span
                            className="create-ratio-shape"
                            style={getRatioShapeStyle(generationConfig.aspectRatio)}
                          />
                        </span>
                        <span className="create-select-value">
                          <strong id="create-format-value">{generationConfig.aspectRatio}</strong>
                          <small id="create-format-orientation">{formatOrientation}</small>
                        </span>
                        <ChevronDown size={14} aria-hidden="true" />
                      </button>
                      <DemandMountedGsapDropdown
                        portal
                        data-toolbar-popup
                        open={isAspectRatioOpen}
                        onOpenChange={setIsAspectRatioOpen}
                        triggerRef={aspectRatioButtonRef}
                        placement="bottom-left"
                        role="listbox"
                        aria-label="Output format"
                        className="create-format-popover"
                      >
                        <div className="create-popover-title">Output format</div>
                        <div className="create-ratio-grid">
                          {currentRatios.map((option) => {
                            const selected = generationConfig.aspectRatio === option.ratio;
                            const orientation =
                              RATIO_ORIENTATION_LABELS[getRatioOrientation(option.ratio)];
                            return (
                              <button
                                type="button"
                                key={option.ratio}
                                role="option"
                                aria-selected={selected}
                                aria-label={`${option.ratio} · ${orientation}`}
                                className={`create-ratio-choice${selected ? ' is-selected' : ''}`}
                                onClick={() => {
                                  updateConfig('aspectRatio', option.ratio);
                                  setIsAspectRatioOpen(false);
                                  setPreviewRatio(null);
                                }}
                                onMouseEnter={() => setPreviewRatio(option.ratio)}
                                onMouseLeave={() => setPreviewRatio(null)}
                              >
                                <span className="create-ratio-symbol" aria-hidden="true">
                                  <span
                                    className="create-ratio-shape"
                                    style={getRatioShapeStyle(option.ratio, 31, 27)}
                                  />
                                </span>
                                <span className="create-ratio-label">{option.ratio}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="create-popover-note">
                          {showSizeControl
                            ? 'Aspect ratio. Choose 1K, 2K, or 4K next to it.'
                            : 'Aspect ratio, not resolution.'}
                        </div>
                      </DemandMountedGsapDropdown>
                    </div>
                    {showSizeControl ? (
                      <div className="create-field">
                        <span className="create-field-label" id="create-size-label">
                          Size
                        </span>
                        <button
                          ref={sizeButtonRef}
                          type="button"
                          className="create-select-field"
                          aria-haspopup="listbox"
                          aria-expanded={isSizeOpen}
                          aria-label={`Image size: ${selectedExecutionImageSize?.tier ?? generationConfig.imageSize ?? '1K'}`}
                          onClick={() => {
                            setIsSizeOpen(!isSizeOpen);
                            setIsAspectRatioOpen(false);
                            setIsExecutionOpen(false);
                            setIsBatchOpen(false);
                          }}
                        >
                          <span className="create-select-value">
                            <strong>{selectedExecutionImageSize?.tier ?? '1K'}</strong>
                            <small>
                              {selectedExecutionImageSize
                                ? `${selectedExecutionImageSize.width}×${selectedExecutionImageSize.height}`
                                : 'Default'}
                            </small>
                          </span>
                          <ChevronDown size={14} aria-hidden="true" />
                        </button>
                        <DemandMountedGsapDropdown
                          portal
                          data-toolbar-popup
                          open={isSizeOpen}
                          onOpenChange={setIsSizeOpen}
                          triggerRef={sizeButtonRef}
                          placement="bottom-left"
                          role="listbox"
                          aria-label="Image size"
                          className="create-format-popover"
                        >
                          <div className="create-popover-title">Image size</div>
                          <div className="flex flex-col gap-1.5">
                            {executionImageSizeOptions.map((option) => {
                              const selected = selectedExecutionImageSize?.tier === option.tier;
                              return (
                                <button
                                  type="button"
                                  key={option.tier}
                                  role="option"
                                  aria-selected={selected}
                                  aria-label={`${option.tier}: ${option.width}×${option.height}`}
                                  className={`create-size-choice${selected ? ' is-selected' : ''}`}
                                  onClick={() => {
                                    handleSelectExecutionImageSize(option.tier);
                                    setIsSizeOpen(false);
                                  }}
                                >
                                  <span className="create-select-value">
                                    <strong>{option.tier}</strong>
                                    <small>
                                      {option.width}×{option.height}
                                      {option.experimental ? ' · experimental' : ''}
                                    </small>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {selectedExecutionImageSize?.experimental ? (
                            <div className="create-popover-note">
                              ChatGPT marks output above 2560×1440 as experimental.
                            </div>
                          ) : (
                            <div className="create-popover-note">
                              Available with ChatGPT Sign in and GPT Image models.
                            </div>
                          )}
                        </DemandMountedGsapDropdown>
                      </div>
                    ) : null}
                    <div className="create-field">
                      <label className="create-field-label" htmlFor="create-quantity-input">
                        Images
                      </label>
                      <div className="create-stepper">
                        <button
                          type="button"
                          className="create-step-button"
                          aria-label="Decrease image count"
                          disabled={currentBatch === previousBatchCount}
                          onClick={() => updateConfig('batchCount', previousBatchCount)}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          id="create-quantity-input"
                          className="create-quantity-input"
                          type="text"
                          inputMode="numeric"
                          value={String(currentBatch)}
                          role="spinbutton"
                          aria-valuemin={1}
                          aria-valuemax={maxOutputCount}
                          aria-valuenow={currentBatch}
                          aria-label="Image count"
                          autoComplete="off"
                          onChange={(event) => {
                            const rawValue = event.target.value.trim();
                            if (!/^\d+$/.test(rawValue)) return;
                            const value = Number.parseInt(rawValue, 10);
                            if (Number.isInteger(value) && value >= 1 && value <= maxOutputCount) {
                              updateConfig('batchCount', value);
                            }
                          }}
                          onBlur={() => updateConfig('batchCount', currentBatch)}
                        />
                        <button
                          type="button"
                          className="create-step-button"
                          aria-label="Increase image count"
                          disabled={currentBatch === nextBatchCount}
                          onClick={() => updateConfig('batchCount', nextBatchCount)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {showCodexPromptTools ? (
                    <div className="create-advanced-section">
                      <button
                        type="button"
                        className="create-advanced-toggle"
                        aria-expanded={isAdvancedOpen}
                        aria-controls="create-advanced-body"
                        aria-label="Advanced settings"
                        onClick={() => {
                          const next = !isAdvancedOpen;
                          setIsAdvancedOpen(next);
                          if (next) {
                            requestAnimationFrame(() =>
                              negativeInputRef.current?.focus({ preventScroll: false }),
                            );
                          }
                        }}
                      >
                        <SlidersHorizontal size={15} aria-hidden="true" />
                        <span>Advanced</span>
                        <span className="create-advanced-meta">
                          {generationConfig.negativePrompt?.trim() ? '1 active' : 'Optional'}
                        </span>
                        <ChevronDown size={13} aria-hidden="true" />
                      </button>
                      <AnimatePresence>
                        {isAdvancedOpen ? (
                          <div
                            data-motion-panel
                            className="create-advanced-body"
                            id="create-advanced-body"
                          >
                            <label className="create-field-label" htmlFor="create-negative-input">
                              Negative prompt
                            </label>
                            <textarea
                              ref={negativeInputRef}
                              id="create-negative-input"
                              className="create-negative-input"
                              value={generationConfig.negativePrompt || ''}
                              onChange={(event) =>
                                updateConfig('negativePrompt', event.target.value)
                              }
                              placeholder="Blurry, low quality, distortion..."
                              spellCheck={false}
                              aria-label="Negative prompt"
                            />
                          </div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 relative min-w-0">
              {/* Input Container */}
              <div
                data-composer-input
                className={`studio-field flex min-h-9 items-end gap-1.5 p-1 px-2 transition-colors duration-300 ${shouldShowQuickStartError ? 'quick-start-error-frame' : ''}`}
              >
                {showQuickStartErrorText && (
                  <div className="quick-start-error-float pointer-events-none absolute -top-5 left-4 z-[120] text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] animate-in fade-in-0 slide-in-from-bottom-1 duration-150">
                    {requirement?.message ?? 'Add a prompt or image.'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isNearLimit}
                  aria-label="Add image reference"
                  className={iconBtnClass}
                  data-tooltip="Add Image"
                >
                  <PlusCircle size={17} />
                </button>

                {hasAttachments && (
                  <ReferenceTray
                    attachments={generationConfig.attachments}
                    onEdit={onOpenEditor}
                    onRemove={onRemoveAttachment}
                    onFiles={onFilesDrop}
                  />
                )}

                {activeRecipeIndicator && (
                  <div
                    data-active-recipe-card={activeRecipeIndicator.id}
                    aria-label={`Active recipe: ${activeRecipeIndicator.title}. ${activeRecipeIndicator.summary}.`}
                    data-tooltip={`${activeRecipeIndicator.title}: ${activeRecipeIndicator.summary}`}
                    className={`group flex h-10 min-h-10 min-w-[6rem] max-w-[10.75rem] flex-[0_1_10.75rem] items-center gap-1.5 overflow-hidden rounded-[var(--wb-radius)] border px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[border-color,background-color,box-shadow] hover:shadow-[0_0_18px_rgba(255,255,255,0.05)] sm:flex-[0_0_10.75rem] ${activeRecipeIndicator.toneClassName}`}
                  >
                    <span
                      className={`h-5 w-1 shrink-0 rounded-[var(--wb-radius)] shadow-[0_0_12px_currentColor] ${activeRecipeIndicator.dotClassName}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-[length:var(--wbp-label)] font-semibold leading-none tracking-[0.12em] opacity-60">
                        Recipe
                      </span>
                      <span className="block truncate text-[11px] font-semibold leading-tight tracking-[0.06em] text-[color:var(--wb-ink)]">
                        {activeRecipeIndicator.title}
                      </span>
                      <span className="block truncate text-[length:var(--wbp-label)] font-medium leading-none opacity-70">
                        {activeRecipeIndicator.summary}
                      </span>
                    </span>
                  </div>
                )}

                {isContextOnly ? (
                  <div
                    data-task-context
                    className="studio-muted hidden min-w-0 flex-1 px-1.5 py-1 text-[11px] leading-relaxed sm:block"
                  >
                    Add references here. Use the selected task action above to continue.
                  </div>
                ) : null}

                {promptField}

                {/* LOGIC AI TOOLS */}
                <div
                  className={`${
                    showCodexPromptTools
                      ? isContextOnly
                        ? 'flex shrink-0 items-center gap-1.5'
                        : 'hidden shrink-0 items-center gap-1.5 sm:flex sm:gap-2'
                      : 'hidden'
                  }`}
                >
                  {/* 1. NEGATIVE (Exclude) */}
                  <div className="relative">
                    <Tooltip content="Negative Prompt (Exclude)">
                      <button
                        ref={negativeButtonRef}
                        type="button"
                        onClick={() => {
                          setIsNegativeOpen(!isNegativeOpen);
                          setIsRefineOpen(false);
                        }}
                        aria-label="Open negative prompt"
                        aria-haspopup="dialog"
                        aria-expanded={isNegativeOpen}
                        className={`${iconBtnClass} ${isNegativeOpen || generationConfig.negativePrompt ? 'text-[color:var(--wb-danger)]' : ''}`}
                      >
                        <Ban size={15} />
                        {generationConfig.negativePrompt && (
                          <div className="absolute top-1 right-1 size-1.5 bg-red-500 rounded-full" />
                        )}
                      </button>
                    </Tooltip>
                    <DemandMountedGsapDropdown
                      portal
                      data-toolbar-popup
                      open={isNegativeOpen}
                      onOpenChange={setIsNegativeOpen}
                      triggerRef={negativeButtonRef}
                      placement="top-right"
                      role="dialog"
                      aria-label="Negative prompt"
                      className="studio-mobile-popover absolute bottom-full right-0 z-[100] mb-3 w-64 p-3"
                    >
                      <label
                        htmlFor="negative-prompt-input"
                        className="text-[length:var(--wbp-label)] font-bold text-zinc-500 tracking-normal block mb-2"
                      >
                        Exclude from Image
                      </label>
                      <input
                        id="negative-prompt-input"
                        type="text"
                        value={generationConfig.negativePrompt || ''}
                        onChange={(e) => updateConfig('negativePrompt', e.target.value)}
                        placeholder="Blurry, low quality, distortion..."
                        autoComplete="off"
                        ref={(el) => el?.focus()}
                        aria-label="Negative prompt"
                        className="h-10 w-full rounded-[var(--wb-radius)] border border-white/2 bg-black/40 px-3 text-xs text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-red-500/30"
                      />
                    </DemandMountedGsapDropdown>
                  </div>

                  {!isContextOnly ? (
                    <>
                      {/* 2. REFINE (Edit with AI) */}
                      <div className="relative">
                        <Tooltip content="Edit with AI (Refine)">
                          <button
                            ref={refineButtonRef}
                            type="button"
                            onClick={() => {
                              setIsRefineOpen(!isRefineOpen);
                              setIsNegativeOpen(false);
                            }}
                            aria-label="Open edit instructions"
                            aria-haspopup="dialog"
                            aria-expanded={isRefineOpen}
                            className={`${iconBtnClass} ${isRefineOpen ? activeIconBtnClass : ''}`}
                          >
                            <Edit3 size={15} />
                          </button>
                        </Tooltip>
                        <DemandMountedGsapDropdown
                          portal
                          data-toolbar-popup
                          open={isRefineOpen}
                          onOpenChange={setIsRefineOpen}
                          triggerRef={refineButtonRef}
                          placement="top-right"
                          role="dialog"
                          aria-label="Edit instructions"
                          className="studio-mobile-popover absolute bottom-full right-0 z-[100] mb-3 w-72 p-3"
                        >
                          <label
                            htmlFor="magic-edit-input"
                            className="text-[length:var(--wbp-label)] font-bold text-zinc-500 tracking-normal block mb-2"
                          >
                            Instructions to Edit
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="magic-edit-input"
                              type="text"
                              value={magicInstruction}
                              onChange={(e) => setMagicInstruction(e.target.value)}
                              placeholder="e.g. Make it cyberpunk style..."
                              autoComplete="off"
                              ref={(el) => el?.focus()}
                              onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
                              aria-label="Edit instructions"
                              className="h-10 flex-1 rounded-[var(--wb-radius)] border border-white/2 bg-black/40 px-3 text-xs text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/2"
                            />
                            <button
                              type="button"
                              onClick={handleMagicEdit}
                              disabled={isRefactoring}
                              aria-label="Apply edit instructions"
                              className="flex size-10 touch-manipulation items-center justify-center rounded-[var(--wb-radius)] border border-accent-400/2 bg-accent-600 text-white transition-colors hover:bg-accent-500"
                            >
                              {isRefactoring ? (
                                <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Send size={12} />
                              )}
                            </button>
                          </div>
                        </DemandMountedGsapDropdown>
                      </div>

                      {/* 3. ENHANCE (Action) */}
                      <Tooltip content="Auto Enhance Prompt">
                        <button
                          type="button"
                          onClick={onEnhancePrompt}
                          disabled={isEnhancingPrompt}
                          aria-label="Enhance prompt"
                          className={`${iconBtnClass} ${isEnhancingPrompt ? 'text-accent-400' : ''}`}
                        >
                          {isEnhancingPrompt ? (
                            <div className="size-3 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin" />
                          ) : (
                            <Wand2 size={15} />
                          )}
                        </button>
                      </Tooltip>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* CONTROLS ROW */}
          <div
            className={
              isRail
                ? 'create-tool-footer'
                : 'studio-field pointer-events-auto flex w-full min-w-0 items-end justify-between gap-1 p-1 transition-colors duration-300 sm:w-auto sm:justify-start'
            }
          >
            {isRail ? null : (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  setIsNegativeOpen(false);
                  setIsRefineOpen(false);
                  setIsMobileControlsOpen(true);
                }}
                aria-label={
                  isContextOnly ? 'Open frame context controls' : 'Open generation controls'
                }
                aria-expanded={isMobileControlsOpen}
                className={`${btnClass} min-w-0 flex-1 sm:hidden`}
              >
                <SlidersHorizontal size={14} />
                <span>{isContextOnly ? 'Context' : 'Controls'}</span>
              </button>
            )}

            <div
              className={
                isRail
                  ? 'create-tool-execution'
                  : `${isMobileControlsOpen ? 'fixed' : 'hidden'} studio-popover custom-scrollbar inset-x-2 z-[90] flex-col gap-3 overflow-y-auto p-3 sm:static sm:flex sm:max-h-none sm:flex-row sm:items-end sm:gap-1 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`
              }
              style={
                !isRail && isMobileControlsOpen
                  ? {
                      bottom: 'calc(var(--studio-mobile-dock-height) + 0.75rem)',
                      maxHeight: 'min(62vh, 28rem)',
                    }
                  : undefined
              }
            >
              <div
                className={
                  isRail
                    ? 'hidden'
                    : 'flex items-center justify-between border-b border-white/2 pb-2 sm:hidden'
                }
              >
                <div className="text-[length:var(--wbp-label)] font-semibold tracking-[0.16em] text-zinc-500">
                  {isContextOnly ? 'Frame context' : 'Generation'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setIsMobileControlsOpen(false);
                  }}
                  aria-label="Close generation controls"
                  className="flex size-10 items-center justify-center rounded-[var(--wb-radius)] border border-white/2 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {showCodexPromptTools && !isContextOnly && !isRail ? (
                <div className="grid gap-2 rounded-[var(--wb-radius)] border border-white/2 bg-white/[0.03] p-2 sm:hidden">
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="mobile-negative-prompt-input"
                      className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-zinc-500"
                    >
                      Negative
                    </label>
                    <input
                      id="mobile-negative-prompt-input"
                      type="text"
                      value={generationConfig.negativePrompt || ''}
                      onChange={(e) => updateConfig('negativePrompt', e.target.value)}
                      placeholder="Blurry, low quality, distortion..."
                      autoComplete="off"
                      aria-label="Negative prompt"
                      className="h-10 rounded-[var(--wb-radius)] border border-white/2 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-red-500/30"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="mobile-magic-edit-input"
                      className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-zinc-500"
                    >
                      Refine
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="mobile-magic-edit-input"
                        type="text"
                        value={magicInstruction}
                        onChange={(e) => setMagicInstruction(e.target.value)}
                        placeholder="Make it sharper, warmer, cinematic..."
                        autoComplete="off"
                        onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
                        aria-label="Edit instructions"
                        className="h-10 min-w-0 flex-1 rounded-[var(--wb-radius)] border border-white/2 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/2"
                      />
                      <button
                        type="button"
                        onClick={handleMagicEdit}
                        disabled={isRefactoring}
                        aria-label="Apply edit instructions"
                        className="flex size-10 items-center justify-center rounded-[var(--wb-radius)] border border-accent-400/2 bg-accent-600 text-white transition-colors hover:bg-accent-500 disabled:opacity-50"
                      >
                        {isRefactoring ? (
                          <div className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        ) : (
                          <Send size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={onEnhancePrompt}
                      disabled={isEnhancingPrompt}
                      aria-label="Enhance prompt"
                      className="flex h-10 items-center justify-center gap-2 rounded-[var(--wb-radius)] border border-white/2 bg-white/5 text-[length:var(--wbp-label)] font-semibold leading-none tracking-normal text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      {isEnhancingPrompt ? (
                        <div className="size-3 animate-spin rounded-full border-2 border-accent-400/30 border-t-accent-400" />
                      ) : (
                        <Wand2 size={14} />
                      )}
                      Enhance
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2 sm:contents">
                {isRail || isContextOnly ? null : (
                  <div className="relative min-w-0">
                    <button
                      ref={aspectRatioButtonRef}
                      type="button"
                      onClick={() => {
                        setIsAspectRatioOpen(!isAspectRatioOpen);
                        setIsExecutionOpen(false);
                        setIsBatchOpen(false);
                      }}
                      aria-label={`Aspect ratio: ${generationConfig.aspectRatio}`}
                      aria-haspopup="menu"
                      aria-expanded={isAspectRatioOpen}
                      className={btnClass}
                    >
                      <AspectRatioIcon ratio={generationConfig.aspectRatio} />
                      <span>{generationConfig.aspectRatio}</span>
                    </button>
                    <DemandMountedGsapDropdown
                      portal
                      data-toolbar-popup
                      open={isAspectRatioOpen}
                      onOpenChange={setIsAspectRatioOpen}
                      triggerRef={aspectRatioButtonRef}
                      placement="top-left"
                      className="studio-mobile-popover absolute bottom-full left-0 z-[100] mb-4 grid w-[270px] grid-cols-3 gap-2 p-3"
                    >
                      {currentRatios.map((option) => (
                        <button
                          type="button"
                          key={option.ratio}
                          role="menuitemradio"
                          aria-checked={generationConfig.aspectRatio === option.ratio}
                          data-dropdown-item
                          onClick={() => {
                            updateConfig('aspectRatio', option.ratio);
                            setIsAspectRatioOpen(false);
                            setPreviewRatio(null);
                          }}
                          onMouseEnter={() => setPreviewRatio(option.ratio)}
                          data-tooltip={`${option.label}: ${option.size}`}
                          className={`aspect-square rounded-[var(--wb-radius)] flex flex-col items-center justify-center gap-1 transition-[color,background-color,border-color,opacity,transform,box-shadow] ${
                            generationConfig.aspectRatio === option.ratio
                              ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600/2 text-white shadow-lg'
                              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <AspectRatioIcon ratio={option.ratio} />
                          <span className="text-[length:var(--wbp-label)] font-semibold">
                            {option.ratio}
                          </span>
                          <span className="text-[6px] font-bold text-zinc-500">{option.size}</span>
                        </button>
                      ))}
                    </DemandMountedGsapDropdown>
                  </div>
                )}

                {/* Resolution */}
                {showSizeControl && !isRail ? (
                  <div className="relative min-w-0">
                    <button
                      ref={sizeButtonRef}
                      type="button"
                      onClick={() => {
                        setIsSizeOpen(!isSizeOpen);
                        setIsExecutionOpen(false);
                      }}
                      aria-label={`Image size: ${generationConfig.imageSize || '1K'}`}
                      aria-haspopup="menu"
                      aria-expanded={isSizeOpen}
                      className={btnClass}
                    >
                      <Monitor size={14} />
                      <span>{generationConfig.imageSize || '1K'}</span>
                    </button>
                    <DemandMountedGsapDropdown
                      portal
                      data-toolbar-popup
                      open={isSizeOpen}
                      onOpenChange={setIsSizeOpen}
                      triggerRef={sizeButtonRef}
                      placement="top-left"
                      className="studio-mobile-popover absolute bottom-full left-0 z-[100] mb-4 flex min-w-24 flex-col gap-1 p-2"
                    >
                      {currentSizes.map((option) => (
                        <button
                          type="button"
                          key={option.tier}
                          role="menuitemradio"
                          aria-checked={selectedExecutionImageSize?.tier === option.tier}
                          data-dropdown-item
                          onClick={() => {
                            handleSelectExecutionImageSize(option.tier);
                            setIsSizeOpen(false);
                          }}
                          className={`min-h-10 w-full rounded-[var(--wb-radius)] px-3 text-left text-[length:var(--wbp-label)] font-semibold transition-[color,background-color,border-color,opacity,transform] ${selectedExecutionImageSize?.tier === option.tier ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white' : 'text-zinc-400 hover:bg-white/10'}`}
                        >
                          {option.tier}
                          <span className="mt-0.5 block text-[length:var(--wbp-label)] font-bold tracking-normal text-zinc-500">
                            {option.width}×{option.height}
                          </span>
                        </button>
                      ))}
                    </DemandMountedGsapDropdown>
                  </div>
                ) : null}

                {isRail || isContextOnly ? null : (
                  <div className="relative min-w-0">
                    <button
                      ref={batchButtonRef}
                      type="button"
                      onClick={() => {
                        setIsBatchOpen(!isBatchOpen);
                        setIsExecutionOpen(false);
                      }}
                      aria-label={`Batch count: ${generationConfig.batchCount || 1}`}
                      aria-haspopup="menu"
                      aria-expanded={isBatchOpen}
                      className={btnClass}
                    >
                      <Layers size={14} />
                      <span>{generationConfig.batchCount || 1}x</span>
                    </button>
                    <DemandMountedGsapDropdown
                      portal
                      data-toolbar-popup
                      open={isBatchOpen}
                      onOpenChange={setIsBatchOpen}
                      triggerRef={batchButtonRef}
                      placement="top-left"
                      className="studio-mobile-popover absolute bottom-full left-0 z-[100] mb-4 flex gap-2 p-2"
                    >
                      {batchCounts.map((count) => (
                        <button
                          type="button"
                          key={count}
                          role="menuitemradio"
                          aria-checked={generationConfig.batchCount === count}
                          data-dropdown-item
                          onClick={() => {
                            updateConfig('batchCount', count);
                            setIsBatchOpen(false);
                          }}
                          className={`flex size-10 touch-manipulation items-center justify-center rounded-[var(--wb-radius)] text-[length:var(--wbp-label)] font-semibold transition-[color,background-color,border-color,opacity,transform] ${generationConfig.batchCount === count ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600/2 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                        >
                          {count}
                        </button>
                      ))}
                    </DemandMountedGsapDropdown>
                  </div>
                )}

                <div className={isRail ? 'create-tool-provider-row' : 'contents'}>
                  {commandCenter && onSelectProvider ? (
                    <ProviderQuickSwitch
                      provider={commandCenter.provider}
                      providerOptions={commandCenter.providerOptions}
                      compactMode={commandCenter.compactMode}
                      isProviderSaving={isProviderSaving}
                      onSelectProvider={onSelectProvider}
                      onOpenSettings={onOpenSettings}
                      placement="top-left"
                      showLabel
                      variant={isRail ? 'rail' : 'toolbar'}
                      className={isRail ? 'min-w-0' : undefined}
                      triggerClassName={isRail ? 'create-tool-chip' : btnClass}
                    />
                  ) : null}

                  {showCodexModelChrome ? (
                    <div className="relative min-w-0">
                      <button
                        ref={executionButtonRef}
                        type="button"
                        onClick={() => {
                          setIsExecutionOpen(!isExecutionOpen);
                          setIsAspectRatioOpen(false);
                          setIsSizeOpen(false);
                          setIsBatchOpen(false);
                        }}
                        aria-label={`${activeProviderId === 'chatgpt' ? 'ChatGPT' : 'Codex'} task execution: ${executionSummary}`}
                        aria-haspopup="dialog"
                        aria-expanded={isExecutionOpen}
                        className={isRail ? 'create-tool-chip' : btnClass}
                      >
                        {isRail ? null : <BrainCircuit size={14} />}
                        {isRail ? (
                          <span className="create-engine-copy">
                            <span className="create-engine-kicker">Model</span>
                            <span className="create-engine-name">{executionChipLabel}</span>
                          </span>
                        ) : (
                          <span className="min-w-0 truncate text-[length:var(--wbp-label)]">
                            {executionSummary}
                          </span>
                        )}
                        {isRail ? <ChevronDown size={12} aria-hidden="true" /> : null}
                      </button>
                      <DemandMountedGsapDropdown
                        portal
                        data-toolbar-popup
                        open={isExecutionOpen}
                        onOpenChange={setIsExecutionOpen}
                        triggerRef={executionButtonRef}
                        placement="top-right"
                        role="dialog"
                        aria-label="Image generation settings"
                        className="create-execution-menu"
                      >
                        <header className="create-execution-header">
                          <div>
                            <h3>Generation settings</h3>
                            <p>Applies to the next image.</p>
                          </div>
                          {activeProviderId === 'codex' && isLoadingCodexModelCatalog && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          <button
                            type="button"
                            className="studio-ghost-control"
                            aria-label="Close generation settings"
                            onClick={() => setIsExecutionOpen(false)}
                          >
                            <X size={14} />
                          </button>
                        </header>
                        <div className="create-execution-body">
                          <section aria-labelledby="codex-execution-model-label">
                            <h4 id="codex-execution-model-label">Text model</h4>
                            {selectedCodexTransport === 'subscription_http' ? (
                              <div className="create-execution-managed">
                                <strong>
                                  {selectedExecutionModel?.displayName ||
                                    generationConfig.executionModel}
                                </strong>
                                <span>Managed by ChatGPT</span>
                              </div>
                            ) : (
                              <div className="create-execution-model-list">
                                {codexModels.map((model) => {
                                  const isSelected = model.id === selectedExecutionModel?.id;
                                  const modelLabel = formatCodexModelLabel(
                                    model.id,
                                    model.displayName,
                                  );
                                  return (
                                    <button
                                      type="button"
                                      key={model.id}
                                      data-codex-model={model.id}
                                      aria-pressed={isSelected}
                                      aria-label={modelLabel}
                                      data-tooltip={model.description || modelLabel}
                                      onClick={() => handleSelectExecutionModel(model)}
                                      className="studio-ghost-control create-execution-choice"
                                    >
                                      <span className="create-execution-copy">
                                        <strong>{model.displayName || modelLabel}</strong>
                                      </span>
                                      {model.isDefault && (
                                        <span className="create-execution-badge">Default</span>
                                      )}
                                      {getCodexSpeedOptions(model).includes('fast') && (
                                        <span className="create-execution-badge">Fast</span>
                                      )}
                                      {isSelected && <Check size={14} aria-hidden="true" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </section>

                          {selectedCodexTransport === 'subscription_http' ? (
                            <>
                              <section aria-labelledby="codex-image-model-label">
                                <h4 id="codex-image-model-label">Image model</h4>
                                <div className="create-execution-options">
                                  {executionImageModels.map((imageModel) => {
                                    const isSelected =
                                      imageModel.id === selectedExecutionImageModel?.id;
                                    return (
                                      <button
                                        type="button"
                                        key={imageModel.id}
                                        data-codex-image-model={imageModel.id}
                                        aria-pressed={isSelected}
                                        aria-label={imageModel.displayName}
                                        onClick={() => handleSelectExecutionImageModel(imageModel)}
                                        className="studio-ghost-control create-execution-choice"
                                      >
                                        <span className="create-execution-copy">
                                          <strong>{imageModel.displayName}</strong>
                                        </span>
                                        {imageModel.lifecycle === 'previous' && (
                                          <span className="create-execution-badge">Previous</span>
                                        )}
                                        {isSelected && <Check size={14} aria-hidden="true" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </section>
                              <section aria-labelledby="codex-image-size-label">
                                <h4 id="codex-image-size-label">Output size</h4>
                                <div
                                  className="create-execution-sizes"
                                  role="group"
                                  aria-label="ChatGPT image size"
                                >
                                  {executionImageSizeOptions.map((option) => (
                                    <button
                                      type="button"
                                      key={option.tier}
                                      data-codex-image-size={option.tier}
                                      aria-pressed={
                                        selectedExecutionImageSize?.tier === option.tier
                                      }
                                      aria-label={`${option.tier}: ${option.width}×${option.height}`}
                                      data-tooltip={`${option.width}×${option.height}${option.experimental ? ' · experimental' : ''}`}
                                      onClick={() => handleSelectExecutionImageSize(option.tier)}
                                      className="studio-ghost-control create-execution-choice"
                                    >
                                      <span className="create-execution-copy">
                                        <strong>{option.tier}</strong>
                                        <small>
                                          {option.width}×{option.height}
                                        </small>
                                      </span>
                                    </button>
                                  ))}
                                </div>
                                {selectedExecutionImageSize?.experimental && (
                                  <p className="create-execution-note">
                                    ChatGPT marks output above 2560×1440 as experimental.
                                  </p>
                                )}
                              </section>
                              <p className="create-execution-note">
                                Reasoning and speed are managed by ChatGPT.
                              </p>
                            </>
                          ) : (
                            <div className="create-execution-tuning">
                              <section aria-labelledby="codex-reasoning-label">
                                <h4 id="codex-reasoning-label">Reasoning</h4>
                                <div className="create-execution-segments">
                                  {executionReasoningOptions.map((effort) => {
                                    const isManaged = effort === 'provider_default';
                                    const label = isManaged
                                      ? 'Auto'
                                      : effort.charAt(0).toUpperCase() + effort.slice(1);
                                    return (
                                      <button
                                        type="button"
                                        key={effort}
                                        aria-label={`Reasoning: ${isManaged ? 'Managed' : effort}`}
                                        aria-pressed={
                                          generationConfig.executionReasoningEffort === effort
                                        }
                                        onClick={() => {
                                          if (!isManaged)
                                            updateConfig('executionReasoningEffort', effort);
                                        }}
                                        className="studio-ghost-control create-execution-choice"
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </section>
                              <section aria-labelledby="codex-speed-label">
                                <h4 id="codex-speed-label">Speed</h4>
                                <div className="create-execution-segments">
                                  {executionSpeedOptions.map((speed) => (
                                    <button
                                      type="button"
                                      key={speed}
                                      aria-label={`Speed: ${formatCodexSpeedLabel(speed)}`}
                                      aria-pressed={generationConfig.executionSpeed === speed}
                                      onClick={() => handleSelectExecutionSpeed(speed)}
                                      className="studio-ghost-control create-execution-choice"
                                    >
                                      {formatCodexSpeedLabel(speed)}
                                    </button>
                                  ))}
                                </div>
                              </section>
                            </div>
                          )}
                        </div>

                        {executionSourceMessage && (
                          <div className="create-execution-warning">{executionSourceMessage}</div>
                        )}
                      </DemandMountedGsapDropdown>
                    </div>
                  ) : commandCenter && onSelectProvider ? null : (
                    <div
                      role="status"
                      aria-label={`Generation provider: ${formatGenerationProviderLabel(activeProviderId)}`}
                      data-tooltip="Generation provider"
                      className={`${btnClass} cursor-default`}
                    >
                      <Zap size={14} />
                      <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal">
                        {formatGenerationProviderLabel(activeProviderId)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isRail && requirement ? (
              <p id="generation-requirement" className="create-style-empty" role="status">
                {requirement.message}
              </p>
            ) : null}
            {isRail ? railAction : null}
            {!isContextOnly ? (
              <Tooltip
                content={generateBlock?.message || 'Generate images'}
                position="top"
                className={isRail ? 'w-full' : undefined}
                hidden={isRail && !generateBlock}
              >
                <button
                  type="button"
                  onClick={handleTriggerGenerate}
                  disabled={Boolean(generateBlock)}
                  data-tooltip={generateBlock?.message ?? requirement?.message}
                  aria-describedby={
                    requirement
                      ? 'generation-requirement'
                      : generateBlock
                        ? 'grok-generate-block'
                        : undefined
                  }
                  data-studio-generate-button
                  data-generate-active={isGenerating ? 'true' : 'false'}
                  className={
                    isRail
                      ? `create-generate-button ${isGenerating ? 'is-busy' : ''}`
                      : `group relative h-10 min-h-10 min-w-[8.75rem] px-4 rounded-[var(--wb-radius)] flex items-center justify-center gap-2 sm:ml-1 overflow-hidden
                    text-[length:var(--wbp-label)] tracking-normal font-semibold transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                      isGenerating
                        ? 'bg-gradient-to-b from-accent-800 to-accent-950 text-accent-200 border border-accent-500/2 shadow-lg hover:border-accent-300/2 hover:text-white active:scale-95'
                        : 'bg-gradient-to-b from-accent-700 via-accent-800 to-accent-950 hover:from-accent-600 hover:via-accent-700 hover:to-accent-900 text-accent-100 border-t border-accent-500/2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(var(--accent-600),0.3)] active:scale-95'
                    }`
                  }
                >
                  {isGenerating ? (
                    <GenerationElapsedStatus
                      startTime={generationStartTime}
                      variant={isRail ? 'rail' : 'dock'}
                    />
                  ) : isRail ? (
                    <>
                      <Sparkles size={17} aria-hidden="true" />
                      <span>{`Generate ${outputSummary}`}</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      <div className="relative z-10 flex items-center gap-2">
                        <>
                          <Wand2
                            size={14}
                            className="group-hover:rotate-12 transition-transform text-accent-300"
                          />
                          <span className="text-white">GENERATE</span>
                        </>
                      </div>
                    </>
                  )}
                </button>
              </Tooltip>
            ) : null}
            {isRail ? (
              <div className="create-footer-meta">
                <span className="create-local-status">
                  <span className="create-status-dot" aria-hidden="true" />
                  <span
                    id={
                      generateBlock
                        ? 'grok-generate-block'
                        : requirement && !shouldShowQuickStartError
                          ? 'generation-requirement'
                          : undefined
                    }
                    role={
                      generateBlock || (requirement && !shouldShowQuickStartError)
                        ? 'status'
                        : undefined
                    }
                  >
                    {generateBlock?.message ??
                      (isGenerating
                        ? 'Generating'
                        : shouldShowQuickStartError
                          ? ''
                          : (requirement?.message ?? 'Ready to generate'))}
                  </span>
                </span>
                {isGenerating ? null : <kbd className="create-shortcut-hint">{shortcutHint}</kbd>}
              </div>
            ) : null}
          </div>
          {generateBlock && !isRail ? (
            <p
              id="grok-generate-block"
              role="status"
              className="order-first mt-0 max-w-xl text-[11px] font-medium leading-relaxed text-[color:var(--wb-warning)] sm:order-none sm:mt-2"
            >
              {generateBlock.message}
            </p>
          ) : null}
        </div>

        <AnimatePresence>
          {isRail && isPromptExpanded && (
            <CreatePromptExpandDialog
              isOpen={isRail && isPromptExpanded}
              value={expandedPrompt}
              onChange={setExpandedPrompt}
              onClose={() => setIsPromptExpanded(false)}
              onSave={saveExpandedPrompt}
            />
          )}
        </AnimatePresence>

        {/* Key Selector Popover (External) */}
        <KeyPopover
          isOpen={isKeyPopoverOpen}
          onClose={onOpenKeySelector}
          onSelectKey={onSelectKey}
        />
      </div>
    );
  },
);
