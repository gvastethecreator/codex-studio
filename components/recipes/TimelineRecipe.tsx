import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Clock,
  StepBack,
  StepForward,
  Lock,
  Video,
  FastForward,
  Rewind,
  Hourglass,
  Film,
  Upload,
  Layers,
  Activity,
  Sun,
} from 'lucide-react';
import { MotionDiv, MotionButton, AnimatePresence } from 'motion/react';
import type { Attachment, ImageGenerationConfig, GeneratedImageWithConfig } from '../../types';
import { RATIO_MAP } from '../../constants';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';
import { QuickStartText } from './QuickStartText';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLazyRef } from '../../hooks/useLazyRef';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { createTimelineRecipeParams } from '../../lib/recipeDerivedParams';
import { getRecipeNumberParam, hasRecipeIdentity } from '../../lib/recipeIdentity';
import { getRecipeModuleUiModel, getRecipeOptions, getRecipeStringDefault } from './recipeModuleUi';

interface TimelineRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
  onSelectImage?: (image: GeneratedImageWithConfig) => void;
}

const { module: TIMELINE_MODULE, defaults: TIMELINE_DEFAULTS } = getRecipeModuleUiModel('timeline');

const DEFAULT_DIRECTION = getRecipeStringDefault(TIMELINE_DEFAULTS, 'direction', 'forward');
const DEFAULT_TIME_DELTA_LABEL = getRecipeStringDefault(
  TIMELINE_DEFAULTS,
  'timeDeltaLabel',
  'Seconds',
);
const DEFAULT_CAMERA_MODE = getRecipeStringDefault(TIMELINE_DEFAULTS, 'cameraMode', 'locked');
const DEFAULT_MOTION_AMOUNT = getRecipeStringDefault(TIMELINE_DEFAULTS, 'motionAmount', 'Subtle');
const DEFAULT_LIGHTING_MODE = getRecipeStringDefault(TIMELINE_DEFAULTS, 'lightingMode', 'Locked');

const TIME_DELTA_LABEL_OPTIONS = getRecipeOptions(TIMELINE_MODULE, 'timeDeltaLabel');
const TIME_OPTIONS = (
  TIME_DELTA_LABEL_OPTIONS.length > 0 ? TIME_DELTA_LABEL_OPTIONS : [DEFAULT_TIME_DELTA_LABEL]
).map((label) => ({
  label,
}));

const MOTION_OPTIONS = getRecipeOptions(TIMELINE_MODULE, 'motionAmount');
const LIGHTING_OPTIONS = getRecipeOptions(TIMELINE_MODULE, 'lightingMode');
const EMPTY_IMAGES: GeneratedImageWithConfig[] = [];

type TimelineItem = {
  id: string;
  src: string;
  thumbnail: string;
  index: number;
  isOrigin: boolean;
  isGenerated: boolean;
  originalObj: GeneratedImageWithConfig | null;
};

