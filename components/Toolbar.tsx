import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  PlusCircle,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Bot,
  Zap,
  Wand2,
  Sparkles,
  ChevronDown,
  Maximize,
  Send,
  BrainCircuit,
  X,
  Key,
  Layers,
  ShieldAlert,
  Wand,
  Eraser,
  MoreHorizontal,
  ImagePlus,
  Monitor,
  Hash,
  Ratio,
  Scan,
  Ban,
  Edit3,
  Check,
  Loader2,
} from 'lucide-react';
import { MotionDiv, AnimatePresence, Variants } from 'motion/react';
import type {
  CodexModel,
  CodexModelCatalogResponse,
  CodexServiceTier,
} from '../packages/shared/src';
import {
  ImageGenerationConfig,
  Attachment,
  GenerationModel,
  AspectRatio,
  ImageSize,
} from '../types';
import Tooltip from './Tooltip';
import KeyPopover from './KeyPopover';
import {
  formatCodexModelLabel,
  formatCodexSpeedLabel,
  getCodexReasoningOptions,
  getCodexSpeedOptions,
  normalizeCodexReasoningEffort,
  normalizeCodexSpeed,
  pickPreferredCodexModel,
} from '../lib/codexExecution';
import { getCodexModelCatalog } from '../services/localStudioService';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';

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
    options?: { force?: boolean; preventModal?: boolean },
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
}

const AspectRatioIcon: React.FC<{ ratio: AspectRatio }> = ({ ratio }) => {
  const iconProps = { size: 14 };
  switch (ratio) {
    case '1:1':
      return <Square {...iconProps} />;
    case '3:2':
      return <RectangleHorizontal {...iconProps} />;
    default:
      return <RectangleVertical {...iconProps} />;
  }
};

import { MODELS as MODEL_IDS } from '../constants';

const ModelIcon: React.FC<{ model: GenerationModel }> = ({ model }) => {
  const iconProps = { size: 14 };
  if (model === MODEL_IDS.CODEX_IMAGEGEN) {
    return (
      <div className="relative flex items-center justify-center size-4">
        <Sparkles {...iconProps} className="text-accent-400 group-hover:text-accent-300" />
        <Sparkles
          size={8}
          strokeWidth={3}
          className="absolute -top-1 -right-1.5 text-accent-200 fill-accent-100/50 animate-pulse"
        />
      </div>
    );
  }
  return <Zap {...iconProps} />;
};

const AVAILABLE_MODELS: { id: GenerationModel; name: string; description: string }[] = [
  {
    id: MODEL_IDS.CODEX_IMAGEGEN,
    name: 'Codex ImageGen',
    description: 'Local ChatGPT/Codex session',
  },
];

const RATIOS = IMAGE_GEN_RATIO_OPTIONS;
const PRO_SIZES: ImageSize[] = ['1K'];
const BATCH_COUNTS = [1, 2, 3, 4];

function buildCodexFallbackCatalogErrorMessage(catalog: CodexModelCatalogResponse | null) {
  if (!catalog || catalog.source !== 'fallback' || !catalog.error) {
    return null;
  }

  return 'Using documented catalog while Codex app-server is not responding live.';
}

const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

