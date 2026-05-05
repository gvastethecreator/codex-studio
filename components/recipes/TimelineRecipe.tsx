
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Clock, StepBack, StepForward, Lock, Video, FastForward, Rewind, Hourglass, Film, Play, Upload, Layers, Anchor, Activity, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Attachment, ImageGenerationConfig, GeneratedImageWithConfig, AspectRatio } from '../../types';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';

interface TimelineRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
  onSelectImage?: (image: GeneratedImageWithConfig) => void;
}

const TIME_OPTIONS = [
    { label: 'Split Second', val: 'IMMEDIATE_REACTION', icon: '⚡' },
    { label: 'Seconds', val: 'SHORT_TERM_CONSEQUENCE', icon: 's' },
    { label: 'Minutes', val: 'MEDIUM_TERM_PROGRESSION', icon: 'm' },
    { label: 'Hours', val: 'DAY_NIGHT_CYCLE', icon: 'h' },
    { label: 'Years', val: 'LONG_TERM_AGING', icon: 'y' }
];

const MOTION_OPTIONS = ['Static', 'Subtle', 'Cinematic', 'High Action'];
const LIGHTING_OPTIONS = ['Locked', 'Evolving', 'Flickering'];

import { RATIO_MAP } from '../../constants';

import { useLocalStorage } from '../../hooks/useLocalStorage';

