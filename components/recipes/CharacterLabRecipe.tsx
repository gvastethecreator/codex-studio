import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconFileText as FileText,
  IconLoader2 as Loader2,
  IconLock as Lock,
  IconSearch as Search,
  IconSparkles as Sparkles,
  IconX as X,
} from '@tabler/icons-react';
import type {
  AspectRatio,
  Attachment,
  GeneratedImageWithConfig,
  ImageGenerationConfig,
} from '../../types';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import {
  CHARACTER_LAB_ACTIONS,
  CHARACTER_LAB_CATEGORIES,
  CHARACTER_LAB_GLOBAL_OPTIONS,
  CHARACTER_LAB_MODES,
  CHARACTER_LAB_OPTION_COUNTS,
  type CharacterLabAction,
  type CharacterLabModeId,
} from '../../lib/characterLabCatalog.generated';
import {
  CHARACTER_LAB_ICON_ATLAS_CELL_SIZE,
  CHARACTER_LAB_ICON_ATLAS_URL,
  CHARACTER_LAB_ICON_FRAMES,
} from '../../lib/characterLabIconAtlas.generated';
import {
  CHARACTER_LAB_OPTION_ICON_ATLAS_CELL_SIZE,
  CHARACTER_LAB_OPTION_ICON_ATLAS_HEIGHT,
  CHARACTER_LAB_OPTION_ICON_ATLAS_URL,
  CHARACTER_LAB_OPTION_ICON_ATLAS_WIDTH,
  CHARACTER_LAB_OPTION_ICON_FRAMES,
  CHARACTER_LAB_OPTION_ICON_SOURCE_URLS,
} from '../../lib/characterLabOptionIconAtlas.generated';
import { buildCharacterLabPrompt } from '../../lib/characterLabPrompt';
import { resolveRecipeAlias, type RecipeAliasId } from '../../lib/recipeAliases';
import { normalizeImageGenRatio } from '../../utils/imageGenSizing';
import { RecipeLayout } from './RecipeLayout';

interface CharacterLabRecipeProps {
  recipeAliasId?: RecipeAliasId | null;
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: {
      force?: boolean;
      preventModal?: boolean;
      useCurrentAttachments?: boolean;
    },
  ) => void;
  isGenerating: boolean;
  images: GeneratedImageWithConfig[];
  onSelectImage: (image: GeneratedImageWithConfig) => void;
  onUseAsSource: (image: GeneratedImageWithConfig) => void;
}

const MODE_ICON_IDS: Record<CharacterLabModeId, string> = {
  poses: 'poses:front',
  spritesheets: 'spritesheets:walk',
  motion: 'motion:motion_idle',
  scenes: 'scenes:char_home',
  special: 'special:turnaround_sheet',
  effects: 'effects:zoom_out_fill',
  profile: 'profile:basic-info',
};

const ACCENT_CLASSES: Record<string, { text: string; border: string; bg: string; soft: string }> = {
  amber: {
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500',
    soft: 'bg-amber-500/10',
  },
  orange: {
    text: 'text-orange-300',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500',
    soft: 'bg-orange-500/10',
  },
  blue: {
    text: 'text-blue-300',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500',
    soft: 'bg-blue-500/10',
  },
  cyan: {
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500',
    soft: 'bg-cyan-500/10',
  },
  emerald: {
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500',
    soft: 'bg-emerald-500/10',
  },
  green: {
    text: 'text-green-300',
    border: 'border-green-500/40',
    bg: 'bg-green-500',
    soft: 'bg-green-500/10',
  },
  indigo: {
    text: 'text-indigo-300',
    border: 'border-indigo-500/40',
    bg: 'bg-indigo-500',
    soft: 'bg-indigo-500/10',
  },
  pink: {
    text: 'text-pink-300',
    border: 'border-pink-500/40',
    bg: 'bg-pink-500',
    soft: 'bg-pink-500/10',
  },
  purple: {
    text: 'text-purple-300',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500',
    soft: 'bg-purple-500/10',
  },
  red: {
    text: 'text-red-300',
    border: 'border-red-500/40',
    bg: 'bg-red-500',
    soft: 'bg-red-500/10',
  },
  teal: {
    text: 'text-teal-300',
    border: 'border-teal-500/40',
    bg: 'bg-teal-500',
    soft: 'bg-teal-500/10',
  },
  yellow: {
    text: 'text-yellow-300',
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500',
    soft: 'bg-yellow-500/10',
  },
  zinc: {
    text: 'text-zinc-300',
    border: 'border-white/10',
    bg: 'bg-zinc-500',
    soft: 'bg-white/[0.04]',
  },
};

const atlasFrames = Object.values(CHARACTER_LAB_ICON_FRAMES);
const ATLAS_WIDTH = Math.max(...atlasFrames.map((frame) => frame.x + frame.w));
const ATLAS_HEIGHT = Math.max(...atlasFrames.map((frame) => frame.y + frame.h));
const FIRST_READY_ACTION = CHARACTER_LAB_ACTIONS.find((action) => action.capability === 'ready')!;

function getFirstReadyActionForMode(mode: CharacterLabModeId) {
  return (
    CHARACTER_LAB_ACTIONS.find((action) => action.mode === mode && action.capability === 'ready') ??
    CHARACTER_LAB_ACTIONS.find((action) => action.mode === mode) ??
    FIRST_READY_ACTION
  );
}

function resolveCharacterLabModeFromAlias(aliasId: RecipeAliasId | null | undefined) {
  const alias = resolveRecipeAlias(aliasId);
  return alias?.targetRecipeId === 'character-lab' ? alias.characterLabMode : 'poses';
}

function getAccent(accent: string) {
  return ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.zinc;
}

