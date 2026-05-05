  import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { 
  PlusCircle, Square, RectangleHorizontal, RectangleVertical, 
  Bot, Zap, Wand2, Sparkles, 
  ChevronDown, Maximize, Send, BrainCircuit, X, Key, Layers,
  ShieldAlert, Wand, Eraser, MoreHorizontal, ImagePlus,
  Monitor, Hash, Ratio, Scan, Ban, Edit3, Check, Loader2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { ImageGenerationConfig, Attachment, GenerationModel, AspectRatio, ImageSize } from '../types';
import Tooltip from './Tooltip';
import KeyPopover from './KeyPopover';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';

interface ToolbarProps {
  generationConfig: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onGenerate: (prompt?: string, configOverrides?: Partial<ImageGenerationConfig>, options?: { force?: boolean; preventModal?: boolean }) => void;
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
    case '1:1': return <Square {...iconProps} />;
    case '3:2': return <RectangleHorizontal {...iconProps} />;
    default: return <RectangleVertical {...iconProps} />;
  }
};

import { MODELS as MODEL_IDS } from '../constants';

const ModelIcon: React.FC<{ model: GenerationModel }> = ({ model }) => {
    const iconProps = { size: 14 };
    if (model === MODEL_IDS.CODEX_IMAGEGEN) {
      return (
        <div className="relative flex items-center justify-center w-4 h-4">
          <Sparkles {...iconProps} className="text-accent-400 group-hover:text-accent-300" />
          <Sparkles size={8} strokeWidth={3} className="absolute -top-1 -right-1.5 text-accent-200 fill-accent-100/50 animate-pulse" />
        </div>
      );
    }
    return <Zap {...iconProps} />;
};

const AVAILABLE_MODELS: { id: GenerationModel, name: string, description: string }[] = [
  { id: MODEL_IDS.CODEX_IMAGEGEN, name: 'Codex ImageGen', description: 'Local ChatGPT/Codex session' },
];

const RATIOS = IMAGE_GEN_RATIO_OPTIONS;
const PRO_SIZES: ImageSize[] = ['1K'];
const BATCH_COUNTS = [1, 2, 3, 4];

const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, y: 10 }
};

import { useDebounce } from '../hooks/useDebounce';

