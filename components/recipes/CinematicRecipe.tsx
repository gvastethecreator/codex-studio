import React, { useState, useRef, useMemo, useCallback, useId } from 'react';
import {
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconMovie as Clapperboard,
  IconVideo as Video,
  IconAperture as Aperture,
  IconMovie as Film,
  IconX as X,
  IconSun as Sun,
  IconGrid3x3 as Grid3X3,
  IconClock as Clock,
  IconCloudRain as CloudRain,
  IconTemplate as LayoutTemplate,
  IconRectangle as RectangleHorizontal,
  IconUpload as Upload,
} from '@tabler/icons-react';
import type { Attachment, ImageGenerationConfig } from '../../types';
import { RATIO_MAP } from '../../constants';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';
import { QuickStartText } from './QuickStartText';
import { GsapDropdown } from '../ui/GsapDropdown';
import {
  getRecipeModuleUiModel,
  getRecipeNumberDefault,
  getRecipeNumberOptions,
  getRecipeOptions,
  getRecipeStringDefault,
} from './recipeModuleUi';

interface CinematicRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
}

const { module: CINEMATIC_MODULE, defaults: CINEMATIC_DEFAULTS } =
  getRecipeModuleUiModel('cinematic');

const CONTROL_OPTIONS = {
  genre: getRecipeOptions(CINEMATIC_MODULE, 'genre'),
  tone: getRecipeOptions(CINEMATIC_MODULE, 'tone'),
  lighting: getRecipeOptions(CINEMATIC_MODULE, 'lighting'),
  time: getRecipeOptions(CINEMATIC_MODULE, 'time'),
  weather: getRecipeOptions(CINEMATIC_MODULE, 'weather'),
  movement: getRecipeOptions(CINEMATIC_MODULE, 'movement'),
  lens: getRecipeOptions(CINEMATIC_MODULE, 'lens'),
};

const FRAME_COUNTS = getRecipeNumberOptions(CINEMATIC_MODULE, 'frames');
const SHOT_TYPES = getRecipeOptions(CINEMATIC_MODULE, 'frameShots');

const DEFAULT_PARAMS = {
  frames: getRecipeNumberDefault(CINEMATIC_DEFAULTS, 'frames', 9),
  genre: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'genre', 'Auto-Detect'),
  tone: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'tone', 'Auto-Detect'),
  lighting: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'lighting', 'Auto-Detect'),
  time: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'time', 'Auto-Detect'),
  weather: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'weather', 'Auto-Detect'),
  movement: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'movement', 'Auto-Detect'),
  lens: getRecipeStringDefault(CINEMATIC_DEFAULTS, 'lens', 'Auto-Detect'),
};

const ShotTypeDropdown: React.FC<{
  value: string;
  sceneLabel: string;
  openBelow: boolean;
  onChange: (value: string) => void;
}> = ({ value, sceneLabel, openBelow, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex min-h-7 max-w-[120px] items-center gap-1.5 rounded border px-2 py-1 text-center text-[9px] font-bold uppercase tracking-wider transition-[background-color,border-color,color,transform] ${
          isOpen
            ? 'border-rose-400/55 bg-rose-500/14 text-white'
            : 'border-white/10 bg-black/50 text-white/70 hover:bg-white/10 hover:text-white'
        }`}
        aria-label={`${sceneLabel} shot type: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={11}
          className={`shrink-0 text-white/45 transition-[color,transform] ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <GsapDropdown
        id={listboxId}
        open={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement={openBelow ? 'bottom-left' : 'top-left'}
        role="listbox"
        aria-label={`${sceneLabel} shot type`}
        className={`absolute left-1/2 z-40 max-h-48 w-44 -translate-x-1/2 overflow-y-auto rounded-[6px] p-1 ${
          openBelow ? 'top-[calc(100%+0.35rem)]' : 'bottom-[calc(100%+0.35rem)]'
        }`}
      >
        {SHOT_TYPES.map((shot) => {
          const selected = shot === value;
          return (
            <button
              key={shot}
              type="button"
              role="option"
              aria-selected={selected}
              data-dropdown-item
              onClick={() => {
                onChange(shot);
                setIsOpen(false);
              }}
              className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-[5px] px-2 py-1.5 text-left text-[9px] font-black uppercase tracking-wider transition-[background-color,color] ${
                selected
                  ? 'bg-rose-500/18 text-white'
                  : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-100'
              }`}
            >
              <span className="truncate">{shot}</span>
              {selected ? <Check size={11} className="shrink-0 text-rose-100" /> : null}
            </button>
          );
        })}
      </GsapDropdown>
    </div>
  );
};

