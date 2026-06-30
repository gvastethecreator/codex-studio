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
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
} from '../packages/shared/src';
import type {
  AspectRatio,
  Attachment,
  GenerationModel,
  ImageGenerationConfig,
  ImageSize,
} from '../types';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';
import KeyPopover from './KeyPopover';
import Tooltip from './Tooltip';

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
    options?: { force?: boolean; preventModal?: boolean; useCurrentAttachments?: boolean },
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
  activeRecipe?: ImageGenerationConfig['recipeId'];
}

const ICON_SIZE = 14;

const AspectRatioIcon: React.FC<{ ratio: AspectRatio }> = ({ ratio }) => {
  switch (ratio) {
    case '1:1':
      return <Square size={ICON_SIZE} />;
    case '3:2':
      return <RectangleHorizontal size={ICON_SIZE} />;
    default:
      return <RectangleVertical size={ICON_SIZE} />;
  }
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

function buildCodexFallbackCatalogErrorMessage(catalog: CodexModelCatalogResponse | null) {
  if (!catalog || catalog.source !== 'fallback' || !catalog.error) {
    return null;
  }

  return 'Using documented catalog while Codex app-server is not responding live.';
}

import { useGlobal } from '../contexts/GlobalContext';

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
    activeRecipe = null,
  }) => {
    const { addToast } = useGlobal();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const [isForcedMode, setIsForcedMode] = useState(false);

    // Logic AI Popover States
    const [isNegativeOpen, setIsNegativeOpen] = useState(false);
    const [isRefineOpen, setIsRefineOpen] = useState(false);

    const [magicInstruction, setMagicInstruction] = useState('');
    const [isRefactoring, setIsRefactoring] = useState(false);
    const [elapsedTick, setElapsedTick] = useState(0);
    const [scrambleTick, setScrambleTick] = useState(0);

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

    useEffect(() => {
      if (!isScrambling) return;
      const interval = window.setInterval(() => setScrambleTick((t) => t + 1), 30);
      return () => clearInterval(interval);
    }, [isScrambling]);

    const scrambleText = useMemo(() => {
      if (!isScrambling) return '';
      void scrambleTick;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      const targetLength = localPrompt.length > 0 ? localPrompt.length : 50;
      let scrambled = '';
      for (let i = 0; i < targetLength; i++) {
        if (localPrompt[i] === ' ') {
          scrambled += ' ';
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      return scrambled;
    }, [isScrambling, scrambleTick, localPrompt]);

    useEffect(() => {
      if (!isGenerating || !generationStartTime) return;
      const interval = window.setInterval(() => setElapsedTick((t) => t + 1), 100);
      return () => clearInterval(interval);
    }, [isGenerating, generationStartTime]);

    const elapsedTime = useMemo(() => {
      if (!isGenerating || !generationStartTime) return '0.0';
      void elapsedTick;
      return ((Date.now() - generationStartTime) / 1000).toFixed(1);
    }, [isGenerating, generationStartTime, elapsedTick]);

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

    useLayoutEffect(() => {
      if (textareaRef.current) {
        const target = textareaRef.current;
        const scrollPos = target.scrollTop;
        // Reset height to base height to get the correct scrollHeight when text is deleted
        target.style.height = '28px';
        const scrollHeight = target.scrollHeight;
        target.style.height = `${Math.min(Math.max(scrollHeight, 28), 320)}px`;
        // Restore scroll position to prevent jumping
        target.scrollTop = scrollPos;
      }
    }, [localPrompt, scrambleText]);

    const handleTriggerGenerate = useCallback(() => {
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
      onGenerate(localPrompt, undefined, { force: isForcedMode });

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
      isForcedMode,
      setIsInteracting,
      interactionScope,
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

    const currentRatios = RATIOS;
    const showSizeControl = false;
    const currentSizes = PRO_SIZES;

    const btnClass =
      'h-10 sm:h-9 w-full sm:w-auto flex items-center justify-center gap-1.5 px-2 sm:px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black tracking-widest transition-[color,background-color,border-color,opacity,transform,box-shadow] active:scale-95 text-zinc-400 hover:text-white disabled:opacity-30 uppercase group border border-transparent hover:border-white/5 whitespace-nowrap cursor-pointer';
    const iconBtnClass =
      'size-10 sm:size-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-[color,background-color,border-color,opacity,transform,box-shadow] active:scale-90 relative cursor-pointer disabled:cursor-not-allowed';
    const activeIconBtnClass =
      'bg-gradient-to-b from-accent-800 to-accent-950 border border-accent-700/50 text-accent-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-pointer';

    const hasAttachments = generationConfig.attachments.length > 0;
    const isNearLimit = generationConfig.attachments.length >= maxAttachments;
    const hasQuickStartInput = localPrompt.trim().length > 0 || hasAttachments;
    const activeRecipeIndicator = getActiveRecipeIndicator(
      generationConfig.recipeId ?? activeRecipe,
    );

    if (quickStartError && (quickStartErrorScope !== interactionScope || hasQuickStartInput)) {
      setQuickStartError(false);
    }

    const shouldShowQuickStartError =
      quickStartError && quickStartErrorScope === interactionScope && !hasQuickStartInput;
    const showQuickStartErrorText = shouldShowQuickStartError && isPromptFocused;

    return (
      <div
        ref={containerRef}
        onMouseEnter={handleToolbarMouseEnter}
        onMouseMove={handleToolbarMouseEnter}
        onMouseLeave={handleToolbarMouseLeave}
        className="w-full flex flex-col justify-end z-50 transition-colors duration-700 ease-in-out relative"
      >
        {/* Fixed height background that doesn't expand with the textarea */}
        <div className="absolute inset-x-0 bottom-0 h-[94px] pointer-events-none bg-black/80 backdrop-blur-sm transition-colors duration-700 ease-in-out sm:h-[50px]" />

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
                className={iconBtnClass}
                title="Add Image"
              >
                <PlusCircle size={17} />
              </button>

              {hasAttachments && (
                <div className="flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-150">
                  {generationConfig.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="size-8 group relative rounded-xl overflow-hidden bg-zinc-800 shrink-0"
                    >
                      <img src={att.dataUrl} className="size-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAttachment(att.id);
                          }}
                          className="p-1 bg-red-500 text-white rounded-lg transition-[color,background-color,border-color,opacity,transform] active:scale-90 hover:bg-red-400"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRecipeIndicator && (
                <div
                  data-active-recipe-card={activeRecipeIndicator.id}
                  aria-label={`Active recipe: ${activeRecipeIndicator.title}. ${activeRecipeIndicator.summary}.`}
                  title={`${activeRecipeIndicator.title}: ${activeRecipeIndicator.summary}`}
                  className={`group flex h-8 min-w-[5.5rem] max-w-[9.75rem] flex-[0_1_9.75rem] items-center gap-1.5 overflow-hidden rounded-[6px] border px-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[border-color,background-color,box-shadow] hover:shadow-[0_0_18px_rgba(255,255,255,0.05)] sm:h-9 sm:max-w-[10.5rem] sm:flex-[0_0_10.5rem] ${activeRecipeIndicator.toneClassName}`}
                >
                  <span
                    className={`h-5 w-1 shrink-0 rounded-[2px] shadow-[0_0_12px_currentColor] ${activeRecipeIndicator.dotClassName}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-[6px] font-black uppercase leading-none tracking-[0.18em] opacity-60">
                      Recipe
                    </span>
                    <span className="block truncate text-[9px] font-black uppercase leading-tight tracking-[0.08em] text-white sm:text-[10px]">
                      {activeRecipeIndicator.title}
                    </span>
                    <span className="block truncate text-[8px] font-medium leading-none opacity-70">
                      {activeRecipeIndicator.summary}
                    </span>
                  </span>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={isEnhancingPrompt || isRefactoring ? scrambleText : localPrompt}
                readOnly={isEnhancingPrompt || isRefactoring}
                onFocus={() => {
                  setIsInteracting(true);
                  setIsPromptFocused(true);
                }}
                aria-label="Prompt input"
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
                placeholder="Describe what you want to create..."
                rows={1}
                className={`custom-scrollbar max-h-[320px] min-w-0 flex-1 self-end overflow-y-auto resize-none border-none bg-transparent px-1.5 py-1 text-[13px] font-medium leading-normal tracking-tight text-zinc-200 outline-none placeholder-zinc-700 sm:min-w-[100px] ${isEnhancingPrompt || isRefactoring ? 'font-mono text-accent-400 opacity-80' : ''}`}
                style={{ minHeight: '28px' }}
              />

              {/* LOGIC AI TOOLS */}
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex sm:gap-2">
                {/* 1. NEGATIVE (Exclude) */}
                <div className="relative">
                  <Tooltip content="Negative Prompt (Exclude)">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNegativeOpen(!isNegativeOpen);
                        setIsRefineOpen(false);
                      }}
                      className={`${iconBtnClass} ${isNegativeOpen || generationConfig.negativePrompt ? 'text-red-400' : ''}`}
                    >
                      <Ban size={15} />
                      {generationConfig.negativePrompt && (
                        <div className="absolute top-1 right-1 size-1.5 bg-red-500 rounded-full" />
                      )}
                    </button>
                  </Tooltip>
                  {isNegativeOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-3 right-0 w-64 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      <label
                        htmlFor="negative-prompt-input"
                        className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2"
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
                        className="w-full h-8 bg-black/40 border border-white/5 rounded-lg px-3 text-[11px] text-zinc-300 outline-none placeholder-zinc-700 focus:border-red-500/30 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* 2. REFINE (Edit with AI) */}
                <div className="relative">
                  <Tooltip content="Edit with AI (Refine)">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRefineOpen(!isRefineOpen);
                        setIsNegativeOpen(false);
                      }}
                      className={`${iconBtnClass} ${isRefineOpen ? activeIconBtnClass : ''}`}
                    >
                      <Edit3 size={15} />
                    </button>
                  </Tooltip>
                  {isRefineOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-3 right-0 w-72 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      <label
                        htmlFor="magic-edit-input"
                        className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2"
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
                          className="flex-1 h-8 bg-black/40 border border-white/5 rounded-lg px-3 text-[11px] text-zinc-300 outline-none placeholder-zinc-700 focus:border-accent-500/30 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleMagicEdit}
                          disabled={isRefactoring}
                          className="size-8 bg-accent-600 hover:bg-accent-500 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          {isRefactoring ? (
                            <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. ENHANCE (Action) */}
                <Tooltip content="Auto Enhance Prompt">
                  <button
                    type="button"
                    onClick={onEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    className={`${iconBtnClass} ${isEnhancingPrompt ? 'text-accent-400' : ''}`}
                  >
                    {isEnhancingPrompt ? (
                      <div className="size-3 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin" />
                    ) : (
                      <Wand2 size={15} />
                    )}
                  </button>
                </Tooltip>

                {/* 6. FORCE JOB */}
                <Tooltip content="Force Job (Bypass Queue)">
                  <button
                    type="button"
                    onClick={() => setIsForcedMode(!isForcedMode)}
                    className={`${iconBtnClass} ${isForcedMode ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30' : ''}`}
                  >
                    <Zap size={15} className={isForcedMode ? 'animate-pulse' : ''} />
                    {isForcedMode && (
                      <div className="absolute top-1 right-1 size-1.5 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* CONTROLS ROW */}
          <div className="pointer-events-auto flex w-full min-w-0 items-end justify-between gap-1 sm:w-auto sm:justify-start">
            <button
              type="button"
              onClick={() => {
                closeAllMenus();
                setIsNegativeOpen(false);
                setIsRefineOpen(false);
                setIsMobileControlsOpen(true);
              }}
              aria-label="Open generation controls"
              aria-expanded={isMobileControlsOpen}
              className={`${btnClass} min-w-0 flex-1 sm:hidden`}
            >
              <SlidersHorizontal size={14} />
              <span>Controls</span>
            </button>

            <div
              className={`${isMobileControlsOpen ? 'fixed' : 'hidden'} custom-scrollbar inset-x-2 z-[90] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:flex sm:max-h-none sm:flex-row sm:items-end sm:gap-1 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0`}
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
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Generation
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setIsMobileControlsOpen(false);
                  }}
                  aria-label="Close generation controls"
                  className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-2 rounded-xl border border-white/6 bg-white/[0.03] p-2 sm:hidden">
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
                    className="h-9 rounded-lg border border-white/5 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-red-500/30"
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
                      className="h-9 min-w-0 flex-1 rounded-lg border border-white/5 bg-black/40 px-3 text-[11px] text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-accent-500/30"
                    />
                    <button
                      type="button"
                      onClick={handleMagicEdit}
                      disabled={isRefactoring}
                      aria-label="Apply edit instructions"
                      className="flex size-9 items-center justify-center rounded-lg bg-accent-600 text-white transition-colors hover:bg-accent-500 disabled:opacity-50"
                    >
                      {isRefactoring ? (
                        <div className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <Send size={12} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    aria-label="Enhance prompt"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    {isEnhancingPrompt ? (
                      <div className="size-3 animate-spin rounded-full border-2 border-accent-400/30 border-t-accent-400" />
                    ) : (
                      <Wand2 size={14} />
                    )}
                    Enhance
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForcedMode(!isForcedMode)}
                    aria-label="Toggle force job"
                    aria-pressed={isForcedMode}
                    className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                      isForcedMode
                        ? 'border border-yellow-500/30 bg-yellow-900/20 text-yellow-300'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Zap size={14} className={isForcedMode ? 'animate-pulse' : undefined} />
                    Force
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:contents">
                {/* Aspect Ratio */}
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAspectRatioOpen(!isAspectRatioOpen);
                      setIsModelOpen(false);
                      setIsExecutionOpen(false);
                      setIsBatchOpen(false);
                    }}
                    className={btnClass}
                  >
                    <AspectRatioIcon ratio={generationConfig.aspectRatio} />
                    <span>{generationConfig.aspectRatio}</span>
                  </button>
                  {isAspectRatioOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100] grid grid-cols-3 gap-2 w-[270px] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      {currentRatios.map((option) => (
                        <button
                          type="button"
                          key={option.ratio}
                          onClick={() => {
                            updateConfig('aspectRatio', option.ratio);
                            setIsAspectRatioOpen(false);
                            setPreviewRatio(null);
                          }}
                          onMouseEnter={() => setPreviewRatio(option.ratio)}
                          title={`${option.label}: ${option.size}`}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-[color,background-color,border-color,opacity,transform,box-shadow] ${
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
                    </div>
                  )}
                </div>

                {/* Resolution */}
                {showSizeControl && (
                  <div className="relative min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSizeOpen(!isSizeOpen);
                        setIsModelOpen(false);
                        setIsExecutionOpen(false);
                      }}
                      className={btnClass}
                    >
                      <Monitor size={14} />
                      <span>{generationConfig.imageSize || '1K'}</span>
                    </button>
                    {isSizeOpen && (
                      <div className="studio-mobile-popover absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1 min-w-[80px] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                        {currentSizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => {
                              updateConfig('imageSize', size);
                              setIsSizeOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black transition-[color,background-color,border-color,opacity,transform,box-shadow] ${generationConfig.imageSize === size ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Batch Count */}
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBatchOpen(!isBatchOpen);
                      setIsModelOpen(false);
                      setIsExecutionOpen(false);
                    }}
                    className={btnClass}
                  >
                    <Layers size={14} />
                    <span>{generationConfig.batchCount || 1}x</span>
                  </button>
                  {isBatchOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex gap-2 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      {BATCH_COUNTS.map((count) => (
                        <button
                          type="button"
                          key={count}
                          onClick={() => {
                            updateConfig('batchCount', count);
                            setIsBatchOpen(false);
                          }}
                          className={`size-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-[color,background-color,border-color,opacity,transform,box-shadow] ${generationConfig.batchCount === count ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Model Selector */}
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModelOpen(!isModelOpen);
                      setIsAspectRatioOpen(false);
                      setIsExecutionOpen(false);
                    }}
                    className={btnClass}
                  >
                    <ModelIcon model={generationConfig.model} />
                    <span className="text-[8px] sm:hidden 2xl:inline">
                      {AVAILABLE_MODELS.find((m) => m.id === generationConfig.model)?.name.replace(
                        'Codex ',
                        '',
                      )}
                    </span>
                  </button>
                  {isModelOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-4 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 min-w-[240px] shadow-2xl z-[100] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      {AVAILABLE_MODELS.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            updateConfig('model', m.id);
                            setIsModelOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-[color,background-color,border-color,opacity,transform,box-shadow] mb-1 last:mb-0 ${generationConfig.model === m.id ? 'bg-gradient-to-r from-accent-900/50 to-accent-800/50 border border-accent-700/30' : 'hover:bg-white/5 text-zinc-400 border border-transparent'}`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <ModelIcon model={m.id} />
                            <div
                              className={`text-[10px] font-black uppercase tracking-wide ${generationConfig.model === m.id ? 'text-accent-300' : 'text-zinc-300'}`}
                            >
                              {m.name}
                            </div>
                          </div>
                          <div className="text-[8px] text-zinc-500 font-bold pl-6">
                            {m.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Codex Task Execution Selector */}
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExecutionOpen(!isExecutionOpen);
                      setIsModelOpen(false);
                      setIsAspectRatioOpen(false);
                      setIsBatchOpen(false);
                    }}
                    className={btnClass}
                  >
                    <BrainCircuit size={14} />
                    <span className="text-[8px] sm:hidden">Task</span>
                    <span className="hidden text-[8px] 2xl:inline">{executionSummary}</span>
                  </button>
                  {isExecutionOpen && (
                    <div className="studio-mobile-popover absolute bottom-full mb-4 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 min-w-[360px] max-w-[420px] shadow-2xl z-[110] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150 custom-scrollbar">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-1">
                            Codex Task Execution
                          </div>
                          <div className="text-[11px] font-black text-zinc-100 uppercase tracking-wide">
                            {selectedExecutionModel?.displayName || executionModelLabel}
                          </div>
                          <div className="text-[8px] text-zinc-500 font-bold mt-1 max-w-[280px] leading-relaxed">
                            {selectedExecutionModel?.description ||
                              'Choose the Codex model that executes the generation task, plus its thinking effort and speed tier.'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isLoadingCodexModelCatalog && (
                            <Loader2 size={12} className="animate-spin text-accent-300" />
                          )}
                          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GENERATE BUTTON - Dark Gradient Premium */}
            <button
              type="button"
              onClick={handleTriggerGenerate}
              data-studio-generate-button
              data-generate-active={isGenerating ? 'true' : 'false'}
              className={`
                    group relative h-8 px-3 sm:h-9 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:ml-1 overflow-hidden
                    text-[10px] tracking-[0.2em] font-black uppercase transition-[color,background-color,border-color,opacity,transform,box-shadow] cursor-pointer
                    ${
                      isGenerating
                        ? 'bg-gradient-to-b from-accent-800 to-accent-950 text-accent-200 border border-accent-500/30 shadow-lg hover:border-accent-300/45 hover:text-white active:scale-95'
                        : 'bg-gradient-to-b from-accent-700 via-accent-800 to-accent-950 hover:from-accent-600 hover:via-accent-700 hover:to-accent-900 text-accent-100 border-t border-accent-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(var(--accent-600),0.3)] active:scale-95'
                    }
                `}
            >
              {/* Progress Bar Layer */}
              {isGenerating && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-accent-500/20 transition-[width] duration-100 ease-linear z-0"
                  style={{
                    width: `${Math.min((parseFloat(elapsedTime) / 120) * 100, 100)}%`,
                  }}
                />
              )}

              {/* Subtle Shine Effect Layer */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full z-0 ${isGenerating ? 'animate-shimmer' : 'group-hover:animate-[shimmer_1.5s_infinite]'}`}
              />

              {/* Content Layer */}
              <div className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Send size={14} className="text-accent-200" />
                    <span className="text-white">QUEUE</span>
                    <span className="hidden w-12 text-right text-[8px] tabular-nums text-accent-300/80 sm:inline">
                      {elapsedTime}s
                    </span>
                  </>
                ) : (
                  <>
                    <Wand2
                      size={14}
                      className="group-hover:rotate-12 transition-transform text-accent-300"
                    />
                    <span className="text-white">GENERATE</span>
                  </>
                )}
              </div>
            </button>
          </div>
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