import { useGlobal } from '../contexts/GlobalContext';
export const Toolbar: React.FC<ToolbarProps> = React.memo(({
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
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isForcedMode, setIsForcedMode] = useState(false);
  
  // Logic AI Popover States
  const [isNegativeOpen, setIsNegativeOpen] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  
  const [magicInstruction, setMagicInstruction] = useState('');
  const [isRefactoring, setIsRefactoring] = useState(false);
  
  const [elapsedTime, setElapsedTime] = useState<string>('0.0');
  const [scrambleText, setScrambleText] = useState('');

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

  const closeAllMenus = useCallback(() => {
    setIsAspectRatioOpen(false);
    setIsModelOpen(false);
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
    }, [localPrompt, generationConfig.attachments.length, updateConfig, onGenerate, closeAllMenus, isForcedMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTriggerGenerate(); }
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
        ].filter(Boolean).join('\n');
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
  
  const btnClass = "h-11 flex items-center gap-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black tracking-widest transition-all active:scale-95 text-zinc-400 hover:text-white disabled:opacity-30 uppercase group border border-transparent hover:border-white/5 whitespace-nowrap cursor-pointer";
  const iconBtnClass = "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative cursor-pointer disabled:cursor-not-allowed";
  const activeIconBtnClass = "bg-gradient-to-b from-accent-800 to-accent-950 border border-accent-700/50 text-accent-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] cursor-pointer";
  
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
        <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*" multiple />
        
        {/* INPUT AREA - ALWAYS VISIBLE */}
        <div className="flex-1 relative min-w-0">
            {/* Input Container */}
            <div className={`flex items-end gap-2 rounded-2xl p-1.5 px-3 min-h-[44px] shadow-lg transition-colors duration-300 bg-zinc-900/50 border border-white/5`}>
                <button onClick={() => fileInputRef.current?.click()} disabled={isNearLimit} className={iconBtnClass} title="Add Image">
                    <PlusCircle size={17} />
                </button>
                
                <AnimatePresence>
                    {hasAttachments && (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            {generationConfig.attachments.map(att => (
                                <div key={att.id} className="w-8 h-8 group relative rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                                    <img src={att.dataUrl} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); onRemoveAttachment(att.id); }} className="p-1 bg-red-500 text-white rounded-lg transition-all active:scale-90 hover:bg-red-400">
                                            <X size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea 
                    ref={textareaRef}
                    value={(isEnhancingPrompt || isRefactoring) ? scrambleText : localPrompt}
                    readOnly={isEnhancingPrompt || isRefactoring}
                    onFocus={() => setIsInteracting(true)}
                    onBlur={() => {
                        // IMMEDIATE SYNC ON BLUR: Fixes race condition when clicking external buttons
                        updateConfig('prompt', localPrompt);
                        closeAllMenus();
                    }}
                    onChange={(e) => { setLocalPrompt(e.target.value); setIsInteracting(true); }}
                    onKeyDown={handleKeyDown}
                    onPaste={(e) => {
                        const items = e.clipboardData?.items;
                        if (!items) return;
                        const files = Array.from(items as any as Iterable<DataTransferItem>)
                            .filter(item => item.type.startsWith('image/'))
                            .map(item => item.getAsFile())
                            .filter((f): f is File => f !== null);
                        if (files.length > 0) {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilesDrop(files);
                        }
                    }}
                    onDrop={(e) => {
                        const files = Array.from(e.dataTransfer.files as any as Iterable<File>).filter(f => f.type.startsWith('image/'));
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
                    className={`flex-1 bg-transparent border-none outline-none text-[13px] text-zinc-200 placeholder-zinc-700 font-medium tracking-tight resize-none py-[6px] leading-normal custom-scrollbar min-w-[100px] px-3 self-end max-h-[400px] overflow-y-auto ${(isEnhancingPrompt || isRefactoring) ? 'font-mono text-accent-400 opacity-80' : ''}`}
                    style={{ minHeight: '32px' }}
                />

                {/* LOGIC AI TOOLS */}
                <div className="flex items-center gap-2">
                    {/* 1. NEGATIVE (Exclude) */}
                    <div className="relative">
                        <Tooltip content="Negative Prompt (Exclude)">
                            <button 
                                onClick={() => { setIsNegativeOpen(!isNegativeOpen); setIsRefineOpen(false); }} 
                                className={`${iconBtnClass} ${isNegativeOpen || generationConfig.negativePrompt ? 'text-red-400' : ''}`}
                            >
                                <Ban size={15} />
                                {generationConfig.negativePrompt && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                            </button>
                        </Tooltip>
                        <AnimatePresence>
                            {isNegativeOpen && (
                                <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-3 right-0 w-64 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100]">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Exclude from Image</label>
                                    <input 
                                        type="text" 
                                        value={generationConfig.negativePrompt || ''} 
                                        onChange={(e) => updateConfig('negativePrompt', e.target.value)} 
                                        placeholder="Blurry, low quality, distortion..." 
                                        autoFocus
                                        className="w-full h-8 bg-black/40 border border-white/5 rounded-lg px-3 text-[11px] text-zinc-300 outline-none placeholder-zinc-700 focus:border-red-500/30 transition-colors" 
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. REFINE (Edit with AI) */}
                    <div className="relative">
                        <Tooltip content="Edit with AI (Refine)">
                            <button 
                                onClick={() => { setIsRefineOpen(!isRefineOpen); setIsNegativeOpen(false); }} 
                                className={`${iconBtnClass} ${isRefineOpen ? activeIconBtnClass : ''}`}
                            >
                                <Edit3 size={15} />
                            </button>
                        </Tooltip>
                        <AnimatePresence>
                            {isRefineOpen && (
                                <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-3 right-0 w-72 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100]">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Instructions to Edit</label>
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
                                        <button onClick={handleMagicEdit} disabled={isRefactoring} className="h-8 w-8 bg-accent-600 hover:bg-accent-500 text-white rounded-lg flex items-center justify-center transition-colors">
                                            {isRefactoring ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <Send size={12} />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. ENHANCE (Action) */}
                    <Tooltip content="Auto Enhance Prompt">
                        <button 
                            onClick={onEnhancePrompt} 
                            disabled={isEnhancingPrompt} 
                            className={`${iconBtnClass} ${isEnhancingPrompt ? 'text-accent-400' : ''}`}
                        >
                            {isEnhancingPrompt ? <div className="w-3 h-3 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin"/> : <Wand2 size={15} />}
                        </button>
                    </Tooltip>

                    {/* 6. FORCE JOB */}
                    <Tooltip content="Force Job (Bypass Queue)">
                        <button 
                            onClick={() => setIsForcedMode(!isForcedMode)} 
                            className={`${iconBtnClass} ${isForcedMode ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30' : ''}`}
                        >
                            <Zap size={15} className={isForcedMode ? 'animate-pulse' : ''} />
                            {isForcedMode && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full" />}
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex items-end gap-2 pointer-events-auto">
            
            {/* Aspect Ratio */}
            <div className="relative">
                <button onClick={() => { setIsAspectRatioOpen(!isAspectRatioOpen); setIsModelOpen(false); setIsBatchOpen(false); }} className={btnClass}>
                    <AspectRatioIcon ratio={generationConfig.aspectRatio} />
                    <span>{generationConfig.aspectRatio}</span>
                </button>
                <AnimatePresence>
                    {isAspectRatioOpen && (
                        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-[100] grid grid-cols-3 gap-2 w-[270px]">
                            {currentRatios.map(option => (
                                <button 
                                    key={option.ratio} 
                                    onClick={() => { updateConfig('aspectRatio', option.ratio); setIsAspectRatioOpen(false); setPreviewRatio(null); }}
                                    onMouseEnter={() => setPreviewRatio(option.ratio)}
                                    title={`${option.label}: ${option.size}`}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all 
                                    ${generationConfig.aspectRatio === option.ratio 
                                        ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600/50 text-white shadow-lg' 
                                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <AspectRatioIcon ratio={option.ratio} />
                                    <span className="text-[8px] font-black">{option.ratio}</span>
                                    <span className="text-[6px] font-bold text-zinc-500">{option.size}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Resolution */}
            {showSizeControl && (
                <div className="relative">
                    <button onClick={() => { setIsSizeOpen(!isSizeOpen); setIsModelOpen(false); }} className={btnClass}>
                        <Monitor size={14} />
                        <span>{generationConfig.imageSize || '1K'}</span>
                    </button>
                    <AnimatePresence>
                        {isSizeOpen && (
                            <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1 min-w-[80px]">
                                {currentSizes.map(size => (
                                    <button 
                                        key={size} 
                                        onClick={() => { updateConfig('imageSize', size); setIsSizeOpen(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black transition-all ${generationConfig.imageSize === size ? 'bg-gradient-to-r from-accent-700 to-accent-800 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Batch Count */}
            <div className="relative">
                <button onClick={() => { setIsBatchOpen(!isBatchOpen); setIsModelOpen(false); }} className={btnClass}>
                    <Layers size={14} />
                    <span>{generationConfig.batchCount || 1}x</span>
                </button>
                <AnimatePresence>
                    {isBatchOpen && (
                        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-4 left-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex gap-2">
                            {BATCH_COUNTS.map(count => (
                                <button 
                                    key={count} 
                                    onClick={() => { updateConfig('batchCount', count); setIsBatchOpen(false); }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${generationConfig.batchCount === count ? 'bg-gradient-to-b from-accent-700 to-accent-900 border border-accent-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                >
                                    {count}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Model Selector */}
            <div className="relative">
                <button onClick={() => { setIsModelOpen(!isModelOpen); setIsAspectRatioOpen(false); }} className={btnClass}>
                    <ModelIcon model={generationConfig.model} />
                    <span className="hidden 2xl:inline text-[8px]">{AVAILABLE_MODELS.find(m => m.id === generationConfig.model)?.name.replace('Codex ', '')}</span>
                </button>
                <AnimatePresence>
                    {isModelOpen && (
                        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" className="absolute bottom-full mb-4 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl p-2 min-w-[240px] shadow-2xl z-[100]">
                            {AVAILABLE_MODELS.map(m => (
                                <button key={m.id} onClick={() => { updateConfig('model', m.id); setIsModelOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl transition-all mb-1 last:mb-0 ${generationConfig.model === m.id ? 'bg-gradient-to-r from-accent-900/50 to-accent-800/50 border border-accent-700/30' : 'hover:bg-white/5 text-zinc-400 border border-transparent'}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <ModelIcon model={m.id} />
                                        <div className={`text-[10px] font-black uppercase tracking-wide ${generationConfig.model === m.id ? 'text-accent-300' : 'text-zinc-300'}`}>{m.name}</div>
                                    </div>
                                    <div className="text-[8px] text-zinc-500 font-bold pl-6">{m.description}</div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* GENERATE BUTTON - Dark Gradient Premium */}
            <button 
                onClick={handleTriggerGenerate} 
                className={`
                    group relative h-11 px-6 rounded-2xl flex items-center justify-center gap-2.5 ml-2 overflow-hidden
                    text-[10px] tracking-[0.2em] font-black uppercase transition-all cursor-pointer
                    ${isGenerating 
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
                            <Wand2 size={14} className="group-hover:rotate-12 transition-transform text-accent-300" />
                            <span className="text-white">GENERATE</span>
                        </>
                    )}
                </div>
            </button>
        </div>
      </div>
      
      {/* Key Selector Popover (External) */}
      <KeyPopover isOpen={isKeyPopoverOpen} onClose={onOpenKeySelector} onSelectKey={onSelectKey} />
    </div>
  );
});