export const TimelineRecipe: React.FC<TimelineRecipeProps> = ({
  config,
  updateConfig,
  updateAttachment,
  onFileSelect,
  onGenerate,
  isGenerating,
  images = [],
  onSelectImage
}) => {
  // --- Persistent UI State ---
  const [direction, setDirection] = useLocalStorage<'forward' | 'backward'>('timeline-direction', 'forward');
  
  const [timeDeltaLabel, setTimeDeltaLabel] = useLocalStorage('timeline-delta', TIME_OPTIONS[1].label);
  const timeDelta = useMemo(() => TIME_OPTIONS.find(o => o.label === timeDeltaLabel) || TIME_OPTIONS[1], [timeDeltaLabel]);
  const setTimeDelta = useCallback((opt: typeof TIME_OPTIONS[0]) => setTimeDeltaLabel(opt.label), [setTimeDeltaLabel]);

  const [cameraMode, setCameraMode] = useLocalStorage<'locked' | 'dynamic'>('timeline-camera', 'locked');

  const [motionAmount, setMotionAmount] = useState('Subtle');
  const [lightingMode, setLightingMode] = useState('Locked');

  // --- Session State ---
  const [sessionOrigin, setSessionOrigin] = useState<{ id: string, src: string } | null>(null);
  const [isOnionSkinEnabled, setIsOnionSkinEnabled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const activeImage = config.attachments[0]; // Currently selected reference frame

  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1.777, [config.aspectRatio]);
  
  // RESTORE SESSION ORIGIN LOGIC
  useEffect(() => {
    if (sessionOrigin) return;
    const anchorAtt = config.attachments.find(a => a.name.includes('(Anchor)'));
    if (anchorAtt) {
        setSessionOrigin({ id: anchorAtt.id, src: anchorAtt.dataUrl });
        return;
    }
    if (config.attachments.length > 0) {
         setSessionOrigin({ 
             id: config.attachments[0].id, 
             src: config.attachments[0].dataUrl 
         });
    }
  }, [config.attachments, sessionOrigin]);

  // Helper: Extract temporal index safely
  const getSequenceIndex = (context?: string): number => {
      if (!context) return 0;
      const match = context.match(/"sequence_index":\s*(-?\d+)/);
      return match ? parseInt(match[1]) : 0;
  };

  // 1. Calculate Logical Index of Active Frame
  const currentRefIndex = useMemo(() => {
      if (!activeImage) return 0;
      const matchedGen = images.find(img => img.src === activeImage.dataUrl);
      if (matchedGen) return getSequenceIndex(matchedGen.config.recipeContext);
      if (sessionOrigin && activeImage.dataUrl === sessionOrigin.src) return 0;
      return 0;
  }, [activeImage, images, sessionOrigin]);

  // 2. Build the Unified Timeline Strip
  const timelineItems = useMemo(() => {
      const generatedItems = images.filter(img => img.config.recipeContext?.includes("TIMELINE_FRAME_GUIDANCE"));
      const itemsMap = new Map();

      generatedItems.forEach(img => {
          itemsMap.set(img.src, {
              id: img.id,
              src: img.src,
              thumbnail: img.thumbnail || img.src,
              index: getSequenceIndex(img.config.recipeContext),
              isOrigin: false,
              isGenerated: true,
              originalObj: img
          });
      });

      if (sessionOrigin) {
          if (!itemsMap.has(sessionOrigin.src)) {
              itemsMap.set(sessionOrigin.src, {
                  id: sessionOrigin.id,
                  src: sessionOrigin.src,
                  thumbnail: sessionOrigin.src,
                  index: 0,
                  isOrigin: true,
                  isGenerated: false,
                  originalObj: null
              });
          }
      }
      return Array.from(itemsMap.values()).sort((a, b) => a.index - b.index);
  }, [images, sessionOrigin]);

  // 3. Local File Upload Handler
  const handleLocalUpload = useCallback(async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });

          const newAttachment: Attachment = {
              id: `timeline-origin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              dataUrl: dataUrl,
              strength: 1
          };

          updateConfig('attachments', [newAttachment]);
          setSessionOrigin({ id: newAttachment.id, src: dataUrl });
      } catch (err) {
          // Failed to load local file
      }
  }, [updateConfig]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) handleLocalUpload(files as File[]);
  };

  // 4. Robust Center Scroll Logic
  const scrollToItem = useCallback((itemId: string) => {
      const element = itemRefs.current.get(itemId);
      const container = scrollContainerRef.current;
      if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          // Calculate the exact scroll position to center the element
          const scrollLeft = element.offsetLeft - (containerRect.width / 2) + (elementRect.width / 2);
          
          container.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
          });
      }
  }, []);

  const handleItemClick = useCallback((item: typeof timelineItems[0]) => {
      // Immediate feedback scroll
      scrollToItem(item.id);

      const newAttachments: Attachment[] = [];
      const isSelectingOrigin = sessionOrigin && item.src === sessionOrigin.src;

      newAttachments.push({
          id: `timeline-ref-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: `Frame ${item.index} (Ref)`,
          dataUrl: item.src,
          strength: 1
      });

      if (sessionOrigin && !isSelectingOrigin) {
           newAttachments.push({
              id: `timeline-anchor-${sessionOrigin.id}`,
              name: `Frame 0 (Anchor)`,
              dataUrl: sessionOrigin.src,
              strength: 0.3 
          });
      }

      updateConfig('attachments', newAttachments);
      
      // Update direction based on navigation
      if (activeImage) {
          const currentIndex = timelineItems.findIndex(i => i.src === activeImage.dataUrl);
          const targetIndex = timelineItems.findIndex(i => i.src === item.src);
          if (currentIndex !== -1 && targetIndex !== -1) {
              setDirection(targetIndex > currentIndex ? 'forward' : 'backward');
          }
      }
  }, [updateConfig, sessionOrigin, scrollToItem, activeImage, timelineItems, setDirection]);

  // Sync Scroll on Active Image Change
  useEffect(() => {
      if (activeImage && timelineItems.length > 0) {
          const matchedItem = timelineItems.find(item => item.src === activeImage.dataUrl);
          if (matchedItem) {
              // Double RAF to ensure DOM is ready after React render cycle
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToItem(matchedItem.id);
                });
              });
          }
      }
  }, [activeImage, timelineItems, scrollToItem]);

  // Auto-select newly generated frames
  const prevIsGenerating = useRef(isGenerating);
  useEffect(() => {
      if (prevIsGenerating.current && !isGenerating) {
          // Generation just finished
          const newestImage = images[0];
          if (newestImage && newestImage.config.recipeContext?.includes("TEMPORAL_INTERPOLATION")) {
              const matchedItem = timelineItems.find(item => item.src === newestImage.src);
              if (matchedItem && activeImage?.dataUrl !== matchedItem.src) {
                  handleItemClick(matchedItem);
              }
          }
      }
      prevIsGenerating.current = isGenerating;
  }, [isGenerating, images, timelineItems, handleItemClick, activeImage]);

  // Keyboard Navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (timelineItems.length === 0 || !activeImage) return;
          
          // Don't trigger if user is typing in an input
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

          const currentIndex = timelineItems.findIndex(item => item.src === activeImage.dataUrl);
          if (currentIndex === -1) return;

          if (e.key === 'ArrowLeft') {
              e.preventDefault();
              if (currentIndex > 0) {
                  handleItemClick(timelineItems[currentIndex - 1]);
              }
          } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              if (currentIndex < timelineItems.length - 1) {
                  handleItemClick(timelineItems[currentIndex + 1]);
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timelineItems, activeImage, handleItemClick]);

  // 5. Update Recipe Context
  useEffect(() => {
    const nextIndex = currentRefIndex + (direction === 'forward' ? 1 : -1);
    const directionPrompt = direction === 'forward' 
        ? "NEXT FRAME: Generate a plausible future state." 
        : "PREVIOUS FRAME: Generate a plausible past state.";
    const isAnchored = config.attachments.length > 1;

    const recipeSchema = {
        task_id: "TIMELINE_FRAME_GUIDANCE",
        sequence_index: nextIndex,
        direction: direction.toUpperCase(),
        time_delta: timeDelta.val,
        visual_guidance: {
            camera_behavior: cameraMode.toUpperCase(),
            subject_motion: motionAmount.toUpperCase(),
            lighting_continuity: lightingMode.toUpperCase()
        },
        context_mode: isAnchored ? "ANCHORED_STABILITY" : "FREE_FLOW",
        instructions: [
            directionPrompt,
            `Time elapsed: ${timeDelta.label}. Use this to guide the amount of scene change.`,
            `Motion Level: ${motionAmount}. Use this as a cue for pose, position, or state change.`,
            `Lighting: ${lightingMode}. Keep shadows and highlights coherent if time has passed.`,
            isAnchored ? "Use the 'Anchor' image as the identity/style guide, and the 'Ref' image as the current state guide." : "Keep visual identity and style close to the reference image.",
            "Output should read like a neighboring storyboard frame in the same sequence.",
            "Avoid text, UI, and watermarks."
        ]
    };

    updateConfig('recipeContext', `--- TIMELINE FRAME PROMPT ---\n${JSON.stringify(recipeSchema, null, 2)}\n--- END CONFIG ---`);
    return () => { updateConfig('recipeContext', ''); };
  }, [direction, timeDelta, cameraMode, motionAmount, lightingMode, updateConfig, currentRefIndex, config.attachments.length]);

  const onionSkinSrc = useMemo(() => {
      if (!isOnionSkinEnabled || !activeImage) return null;
      const targetIndex = currentRefIndex + (direction === 'forward' ? -1 : 1);
      const skinItem = timelineItems.find(i => i.index === targetIndex);
      return skinItem?.src || null;
  }, [isOnionSkinEnabled, currentRefIndex, direction, timelineItems, activeImage]);

  const BottomDock = useMemo(() => (
    <>
        {/* GROUP 1: SEQUENCE */}
        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">Sequence</span>
            <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5 relative">
                <div 
                    className={`absolute inset-y-1 w-1/2 bg-teal-600/20 border border-teal-500/30 rounded-lg transition-all duration-300 ${direction === 'forward' ? 'translate-x-full' : 'translate-x-0'}`} 
                />
                <button 
                    onClick={() => setDirection('backward')} 
                    className={`relative px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${direction === 'backward' ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <StepBack size={14} fill={direction === 'backward' ? "currentColor" : "none"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Prev</span>
                </button>
                <button 
                    onClick={() => setDirection('forward')} 
                    className={`relative px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${direction === 'forward' ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">Next</span>
                    <StepForward size={14} fill={direction === 'forward' ? "currentColor" : "none"} />
                </button>
            </div>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

        {/* GROUP 2: TIME */}
        <ControlDropdown 
            title="Interval"
            icon={<Hourglass size={14} />} 
            label={timeDelta.label} 
            options={TIME_OPTIONS.map(o => o.label)} 
            onSelect={(l) => { const opt = TIME_OPTIONS.find(o => o.label === l); if(opt) setTimeDelta(opt); }} 
            activeColor="teal" 
        />

        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

        {/* GROUP 3: PHYSICS (Motion & Light) */}
        <div className="flex gap-2">
            <ControlDropdown 
                title="Motion"
                icon={<Activity size={14} />} 
                label={motionAmount} 
                options={MOTION_OPTIONS} 
                onSelect={setMotionAmount} 
                activeColor="orange" 
            />
            <ControlDropdown 
                title="Lighting"
                icon={<Sun size={14} />} 
                label={lightingMode} 
                options={LIGHTING_OPTIONS} 
                onSelect={setLightingMode} 
                activeColor="yellow" 
            />
        </div>

        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

        {/* GROUP 4: CAMERA & VIEW */}
        <div className="flex gap-2">
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">Cam</span>
                <button 
                    onClick={() => setCameraMode(p => p === 'locked' ? 'dynamic' : 'locked')}
                    className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all min-w-[100px] ${cameraMode === 'locked' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}
                >
                    {cameraMode === 'locked' ? <Lock size={14} /> : <Video size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{cameraMode}</span>
                </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">View</span>
                <button 
                    onClick={() => setIsOnionSkinEnabled(p => !p)}
                    className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all ${isOnionSkinEnabled ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-zinc-500'}`}
                    title="Toggle Onion Skin"
                >
                    <Layers size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ghost</span>
                </button>
            </div>
        </div>
    </>
  ), [direction, timeDelta, motionAmount, lightingMode, cameraMode, isOnionSkinEnabled]);

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock} className="p-0 pb-28 flex flex-col items-center justify-center relative h-full">
        
        {/* Main Viewport */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
            <div 
                className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
                style={{
                    aspectRatio: ratioValue,
                    width: `min(80vw, (100vh - 400px) * ${ratioValue})`,
                    height: `min(100vh - 400px, 80vw / ${ratioValue})`
                }}
            >
                {activeImage ? (
                    <>
                        <img 
                            src={activeImage.dataUrl} 
                            alt="Reference" 
                            className="w-full h-full object-contain opacity-100 relative z-10" 
                        />
                        {onionSkinSrc && (
                            <img 
                                src={onionSkinSrc}
                                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none mix-blend-screen opacity-40"
                                style={{ filter: 'grayscale(100%) brightness(1.2)' }}
                                alt="Onion Skin"
                            />
                        )}
                        <div className="absolute inset-0 z-30 flex items-center justify-between px-8 pointer-events-none">
                            <div className={`p-4 rounded-full bg-black/60 border border-white/10 transition-all duration-500 ${direction === 'backward' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                                <Rewind size={32} className="text-teal-400" />
                            </div>
                            <div className={`p-4 rounded-full bg-black/60 border border-white/10 transition-all duration-500 ${direction === 'forward' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                                <FastForward size={32} className="text-teal-400" />
                            </div>
                        </div>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md z-30">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Frame: {currentRefIndex}</span>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">{direction === 'forward' ? 'Generating Future' : 'Reconstructing Past'}</span>
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-black/60 text-zinc-400 hover:text-white hover:bg-white/10 transition-all pointer-events-auto border border-white/10 flex items-center gap-2"
                        >
                            <span className="text-[9px] font-bold uppercase hidden sm:block">Replace</span>
                            <Upload size={14} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleLocalUpload(Array.from(e.target.files) as File[])} className="hidden" accept="image/*" />
                    </>
                ) : (
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-6 cursor-pointer transition-all group bg-white/[0.01] hover:bg-white/[0.03]"
                    >
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleLocalUpload(Array.from(e.target.files) as File[])} className="hidden" accept="image/*" />
                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-2xl">
                            <Clock size={32} className="text-zinc-600 group-hover:text-teal-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-zinc-500 group-hover:text-white uppercase tracking-tight">Load Scene Keyframe or Prompt</h3>
                            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] mt-2">The starting point of time</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Timeline Strip (Carousel) */}
        <div className="w-full h-auto flex flex-col gap-2 relative z-20 flex-shrink-0 bg-[#060606] pb-4 border-t border-white/5">
            <div className="flex items-center justify-between px-6 pt-2">
                <div className="flex items-center gap-2 text-teal-500/60">
                    <Film size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Film Strip</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1 opacity-20">
                        {[...Array(20)].map((_, i) => <div key={i} className={`w-px h-2 ${i % 5 === 0 ? 'bg-zinc-200 h-3' : 'bg-zinc-600'}`} />)}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">{timelineItems.length} Frames</span>
                </div>
            </div>
            
            <div className="w-full h-28 relative group">
                 {/* Playhead Indicator (Absolute Center) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-teal-500 z-30 pointer-events-none shadow-[0_0_15px_rgba(20,184,166,1)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-teal-500" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-teal-500" />
                </div>

                {/* SCROLL CONTAINER */}
                <div 
                    ref={scrollContainerRef}
                    className="w-full h-full bg-black/40 flex items-center overflow-x-auto custom-scrollbar relative snap-x snap-mandatory"
                    // Center padding calculation: 50% screen - half item width (assuming w-48/192px approx)
                    style={{ paddingLeft: 'calc(50% - 96px)', paddingRight: 'calc(50% - 96px)' }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_100%] pointer-events-none opacity-50" />

                    <div className="flex items-center gap-4 px-4">
                        {timelineItems.length === 0 && (
                            <div className="h-20 w-48 flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic opacity-50 border border-white/5 rounded-lg snap-center mx-auto border-dashed">
                                Sequence Empty
                            </div>
                        )}

                        <AnimatePresence mode='popLayout'>
                            {timelineItems.map((item) => {
                                const isActive = activeImage?.dataUrl === item.src;
                                const isAnchor = sessionOrigin?.src === item.src;
                                const isOriginFrame = item.isOrigin;
                                
                                return (
                                    <motion.button
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        ref={(el) => { if (el) itemRefs.current.set(item.id, el); else itemRefs.current.delete(item.id); }}
                                        className={`snap-center relative h-24 aspect-video flex-shrink-0 rounded-lg bg-zinc-900 border-2 overflow-hidden group transition-all duration-500 ease-out-expo
                                            ${isActive 
                                                ? 'border-teal-500 shadow-[0_0_40px_rgba(20,184,166,0.3)] scale-110 z-20 ring-1 ring-teal-400/50 opacity-100' 
                                                : 'border-white/5 opacity-40 scale-90 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-95'
                                            }
                                        `}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <img src={item.thumbnail} className="w-full h-full object-cover" loading="lazy" />
                                        
                                        {/* Frame Number Tag */}
                                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[7px] font-black font-mono border backdrop-blur-md uppercase tracking-wider ${isActive ? 'bg-teal-500 text-black border-teal-400' : 'bg-black/80 text-white/50 border-white/10'}`}>
                                            {item.isOrigin ? 'ORIGIN' : `SEQ.${item.index}`}
                                        </div>
                                        
                                        {isAnchor && !isActive && (
                                            <div className="absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-lg pointer-events-none" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    </RecipeLayout>
  );
};