function useTimelineKeyboard(
  timelineItems: TimelineItem[],
  activeImage: Attachment | undefined,
  handleItemClick: (item: TimelineItem) => void,
) {
  const timelineItemsRef = useRef(timelineItems);
  timelineItemsRef.current = timelineItems;
  const activeImageRef = useRef(activeImage);
  activeImageRef.current = activeImage;
  const handleItemClickRef = useRef(handleItemClick);
  handleItemClickRef.current = handleItemClick;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = timelineItemsRef.current;
      const active = activeImageRef.current;
      if (items.length === 0 || !active) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const currentIndex = items.findIndex((item) => item.src === active.dataUrl);
      if (currentIndex === -1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) handleItemClickRef.current(items[currentIndex - 1]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < items.length - 1) handleItemClickRef.current(items[currentIndex + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

interface TimelineBottomDockProps {
  direction: 'forward' | 'backward';
  timeDelta: { label: string };
  motionAmount: string;
  lightingMode: string;
  cameraMode: 'locked' | 'dynamic';
  isOnionSkinEnabled: boolean;
  onSetDirection: (d: 'forward' | 'backward') => void;
  onSetTimeDelta: (opt: { label: string }) => void;
  onSetMotionAmount: (v: string) => void;
  onSetLightingMode: (v: string) => void;
  onSetCameraMode: (mode: 'locked' | 'dynamic') => void;
  onToggleOnionSkin: () => void;
}

function TimelineBottomDock({
  direction,
  timeDelta,
  motionAmount,
  lightingMode,
  cameraMode,
  isOnionSkinEnabled,
  onSetDirection,
  onSetTimeDelta,
  onSetMotionAmount,
  onSetLightingMode,
  onSetCameraMode,
  onToggleOnionSkin,
}: TimelineBottomDockProps) {
  return (
    <>
      {/* GROUP 1: SEQUENCE */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
          Sequence
        </span>
        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5 relative">
          <div
            className={`absolute inset-y-1 w-1/2 bg-teal-600/20 border border-teal-500/30 rounded-lg transition-all duration-300 ${direction === 'forward' ? 'translate-x-full' : 'translate-x-0'}`}
          />
          <button
            type="button"
            onClick={() => onSetDirection('backward')}
            className={`relative px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${direction === 'backward' ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <StepBack size={14} fill={direction === 'backward' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-widest">Prev</span>
          </button>
          <button
            type="button"
            onClick={() => onSetDirection('forward')}
            className={`relative px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${direction === 'forward' ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Next</span>
            <StepForward size={14} fill={direction === 'forward' ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

      {/* GROUP 2: TIME */}
      <ControlDropdown
        title="Interval"
        icon={<Hourglass size={14} />}
        label={timeDelta.label}
        options={TIME_OPTIONS.map((o) => o.label)}
        onSelect={(l) => {
          const opt = TIME_OPTIONS.find((o) => o.label === l);
          if (opt) onSetTimeDelta(opt);
        }}
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
          onSelect={onSetMotionAmount}
          activeColor="orange"
        />
        <ControlDropdown
          title="Lighting"
          icon={<Sun size={14} />}
          label={lightingMode}
          options={LIGHTING_OPTIONS}
          onSelect={onSetLightingMode}
          activeColor="yellow"
        />
      </div>

      <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

      {/* GROUP 4: CAMERA & VIEW */}
      <div className="flex gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            Cam
          </span>
          <button
            type="button"
            onClick={() => onSetCameraMode(cameraMode === 'locked' ? 'dynamic' : 'locked')}
            className={`flex min-w-25 items-center gap-2 rounded-xl border px-4 transition-all h-10 ${cameraMode === 'locked' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}
          >
            {cameraMode === 'locked' ? <Lock size={14} /> : <Video size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{cameraMode}</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            View
          </span>
          <button
            type="button"
            onClick={onToggleOnionSkin}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all ${isOnionSkinEnabled ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-zinc-500'}`}
            title="Toggle Onion Skin"
          >
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Ghost</span>
          </button>
        </div>
      </div>
    </>
  );
}

interface TimelineCanvasProps {
  activeImage: Attachment | undefined;
  onionSkinSrc: string | null;
  direction: 'forward' | 'backward';
  currentRefIndex: number;
  ratioValue: number;
  timelineItems: TimelineItem[];
  sessionOrigin: { id: string; src: string } | null;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  onLocalUpload: (files: File[]) => void;
  onItemClick: (item: TimelineItem) => void;
}

function TimelineCanvas({
  activeImage,
  onionSkinSrc,
  direction,
  currentRefIndex,
  ratioValue,
  timelineItems,
  sessionOrigin,
  scrollContainerRef,
  itemRefs,
  onLocalUpload,
  onItemClick,
}: TimelineCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onLocalUpload(files as File[]);
  };

  return (
    <>
      {/* Main Viewport */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
        <div
          className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950"
          style={{
            aspectRatio: ratioValue,
            width: `min(80vw, (100vh - 400px) * ${ratioValue})`,
            height: `min(100vh - 400px, 80vw / ${ratioValue})`,
          }}
        >
          {activeImage ? (
            <>
              <img
                src={activeImage.dataUrl}
                alt="Reference"
                className="size-full object-contain opacity-100 relative z-10"
              />
              {onionSkinSrc && (
                <img
                  src={onionSkinSrc}
                  className="absolute inset-0 size-full object-contain z-20 pointer-events-none mix-blend-screen opacity-40"
                  style={{ filter: 'grayscale(100%) brightness(1.2)' }}
                  alt="Onion Skin"
                />
              )}
              <div className="absolute inset-0 z-30 flex items-center justify-between px-8 pointer-events-none">
                <div
                  className={`p-4 rounded-full bg-zinc-950/60 border border-white/10 transition-all duration-500 ${direction === 'backward' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                >
                  <Rewind size={32} className="text-teal-400" />
                </div>
                <div
                  className={`p-4 rounded-full bg-zinc-950/60 border border-white/10 transition-all duration-500 ${direction === 'forward' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                >
                  <FastForward size={32} className="text-teal-400" />
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-950/60 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md z-30">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">
                  Frame: {currentRefIndex}
                </span>
                <div className="size-1 bg-white/20 rounded-full" />
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">
                  {direction === 'forward' ? 'Generating Future' : 'Reconstructing Past'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-zinc-950/60 text-zinc-400 hover:text-white hover:bg-white/10 transition-all pointer-events-auto border border-white/10 flex items-center gap-2"
              >
                <span className="text-[9px] font-bold uppercase hidden sm:block">Replace</span>
                <Upload size={14} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files && onLocalUpload(Array.from(e.target.files) as File[])
                }
                aria-label="Upload file"
                className="hidden"
                accept="image/*"
              />
            </>
          ) : (
            <button
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group flex size-full cursor-pointer flex-col items-center justify-center gap-6 bg-white/1 transition-all hover:bg-white/3 appearance-none border-none p-0 m-0"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files && onLocalUpload(Array.from(e.target.files) as File[])
                }
                aria-label="Upload file"
                className="hidden"
                accept="image/*"
              />
              <div className="size-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-2xl">
                <Clock size={32} className="text-zinc-600 group-hover:text-teal-400" />
              </div>
              <QuickStartText
                title="Load Scene Keyframe or Prompt"
                subtitle="The starting point of time"
                maxTitleFontSize={20}
              />
            </button>
          )}
        </div>
      </div>

      {/* Timeline Strip (Carousel) */}
      <div className="relative z-20 flex h-auto w-full shrink-0 flex-col gap-2 border-t border-white/5 bg-[#060606] pb-4">
        <div className="flex items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-2 text-teal-500/60">
            <Film size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Film Strip</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 opacity-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-px h-2 ${i % 5 === 0 ? 'bg-zinc-200 h-3' : 'bg-zinc-600'}`}
                />
              ))}
            </div>
            <span className="text-[9px] font-bold text-zinc-600 uppercase">
              {timelineItems.length} Frames
            </span>
          </div>
        </div>

        <div className="w-full h-28 relative group">
          {/* Playhead Indicator (Absolute Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-teal-500 z-30 pointer-events-none shadow-[0_0_15px_rgba(20,184,166,1)]">
            <div className="absolute top-0 left-1/2 size-0 -translate-x-1/2 border-r-[6px] border-r-transparent border-l-[6px] border-l-transparent border-t-8 border-t-teal-500" />
            <div className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 border-r-[6px] border-r-transparent border-b-8 border-b-teal-500 border-l-[6px] border-l-transparent" />
          </div>

          {/* SCROLL CONTAINER */}
          <div
            ref={scrollContainerRef}
            className="size-full bg-zinc-950/40 flex items-center overflow-x-auto custom-scrollbar relative snap-x snap-mandatory"
            // Center padding calculation: 50% screen - half item width (assuming w-48/192px approx)
            style={{ paddingLeft: 'calc(50% - 96px)', paddingRight: 'calc(50% - 96px)' }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[20px_100%] pointer-events-none opacity-50" />

            <div className="flex items-center gap-4 px-4">
              {timelineItems.length === 0 && (
                <div className="h-20 w-48 flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic opacity-50 border border-white/5 rounded-lg snap-center mx-auto border-dashed">
                  Sequence Empty
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {timelineItems.map((item) => {
                  const isActive = activeImage?.dataUrl === item.src;
                  const isAnchor = sessionOrigin?.src === item.src;

                  return (
                    <MotionButton
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      ref={(el) => {
                        if (el) itemRefs.current.set(item.id, el);
                        else itemRefs.current.delete(item.id);
                      }}
                      className={`group relative h-24 shrink-0 snap-center aspect-video overflow-hidden rounded-lg border-2 bg-zinc-900 transition-all duration-500 ease-out-expo
                                            ${
                                              isActive
                                                ? 'border-teal-500 shadow-[0_0_40px_rgba(20,184,166,0.3)] scale-110 z-20 ring-1 ring-teal-400/50 opacity-100'
                                                : 'border-white/5 opacity-40 scale-90 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-95'
                                            }
                                        `}
                      onClick={() => onItemClick(item)}
                    >
                      <img
                        src={item.thumbnail}
                        className="size-full object-cover"
                        loading="lazy"
                        alt=""
                      />

                      {/* Frame Number Tag */}
                      <div
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[7px] font-black font-mono border backdrop-blur-md uppercase tracking-wider ${isActive ? 'bg-teal-500 text-black border-teal-400' : 'bg-zinc-950/80 text-white/50 border-white/10'}`}
                      >
                        {item.isOrigin ? 'ORIGIN' : `SEQ.${item.index}`}
                      </div>

                      {isAnchor && !isActive && (
                        <div className="absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-lg pointer-events-none" />
                      )}
                    </MotionButton>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// File-scope utility: reads a File as a data URL
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// File-scope utility: extracts temporal sequence index from image config
function getSequenceIndex(imageConfig?: ImageGenerationConfig): number {
  return imageConfig ? getRecipeNumberParam(imageConfig, 'nextIndex', 0) : 0;
}

function useTimelineRecipeController({
  config,
  updateConfig,
  isGenerating,
  images,
}: {
  config: ImageGenerationConfig;
  updateConfig: TimelineRecipeProps['updateConfig'];
  isGenerating: boolean;
  images: GeneratedImageWithConfig[];
}) {
  // --- Persistent UI State ---
  const [direction, setDirection] = useLocalStorage<'forward' | 'backward'>(
    'timeline-direction',
    DEFAULT_DIRECTION === 'backward' ? 'backward' : 'forward',
  );

  const [timeDeltaLabel, setTimeDeltaLabel] = useLocalStorage(
    'timeline-delta',
    DEFAULT_TIME_DELTA_LABEL,
  );
  const timeDelta = useMemo(
    () =>
      TIME_OPTIONS.find((option) => option.label === timeDeltaLabel) ??
      TIME_OPTIONS.find((option) => option.label === DEFAULT_TIME_DELTA_LABEL) ??
      TIME_OPTIONS[0],
    [timeDeltaLabel],
  );
  const setTimeDelta = useCallback(
    (opt: (typeof TIME_OPTIONS)[0]) => setTimeDeltaLabel(opt.label),
    [setTimeDeltaLabel],
  );

  const [cameraMode, setCameraMode] = useLocalStorage<'locked' | 'dynamic'>(
    'timeline-camera',
    DEFAULT_CAMERA_MODE === 'dynamic' ? 'dynamic' : 'locked',
  );

  const [motionAmount, setMotionAmount] = useState(DEFAULT_MOTION_AMOUNT);
  const [lightingMode, setLightingMode] = useState(DEFAULT_LIGHTING_MODE);

  const [isOnionSkinEnabled, setIsOnionSkinEnabled] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useLazyRef(() => new Map<string, HTMLButtonElement>());
  // react-doctor-disable-next-line react-doctor/no-event-handler
  const activeImage = useMemo(() => config.attachments[0], [config.attachments]);

  // react-doctor-disable-next-line react-doctor/no-event-handler
  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1.777, [config.aspectRatio]);

  const [uploadedOrigin, setUploadedOrigin] = useState<{ id: string; src: string } | null>(null);
  const sessionOrigin = useMemo(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler
    if (uploadedOrigin) return uploadedOrigin;
    const anchorAtt = config.attachments.find((a) => a.name.includes('(Anchor)'));
    if (anchorAtt) return { id: anchorAtt.id, src: anchorAtt.dataUrl };
    if (config.attachments.length > 0)
      return { id: config.attachments[0].id, src: config.attachments[0].dataUrl };
    return null;
  }, [uploadedOrigin, config.attachments]);

  // 1. Calculate Logical Index of Active Frame
  const currentRefIndex = useMemo(() => {
    if (!activeImage) return 0;
    const matchedGen = images.find((img) => img.src === activeImage.dataUrl);
    if (matchedGen) return getSequenceIndex(matchedGen.config);
    if (sessionOrigin && activeImage.dataUrl === sessionOrigin.src) return 0;
    return 0;
  }, [activeImage, images, sessionOrigin]);

  // 2. Build the Unified Timeline Strip
  const timelineItems = useMemo(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler
    const generatedItems = images.filter((img) => hasRecipeIdentity(img.config, 'timeline'));
    const itemsMap = new Map();

    generatedItems.forEach((img) => {
      itemsMap.set(img.src, {
        id: img.id,
        src: img.src,
        thumbnail: img.thumbnail || img.src,
        index: getSequenceIndex(img.config),
        isOrigin: false,
        isGenerated: true,
        originalObj: img,
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
          originalObj: null,
        });
      }
    }
    return Array.from(itemsMap.values()).sort((a, b) => a.index - b.index);
  }, [images, sessionOrigin]);

  // 3. Local File Upload Handler
  const handleLocalUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      try {
        const dataUrl = await readFileAsDataUrl(file);

        const newAttachment: Attachment = {
          id: `timeline-origin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          dataUrl: dataUrl,
          strength: 1,
        };

        updateConfig('attachments', [newAttachment]);
        setUploadedOrigin({ id: newAttachment.id, src: dataUrl });
      } catch (err) {
        // Failed to load local file
      }
    },
    [updateConfig],
  );

  // 4. Robust Center Scroll Logic
  const scrollToItem = useCallback(
    (itemId: string) => {
      const element = itemRefs.current.get(itemId);
      const container = scrollContainerRef.current;
      if (element && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate the exact scroll position to center the element
        const scrollLeft = element.offsetLeft - containerRect.width / 2 + elementRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    },
    [itemRefs],
  );

  const handleItemClick = useCallback(
    (item: (typeof timelineItems)[0]) => {
      // Immediate feedback scroll
      scrollToItem(item.id);

      const newAttachments: Attachment[] = [];
      const isSelectingOrigin = sessionOrigin && item.src === sessionOrigin.src;

      newAttachments.push({
        id: `timeline-ref-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: `Frame ${item.index} (Ref)`,
        dataUrl: item.src,
        strength: 1,
      });

      if (sessionOrigin && !isSelectingOrigin) {
        newAttachments.push({
          id: `timeline-anchor-${sessionOrigin.id}`,
          name: `Frame 0 (Anchor)`,
          dataUrl: sessionOrigin.src,
          strength: 0.3,
        });
      }

      updateConfig('attachments', newAttachments);

      // Update direction based on navigation
      if (activeImage) {
        const currentIndex = timelineItems.findIndex((i) => i.src === activeImage.dataUrl);
        const targetIndex = timelineItems.findIndex((i) => i.src === item.src);
        if (currentIndex !== -1 && targetIndex !== -1) {
          setDirection(targetIndex > currentIndex ? 'forward' : 'backward');
        }
      }
    },
    [updateConfig, sessionOrigin, scrollToItem, activeImage, timelineItems, setDirection],
  );

  const scrollToItemRef = useRef(scrollToItem);
  scrollToItemRef.current = scrollToItem;

  // Sync Scroll on Active Image Change
  useEffect(() => {
    if (activeImage && timelineItems.length > 0) {
      const matchedItem = timelineItems.find((item) => item.src === activeImage.dataUrl);
      if (matchedItem) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToItemRef.current(matchedItem.id);
          });
        });
      }
    }
  }, [activeImage, timelineItems]);

  const prevIsGenerating = useRef(isGenerating);
  if (prevIsGenerating.current && !isGenerating) {
    const newestImage = images[0];
    if (newestImage && hasRecipeIdentity(newestImage.config, 'timeline')) {
      const matchedItem = timelineItems.find((item) => item.src === newestImage.src);
      if (matchedItem && activeImage?.dataUrl !== matchedItem.src) {
        handleItemClick(matchedItem);
      }
    }
  }
  prevIsGenerating.current = isGenerating;

  useTimelineKeyboard(timelineItems, activeImage, handleItemClick);

  const recipeParams = useMemo(
    () =>
      createTimelineRecipeParams({
        currentRefIndex,
        direction,
        timeDeltaLabel: timeDelta.label,
        cameraMode,
        motionAmount,
        lightingMode,
        isAnchored: config.attachments.length > 1,
      }),
    [
      cameraMode,
      config.attachments.length,
      currentRefIndex,
      direction,
      lightingMode,
      motionAmount,
      timeDelta.label,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'timeline', recipeParams);

  const onionSkinSrc = useMemo(() => {
    if (!isOnionSkinEnabled || !activeImage) return null;
    const targetIndex = currentRefIndex + (direction === 'forward' ? -1 : 1);
    const skinItem = timelineItems.find((i) => i.index === targetIndex);
    return skinItem?.src || null;
  }, [isOnionSkinEnabled, currentRefIndex, direction, timelineItems, activeImage]);

  const bottomDock = useMemo(
    () => (
      <TimelineBottomDock
        direction={direction}
        timeDelta={timeDelta}
        motionAmount={motionAmount}
        lightingMode={lightingMode}
        cameraMode={cameraMode}
        isOnionSkinEnabled={isOnionSkinEnabled}
        onSetDirection={setDirection}
        onSetTimeDelta={setTimeDelta}
        onSetMotionAmount={setMotionAmount}
        onSetLightingMode={setLightingMode}
        onSetCameraMode={setCameraMode}
        onToggleOnionSkin={() => setIsOnionSkinEnabled((p) => !p)}
      />
    ),
    [
      direction,
      timeDelta,
      motionAmount,
      lightingMode,
      cameraMode,
      isOnionSkinEnabled,
      setDirection,
      setTimeDelta,
      setMotionAmount,
      setLightingMode,
      setCameraMode,
    ],
  );

  return {
    activeImage,
    bottomDock,
    currentRefIndex,
    direction,
    handleItemClick,
    handleLocalUpload,
    itemRefs,
    onionSkinSrc,
    ratioValue,
    scrollContainerRef,
    sessionOrigin,
    timelineItems,
  };
}

export const TimelineRecipe: React.FC<TimelineRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
  images = EMPTY_IMAGES,
}) => {
  const timelineController = useTimelineRecipeController({
    config,
    updateConfig,
    isGenerating,
    images,
  });

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      bottomDock={timelineController.bottomDock}
      className="p-0 pb-72 sm:pb-28 flex flex-col items-center justify-center relative h-full"
    >
      <TimelineCanvas
        activeImage={timelineController.activeImage}
        onionSkinSrc={timelineController.onionSkinSrc}
        direction={timelineController.direction}
        currentRefIndex={timelineController.currentRefIndex}
        ratioValue={timelineController.ratioValue}
        timelineItems={timelineController.timelineItems}
        sessionOrigin={timelineController.sessionOrigin}
        scrollContainerRef={timelineController.scrollContainerRef}
        itemRefs={timelineController.itemRefs}
        onLocalUpload={timelineController.handleLocalUpload}
        onItemClick={timelineController.handleItemClick}
      />
    </RecipeLayout>
  );
};
