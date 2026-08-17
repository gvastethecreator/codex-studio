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
  IconKey as Key,
  IconStack as Layers,
  IconLoader2 as Loader2,
  IconMaximize as Maximize,
  IconDeviceDesktop as Monitor,
  IconDots as MoreHorizontal,
  IconCirclePlus as PlusCircle,
  IconAspectRatio as Ratio,
  IconRectangle as RectangleHorizontal,
  IconRectangleVertical as RectangleVertical,
  IconScan as Scan,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconSend as Send,
  IconShieldExclamation as ShieldAlert,
  IconSparkles as Sparkles,
  IconSquare as Square,
  IconWand as Wand,
  IconWand as Wand2,
  IconX as X,
  IconBolt as Zap,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatCodexModelLabel,
  formatCodexSpeedLabel,
  getCodexReasoningOptions,
  getCodexSpeedOptions,
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
  pickPreferredCodexModel,
} from '../lib/codexExecution';
import { getActiveRecipeIndicator } from '../lib/activeRecipeIndicator';
import type {
  CodexModel,
  CodexModelCatalogResponse,
  CodexServiceTier,
  GenerationProviderId,
} from '../packages/shared/src';
import type {
  AspectRatio,
  Attachment,
  GenerationModel,
  ImageGenerationConfig,
  ImageSize,
} from '../types';
import {
  listGrokImagineRatioOptions,
  resolveGrokImagineGenerateBlock,
} from '../lib/grokImagineUiPolicy';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';
import KeyPopover from './KeyPopover';
import Tooltip from './Tooltip';
import { DemandMountedGsapDropdown } from './ui/DemandMountedGsapDropdown';
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
  onFilesDrop: (files: File[]) => void;
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
  grokCanExecute?: boolean;
  grokStatus?: string;
  grokDiagnostics?: string[];
  activeRecipe?: ImageGenerationConfig['recipeId'];
  mode?: 'full' | 'context-only';
}

const ICON_SIZE = 14;

const AspectRatioIcon: React.FC<{ ratio: AspectRatio }> = ({ ratio }) => {
  const [width = 1, height = 1] = ratio.split(':').map(Number);
  if (width === height) return <Square size={ICON_SIZE} />;
  if (width > height) return <RectangleHorizontal size={ICON_SIZE} />;
  return <RectangleVertical size={ICON_SIZE} />;
};

import { MODELS as MODEL_IDS } from '../constants';

const ModelIcon: React.FC<{ model: GenerationModel }> = ({ model }) => {
  if (model === MODEL_IDS.CODEX_IMAGEGEN) {
    return (
      <div className="relative flex items-center justify-center size-4">
        <Sparkles size={ICON_SIZE} className="text-accent-400 group-hover:text-accent-300" />
        <Sparkles
          size={8}
          strokeWidth={3}
          className="absolute -top-1 -right-1.5 text-accent-200 fill-accent-100/50 animate-pulse"
        />
      </div>
    );
  }
  return <Zap size={ICON_SIZE} />;
};

const AVAILABLE_MODELS: {
  id: GenerationModel;
  name: string;
  description: string;
}[] = [
  {
    id: MODEL_IDS.CODEX_IMAGEGEN,
    name: 'Codex ImageGen',
    description: 'Local ChatGPT/Codex session',
  },
];

const RATIOS = IMAGE_GEN_RATIO_OPTIONS;
const PRO_SIZES: ImageSize[] = ['1K'];
const BATCH_COUNTS = [1, 2, 3, 4];
const EMPTY_CODEX_MODELS: CodexModel[] = [];

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

