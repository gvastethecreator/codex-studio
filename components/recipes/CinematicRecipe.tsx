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
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';
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
        className={`flex min-h-7 max-w-[120px] items-center gap-1.5 rounded border px-2 py-1 text-center text-[length:var(--wbp-label)] font-bold tracking-normal transition-[background-color,border-color,color,transform] ${
          isOpen
            ? 'border-rose-400/2 bg-rose-500/14 text-[color:var(--wb-ink)]'
            : 'border-[color:var(--wb-line)] bg-[color:var(--wb-well)] text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]'
        }`}
        aria-label={`${sceneLabel} shot type: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={11}
          className={`shrink-0 text-[color:var(--wb-ink)]/45 transition-[color,transform] ${
            isOpen ? 'rotate-180 text-[color:var(--wb-ink)]' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <DemandMountedGsapDropdown
        id={listboxId}
        open={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement={openBelow ? 'bottom-left' : 'top-left'}
        role="listbox"
        aria-label={`${sceneLabel} shot type`}
        className={`absolute left-1/2 z-40 max-h-48 w-44 -translate-x-1/2 overflow-y-auto rounded-[var(--wb-radius)] p-1 ${
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
              className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-[var(--wb-radius)] px-2 py-1.5 text-left text-[length:var(--wbp-label)] font-semibold tracking-normal transition-[background-color,color] ${
                selected
                  ? 'bg-rose-500/18 text-[color:var(--wb-ink)]'
                  : 'text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]'
              }`}
            >
              <span className="truncate">{shot}</span>
              {selected ? (
                <Check size={11} className="shrink-0 text-[color:var(--wb-danger)]" />
              ) : null}
            </button>
          );
        })}
      </DemandMountedGsapDropdown>
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
  const [params, setParams] = useState(
    () =>
      ({
        ...DEFAULT_PARAMS,
        ...(config.recipeId === 'cinematic' ? config.recipeParams : {}),
      }) as typeof DEFAULT_PARAMS,
  );

  const [frameShots, setFrameShots] = useState<Record<number, string>>(
    () => (config.recipeParams?.frameShots as Record<number, string>) ?? {},
  );

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
          <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-muted)] tracking-normal pl-1">
            Layout
          </span>
          <div className="flex items-center gap-2 p-1 bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] rounded-[var(--wb-radius)] border border-[color:var(--wb-line)]">
            {FRAME_COUNTS.map((count) => (
              <button
                type="button"
                key={count}
                onClick={() => handleFrameChange(count)}
                className={`h-9 px-4 rounded-[var(--wb-radius)] flex items-center gap-2 transition-[background-color,color,box-shadow,transform] ${
                  params.frames === count
                    ? 'bg-rose-600 text-[color:var(--wb-ink)] shadow-lg'
                    : 'text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)]'
                }`}
              >
                {count === 3 && <LayoutTemplate size={14} />}
                {count === 6 && <RectangleHorizontal size={14} />}
                {count === 9 && <Grid3X3 size={14} />}
                <span className="text-[length:var(--wbp-label)] font-semibold">{count} Scenes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-10 w-px bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-2 hidden xl:block" />

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

        <div className="h-10 w-px bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-2 hidden xl:block" />

        <details className="recipe-advanced">
          <summary>Advanced camera and mood</summary>
          <div className="recipe-advanced-grid">
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
        </details>
      </>
    ),
    [params, handleFrameChange],
  );

  return (
    <RecipeLayout
      editorLabel="Storyboard"
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="flex min-h-0 flex-col"
    >
      <div
        className="relative overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-2xl transition-[background-color,border-color,box-shadow,transform] duration-500 ease-out-expo group"
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
          className="pointer-events-none absolute inset-0 grid gap-px bg-[color:var(--wb-well)] transition-colors duration-500"
          style={{
            gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: params.frames }).map((_, i) => (
            <div
              key={i}
              className="relative bg-white/[0.02] backdrop-blur-[1px] flex flex-col items-center justify-center border border-[color:var(--wb-line)] group/cell pointer-events-auto"
            >
              <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)]/30 group-hover/cell:text-[color:var(--wb-ink)]/60 tracking-normal transition-colors mb-2">
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

        {activeImage && (
          <button
            type="button"
            aria-label="Remove cinematic reference"
            onClick={() => updateConfig('attachments', [])}
            className="pointer-events-auto absolute right-4 top-4 z-20 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] p-2 text-[color:var(--wb-ink)] transition-[background-color,color] hover:bg-red-500 hover:text-[color:var(--wb-ink)]"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </RecipeLayout>
  );
};