import { useDebounce } from '../hooks/useDebounce';

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
  }) => {
    const { addToast } = useGlobal();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [localPrompt, setLocalPrompt] = useState(generationConfig.prompt || '');
    const debouncedPrompt = useDebounce(localPrompt, 300);

    // Menu States
    const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isExecutionOpen, setIsExecutionOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [isBatchOpen, setIsBatchOpen] = useState(false);
    const [isForcedMode, setIsForcedMode] = useState(false);

    // Logic AI Popover States
    const [isNegativeOpen, setIsNegativeOpen] = useState(false);
    const [isRefineOpen, setIsRefineOpen] = useState(false);

    const [magicInstruction, setMagicInstruction] = useState('');
    const [isRefactoring, setIsRefactoring] = useState(false);
    const [codexModelCatalog, setCodexModelCatalog] = useState<CodexModelCatalogResponse | null>(
      null,
    );
    const [isLoadingCodexModelCatalog, setIsLoadingCodexModelCatalog] = useState(false);
    const [codexModelCatalogError, setCodexModelCatalogError] = useState<string | null>(null);

    const [elapsedTime, setElapsedTime] = useState<string>('0.0');
    const [scrambleText, setScrambleText] = useState('');

    const codexModels = codexModelCatalog?.models ?? [];
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

    useEffect(() => {
      let interval: number;
      if (isEnhancingPrompt || isRefactoring) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        const targetLength = localPrompt.length > 0 ? localPrompt.length : 50;

        interval = window.setInterval(() => {
          let scrambled = '';
          for (let i = 0; i < targetLength; i++) {
            if (localPrompt[i] === ' ') {
              scrambled += ' ';
            } else {
              scrambled += chars[Math.floor(Math.random() * chars.length)];
            }
          }
          setScrambleText(scrambled);
        }, 30);
      } else {
        setScrambleText('');
      }
      return () => clearInterval(interval);
    }, [isEnhancingPrompt, isRefactoring, localPrompt]);

    useEffect(() => {
      let interval: number;
      if (isGenerating && generationStartTime) {
        interval = window.setInterval(() => {
          setElapsedTime(((Date.now() - generationStartTime) / 1000).toFixed(1));
        }, 100);
      } else {
        setElapsedTime('0.0');
      }
      return () => clearInterval(interval);
    }, [isGenerating, generationStartTime]);

    useEffect(() => {
      let isCancelled = false;
      setIsLoadingCodexModelCatalog(true);

      void getCodexModelCatalog()
        .then((catalog) => {
          if (isCancelled) return;
          setCodexModelCatalog(catalog);
          setCodexModelCatalogError(catalog.error);
        })
        .catch((error) => {
          if (isCancelled) return;
          setCodexModelCatalogError(
            error instanceof Error ? error.message : 'Unable to read the Codex model catalog.',
          );
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingCodexModelCatalog(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }, []);

    useEffect(() => {
      if (codexModels.length === 0) return;

      if (
        preferredExecutionModelId &&
        preferredExecutionModelId !== generationConfig.executionModel
      ) {
        updateConfig('executionModel', preferredExecutionModelId);
        return;
      }

      const normalizedReasoning = normalizeCodexReasoningEffort(
        selectedExecutionModel,
        generationConfig.executionReasoningEffort,
      );
      if (normalizedReasoning !== generationConfig.executionReasoningEffort) {
        updateConfig('executionReasoningEffort', normalizedReasoning);
        return;
      }

      const normalizedSpeed = normalizeCodexSpeed(
        selectedExecutionModel,
        generationConfig.executionSpeed,
      );
      if (normalizedSpeed !== generationConfig.executionSpeed) {
        updateConfig('executionSpeed', normalizedSpeed);
      }
    }, [
      codexModels,
      generationConfig.executionModel,
      generationConfig.executionReasoningEffort,
      generationConfig.executionSpeed,
      preferredExecutionModelId,
      selectedExecutionModel,
      updateConfig,
    ]);

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

    // Click outside
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          closeAllMenus();
          setIsNegativeOpen(false);
          setIsRefineOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [closeAllMenus]);

    // Sync prop changes to local state (Downstream)
    // Only if the prop value is different and we assume it came from an external source (like a preset load)
    useEffect(() => {
      if (generationConfig.prompt !== localPrompt) {
        setLocalPrompt(generationConfig.prompt || '');
      }
    }, [generationConfig.prompt]);

    // Sync local state to prop changes (Upstream - Debounced)
    // This ensures that when other components (Recipes) read generationConfig, they get the latest text
    useEffect(() => {
      if (debouncedPrompt === localPrompt && debouncedPrompt !== generationConfig.prompt) {
        updateConfig('prompt', debouncedPrompt);
      }
    }, [debouncedPrompt, localPrompt, generationConfig.prompt, updateConfig]);

    useLayoutEffect(() => {
      if (textareaRef.current) {
        const target = textareaRef.current;
        const scrollPos = target.scrollTop;
        // Reset height to base height to get the correct scrollHeight when text is deleted
        target.style.height = '32px';
        const scrollHeight = target.scrollHeight;
        target.style.height = `${Math.min(Math.max(scrollHeight, 32), 400)}px`;
        // Restore scroll position to prevent jumping
        target.scrollTop = scrollPos;
      }
    }, [localPrompt, scrambleText]);

    const handleTriggerGenerate = useCallback(() => {
      const trimmedPrompt = localPrompt.trim();
      if (!trimmedPrompt && generationConfig.attachments.length === 0) return;

      // Force sync immediately before generating
      updateConfig('prompt', localPrompt);
      onGenerate(localPrompt, undefined, { force: isForcedMode });

      closeAllMenus();
      setIsNegativeOpen(false);
      setIsRefineOpen(false);
    }, [
      localPrompt,
      generationConfig.attachments.length,
      updateConfig,
      onGenerate,
      closeAllMenus,
      isForcedMode,
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
      'h-11 flex items-center gap-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black tracking-widest transition-all active:scale-95 text-zinc-400 hover:text-white disabled:opacity-30 uppercase group border border-transparent hover:border-white/5 whitespace-nowrap cursor-pointer';
    const iconBtnClass =
      'size-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative cursor-pointer disabled:cursor-not-allowed';
    const activeIconBtnClass =
      'bg-gradient-to-b from-accent-800 to-accent-950 border border-accent-700/50 text-accent-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-pointer';

    const hasAttachments = generationConfig.attachments.length > 0;
    const isNearLimit = generationConfig.attachments.length >= maxAttachments;

    return (
      <div
        ref={containerRef}
        className="w-full flex flex-col justify-end z-50 transition-colors duration-700 ease-in-out relative"
      >
        {/* Fixed height background that doesn't expand with the textarea */}
        <div className="absolute inset-x-0 bottom-0 h-[68px] pointer-events-none bg-black/80 backdrop-blur-sm transition-colors duration-700 ease-in-out" />

        <div className="w-full max-w-[1920px] mx-auto flex items-end gap-3 px-6 py-3 relative z-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            className="hidden"
            accept="image/*"
            multiple
          />

          {/* INPUT AREA - ALWAYS VISIBLE */}
          <div className="flex-1 relative min-w-0">
            {/* Input Container */}
            <div
              className={`flex items-end gap-2 rounded-2xl p-1.5 px-3 min-h-[44px] shadow-lg transition-colors duration-300 bg-zinc-900/50 border border-white/5`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isNearLimit}
                className={iconBtnClass}
                title="Add Image"
              >
                <PlusCircle size={17} />
              </button>

              <AnimatePresence>
                {hasAttachments && (
                  <MotionDiv
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
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
                            className="p-1 bg-red-500 text-white rounded-lg transition-all active:scale-90 hover:bg-red-400"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </MotionDiv>
                )}
              </AnimatePresence>

              <textarea
                ref={textareaRef}
                value={isEnhancingPrompt || isRefactoring ? scrambleText : localPrompt}
                readOnly={isEnhancingPrompt || isRefactoring}
                onFocus={() => setIsInteracting(true)}
                onBlur={() => {
                  // IMMEDIATE SYNC ON BLUR: Fixes race condition when clicking external buttons
                  updateConfig('prompt', localPrompt);
                  closeAllMenus();
                }}
                onChange={(e) => {
                  setLocalPrompt(e.target.value);
                  setIsInteracting(true);
                }}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  const files = Array.from(items as any as Iterable<DataTransferItem>)
                    .filter((item) => item.type.startsWith('image/'))
                    .map((item) => item.getAsFile())
                    .filter((f): f is File => f !== null);
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
                className={`flex-1 bg-transparent border-none outline-none text-[13px] text-zinc-200 placeholder-zinc-700 font-medium tracking-tight resize-none py-[6px] leading-normal custom-scrollbar min-w-[100px] px-3 self-end max-h-[400px] overflow-y-auto ${isEnhancingPrompt || isRefactoring ? 'font-mono text-accent-400 opacity-80' : ''}`}
                style={{ minHeight: '32px' }}
              />

              {/* LOGIC AI TOOLS */}
              <div className="flex items-center gap-2">
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
                  <AnimatePresence>
                    {isNegativeOpen && (
                      <MotionDiv
                        variants={popoverVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute bottom-full mb-3 right-0 w-64 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100]"
                      >
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                          Exclude from Image
                        </label>
                        <input
                          type="text"
                          value={generationConfig.negativePrompt || ''}
                          onChange={(e) => updateConfig('negativePrompt', e.target.value)}
                          placeholder="Blurry, low quality, distortion..."
                          autoFocus
                          className="w-full h-8 bg-black/40 border border-white/5 rounded-lg px-3 text-[11px] text-zinc-300 outline-none placeholder-zinc-700 focus:border-red-500/30 transition-colors"
                        />
                      </MotionDiv>
                    )}
                  </AnimatePresence>
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
                  <AnimatePresence>
                    {isRefineOpen && (
                      <MotionDiv
                        variants={popoverVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute bottom-full mb-3 right-0 w-72 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100]"
                      >
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                          Instructions to Edit
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={magicInstruction}
                            onChange={(e) => setMagicInstruction(e.target.value)}
                            placeholder="e.g. Make it cyberpunk style..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
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
                      </MotionDiv>
                    )}
                  </AnimatePresence>
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
          <div className="flex items-end gap-2 pointer-events-auto">
            {/* Aspect Ratio */}
            <div className="relative">
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
              <AnimatePresence>
                {isAspectRatioOpen && (
                  <MotionDiv
                    variants={popoverVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100] grid grid-cols-3 gap-2 w-[270px]"
                  >
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
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all 
                                    ${
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
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Resolution */}
            {showSizeControl && (
              <div className="relative">
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
                <AnimatePresence>
                  {isSizeOpen && (
                    <MotionDiv
                      variants={popoverVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1 min-w-[80px]"
                    >
                      {currentSizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => {
                            updateConfig('imageSize', size);
                            setIsSizeOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black transition-all ${generationConfig.imageSize === size ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Batch Count */}
            <div className="relative">
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
              <AnimatePresence>
                {isBatchOpen && (
                  <MotionDiv
                    variants={popoverVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex gap-2"
                  >
                    {BATCH_COUNTS.map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => {
                          updateConfig('batchCount', count);
                          setIsBatchOpen(false);
                        }}
                        className={`size-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${generationConfig.batchCount === count ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {count}
                      </button>
                    ))}
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Model Selector */}
            <div className="relative">
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
                <span className="hidden 2xl:inline text-[8px]">
                  {AVAILABLE_MODELS.find((m) => m.id === generationConfig.model)?.name.replace(
                    'Codex ',
                    '',
                  )}
                </span>
              </button>
              <AnimatePresence>
                {isModelOpen && (
                  <MotionDiv
                    variants={popoverVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute bottom-full mb-4 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 min-w-[240px] shadow-2xl z-[100]"
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          updateConfig('model', m.id);
                          setIsModelOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all mb-1 last:mb-0 ${generationConfig.model === m.id ? 'bg-gradient-to-r from-accent-900/50 to-accent-800/50 border border-accent-700/30' : 'hover:bg-white/5 text-zinc-400 border border-transparent'}`}
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
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Codex Task Execution Selector */}
            <div className="relative">
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
                <span className="hidden 2xl:inline text-[8px]">{executionSummary}</span>
              </button>
              <AnimatePresence>
                {isExecutionOpen && (
                  <MotionDiv
                    variants={popoverVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute bottom-full mb-4 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 min-w-[360px] max-w-[420px] shadow-2xl z-[110]"
                  >
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
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border ${
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
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${
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
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${
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
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* GENERATE BUTTON - Dark Gradient Premium */}
            <button
              type="button"
              onClick={handleTriggerGenerate}
              className={`
                    group relative h-11 px-6 rounded-2xl flex items-center justify-center gap-2.5 ml-2 overflow-hidden
                    text-[10px] tracking-[0.2em] font-black uppercase transition-all cursor-pointer
                    ${
                      isGenerating
                        ? 'bg-gradient-to-b from-accent-800 to-accent-950 text-accent-400 border border-accent-700/30 shadow-lg'
                        : 'bg-gradient-to-b from-accent-700 via-accent-800 to-accent-950 hover:from-accent-600 hover:via-accent-700 hover:to-accent-900 text-accent-100 border-t border-accent-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(var(--accent-600),0.3)] active:scale-95'
                    }
                `}
            >
              {/* Progress Bar Layer */}
              {isGenerating && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-accent-500/20 transition-all duration-100 ease-linear z-0"
                  style={{ width: `${Math.min((parseFloat(elapsedTime) / 120) * 100, 100)}%` }}
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
                    <Loader2 size={14} className="animate-spin text-accent-500" />
                    <span className="w-16 text-center">{elapsedTime}s</span>
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