function buildCodexFallbackCatalogErrorMessage(catalog: CodexModelCatalogResponse | null) {
  if (!catalog || catalog.source !== 'fallback' || !catalog.error) {
    return null;
  }

  return 'Using documented catalog while Codex app-server is not responding live.';
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
    grokCanExecute = false,
    grokStatus,
    grokDiagnostics,
    activeRecipe = null,
    mode = 'full',
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
    const modelButtonRef = useRef<HTMLButtonElement>(null);
    const executionButtonRef = useRef<HTMLButtonElement>(null);

    const [localPrompt, setLocalPrompt] = useState(generationConfig.prompt || '');
    const [quickStartError, setQuickStartError] = useState(false);
    const [quickStartErrorScope, setQuickStartErrorScope] = useState<string | undefined>();
    const [isPromptFocused, setIsPromptFocused] = useState(false);

    // Menu States
    const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isExecutionOpen, setIsExecutionOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [isBatchOpen, setIsBatchOpen] = useState(false);
    const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

    // Logic AI Popover States
    const [isNegativeOpen, setIsNegativeOpen] = useState(false);
    const [isRefineOpen, setIsRefineOpen] = useState(false);

    const [magicInstruction, setMagicInstruction] = useState('');
    const [isRefactoring, setIsRefactoring] = useState(false);

    const codexModels = codexModelCatalog?.models ?? EMPTY_CODEX_MODELS;
    const preferredExecutionModelId = pickPreferredCodexModel(
      codexModels,
      generationConfig.executionModel,
    );
    const selectedExecutionModel =
      codexModels.find((model) => model.id === generationConfig.executionModel) ??
      codexModels.find((model) => model.id === preferredExecutionModelId) ??
      null;
    const executionReasoningOptions = getCodexReasoningOptions(selectedExecutionModel);
    const executionSpeedOptions = getCodexSpeedOptions(selectedExecutionModel);
    const executionModelLabel = formatCodexModelLabel(
      generationConfig.executionModel,
      selectedExecutionModel?.displayName,
    );
    const executionSourceMessage =
      buildCodexFallbackCatalogErrorMessage(codexModelCatalog) || codexModelCatalogError;
    const executionSummary = [
      executionModelLabel,
      generationConfig.executionReasoningEffort?.toUpperCase(),
      generationConfig.executionSpeed !== 'standard'
        ? formatCodexSpeedLabel(generationConfig.executionSpeed)
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const isScrambling = isEnhancingPrompt || isRefactoring;

    const handleSelectExecutionModel = useCallback(
      (model: CodexModel) => {
        updateConfig('executionModel', model.id);
        updateConfig(
          'executionReasoningEffort',
          normalizeCodexReasoningEffort(model, generationConfig.executionReasoningEffort),
        );
        updateConfig('executionSpeed', normalizeCodexSpeed(model, generationConfig.executionSpeed));
      },
      [generationConfig.executionReasoningEffort, generationConfig.executionSpeed, updateConfig],
    );

    const handleSelectExecutionSpeed = useCallback(
      (speed: CodexServiceTier) => {
        updateConfig('executionSpeed', normalizeCodexSpeed(selectedExecutionModel, speed));
      },
      [selectedExecutionModel, updateConfig],
    );

    const closeAllMenus = useCallback(() => {
      setIsAspectRatioOpen(false);
      setIsModelOpen(false);
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

    const currentRatios = activeProviderId === 'grok' ? listGrokImagineRatioOptions() : RATIOS;
    const generateBlock = resolveGrokImagineGenerateBlock({
      providerId: activeProviderId,
      recipeId: activeRecipe,
      aspectRatio: generationConfig.aspectRatio,
      attachments: generationConfig.attachments,
      canExecute: grokCanExecute,
      status: grokStatus,
      diagnostics: grokDiagnostics,
    });
    const showCodexPromptTools = activeProviderId !== 'grok';

    const handleTriggerGenerate = useCallback(() => {
      if (generateBlock) return;
      const trimmedPrompt = localPrompt.trim();
      if (!trimmedPrompt && generationConfig.attachments.length === 0) {
        setQuickStartErrorScope(interactionScope);
        setQuickStartError(true);
        setIsInteracting(true);
        requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
        return;
      }

      // Force sync immediately before generating
      updateConfig('prompt', localPrompt);
      onGenerate(localPrompt);

      closeAllMenus();
      setIsNegativeOpen(false);
      setIsRefineOpen(false);
      setIsMobileControlsOpen(false);
    }, [
      localPrompt,
      generationConfig.attachments.length,
      updateConfig,
      onGenerate,
      closeAllMenus,
      setIsInteracting,
      interactionScope,
      generateBlock,
    ]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTriggerGenerate();
      }
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

    const showSizeControl = false;
    const currentSizes = PRO_SIZES;

    const btnClass =
      'h-10 min-h-10 w-full touch-manipulation sm:w-auto flex items-center justify-center gap-2 px-3 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase leading-none tracking-[0.18em] text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[color,background-color,border-color,opacity,transform,box-shadow] hover:border-white/10 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 group whitespace-nowrap cursor-pointer';
    const iconBtnClass =
      'size-10 min-w-10 flex-shrink-0 touch-manipulation flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[color,background-color,border-color,opacity,transform,box-shadow] hover:border-white/10 hover:bg-white/10 hover:text-white active:scale-90 relative cursor-pointer disabled:cursor-not-allowed';
    const activeIconBtnClass =
      'bg-gradient-to-b from-accent-800 to-accent-950 border border-accent-700/50 text-accent-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-pointer';

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

    return (
      <div
        ref={containerRef}
        data-toolbar-mode={mode}
        onMouseEnter={handleToolbarMouseEnter}
        onMouseMove={handleToolbarMouseEnter}
        onMouseLeave={handleToolbarMouseLeave}
        className="w-full flex flex-col justify-end z-50 transition-colors duration-200 ease-out relative"
      >
        {/* Fixed height background that doesn't expand with the textarea */}
        <div className="absolute inset-x-0 bottom-0 h-[106px] pointer-events-none bg-black/80 transition-colors duration-200 ease-out sm:h-[56px]" />

        <div className="relative z-10 flex w-full flex-col items-stretch gap-1 px-2 py-1.5 sm:flex-row sm:items-end sm:gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            aria-label="Upload images"
            className="hidden"
            accept="image/*"
            multiple
          />

          {/* INPUT AREA - ALWAYS VISIBLE */}
          <div className="flex-1 relative min-w-0">
            {/* Input Container */}
            <div
              className={`flex min-h-9 items-end gap-1.5 rounded-lg border border-white/5 bg-zinc-900/50 p-1 px-2 shadow-lg transition-colors duration-300 ${shouldShowQuickStartError ? 'quick-start-error-frame' : ''}`}
            >
              {showQuickStartErrorText && (
                <div className="quick-start-error-float pointer-events-none absolute -top-5 left-4 z-[120] text-[9px] font-black uppercase tracking-[0.18em] text-red-200 animate-in fade-in-0 slide-in-from-bottom-1 duration-150">
                  Add prompt or image to generate
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isNearLimit}
                aria-label="Add image reference"
                className={iconBtnClass}
                title="Add Image"
              >
                <PlusCircle size={17} />
              </button>

              {hasAttachments && (
                <div className="flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-150">
                  {generationConfig.attachments.map((att) => (
                    <div key={att.id} className="relative size-8 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenEditor(att)}
                        aria-label={`Edit ${att.name}`}
                        className="size-8 overflow-hidden rounded-xl bg-zinc-800"
                      >
                        <img
                          src={att.dataUrl}
                          width={32}
                          height={32}
                          className="size-full object-cover"
                          alt=""
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAttachment(att.id);
                        }}
                        aria-label={`Remove ${att.name}`}
                        className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-zinc-950 text-zinc-200 ring-1 ring-white/20 hover:bg-red-500 hover:text-white"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeRecipeIndicator && (
                <div
                  data-active-recipe-card={activeRecipeIndicator.id}
                  aria-label={`Active recipe: ${activeRecipeIndicator.title}. ${activeRecipeIndicator.summary}.`}
                  title={`${activeRecipeIndicator.title}: ${activeRecipeIndicator.summary}`}
                  className={`group flex h-10 min-h-10 min-w-[6rem] max-w-[10.75rem] flex-[0_1_10.75rem] items-center gap-1.5 overflow-hidden rounded-xl border px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[border-color,background-color,box-shadow] hover:shadow-[0_0_18px_rgba(255,255,255,0.05)] sm:flex-[0_0_10.75rem] ${activeRecipeIndicator.toneClassName}`}
                >
                  <span
                    className={`h-5 w-1 shrink-0 rounded-[2px] shadow-[0_0_12px_currentColor] ${activeRecipeIndicator.dotClassName}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase leading-none tracking-[0.12em] opacity-60">
                      Recipe
                    </span>
                    <span className="block truncate text-[11px] font-black uppercase leading-tight tracking-[0.06em] text-white">
                      {activeRecipeIndicator.title}
                    </span>
                    <span className="block truncate text-[10px] font-medium leading-none opacity-70">
                      {activeRecipeIndicator.summary}
                    </span>
                  </span>
                </div>
              )}

              {isContextOnly ? (
                <div
                  data-animation-frame-context
                  className="hidden min-w-0 flex-1 px-1.5 py-1 text-[11px] leading-relaxed text-zinc-500 sm:block"
                >
                  Add frame references here. Generate and Correct stay in the Frame Inspector.
                </div>
              ) : null}

              <LivePromptTextarea
                textareaRef={textareaRef}
                prompt={localPrompt}
                isScrambling={isScrambling}
                isHidden={isContextOnly}
                onFocus={() => {
                  setIsInteracting(true);
                  setIsPromptFocused(true);
                }}
                onBlur={() => {
                  setIsPromptFocused(false);
                  // IMMEDIATE SYNC ON BLUR: Fixes race condition when clicking external buttons
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
                  const files = Array.from(items as any as Iterable<DataTransferItem>).reduce<
                    File[]
                  >((acc, item) => {
                    if (!item.type.startsWith('image/')) return acc;
                    const file = item.getAsFile();
                    if (file !== null) acc.push(file);
                    return acc;
                  }, []);
                  if (files.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    onFilesDrop(files);
                  }
                }}
                onDrop={(e) => {
                  const files = Array.from(e.dataTransfer.files as any as Iterable<File>).filter(
                    (f) => f.type.startsWith('image/'),
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
                      className={`${iconBtnClass} ${isNegativeOpen || generationConfig.negativePrompt ? 'text-red-400' : ''}`}
                    >
                      <Ban size={15} />
                      {generationConfig.negativePrompt && (
                        <div className="absolute top-1 right-1 size-1.5 bg-red-500 rounded-full" />
                      )}
                    </button>
                  </Tooltip>
                  <DemandMountedGsapDropdown
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
                      className="text-[10px] font-bold text-zinc-500 tracking-wide block mb-2"
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
                      className="h-10 w-full rounded-xl border border-white/5 bg-black/40 px-3 text-xs text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-red-500/30"
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
                          className="text-[10px] font-bold text-zinc-500 tracking-wide block mb-2"
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
                            className="h-10 flex-1 rounded-xl border border-white/5 bg-black/40 px-3 text-xs text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/30"
                          />
                          <button
                            type="button"
                            onClick={handleMagicEdit}
                            disabled={isRefactoring}
                            aria-label="Apply edit instructions"
                            className="flex size-10 touch-manipulation items-center justify-center rounded-xl border border-accent-400/20 bg-accent-600 text-white transition-colors hover:bg-accent-500"
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

          {/* CONTROLS ROW */}
          <div className="pointer-events-auto flex w-full min-w-0 items-end justify-between gap-1 rounded-lg border border-white/5 bg-zinc-900/50 p-1 shadow-lg transition-colors duration-300 sm:w-auto sm:justify-start">
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

            <div
              className={`${isMobileControlsOpen ? 'fixed' : 'hidden'} custom-scrollbar inset-x-2 z-[90] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl sm:static sm:flex sm:max-h-none sm:flex-row sm:items-end sm:gap-1 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
              style={
                isMobileControlsOpen
                  ? {
                      bottom: 'calc(var(--studio-mobile-dock-height) + 0.75rem)',
                      maxHeight: 'min(62vh, 28rem)',
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 sm:hidden">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                  {isContextOnly ? 'Frame context' : 'Generation'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setIsMobileControlsOpen(false);
                  }}
                  aria-label="Close generation controls"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div
                className={`${
                  showCodexPromptTools && !isContextOnly
                    ? 'grid gap-2 rounded-xl border border-white/6 bg-white/[0.03] p-2 sm:hidden'
                    : 'hidden'
                }`}
              >
                <div className="grid gap-1.5">
                  <label
                    htmlFor="mobile-negative-prompt-input"
                    className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500"
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
                    className="h-10 rounded-xl border border-white/5 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-red-500/30"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label
                    htmlFor="mobile-magic-edit-input"
                    className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500"
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
                      className="h-10 min-w-0 flex-1 rounded-xl border border-white/5 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/30"
                    />
                    <button
                      type="button"
                      onClick={handleMagicEdit}
                      disabled={isRefactoring}
                      aria-label="Apply edit instructions"
                      className="flex size-10 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-600 text-white transition-colors hover:bg-accent-500 disabled:opacity-50"
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
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase leading-none tracking-[0.18em] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
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

              <div className="grid grid-cols-2 gap-2 sm:contents">
                {/* Aspect Ratio */}
                <div className={`${isContextOnly ? 'hidden' : 'relative min-w-0'}`}>
                  <button
                    ref={aspectRatioButtonRef}
                    type="button"
                    onClick={() => {
                      setIsAspectRatioOpen(!isAspectRatioOpen);
                      setIsModelOpen(false);
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
                        title={`${option.label}: ${option.size}`}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-[color,background-color,border-color,opacity,transform,box-shadow] ${
                          generationConfig.aspectRatio === option.ratio
                            ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600/50 text-white shadow-lg'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <AspectRatioIcon ratio={option.ratio} />
                        <span className="text-[8px] font-black">{option.ratio}</span>
                        <span className="text-[6px] font-bold text-zinc-500">{option.size}</span>
                      </button>
                    ))}
                  </DemandMountedGsapDropdown>
                </div>

                {/* Resolution */}
                {showSizeControl && (
                  <div className="relative min-w-0">
                    <button
                      ref={sizeButtonRef}
                      type="button"
                      onClick={() => {
                        setIsSizeOpen(!isSizeOpen);
                        setIsModelOpen(false);
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
                      open={isSizeOpen}
                      onOpenChange={setIsSizeOpen}
                      triggerRef={sizeButtonRef}
                      placement="top-left"
                      className="studio-mobile-popover absolute bottom-full left-0 z-[100] mb-4 flex min-w-24 flex-col gap-1 p-2"
                    >
                      {currentSizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          role="menuitemradio"
                          aria-checked={generationConfig.imageSize === size}
                          data-dropdown-item
                          onClick={() => {
                            updateConfig('imageSize', size);
                            setIsSizeOpen(false);
                          }}
                          className={`min-h-10 w-full rounded-xl px-3 text-left text-[10px] font-black transition-[color,background-color,border-color,opacity,transform] ${generationConfig.imageSize === size ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white' : 'text-zinc-400 hover:bg-white/10'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </DemandMountedGsapDropdown>
                  </div>
                )}

                {/* Batch Count */}
                <div className={`${isContextOnly ? 'hidden' : 'relative min-w-0'}`}>
                  <button
                    ref={batchButtonRef}
                    type="button"
                    onClick={() => {
                      setIsBatchOpen(!isBatchOpen);
                      setIsModelOpen(false);
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
                    open={isBatchOpen}
                    onOpenChange={setIsBatchOpen}
                    triggerRef={batchButtonRef}
                    placement="top-left"
                    className="studio-mobile-popover absolute bottom-full left-0 z-[100] mb-4 flex gap-2 p-2"
                  >
                    {BATCH_COUNTS.map((count) => (
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
                        className={`flex size-10 touch-manipulation items-center justify-center rounded-xl text-[10px] font-black transition-[color,background-color,border-color,opacity,transform] ${generationConfig.batchCount === count ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {count}
                      </button>
                    ))}
                  </DemandMountedGsapDropdown>
                </div>

                {activeProviderId === 'codex' ? (
                  <>
                    {/* Model Selector */}
                    <div className="relative min-w-0">
                      <button
                        ref={modelButtonRef}
                        type="button"
                        onClick={() => {
                          setIsModelOpen(!isModelOpen);
                          setIsAspectRatioOpen(false);
                          setIsExecutionOpen(false);
                        }}
                        aria-label={`Generation model: ${
                          AVAILABLE_MODELS.find((m) => m.id === generationConfig.model)?.name ??
                          generationConfig.model
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={isModelOpen}
                        className={btnClass}
                      >
                        <ModelIcon model={generationConfig.model} />
                        <span className="text-[8px] sm:hidden 2xl:inline">
                          {AVAILABLE_MODELS.find(
                            (m) => m.id === generationConfig.model,
                          )?.name.replace('Codex ', '')}
                        </span>
                      </button>
                      <DemandMountedGsapDropdown
                        open={isModelOpen}
                        onOpenChange={setIsModelOpen}
                        triggerRef={modelButtonRef}
                        placement="top-right"
                        className="studio-mobile-popover absolute bottom-full right-0 z-[100] mb-4 min-w-[240px] p-2"
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            role="menuitemradio"
                            aria-checked={generationConfig.model === m.id}
                            data-dropdown-item
                            onClick={() => {
                              updateConfig('model', m.id);
                              setIsModelOpen(false);
                            }}
                            className={`mb-1 min-h-12 w-full rounded-xl px-3 py-2.5 text-left transition-[color,background-color,border-color,opacity,transform] last:mb-0 ${generationConfig.model === m.id ? 'bg-gradient-to-r from-accent-900/50 to-accent-800/50 border border-accent-700/30' : 'border border-transparent text-zinc-400 hover:bg-white/5'}`}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <ModelIcon model={m.id} />
                              <div
                                className={`text-[10px] font-black uppercase tracking-wide ${generationConfig.model === m.id ? 'text-accent-300' : 'text-zinc-300'}`}
                              >
                                {m.name}
                              </div>
                            </div>
                            <div className="pl-6 text-[10px] font-bold text-zinc-500">
                              {m.description}
                            </div>
                          </button>
                        ))}
                      </DemandMountedGsapDropdown>
                    </div>

                    {/* Codex Task Execution Selector */}
                    <div className="relative min-w-0">
                      <button
                        ref={executionButtonRef}
                        type="button"
                        onClick={() => {
                          setIsExecutionOpen(!isExecutionOpen);
                          setIsModelOpen(false);
                          setIsAspectRatioOpen(false);
                          setIsBatchOpen(false);
                        }}
                        aria-label={`Codex task execution: ${executionSummary}`}
                        aria-haspopup="dialog"
                        aria-expanded={isExecutionOpen}
                        className={btnClass}
                      >
                        <BrainCircuit size={14} />
                        <span className="text-[8px] sm:hidden">Task</span>
                        <span className="hidden text-[8px] 2xl:inline">{executionSummary}</span>
                      </button>
                      <DemandMountedGsapDropdown
                        open={isExecutionOpen}
                        onOpenChange={setIsExecutionOpen}
                        triggerRef={executionButtonRef}
                        placement="top-right"
                        role="dialog"
                        aria-label="Codex task execution"
                        className="studio-mobile-popover absolute bottom-full right-0 z-[110] mb-4 w-[min(90vw,420px)] p-3"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                              Codex Task Execution
                            </div>
                            <div className="text-xs font-black uppercase tracking-wide text-zinc-100">
                              {selectedExecutionModel?.displayName || executionModelLabel}
                            </div>
                            <div className="mt-1 max-w-[280px] text-[10px] font-bold leading-relaxed text-zinc-500">
                              {selectedExecutionModel?.description ||
                                'Choose the Codex model that executes the generation task, plus its thinking effort and speed tier.'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isLoadingCodexModelCatalog && (
                              <Loader2 size={12} className="animate-spin text-accent-300" />
                            )}
                            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                              {codexModelCatalog?.source === 'fallback' ? 'Docs fallback' : 'Live'}
                            </div>
                          </div>
                        </div>

                        {executionSourceMessage && (
                          <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[8px] font-bold text-amber-200">
                            {executionSourceMessage}
                          </div>
                        )}

                        <div className="mb-3">
                          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-2">
                            Available Codex Models
                          </div>
                          <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                            {codexModels.map((model) => {
                              const isSelected = model.id === selectedExecutionModel?.id;
                              const modelSpeedOptions = getCodexSpeedOptions(model);
                              return (
                                <button
                                  type="button"
                                  key={model.id}
                                  onClick={() => handleSelectExecutionModel(model)}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-[color,background-color,border-color,opacity,transform,box-shadow] border ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-accent-900/50 to-accent-800/50 border-accent-700/30'
                                      : 'hover:bg-white/5 text-zinc-400 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-1">
                                    <div
                                      className={`text-[10px] font-black uppercase tracking-wide ${
                                        isSelected ? 'text-accent-300' : 'text-zinc-200'
                                      }`}
                                    >
                                      {model.displayName}
                                    </div>
                                    {isSelected ? (
                                      <Check size={12} className="text-accent-300 shrink-0" />
                                    ) : null}
                                  </div>
                                  <div className="text-[8px] text-zinc-500 font-bold leading-relaxed">
                                    {model.description || 'Codex execution model'}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {model.isDefault && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-accent-500/15 text-accent-200 text-[7px] font-black uppercase tracking-wide">
                                        Default
                                      </span>
                                    )}
                                    {modelSpeedOptions.includes('fast') && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-200 text-[7px] font-black uppercase tracking-wide">
                                        Fast
                                      </span>
                                    )}
                                    {codexModelCatalog?.planType &&
                                      model.id === 'gpt-5.3-codex-spark' && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-200 text-[7px] font-black uppercase tracking-wide">
                                          {codexModelCatalog.planType}
                                        </span>
                                      )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 mb-3">
                          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500 mb-2">
                            Thinking
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {executionReasoningOptions.map((effort) => (
                              <button
                                type="button"
                                key={effort}
                                onClick={() => updateConfig('executionReasoningEffort', effort)}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-[color,background-color,border-color,opacity,transform,box-shadow] ${
                                  generationConfig.executionReasoningEffort === effort
                                    ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white border border-accent-500/30'
                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                }`}
                              >
                                {effort}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">
                              Speed
                            </div>
                            <div className="text-[8px] font-bold text-zinc-600">
                              Fast mode depends on the selected model and Codex sign-in.
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {executionSpeedOptions.map((speed) => (
                              <button
                                type="button"
                                key={speed}
                                onClick={() => handleSelectExecutionSpeed(speed)}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-[color,background-color,border-color,opacity,transform,box-shadow] ${
                                  generationConfig.executionSpeed === speed
                                    ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white border border-accent-500/30'
                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                }`}
                              >
                                {formatCodexSpeedLabel(speed)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </DemandMountedGsapDropdown>
                    </div>
                  </>
                ) : (
                  <div
                    role="status"
                    aria-label={`Generation provider: ${formatGenerationProviderLabel(activeProviderId)}`}
                    title="Generation provider"
                    className={`${btnClass} cursor-default`}
                  >
                    <Zap size={14} />
                    <span className="text-[8px] font-black uppercase tracking-wide">
                      {formatGenerationProviderLabel(activeProviderId)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* GENERATE BUTTON - Dark Gradient Premium */}
            {!isContextOnly ? (
              <button
                type="button"
                onClick={handleTriggerGenerate}
                disabled={Boolean(generateBlock)}
                title={generateBlock?.message}
                aria-describedby={generateBlock ? 'grok-generate-block' : undefined}
                data-studio-generate-button
                data-generate-active={isGenerating ? 'true' : 'false'}
                className={`
                    group relative h-10 min-h-10 min-w-[8.75rem] px-4 rounded-xl flex items-center justify-center gap-2 sm:ml-1 overflow-hidden
                    text-[10px] tracking-[0.2em] font-black uppercase transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer disabled:cursor-not-allowed disabled:opacity-45
                    ${
                      isGenerating
                        ? 'bg-gradient-to-b from-accent-800 to-accent-950 text-accent-200 border border-accent-500/30 shadow-lg hover:border-accent-300/45 hover:text-white active:scale-95'
                        : 'bg-gradient-to-b from-accent-700 via-accent-800 to-accent-950 hover:from-accent-600 hover:via-accent-700 hover:to-accent-900 text-accent-100 border-t border-accent-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(var(--accent-600),0.3)] active:scale-95'
                    }
                `}
              >
                {isGenerating ? (
                  <GenerationElapsedStatus startTime={generationStartTime} />
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
            ) : null}
          </div>
          {generateBlock ? (
            <p
              id="grok-generate-block"
              role="status"
              className="order-first mt-0 max-w-xl text-[11px] font-medium leading-relaxed text-amber-200/90 sm:order-none sm:mt-2"
            >
              {generateBlock.message}
            </p>
          ) : null}
        </div>

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