export const CinematicRecipe: React.FC<CinematicRecipeProps> = ({
  config,
  updateConfig,
  updateAttachment,
  onFileSelect,
  onGenerate,
  isGenerating,
}) => {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const [frameShots, setFrameShots] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImage = config.attachments[0];
  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1.777, [config.aspectRatio]);

  const handleFrameChange = useCallback((count: number) => {
    setParams((p) => ({ ...p, frames: count }));
  }, []);

  const gridLayout = useMemo(() => {
    const isPortrait = ratioValue < 1;
    const frames = params.frames;

    if (frames === 3) return isPortrait ? { rows: 3, cols: 1 } : { rows: 1, cols: 3 };
    if (frames === 6) return isPortrait ? { rows: 3, cols: 2 } : { rows: 2, cols: 3 };
    return { rows: 3, cols: 3 };
  }, [params.frames, ratioValue]);

  const recipeParams = useMemo(
    () => ({
      frames: params.frames,
      rows: gridLayout.rows,
      cols: gridLayout.cols,
      aspectRatio: config.aspectRatio,
      frameShots,
      genre: params.genre,
      tone: params.tone,
      lighting: params.lighting,
      time: params.time,
      weather: params.weather,
      movement: params.movement,
      lens: params.lens,
    }),
    [
      config.aspectRatio,
      frameShots,
      gridLayout.cols,
      gridLayout.rows,
      params.frames,
      params.genre,
      params.lens,
      params.lighting,
      params.movement,
      params.time,
      params.tone,
      params.weather,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'cinematic', recipeParams);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

  const BottomDock = useMemo(
    () => (
      <>
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            Layout
          </span>
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            {FRAME_COUNTS.map((count) => (
              <button
                type="button"
                key={count}
                onClick={() => handleFrameChange(count)}
                className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-[background-color,color,box-shadow,transform] ${
                  params.frames === count
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {count === 3 && <LayoutTemplate size={14} />}
                {count === 6 && <RectangleHorizontal size={14} />}
                {count === 9 && <Grid3X3 size={14} />}
                <span className="text-[10px] font-black uppercase">{count} Scenes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-10 w-px bg-white/10 mx-2 hidden xl:block" />

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <ControlDropdown
            title="Time"
            icon={<Clock size={14} />}
            label={params.time}
            options={CONTROL_OPTIONS.time}
            onSelect={(v) => setParams((p) => ({ ...p, time: v }))}
            activeColor="rose"
          />
          <ControlDropdown
            title="Weather"
            icon={<CloudRain size={14} />}
            label={params.weather}
            options={CONTROL_OPTIONS.weather}
            onSelect={(v) => setParams((p) => ({ ...p, weather: v }))}
            activeColor="rose"
          />
          <ControlDropdown
            title="Lighting"
            icon={<Sun size={14} />}
            label={params.lighting}
            options={CONTROL_OPTIONS.lighting}
            onSelect={(v) => setParams((p) => ({ ...p, lighting: v }))}
            activeColor="rose"
          />
        </div>

        <div className="h-10 w-px bg-white/10 mx-2 hidden xl:block" />

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <ControlDropdown
            title="Genre"
            icon={<Film size={14} />}
            label={params.genre}
            options={CONTROL_OPTIONS.genre}
            onSelect={(v) => setParams((p) => ({ ...p, genre: v }))}
            activeColor="rose"
          />
          <ControlDropdown
            title="Tone"
            icon={<Aperture size={14} />}
            label={params.tone}
            options={CONTROL_OPTIONS.tone}
            onSelect={(v) => setParams((p) => ({ ...p, tone: v }))}
            activeColor="rose"
          />
          <ControlDropdown
            title="Camera"
            icon={<Video size={14} />}
            label={params.movement}
            options={CONTROL_OPTIONS.movement}
            onSelect={(v) => setParams((p) => ({ ...p, movement: v }))}
            activeColor="rose"
          />
          <ControlDropdown
            title="Lens"
            icon={<Clapperboard size={14} />}
            label={params.lens}
            options={CONTROL_OPTIONS.lens}
            onSelect={(v) => setParams((p) => ({ ...p, lens: v }))}
            activeColor="rose"
          />
        </div>
      </>
    ),
    [params, handleFrameChange],
  );

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="p-3 pt-4 pb-[var(--studio-recipe-dock-space)] sm:p-6 sm:pt-20 sm:pb-48 flex items-center justify-center"
    >
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl transition-[background-color,border-color,box-shadow,transform] duration-500 ease-out-expo group"
        style={{
          aspectRatio: ratioValue,
          width: 'min(90vw, 74vh)',
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - var(--studio-chrome-block))',
        }}
      >
        {activeImage && (
          <img
            src={activeImage.dataUrl}
            alt="Ref"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-20 blur-sm grayscale transition-[filter,opacity] duration-700 group-hover:grayscale-0"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 grid gap-px bg-black/50 transition-colors duration-500"
          style={{
            gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: params.frames }).map((_, i) => (
            <div
              key={i}
              className="relative bg-white/[0.02] backdrop-blur-[1px] flex flex-col items-center justify-center border border-white/5 group/cell pointer-events-auto"
            >
              <span className="text-[9px] font-black text-white/30 group-hover/cell:text-white/60 uppercase tracking-widest transition-colors mb-2">
                {i === 0 ? 'START' : i === params.frames - 1 ? 'END' : `SCENE ${i + 1}`}
              </span>
              <ShotTypeDropdown
                value={frameShots[i] || 'Auto'}
                sceneLabel={
                  i === 0 ? 'Start scene' : i === params.frames - 1 ? 'End scene' : `Scene ${i + 1}`
                }
                openBelow={i < gridLayout.cols}
                onChange={(value) => setFrameShots((prev) => ({ ...prev, [i]: value }))}
              />
            </div>
          ))}
        </div>

        {!activeImage && (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-white/5 transition-colors bg-white/[0.01] appearance-none border-none p-0 m-0"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))}
              aria-label="Upload reference image"
              className="hidden"
              accept="image/*"
            />
            <div className="mb-6 flex size-20 items-center justify-center rounded-full border border-white/10 bg-zinc-900 shadow-2xl transition-[border-color,transform] group-hover:scale-110 group-hover:border-rose-500/50">
              <Upload
                size={28}
                className="text-zinc-600 group-hover:text-rose-400 transition-colors"
              />
            </div>
            <QuickStartText
              title="Source Frame"
              subtitle="Upload shot or enter prompt"
              toneClassName="text-white"
              subtitleClassName="text-zinc-400"
              maxTitleFontSize={14}
            />
          </button>
        )}

        {activeImage && (
          <button
            type="button"
            onClick={() => updateConfig('attachments', [])}
            className="pointer-events-auto absolute right-4 top-4 z-20 rounded-lg border border-white/10 bg-black/60 p-2 text-white transition-[background-color,color] hover:bg-red-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </RecipeLayout>
  );
};