function CharacterLabIcon({ id, size = 18 }: { id: string; size?: number }) {
  const frame = CHARACTER_LAB_ICON_FRAMES[id as keyof typeof CHARACTER_LAB_ICON_FRAMES];
  if (!frame) return <Sparkles size={size} aria-hidden="true" />;

  const scale = size / CHARACTER_LAB_ICON_ATLAS_CELL_SIZE;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-no-repeat align-middle"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${CHARACTER_LAB_ICON_ATLAS_URL})`,
        backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
        backgroundSize: `${ATLAS_WIDTH * scale}px ${ATLAS_HEIGHT * scale}px`,
      }}
    />
  );
}

function CharacterLabOptionIcon({
  id,
  fallbackId,
  size = 22,
}: {
  id: string;
  fallbackId: string;
  size?: number;
}) {
  const frame =
    CHARACTER_LAB_OPTION_ICON_FRAMES[id as keyof typeof CHARACTER_LAB_OPTION_ICON_FRAMES];
  if (!frame) return <CharacterLabIcon id={fallbackId} size={size} />;

  const scale = size / CHARACTER_LAB_OPTION_ICON_ATLAS_CELL_SIZE;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-no-repeat align-middle"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${CHARACTER_LAB_OPTION_ICON_ATLAS_URL})`,
        backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
        backgroundSize: `${CHARACTER_LAB_OPTION_ICON_ATLAS_WIDTH * scale}px ${
          CHARACTER_LAB_OPTION_ICON_ATLAS_HEIGHT * scale
        }px`,
      }}
    />
  );
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function actionMatches(action: CharacterLabAction, query: string) {
  if (!query) return true;
  return [action.label, action.category, action.prompt, action.mode, action.sourceId]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

async function readAttachments(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<Attachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== 'string') {
              reject(new Error(`Unable to read ${file.name} as a data URL.`));
              return;
            }

            resolve({
              id: `character-lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name: file.name,
              dataUrl: reader.result,
              strength: 0.5,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

type SelectFieldKind = 'body' | 'clothing' | 'expression' | 'ratio' | 'style';

const FIELD_ICON_IDS: Record<SelectFieldKind, string> = {
  body: 'special:anatomy_sheet',
  clothing: 'special:outfit_variations',
  expression: 'poses:expressions',
  ratio: 'effects:cinematic_wide',
  style: 'special:sticker_sheet',
};

function getAspectRatioGroup(option: string) {
  const group = CHARACTER_LAB_GLOBAL_OPTIONS.aspectRatios.find((item) =>
    (item.ratios as readonly string[]).includes(option),
  );
  return group?.label ?? 'Flexible';
}

const OPTION_FIELD_BY_KIND: Record<
  SelectFieldKind,
  'body-type' | 'clothing' | 'expression' | 'aspect-ratio' | 'style'
> = {
  body: 'body-type',
  clothing: 'clothing',
  expression: 'expression',
  ratio: 'aspect-ratio',
  style: 'style',
};

function slugifyOption(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function getOptionIconId(kind: SelectFieldKind, option: string) {
  const optionText = getDropdownOptionText(kind, option);
  const slugSource = kind === 'style' ? optionText.primary : option;
  return `option:${OPTION_FIELD_BY_KIND[kind]}:${slugifyOption(slugSource)}`;
}

function getOptionSourceUrl(id: string) {
  return CHARACTER_LAB_OPTION_ICON_SOURCE_URLS[
    id as keyof typeof CHARACTER_LAB_OPTION_ICON_SOURCE_URLS
  ];
}

function getDropdownOptionIcon(kind: SelectFieldKind, option: string) {
  const value = option.toLowerCase();

  if (kind === 'expression') {
    if (value.includes('happy') || value.includes('joyful')) return 'poses:cheering';
    if (value.includes('sad') || value.includes('worried')) return 'poses:reaction_scared';
    if (value.includes('angry') || value.includes('annoyed')) return 'poses:action_fighting';
    if (value.includes('surprised') || value.includes('scared')) return 'spritesheets:shocked';
    if (value.includes('determined') || value.includes('confident')) return 'poses:victory_pose';
    if (value.includes('sarcastic') || value.includes('smug')) return 'poses:smirking';
    if (value.includes('shy') || value.includes('timid')) return 'poses:thinking';
    if (value.includes('exhausted')) return 'spritesheets:tired';
    if (value.includes('flirty')) return 'poses:interaction_waving';
    return 'poses:front';
  }

  if (kind === 'ratio') {
    if (option === '1:1') return 'effects:bg_grid';
    if (['21:9', '16:9', '4:3', '3:2'].includes(option)) return 'effects:cinematic_wide';
    if (['9:16', '3:4', '2:3', '4:5'].includes(option)) return 'special:tarot_card';
    return 'effects:zoom_out_fill';
  }

  if (kind === 'body') {
    if (value.includes('preserve')) return 'poses:front';
    if (value.includes('thin')) return 'poses:left';
    if (value.includes('skeletal') || value.includes('emaciated')) return 'special:skeleton_sheet';
    if (value.includes('heavier') || value.includes('obese')) return 'poses:blocking';
    if (value.includes('athletic') || value.includes('lean')) return 'poses:action_running';
    if (value.includes('stocky') || value.includes('burly')) return 'poses:action_fighting';
    if (value.includes('muscle')) return 'special:anatomy_sheet';
    return 'poses:front';
  }

  if (kind === 'clothing') {
    if (value.includes('preserve')) return 'control:source';
    if (value.includes('armor') || value.includes('knight') || value.includes('plate')) {
      return 'special:weapon_sheet';
    }
    if (value.includes('wizard') || value.includes('robe') || value.includes('sage')) {
      return 'poses:action_spellcasting';
    }
    if (value.includes('rogue') || value.includes('leather')) return 'poses:action_sneaking';
    if (value.includes('bard') || value.includes('jester')) return 'poses:cheering';
    if (value.includes('cyber') || value.includes('android')) return 'special:transform_cybernetic';
    if (value.includes('space') || value.includes('galactic') || value.includes('starship')) {
      return 'scenes:space_station';
    }
    if (value.includes('steampunk')) return 'scenes:steampunk_workshop';
    if (value.includes('royal') || value.includes('king')) return 'scenes:throne_room';
    if (value.includes('vampire') || value.includes('necromancer')) return 'special:transform_evil';
    if (value.includes('desert') || value.includes('nomad')) return 'scenes:desert_oasis';
    return 'special:outfit_variations';
  }

  if (value.includes('preserve')) return 'control:source';
  if (value.includes('anime') || value.includes('manga')) return 'special:sticker_sheet';
  if (value.includes('horror') || value.includes('noir')) return 'effects:day_night';
  if (value.includes('comic') || value.includes('graphic novel')) return 'special:rpg_card';
  if (value.includes('chibi')) return 'special:plastic_toy';
  if (value.includes('pixel')) return 'special:pixel_art_portrait';
  if (value.includes('voxel')) return 'special:collectible_figurine';
  if (value.includes('vector') || value.includes('flat')) return 'effects:bg_pattern';
  if (value.includes('watercolor') || value.includes('painterly') || value.includes('oil')) {
    return 'scenes:art_museum';
  }
  if (value.includes('cyber') || value.includes('sci-fi') || value.includes('mecha')) {
    return 'special:transform_cybernetic';
  }
  if (value.includes('fantasy') || value.includes('ghibli')) return 'scenes:world_tree';
  return FIELD_ICON_IDS.style;
}

function getDropdownOptionText(kind: SelectFieldKind, option: string) {
  if (kind === 'ratio') {
    return {
      primary: option,
      detail: getAspectRatioGroup(option),
    };
  }

  const separator = option.indexOf(': ');
  if (separator === -1) {
    return {
      primary: option,
      detail: kind === 'body' || kind === 'expression' ? 'Character control' : 'Preset option',
    };
  }

  return {
    primary: option.slice(0, separator),
    detail: option.slice(separator + 2),
  };
}

function SelectField({
  label,
  value,
  options,
  onChange,
  kind,
  className = '',
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  kind: SelectFieldKind;
  className?: string;
}) {
  const fieldName = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const labelId = useId();
  const listboxId = useId();
  const selectedText = getDropdownOptionText(kind, value);
  const selectedIconId = getOptionIconId(kind, value);
  const fallbackIconId = FIELD_ICON_IDS[kind];
  const isRendered = isOpen || isClosing;

  const openDropdown = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 150);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveIndex(selectedIndex);
  }, [isOpen, selectedIndex]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeDropdown();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDropdown();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [closeDropdown, isOpen]);

  const chooseOption = (option: string) => {
    onChange(option);
    closeDropdown();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
        return;
      }
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
        return;
      }
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === 'Home' && isOpen) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && isOpen) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault();
      chooseOption(options[activeIndex] ?? value);
    }
  };

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      className={`relative flex min-w-0 flex-col gap-1.5 ${className}`}
    >
      <span id={labelId} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <input type="hidden" name={fieldName} value={value} />
      <button
        type="button"
        name={fieldName}
        aria-labelledby={labelId}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`character-lab-control-card flex min-h-12 w-full min-w-0 items-center gap-3 rounded-xl border px-2.5 py-2 text-left outline-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isOpen
            ? 'border-violet-400/60 bg-violet-500/10 text-white'
            : 'border-white/10 bg-black/35 text-zinc-100 hover:border-white/20 hover:bg-white/[0.05]'
        }`}
        onClick={() => {
          if (isOpen) closeDropdown();
          else openDropdown();
        }}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-black">
          <CharacterLabOptionIcon id={selectedIconId} fallbackId={fallbackIconId} size={27} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-black leading-tight text-zinc-100">
            {selectedText.primary}
          </span>
          <span className="mt-0.5 block truncate text-[9px] font-bold leading-tight text-zinc-600">
            {selectedText.detail}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-zinc-500 transition-[transform,color] duration-150 ${
            isOpen ? 'rotate-180 text-violet-200' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isRendered && (
        <div
          className="t-dropdown absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          data-closing={isClosing ? 'true' : undefined}
          data-open={isOpen ? 'true' : 'false'}
          data-origin="top-right"
        >
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            aria-activedescendant={`${listboxId}-${activeIndex}`}
            className="custom-scrollbar max-h-64 overflow-y-auto pr-1"
          >
            {options.map((option, index) => {
              const selected = option === value;
              const active = index === activeIndex;
              const optionText = getDropdownOptionText(kind, option);
              const optionIconId = getOptionIconId(kind, option);

              return (
                <button
                  id={`${listboxId}-${index}`}
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseOption(option)}
                  className={`flex min-h-12 w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,color,transform] duration-150 ${
                    selected
                      ? 'bg-violet-500/15 text-white'
                      : active
                        ? 'bg-white/[0.06] text-zinc-100'
                        : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
                  }`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-black">
                    <CharacterLabOptionIcon
                      id={optionIconId}
                      fallbackId={fallbackIconId}
                      size={24}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-black leading-tight">
                      {optionText.primary}
                    </span>
                    <span className="mt-0.5 block truncate text-[8px] font-bold leading-tight text-zinc-600">
                      {optionText.detail}
                    </span>
                  </span>
                  {selected && <Check size={14} className="shrink-0 text-violet-200" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface PreviewOptionItem {
  label: string;
  value: string;
  detail: string;
  iconId: string;
  fallbackIconId: string;
  sourceUrl?: string;
}

function PreviewOptionCard({
  item,
  prominent = false,
}: {
  item: PreviewOptionItem;
  prominent?: boolean;
}) {
  return (
    <div
      className={`character-lab-preview-option group flex h-full min-h-[132px] min-w-0 flex-col rounded-xl border border-white/10 bg-black/40 p-2 shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045] ${
        prominent ? 'sm:col-span-2 xl:col-span-1' : ''
      }`}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
        {item.sourceUrl ? (
          <img
            src={item.sourceUrl}
            alt=""
            className="size-full object-contain p-1 transition-transform duration-300 group-hover:scale-[1.035]"
          />
        ) : (
          <CharacterLabOptionIcon id={item.iconId} fallbackId={item.fallbackIconId} size={64} />
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        <span className="absolute left-1.5 top-1.5 rounded-md border border-white/10 bg-black/70 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-zinc-500">
          {item.label}
        </span>
      </div>
      <div className="min-w-0 shrink-0 px-0.5 pt-1.5">
        <div className="line-clamp-1 text-[10px] font-black leading-tight text-zinc-100">
          {item.value}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[8px] font-bold leading-tight text-zinc-600">
          {item.detail}
        </div>
      </div>
    </div>
  );
}

function AttachmentSetupSlot({
  kind,
  attachment,
  label,
  disabled = false,
  onClick,
  onDrop,
  onRemove,
}: {
  kind: 'source' | 'reference';
  attachment: Attachment | null;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  onDrop?: (files: File[]) => void;
  onRemove?: () => void;
}) {
  const isSource = kind === 'source';

  return (
    <div
      className={`group relative min-w-0 overflow-hidden rounded-xl border bg-black/45 transition-[border-color,opacity] duration-150 ${
        attachment ? 'border-white/15' : 'border-dashed border-white/10'
      } ${disabled ? 'opacity-45' : 'hover:border-white/25'}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        onDragOver={(event) => {
          if (disabled || !onDrop) return;
          event.preventDefault();
        }}
        onDrop={(event) => {
          if (disabled || !onDrop) return;
          event.preventDefault();
          onDrop(Array.from(event.dataTransfer.files));
        }}
        className="relative flex aspect-[4/5] w-full min-w-0 flex-col items-center justify-center overflow-hidden text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed"
        aria-label={attachment ? `${label} attached` : `Add ${label}`}
      >
        {attachment ? (
          <img
            src={attachment.dataUrl}
            alt={isSource ? 'Principal character source' : `${label} reference`}
            className="size-full object-cover outline outline-1 -outline-offset-1 outline-white/10 transition-transform duration-200 group-hover:scale-[1.025]"
          />
        ) : (
          <>
            <CharacterLabIcon id={isSource ? 'control:source' : 'control:reference'} size={42} />
            <span className="mt-1 max-w-full px-1 text-[8px] font-black uppercase tracking-widest text-zinc-600">
              {isSource ? 'Main' : 'Ref'}
            </span>
          </>
        )}
        <span className="absolute bottom-1 left-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-zinc-300">
          {label}
        </span>
      </button>

      {attachment && onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute right-1 top-1 rounded-md bg-black/80 p-1 text-zinc-300 opacity-0 transition-[opacity,color] duration-150 hover:text-red-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
          aria-label={`Remove ${label}`}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

function SourcePreviewCard({ source }: { source: Attachment | null }) {
  return (
    <div className="character-lab-preview-option group flex h-full min-h-[180px] flex-col rounded-xl border border-white/10 bg-black/45 p-2 shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-[border-color,background-color] duration-200 hover:border-white/20 hover:bg-white/[0.04]">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black">
        {source ? (
          <img
            src={source.dataUrl}
            alt="Selected character source"
            className="size-full object-contain p-1 outline outline-1 -outline-offset-1 outline-white/10 transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <CharacterLabIcon id="control:source" size={76} />
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        <span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-300">
          Source Image
        </span>
      </div>
      <div className="min-w-0 px-0.5 pt-1.5">
        <div className="truncate text-[11px] font-black uppercase tracking-wide text-white">
          {source ? 'Source Attached' : 'Prompt Guided'}
        </div>
        <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-widest text-zinc-500">
          {source?.name ?? 'No image source'}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  action,
  selected,
  onSelect,
}: {
  action: CharacterLabAction;
  selected: boolean;
  onSelect: (action: CharacterLabAction) => void;
}) {
  const accent = getAccent(action.accent);
  const locked = action.capability !== 'ready';

  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      title={action.prompt}
      className={`character-lab-action-card group relative flex aspect-[5/6] min-h-[132px] w-full min-w-0 flex-col overflow-hidden rounded-xl border p-1.5 text-left shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition-[background-color,border-color,color,opacity,transform] duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        selected
          ? `${accent.border} ${accent.soft} text-white ring-1 ring-inset ring-white/10`
          : 'border-white/10 bg-black/35 text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-100'
      }`}
    >
      <span className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
        <CharacterLabIcon id={action.id} size={58} />
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        {selected && (
          <span
            className={`absolute left-2 top-2 rounded-md border bg-black/60 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${accent.border} ${accent.text}`}
          >
            Active
          </span>
        )}
      </span>
      <span className="min-w-0 shrink-0 px-1 pb-1 pt-1">
        <span className="line-clamp-1 text-[9px] font-black leading-tight text-pretty">
          {action.label}
        </span>
        <span
          className={`mt-0.5 line-clamp-2 text-[8px] font-semibold leading-snug text-pretty ${
            selected ? 'text-zinc-300/85' : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
        >
          {action.prompt}
        </span>
        <span
          className={`mt-0.5 block truncate text-[7px] font-black uppercase tracking-widest ${selected ? accent.text : 'text-zinc-600'}`}
        >
          {action.task}
        </span>
      </span>
      {locked && (
        <span className="absolute right-2 top-2 rounded-md bg-black/70 p-1 text-zinc-500">
          <Lock size={10} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

export const CharacterLabRecipe: React.FC<CharacterLabRecipeProps> = ({
  recipeAliasId = null,
  config,
  updateConfig,
  onGenerate,
  isGenerating,
  images,
  onSelectImage,
  onUseAsSource,
}) => {
  const initialAliasMode = resolveCharacterLabModeFromAlias(recipeAliasId);
  const [selectedMode, setSelectedMode] = useState<CharacterLabModeId>(initialAliasMode);
  const [selectedActionId, setSelectedActionId] = useState(
    () => getFirstReadyActionForMode(initialAliasMode).id,
  );
  const [search, setSearch] = useState('');
  const [capabilityNotice, setCapabilityNotice] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState<string>(CHARACTER_LAB_GLOBAL_OPTIONS.styles[0]);
  const [clothing, setClothing] = useState<string>(CHARACTER_LAB_GLOBAL_OPTIONS.clothing[0]);
  const [bodyType, setBodyType] = useState<string>(CHARACTER_LAB_GLOBAL_OPTIONS.bodyTypes[0]);
  const [expression, setExpression] = useState<string>(CHARACTER_LAB_GLOBAL_OPTIONS.expressions[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    CHARACTER_LAB_GLOBAL_OPTIONS.palettes[0].backgroundColor,
  );
  const [labAspectRatio, setLabAspectRatio] = useState<string>('1:1');
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recipeAliasId) return;

    const aliasMode = resolveCharacterLabModeFromAlias(recipeAliasId);
    setSelectedMode(aliasMode);
    setSelectedActionId(getFirstReadyActionForMode(aliasMode).id);
    setSearch('');
    setCapabilityNotice('');
  }, [recipeAliasId]);

  const source = config.attachments[0] ?? null;
  const references = config.attachments.slice(1, 4);
  const selectedAction =
    CHARACTER_LAB_ACTIONS.find((action) => action.id === selectedActionId) ?? FIRST_READY_ACTION;
  const selectedAccent = getAccent(selectedAction.accent);
  const selectedModeMeta =
    CHARACTER_LAB_MODES.find((mode) => mode.id === selectedMode) ?? CHARACTER_LAB_MODES[0];
  const selectedModeActions = CHARACTER_LAB_ACTIONS.filter(
    (action) => action.mode === selectedMode,
  );
  const selectedModeReadyActions = selectedModeActions.filter(
    (action) => action.capability === 'ready',
  );
  const hasCharacterBrief = subject.trim().length > 0;
  const sourceLabel = source ? 'Source locked' : 'Prompt guided';
  const workflowStateTitle = source
    ? 'Source Ready'
    : hasCharacterBrief
      ? 'Brief Ready'
      : 'Start With Source Or Brief';
  const workflowStateCopy = source
    ? 'Identity source is loaded for the selected action.'
    : hasCharacterBrief
      ? 'Prompt-guided generation will use your character brief.'
      : 'Prompt-guided works now; a source image improves identity consistency.';

  const promptOptions = useMemo(
    () => ({
      subject,
      style,
      clothing,
      bodyType,
      expression,
      backgroundColor,
      labAspectRatio,
      referencesCount: references.length,
      hasSource: Boolean(source),
    }),
    [
      backgroundColor,
      bodyType,
      clothing,
      expression,
      labAspectRatio,
      references.length,
      source,
      style,
      subject,
    ],
  );

  const buildRecipeParamsForAction = (
    action: CharacterLabAction,
    paramsOverride: Record<string, unknown> = {},
  ) => ({
    mode: action.mode,
    actionId: action.id,
    actionLabel: action.label,
    category: action.category,
    actionPrompt: action.prompt,
    task: action.task,
    mediaType: action.mediaType,
    frames: action.frames ?? 0,
    isCouplesPose: action.isCouplesPose,
    capability: action.capability,
    subject,
    style,
    clothing,
    bodyType,
    expression,
    backgroundColor,
    labAspectRatio,
    hasSource: Boolean(source),
    referencesCount: references.length,
    ...paramsOverride,
  });

  const recipeParams = useMemo(
    () => buildRecipeParamsForAction(selectedAction),
    [
      backgroundColor,
      bodyType,
      clothing,
      expression,
      labAspectRatio,
      references.length,
      selectedAction,
      source,
      style,
      subject,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'character-lab', recipeParams);

  const selectedPrompt = useMemo(
    () => buildCharacterLabPrompt(selectedAction, promptOptions),
    [promptOptions, selectedAction],
  );

  const selectedActionSummary = useMemo(
    () =>
      [
        selectedAction.category,
        selectedAction.mediaType,
        selectedAction.frames ? `${selectedAction.frames} frames` : null,
      ]
        .filter(Boolean)
        .join(' / '),
    [selectedAction],
  );

  const capabilityLabel =
    selectedAction.capability === 'ready'
      ? 'Ready'
      : selectedAction.capability === 'planned-video'
        ? 'Video planned'
        : selectedAction.capability === 'planned-live'
          ? 'Live planned'
          : 'Analysis planned';
  const previewControlItems = useMemo(
    () =>
      (
        [
          ['Expression', 'expression', expression],
          ['Ratio', 'ratio', labAspectRatio],
          ['Style', 'style', style],
          ['Clothing', 'clothing', clothing],
          ['Body', 'body', bodyType],
        ] as const
      ).map(([label, kind, option]) => {
        const optionText = getDropdownOptionText(kind, option);
        const iconId = getOptionIconId(kind, option);
        return {
          label,
          value: optionText.primary,
          detail: optionText.detail,
          iconId,
          fallbackIconId: getDropdownOptionIcon(kind, option),
          sourceUrl: getOptionSourceUrl(iconId),
        };
      }),
    [bodyType, clothing, expression, labAspectRatio, style],
  );

  const filteredCategoryGroups = useMemo(() => {
    const query = normalizeSearch(search);
    return CHARACTER_LAB_CATEGORIES.filter((category) => category.mode === selectedMode)
      .map((category) => ({
        category,
        actions: CHARACTER_LAB_ACTIONS.filter(
          (action) =>
            action.mode === selectedMode &&
            action.category === category.label &&
            actionMatches(action, query),
        ),
      }))
      .filter((group) => group.actions.length > 0);
  }, [search, selectedMode]);

  const recentImages = images
    .filter((image) => image.config.recipeId === 'character-lab')
    .slice(0, 8);

  const setAction = (action: CharacterLabAction) => {
    setSelectedActionId(action.id);
    setSelectedMode(action.mode);
    setCapabilityNotice('');
  };

  const setOutputRatio = (value: string) => {
    setLabAspectRatio(value);
    updateConfig('aspectRatio', normalizeImageGenRatio(value) as AspectRatio);
  };

  const handleSourceFiles = async (files: File[]) => {
    const next = (
      await readAttachments(files.filter((file) => file.type.startsWith('image/')))
    ).slice(0, 1);
    if (next[0]) updateConfig('attachments', [next[0], ...references]);
  };

  const handleReferenceFiles = async (files: File[]) => {
    if (!source) {
      setCapabilityNotice('Add a source image before adding detail references.');
      return;
    }

    const next = (
      await readAttachments(files.filter((file) => file.type.startsWith('image/')))
    ).slice(0, Math.max(0, 3 - references.length));
    if (next.length > 0)
      updateConfig('attachments', [...(source ? [source] : []), ...references, ...next]);
  };

  const clearSource = () => updateConfig('attachments', []);
  const removeReference = (index: number) =>
    updateConfig('attachments', [
      ...(source ? [source] : []),
      ...references.filter((_, i) => i !== index),
    ]);

  const runAction = (
    action: CharacterLabAction,
    promptOverride?: string,
    paramsOverride: Record<string, unknown> = {},
    batchCount = config.batchCount,
  ) => {
    setAction(action);
    if (action.capability !== 'ready') {
      setCapabilityNotice(
        action.capability === 'planned-video'
          ? 'Motion generation is queued for a future video-capable provider.'
          : 'Profile and Live Interview actions require structured analysis/live provider support.',
      );
      return;
    }

    const prompt = promptOverride ?? buildCharacterLabPrompt(action, promptOptions);
    const nextRecipeParams = buildRecipeParamsForAction(action, paramsOverride);

    onGenerate(
      prompt,
      {
        recipeId: 'character-lab',
        recipeParams: nextRecipeParams,
        prompt,
        batchCount,
        aspectRatio: normalizeImageGenRatio(labAspectRatio),
        attachments: config.attachments.slice(0, 4),
      },
      { preventModal: true, useCurrentAttachments: true },
    );
  };

  const runCategoryBatch = (actions: CharacterLabAction[]) => {
    const readyActions = actions.filter((action) => action.capability === 'ready');
    const batchActions = readyActions.filter((action) => action.batchRecommended).slice(0, 8);
    const selected = batchActions[0] ?? actions[0];
    if (!selected) return;
    const actionList = batchActions.length > 0 ? batchActions : [selected];
    const basePrompt = buildCharacterLabPrompt(selected, promptOptions);
    const prompt = [
      basePrompt,
      '',
      `Batch request: generate ${actionList.length} separate Character Lab results, one for each action below while preserving identity and settings.`,
      ...actionList.map((action, index) => `${index + 1}. ${action.label}: ${action.prompt}`),
    ].join('\n');

    runAction(
      selected,
      prompt,
      {
        batchActionIds: actionList.map((action) => action.id),
        batchActionLabels: actionList.map((action) => action.label),
      },
      Math.max(1, Math.min(actionList.length, 8)),
    );
  };

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      className="character-lab-shell overflow-hidden bg-[#101010] p-2 pb-[var(--studio-recipe-dock-space)] sm:p-3 sm:pb-3 max-xl:overflow-y-auto"
    >
      <div className="grid size-full min-h-0 grid-cols-[minmax(250px,5fr)_minmax(320px,6fr)_minmax(440px,9fr)] gap-3 max-xl:flex max-xl:h-auto max-xl:min-h-[1120px] max-xl:flex-col max-sm:min-h-0">
        <aside
          className="character-lab-panel z-20 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-2xl max-xl:min-h-[680px] max-sm:min-h-[680px]"
          data-panel="left"
        >
          <div className="shrink-0 border-b border-white/10 p-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Attachments
                </div>
                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                  Principal + 3 refs
                </div>
              </div>
              <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                {source ? `${references.length}/3 refs` : 'source first'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <AttachmentSetupSlot
                kind="source"
                label="Main"
                attachment={source}
                onClick={() => sourceInputRef.current?.click()}
                onDrop={(files) => void handleSourceFiles(files)}
                onRemove={source ? clearSource : undefined}
              />
              {[0, 1, 2].map((index) => {
                const reference = references[index] ?? null;
                return (
                  <AttachmentSetupSlot
                    key={index}
                    kind="reference"
                    label={`R${index + 1}`}
                    attachment={reference}
                    disabled={!source}
                    onClick={() => referenceInputRef.current?.click()}
                    onDrop={(files) => void handleReferenceFiles(files)}
                    onRemove={reference ? () => removeReference(index) : undefined}
                  />
                );
              })}
            </div>

            <p className="mt-1.5 line-clamp-2 text-[9px] leading-snug text-zinc-600">
              {source
                ? 'References are unlocked for costume, prop, mood, or identity details.'
                : 'Add the principal image to unlock reference slots. Brief-only generation still works.'}
            </p>

            <input
              ref={sourceInputRef}
              name="character-lab-source"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Upload source image"
              onChange={(event) => {
                if (event.target.files) void handleSourceFiles(Array.from(event.target.files));
                event.currentTarget.value = '';
              }}
            />
            <input
              ref={referenceInputRef}
              name="character-lab-references"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Upload reference images"
              onChange={(event) => {
                if (event.target.files) void handleReferenceFiles(Array.from(event.target.files));
                event.currentTarget.value = '';
              }}
            />
          </div>

          <div className="shrink-0 border-b border-white/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-200">
                  Action Setup
                </h2>
                <p className="mt-1 text-[10px] font-semibold text-zinc-600">
                  {sourceLabel} / {selectedAction.task} / {selectedModeMeta.mediaType}
                </p>
              </div>
              <span
                className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${selectedAccent.border} ${selectedAccent.text}`}
              >
                {capabilityLabel}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-20 custom-scrollbar">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Character Brief
              </span>
              <textarea
                name="character-lab-brief"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Brave elven ranger, scar over left eye..."
                className="h-20 resize-none rounded-xl border border-white/10 bg-black/35 p-2.5 text-[12px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 transition-[border-color,background-color] duration-150 focus:border-violet-500/70 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <SelectField
                label="Base Expression"
                value={expression}
                options={CHARACTER_LAB_GLOBAL_OPTIONS.expressions}
                onChange={setExpression}
                kind="expression"
              />
              <SelectField
                label="Aspect Ratio"
                value={labAspectRatio}
                options={CHARACTER_LAB_GLOBAL_OPTIONS.aspectRatios.flatMap((group) => group.ratios)}
                onChange={setOutputRatio}
                kind="ratio"
              />
              <SelectField
                label="Artistic Style"
                value={style}
                options={CHARACTER_LAB_GLOBAL_OPTIONS.styles}
                onChange={setStyle}
                kind="style"
                className="col-span-2"
              />
              <SelectField
                label="Clothing"
                value={clothing}
                options={CHARACTER_LAB_GLOBAL_OPTIONS.clothing}
                onChange={setClothing}
                kind="clothing"
                className="col-span-2"
              />
              <SelectField
                label="Body Type"
                value={bodyType}
                options={CHARACTER_LAB_GLOBAL_OPTIONS.bodyTypes}
                onChange={setBodyType}
                kind="body"
                className="col-span-2"
              />
            </div>

            <div className="mt-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Background Color
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {CHARACTER_LAB_GLOBAL_OPTIONS.palettes.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => setBackgroundColor(palette.backgroundColor)}
                    className={`flex h-8 items-center justify-center rounded-lg border bg-black/35 transition-[border-color,background-color] duration-150 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      backgroundColor === palette.backgroundColor
                        ? 'border-violet-400 bg-violet-500/10'
                        : 'border-white/10'
                    }`}
                    aria-label={`Background ${palette.name}`}
                  >
                    <span className="flex -space-x-1">
                      {palette.swatches.map((swatch) => (
                        <span
                          key={swatch}
                          className="size-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main
          className="character-lab-panel z-10 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/75 shadow-2xl max-xl:min-h-[560px] max-sm:min-h-[500px]"
          data-panel="main"
        >
          <div className="shrink-0 border-b border-white/10 p-2.5">
            <div className="custom-scrollbar flex gap-1 overflow-x-auto pb-1">
              {CHARACTER_LAB_MODES.map((mode) => {
                const active = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    title={mode.description}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setAction(getFirstReadyActionForMode(mode.id));
                    }}
                    className={`character-lab-control-card flex h-10 min-w-[76px] flex-none items-center justify-center gap-1.5 rounded-lg border px-2 text-[8px] font-black transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      active
                        ? 'border-violet-400/60 bg-violet-500/10 text-white'
                        : 'border-white/10 bg-black/25 text-zinc-500 hover:border-white/20 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    <CharacterLabIcon id={MODE_ICON_IDS[mode.id]} size={18} />
                    <span className="min-w-0 truncate">{mode.label.replace(' Sheets', '')}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  aria-hidden="true"
                />
                <input
                  name="character-lab-action-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${CHARACTER_LAB_OPTION_COUNTS.total} actions`}
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600 transition-[border-color,background-color] duration-150 focus:border-violet-500/70 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                />
              </div>
              <div className="shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-right">
                <div className="text-[9px] font-black tabular-nums text-zinc-300">
                  {selectedModeReadyActions.length}/{selectedModeActions.length}
                </div>
                <div className="text-[7px] font-black uppercase tracking-widest text-zinc-600">
                  ready
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5 custom-scrollbar">
            {filteredCategoryGroups.map(({ category, actions }) => {
              const firstAction = actions[0];
              const accent = firstAction ? getAccent(firstAction.accent) : getAccent('zinc');
              const batchCount = actions.filter((action) => action.batchRecommended).length;

              return (
                <section key={category.id} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className={`flex min-w-0 flex-1 items-center gap-2 ${accent.text}`}>
                      {firstAction && <CharacterLabIcon id={firstAction.id} size={22} />}
                      <span className="truncate text-[11px] font-black uppercase tracking-wide">
                        {category.label}
                      </span>
                      <span className="text-[9px] font-bold tabular-nums text-zinc-600">
                        {actions.length}
                      </span>
                    </div>
                    {batchCount > 0 && (
                      <button
                        type="button"
                        onClick={() => runCategoryBatch(actions)}
                        className="flex h-7 items-center gap-1 rounded-lg border border-violet-400/25 bg-violet-500/15 px-2 text-[8px] font-black uppercase tracking-wide text-violet-100 transition-[background-color,border-color] duration-150 hover:border-violet-300/50 hover:bg-violet-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <CharacterLabIcon id="control:batch" size={16} />
                        Batch
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(124px,1fr))] gap-2">
                    {actions.map((action) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        selected={action.id === selectedAction.id}
                        onSelect={setAction}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {filteredCategoryGroups.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                No matching actions
              </div>
            )}
          </div>
        </main>

        <aside
          className="character-lab-panel relative z-20 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-2xl max-xl:min-h-[680px]"
          data-panel="right"
        >
          <div className="shrink-0 border-b border-white/10 p-3">
            <div className="flex items-start gap-2.5">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-lg border ${selectedAccent.border} ${selectedAccent.soft}`}
              >
                <CharacterLabIcon id={selectedAction.id} size={32} />
              </span>
              <div className="min-w-0">
                <h2 className="text-[16px] font-black leading-tight text-balance text-zinc-100">
                  {workflowStateTitle}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-pretty text-zinc-500">
                  {workflowStateCopy}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5 pb-20 custom-scrollbar">
            <div className="grid grid-cols-[minmax(210px,0.9fr)_minmax(250px,1.1fr)] gap-2.5 max-[1180px]:grid-cols-1">
              <SourcePreviewCard source={source} />
              <div className="flex h-full min-h-[180px] flex-col rounded-xl border border-white/10 bg-black/45 p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.26)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Selected Inputs
                    </div>
                    <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-zinc-600">
                      Source and refs
                    </div>
                  </div>
                  <span className="rounded-lg border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    {source ? `${references.length + 1}/4` : '0/4'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[source, ...references, null, null, null]
                    .slice(0, 4)
                    .map((attachment, index) => (
                      <div
                        key={attachment?.id ?? `preview-empty-${index}`}
                        className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/10 bg-zinc-950"
                      >
                        {attachment ? (
                          <img
                            src={attachment.dataUrl}
                            alt={index === 0 ? 'Source preview' : `Reference preview ${index}`}
                            className="size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-zinc-700">
                            <CharacterLabIcon
                              id={index === 0 ? 'control:source' : 'control:reference'}
                              size={30}
                            />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-zinc-400">
                          {index === 0 ? 'Main' : `R${index}`}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="mt-2.5 flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-zinc-950/75 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-black uppercase tracking-wide text-zinc-100">
                      {selectedAction.label}
                    </span>
                    <span
                      className={`shrink-0 rounded-md border bg-black/50 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${selectedAccent.border} ${selectedAccent.text}`}
                    >
                      {capabilityLabel}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-[10px] leading-snug text-pretty text-zinc-500">
                    {selectedAction.prompt}
                  </p>
                  <div className="mt-auto pt-2 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                    {selectedActionSummary}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)] gap-2.5 max-[1360px]:grid-cols-1">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-2">
                {previewControlItems.map((item) => (
                  <PreviewOptionCard key={item.label} item={item} />
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/45 p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
                <div className="mb-1.5 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <FileText size={12} aria-hidden="true" />
                  Prompt Snapshot
                </div>
                <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-zinc-500 custom-scrollbar">
                  {selectedPrompt}
                </p>
              </div>
            </div>

            {recentImages.length > 0 && (
              <div className="mt-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Recent Outputs
                  </div>
                  <span className="text-[9px] font-black tabular-nums text-zinc-600">
                    {recentImages.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-sm:grid-cols-2">
                  {recentImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectImage(image)}
                        className="size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        aria-label="Open generated image"
                      >
                        <img
                          src={image.thumbnail ?? image.preview ?? image.src}
                          alt=""
                          className="size-full object-cover opacity-90 transition-[opacity] duration-150 group-hover:opacity-100"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUseAsSource(image)}
                        className="absolute inset-x-1 bottom-1 flex min-h-7 items-center justify-center gap-1 rounded-lg bg-black/80 px-1.5 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-200 opacity-0 transition-[opacity] duration-150 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <CharacterLabIcon id="control:use-as-source" size={14} />
                        Source
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {capabilityNotice && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[12px] font-semibold text-amber-100">
                {capabilityNotice}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => runAction(selectedAction)}
            disabled={isGenerating}
            className="group absolute bottom-3 right-3 z-30 flex min-h-11 w-fit min-w-[172px] items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/20 px-3 py-2 text-left text-white shadow-[0_18px_38px_rgba(0,0,0,0.38),0_12px_28px_rgba(139,92,246,0.18)] backdrop-blur-md transition-[border-color,background-color,opacity,transform] duration-150 hover:-translate-y-0.5 hover:border-violet-300/60 hover:bg-violet-500/30 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-black">
              {isGenerating ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CharacterLabIcon id="control:generate" size={22} />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-black uppercase tracking-widest">
                Generate
              </span>
              <span className="mt-0.5 block truncate text-[8px] font-bold uppercase tracking-wider text-violet-200/70">
                Current action
              </span>
            </span>
          </button>
        </aside>
      </div>
    </RecipeLayout>
  );
};
