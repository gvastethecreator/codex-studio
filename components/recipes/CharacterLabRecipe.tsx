import { getRecipeStringParam } from '../../lib/recipeIdentity';
import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import type { AspectRatio, Attachment, ImageGenerationConfig } from '../../types';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { buildCharacterLabPrompt } from '../../lib/characterLabPrompt';
import {
  characterLabActions,
  characterLabCategories,
  characterLabGlobalOptions,
  characterLabIconAtlas,
  characterLabIconAtlasSize,
  characterLabModes,
  characterLabOptionCounts,
  characterLabOptionIconAtlas,
  getCharacterLabIconFrame,
  getCharacterLabOptionIconFrame,
  getFirstReadyCharacterLabAction,
  resolveInitialCharacterLabAction,
  type CharacterLabAction,
  type CharacterLabModeId,
} from '../../lib/characterLabView';
import { type RecipeAliasId } from '../../lib/recipeAliases';
import { normalizeImageGenRatio } from '../../utils/imageGenSizing';
import {
  RecipeControls,
  RecipePrimaryAction,
  RecipeOptionsPanel,
  RecipeResults,
} from './RecipeWorkbenchContext';
import { RecipeLayout } from './RecipeLayout';
import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';

interface CharacterLabRecipeProps {
  recipeAliasId?: RecipeAliasId | null;
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  onGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: {
      preventModal?: boolean;
      useCurrentAttachments?: boolean;
    },
  ) => void;
  isGenerating: boolean;
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

const SELECTED_INPUT_PREVIEW_SLOT_IDS = [
  'source-preview',
  'reference-preview-1',
  'reference-preview-2',
  'reference-preview-3',
] as const;

const ACCENT_CLASSES: Record<string, { text: string; border: string; bg: string; soft: string }> = {
  amber: {
    text: 'text-[color:var(--wb-warning)] ',
    border: 'border-amber-500/2',
    bg: 'bg-amber-500',
    soft: 'bg-amber-500/10',
  },
  orange: {
    text: 'text-orange-300',
    border: 'border-orange-500/2',
    bg: 'bg-orange-500',
    soft: 'bg-orange-500/10',
  },
  blue: {
    text: 'text-blue-300',
    border: 'border-blue-500/2',
    bg: 'bg-blue-500',
    soft: 'bg-blue-500/10',
  },
  cyan: {
    text: 'text-cyan-300',
    border: 'border-cyan-500/2',
    bg: 'bg-cyan-500',
    soft: 'bg-cyan-500/10',
  },
  emerald: {
    text: 'text-[color:var(--wb-success)] ',
    border: 'border-emerald-500/2',
    bg: 'bg-emerald-500',
    soft: 'bg-emerald-500/10',
  },
  green: {
    text: 'text-green-300',
    border: 'border-green-500/2',
    bg: 'bg-green-500',
    soft: 'bg-green-500/10',
  },
  indigo: {
    text: 'text-indigo-300',
    border: 'border-indigo-500/2',
    bg: 'bg-indigo-500',
    soft: 'bg-indigo-500/10',
  },
  pink: {
    text: 'text-pink-300',
    border: 'border-pink-500/2',
    bg: 'bg-pink-500',
    soft: 'bg-pink-500/10',
  },
  purple: {
    text: 'text-purple-300',
    border: 'border-purple-500/2',
    bg: 'bg-purple-500',
    soft: 'bg-purple-500/10',
  },
  red: {
    text: 'text-[color:var(--wb-danger)] ',
    border: 'border-red-500/40',
    bg: 'bg-red-500',
    soft: 'bg-red-500/10',
  },
  teal: {
    text: 'text-teal-300',
    border: 'border-teal-500/2',
    bg: 'bg-teal-500',
    soft: 'bg-teal-500/10',
  },
  yellow: {
    text: 'text-yellow-300',
    border: 'border-yellow-500/2',
    bg: 'bg-yellow-500',
    soft: 'bg-yellow-500/10',
  },
  zinc: {
    text: 'text-[color:var(--wb-ink)]',
    border: 'border-[color:var(--wb-line)]',
    bg: 'bg-zinc-500',
    soft: 'bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)]',
  },
};

const ATLAS_WIDTH = characterLabIconAtlasSize.width;
const ATLAS_HEIGHT = characterLabIconAtlasSize.height;
const FIRST_READY_ACTION = getFirstReadyCharacterLabAction();

function getFirstReadyActionForMode(mode: CharacterLabModeId) {
  return getFirstReadyCharacterLabAction(mode);
}

function getAccent(accent: string) {
  return ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.zinc;
}

function CharacterLabIcon({ id, size = 18 }: { id: string; size?: number }) {
  const frame = getCharacterLabIconFrame(id);
  if (!frame) return <Sparkles size={size} aria-hidden="true" />;

  const scale = size / characterLabIconAtlas.cellSize;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-no-repeat align-middle"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${characterLabIconAtlas.url})`,
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
  const frame = getCharacterLabOptionIconFrame(id);
  if (!frame) return <CharacterLabIcon id={fallbackId} size={size} />;

  const scale = size / characterLabOptionIconAtlas.cellSize;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-no-repeat align-middle"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${characterLabOptionIconAtlas.url})`,
        backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
        backgroundSize: `${characterLabOptionIconAtlas.width * scale}px ${
          characterLabOptionIconAtlas.height * scale
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
  const group = characterLabGlobalOptions.aspectRatios.find((item) =>
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
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const listboxId = useId();
  const selectedText = getDropdownOptionText(kind, value);
  const selectedIconId = getOptionIconId(kind, value);
  const fallbackIconId = FIELD_ICON_IDS[kind];

  const openDropdown = useCallback(() => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }, [selectedIndex]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);
  const closeDropdownFromDocument = useEffectEvent(closeDropdown);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeDropdownFromDocument();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDropdownFromDocument();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  const chooseOption = (option: string) => {
    onChange(option);
    closeDropdown();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
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
    <div ref={rootRef} className={`relative flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span
        id={labelId}
        className="text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-muted)]"
      >
        {label}
      </span>
      <input type="hidden" name={fieldName} value={value} />
      <button
        ref={triggerRef}
        type="button"
        name={fieldName}
        aria-labelledby={labelId}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={handleKeyDown}
        className={`character-lab-control-card flex min-h-12 w-full min-w-0 items-center gap-3 rounded-[var(--wb-radius)] border px-2.5 py-2 text-left outline-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isOpen
            ? 'border-violet-400/2 bg-violet-500/10 text-[color:var(--wb-ink)]'
            : 'border-[color:var(--wb-line)] bg-[color:var(--wb-well)] text-[color:var(--wb-ink)] hover:border-[color:var(--wb-border)] hover:bg-white/[0.05]'
        }`}
        onClick={() => {
          if (isOpen) closeDropdown();
          else openDropdown();
        }}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[var(--wb-radius)] bg-black">
          <CharacterLabOptionIcon id={selectedIconId} fallbackId={fallbackIconId} size={27} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold leading-tight text-[color:var(--wb-ink)]">
            {selectedText.primary}
          </span>
          <span className="mt-0.5 block truncate text-[length:var(--wbp-label)] font-bold leading-tight text-[color:var(--wb-dim)]">
            {selectedText.detail}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[color:var(--wb-muted)] transition-[transform,color] duration-150 ${
            isOpen ? 'rotate-180 text-violet-200' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <DemandMountedGsapDropdown
        id={listboxId}
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) openDropdown();
          else closeDropdown();
        }}
        triggerRef={triggerRef}
        placement="bottom-left"
        role="listbox"
        aria-labelledby={labelId}
        aria-activedescendant={`${listboxId}-${activeIndex}`}
        className="t-dropdown custom-scrollbar absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-[var(--wb-radius)] p-1.5"
        data-origin="top-right"
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
              data-dropdown-item
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(option)}
              className={`flex min-h-12 w-full min-w-0 items-center gap-3 rounded-[var(--wb-radius)] px-2 py-2 text-left transition-[background-color,color,transform] duration-150 ${
                selected
                  ? 'bg-violet-500/15 text-[color:var(--wb-ink)]'
                  : active
                    ? 'bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-ink)]'
                    : 'text-[color:var(--wb-muted)] hover:bg-white/[0.05] hover:text-[color:var(--wb-ink)]'
              }`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[var(--wb-radius)] bg-black">
                <CharacterLabOptionIcon id={optionIconId} fallbackId={fallbackIconId} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold leading-tight">
                  {optionText.primary}
                </span>
                <span className="mt-0.5 block truncate text-[length:var(--wbp-label)] font-bold leading-tight text-[color:var(--wb-dim)]">
                  {optionText.detail}
                </span>
              </span>
              {selected && <Check size={14} className="shrink-0 text-violet-200" />}
            </button>
          );
        })}
      </DemandMountedGsapDropdown>
    </div>
  );
}

interface PreviewOptionItem {
  label: string;
  value: string;
  detail: string;
  iconId: string;
  fallbackIconId: string;
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
      className={`character-lab-preview-option group flex h-full min-h-[132px] min-w-0 flex-col rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2 shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[color:var(--wb-border)] hover:bg-white/[0.045] ${
        prominent ? 'sm:col-span-2 xl:col-span-1' : ''
      }`}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[var(--wb-radius)] bg-black">
        <CharacterLabOptionIcon id={item.iconId} fallbackId={item.fallbackIconId} size={64} />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        <span className="absolute left-1.5 top-1.5 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] px-1.5 py-0.5 text-[7px] font-semibold tracking-normal text-[color:var(--wb-muted)]">
          {item.label}
        </span>
      </div>
      <div className="min-w-0 shrink-0 px-0.5 pt-1.5">
        <div className="line-clamp-1 text-[length:var(--wbp-label)] font-semibold leading-tight text-[color:var(--wb-ink)]">
          {item.value}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[length:var(--wbp-label)] font-bold leading-tight text-[color:var(--wb-dim)]">
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
      className={`group relative min-w-0 overflow-hidden rounded-[var(--wb-radius)] border bg-[color:var(--wb-well)] transition-[border-color,opacity] duration-150 ${
        attachment ? 'border-[color:var(--wb-line)]' : 'border-dashed border-[color:var(--wb-line)]'
      } ${disabled ? 'opacity-45' : 'hover:border-[color:var(--wb-border)]'}`}
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
            <span className="mt-1 max-w-full px-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              {isSource ? 'Main' : 'Ref'}
            </span>
          </>
        )}
        <span className="absolute bottom-1 left-1 rounded-[var(--wb-radius)] bg-black/75 px-1.5 py-0.5 text-[7px] font-semibold tracking-normal text-[color:var(--wb-ink)]">
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
          className="absolute right-1 top-1 rounded-[var(--wb-radius)] bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] p-1 text-[color:var(--wb-ink)] opacity-0 transition-[opacity,color] duration-150 hover:text-[color:var(--wb-danger)]  group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
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
    <div className="character-lab-preview-option group flex h-full min-h-[180px] flex-col rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2 shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-[border-color,background-color] duration-200 hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)]">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-black">
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
        <span className="absolute left-3 top-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
          Source Image
        </span>
      </div>
      <div className="min-w-0 px-0.5 pt-1.5">
        <div className="truncate text-[11px] font-semibold tracking-normal text-[color:var(--wb-ink)]">
          {source ? 'Source Attached' : 'Prompt Guided'}
        </div>
        <div className="mt-0.5 truncate text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
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
      className={`character-lab-action-card group relative flex aspect-[5/6] min-h-[132px] w-full min-w-0 flex-col overflow-hidden rounded-[var(--wb-radius)] border p-1.5 text-left shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition-[background-color,border-color,color,opacity,transform] duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        selected
          ? `${accent.border} ${accent.soft} text-[color:var(--wb-ink)] ring-1 ring-inset ring-white/10`
          : 'border-[color:var(--wb-line)] bg-[color:var(--wb-well)] text-[color:var(--wb-muted)] hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] hover:text-[color:var(--wb-ink)]'
      }`}
    >
      <span className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[var(--wb-radius)] bg-black">
        <CharacterLabIcon id={action.id} size={58} />
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
        {selected && (
          <span
            className={`absolute left-2 top-2 rounded-[var(--wb-radius)] border bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] px-1.5 py-0.5 text-[7px] font-semibold tracking-normal ${accent.border} ${accent.text}`}
          >
            Selected
          </span>
        )}
      </span>
      <span className="min-w-0 shrink-0 px-1 pb-1 pt-1">
        <span className="line-clamp-1 text-[length:var(--wbp-label)] font-semibold leading-tight text-pretty">
          {action.label}
        </span>
        <span
          className={`mt-0.5 line-clamp-2 text-[length:var(--wbp-label)] font-semibold leading-snug text-pretty ${
            selected
              ? 'text-[color:var(--wb-ink)]/85'
              : 'text-[color:var(--wb-muted)] group-hover:text-[color:var(--wb-muted)]'
          }`}
        >
          {action.prompt}
        </span>
        <span
          className={`mt-0.5 block truncate text-[7px] font-semibold tracking-normal ${selected ? accent.text : 'text-[color:var(--wb-dim)]'}`}
        >
          {action.capability === 'ready' ? 'Prompt or reference' : 'Not yet available'}
        </span>
      </span>
      {locked && (
        <span className="absolute right-2 top-2 rounded-[var(--wb-radius)] bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] p-1 text-[color:var(--wb-muted)]">
          <Lock size={10} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

const CharacterLabRecipeSession: React.FC<CharacterLabRecipeProps> = ({
  recipeAliasId = null,
  config,
  updateConfig,
  onGenerate,
  isGenerating,
}) => {
  const [actionBrowserOpen, setActionBrowserOpen] = useState(false);
  const actionToggleRef = useRef<HTMLButtonElement>(null);
  const [initialAction] = useState(() =>
    resolveInitialCharacterLabAction(config.recipeParams, recipeAliasId),
  );
  const [selectedMode, setSelectedMode] = useState<CharacterLabModeId>(initialAction.mode);
  const [selectedActionId, setSelectedActionId] = useState(initialAction.id);
  const [search, setSearch] = useState(() => getRecipeStringParam(config, 'actionSearch', ''));
  const [capabilityNotice, setCapabilityNotice] = useState('');
  const [subject, setSubject] = useState(() => getRecipeStringParam(config, 'subject', ''));
  const [style, setStyle] = useState<string>(() =>
    getRecipeStringParam(config, 'style', characterLabGlobalOptions.styles[0]),
  );
  const [clothing, setClothing] = useState<string>(() =>
    getRecipeStringParam(config, 'clothing', characterLabGlobalOptions.clothing[0]),
  );
  const [bodyType, setBodyType] = useState<string>(() =>
    getRecipeStringParam(config, 'bodyType', characterLabGlobalOptions.bodyTypes[0]),
  );
  const [expression, setExpression] = useState<string>(() =>
    getRecipeStringParam(config, 'expression', characterLabGlobalOptions.expressions[0]),
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    getRecipeStringParam(config, 'backgroundColor') ||
      characterLabGlobalOptions.palettes[0].backgroundColor,
  );
  const [labAspectRatio, setLabAspectRatio] = useState<string>(
    () => getRecipeStringParam(config, 'labAspectRatio') || config.aspectRatio || '1:1',
  );
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const source = config.attachments[0] ?? null;
  const references = config.attachments.slice(1, 4);
  const selectedAction =
    characterLabActions.find((action) => action.id === selectedActionId) ?? FIRST_READY_ACTION;
  const selectedAccent = getAccent(selectedAction.accent);
  const selectedModeMeta =
    characterLabModes.find((mode) => mode.id === selectedMode) ?? characterLabModes[0];
  const selectedModeActions = characterLabActions.filter((action) => action.mode === selectedMode);
  const selectedModeReadyActions = selectedModeActions.filter(
    (action) => action.capability === 'ready',
  );
  const hasCharacterBrief = subject.trim().length > 0;
  const sourceLabel = source ? 'Source locked' : 'Prompt guided';
  const workflowStateTitle = source
    ? 'Reference attached'
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
      search,
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

  const buildRecipeParamsForAction = useCallback(
    (action: CharacterLabAction, paramsOverride: Record<string, unknown> = {}) => ({
      mode: action.mode,
      actionId: action.id,
      actionSearch: search,
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

  const recipeParams = useMemo(
    () => buildRecipeParamsForAction(selectedAction),
    [buildRecipeParamsForAction, selectedAction],
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
        };
      }),
    [bodyType, clothing, expression, labAspectRatio, style],
  );

  const filteredCategoryGroups = useMemo(() => {
    const query = normalizeSearch(search);
    return characterLabCategories
      .filter((category) => category.mode === selectedMode)
      .map((category) => ({
        category,
        actions: characterLabActions.filter(
          (action) =>
            action.mode === selectedMode &&
            action.category === category.label &&
            actionMatches(action, query),
        ),
      }))
      .filter((group) => group.actions.length > 0);
  }, [search, selectedMode]);

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
    <RecipeLayout isGenerating={isGenerating} className="character-lab-shell flex min-h-0 flex-col">
      <div className="flex size-full min-h-0 flex-col">
        <RecipeOptionsPanel
          title="Choose action"
          open={actionBrowserOpen}
          onOpenChange={setActionBrowserOpen}
          triggerRef={actionToggleRef}
        >
          <div className="character-action-catalog flex min-h-0 flex-col" data-panel="main">
            <div className="shrink-0 border-b border-[color:var(--wb-line)] p-2.5">
              <div className="custom-scrollbar flex gap-1 overflow-x-auto pb-1">
                {characterLabModes.map((mode) => {
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
                      className={`character-lab-control-card flex h-10 min-w-[76px] flex-none items-center justify-center gap-1.5 rounded-[var(--wb-radius)] border px-2 text-[length:var(--wbp-label)] font-semibold transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                        active
                          ? 'border-violet-400/2 bg-violet-500/10 text-[color:var(--wb-ink)]'
                          : 'border-[color:var(--wb-line)] bg-black/25 text-[color:var(--wb-muted)] hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] hover:text-[color:var(--wb-ink)]'
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--wb-dim)]"
                    aria-hidden="true"
                  />
                  <input
                    name="character-lab-action-search"
                    aria-label="Search character actions"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${characterLabOptionCounts.total} actions`}
                    className="h-9 w-full rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] pl-9 pr-3 text-[12px] text-[color:var(--wb-ink)] outline-none placeholder:text-[color:var(--wb-dim)] transition-[border-color,background-color] duration-150 focus:border-violet-500/2 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  />
                </div>
                <div className="shrink-0 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] px-2 py-1.5 text-right">
                  <div className="text-[length:var(--wbp-label)] font-semibold tabular-nums text-[color:var(--wb-ink)]">
                    {selectedModeReadyActions.length}/{selectedModeActions.length}
                  </div>
                  <div className="text-[7px] font-semibold tracking-normal text-[color:var(--wb-dim)]">
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
                        <span className="truncate text-[11px] font-semibold tracking-normal">
                          {category.label}
                        </span>
                        <span className="text-[length:var(--wbp-label)] font-bold tabular-nums text-[color:var(--wb-dim)]">
                          {actions.length}
                        </span>
                      </div>
                      {batchCount > 0 && (
                        <button
                          type="button"
                          onClick={() => runCategoryBatch(actions)}
                          className="flex h-7 items-center gap-1 rounded-[var(--wb-radius)] border border-violet-400/2 bg-violet-500/15 px-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-violet-100 transition-[background-color,border-color] duration-150 hover:border-violet-300/2 hover:bg-violet-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                          onSelect={(action) => {
                            setAction(action);
                            setActionBrowserOpen(false);
                            actionToggleRef.current?.focus();
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {filteredCategoryGroups.length === 0 && (
                <div className="rounded-[var(--wb-radius)] border border-dashed border-[color:var(--wb-line)] p-6 text-center text-[11px] font-bold tracking-normal text-[color:var(--wb-dim)]">
                  No matching actions
                </div>
              )}
            </div>
          </div>
        </RecipeOptionsPanel>
        <RecipeControls>
          <aside
            className="character-lab-panel z-20 flex min-h-0 flex-col overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-2xl"
            data-panel="left"
          >
            <div className="shrink-0 border-b border-[color:var(--wb-line)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[12px] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                    Action Setup
                  </h2>
                  <p className="mt-1 text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-dim)]">
                    {selectedAction.label} · {sourceLabel}
                  </p>
                </div>
                <span
                  className={`rounded-[var(--wb-radius)] border px-2 py-1 text-[length:var(--wbp-label)] font-semibold tracking-normal ${selectedAccent.border} ${selectedAccent.text}`}
                >
                  {capabilityLabel}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
              <label className="flex flex-col gap-1.5">
                <span className="text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-muted)]">
                  Character Brief
                </span>
                <textarea
                  name="character-lab-brief"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Brave elven ranger, scar over left eye..."
                  className="h-20 resize-none rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2.5 text-[12px] leading-relaxed text-[color:var(--wb-ink)] outline-none placeholder:text-[color:var(--wb-dim)] transition-[border-color,background-color] duration-150 focus:border-violet-500/2 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                />
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <SelectField
                  label="Base Expression"
                  value={expression}
                  options={characterLabGlobalOptions.expressions}
                  onChange={setExpression}
                  kind="expression"
                />
                <SelectField
                  label="Aspect Ratio"
                  value={labAspectRatio}
                  options={characterLabGlobalOptions.aspectRatios.flatMap((group) => group.ratios)}
                  onChange={setOutputRatio}
                  kind="ratio"
                />
                <SelectField
                  label="Artistic Style"
                  value={style}
                  options={characterLabGlobalOptions.styles}
                  onChange={setStyle}
                  kind="style"
                  className="col-span-2"
                />
                <SelectField
                  label="Clothing"
                  value={clothing}
                  options={characterLabGlobalOptions.clothing}
                  onChange={setClothing}
                  kind="clothing"
                  className="col-span-2"
                />
                <SelectField
                  label="Body Type"
                  value={bodyType}
                  options={characterLabGlobalOptions.bodyTypes}
                  onChange={setBodyType}
                  kind="body"
                  className="col-span-2"
                />
              </div>

              <div className="mt-3">
                <div className="mb-1.5 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-muted)]">
                  Background Color
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {characterLabGlobalOptions.palettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => setBackgroundColor(palette.backgroundColor)}
                      className={`flex h-8 items-center justify-center rounded-[var(--wb-radius)] border bg-[color:var(--wb-well)] transition-[border-color,background-color] duration-150 hover:border-[color:var(--wb-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                        backgroundColor === palette.backgroundColor
                          ? 'border-violet-400/2 bg-violet-500/10'
                          : 'border-[color:var(--wb-line)]'
                      }`}
                      aria-label={`Background ${palette.name}`}
                    >
                      <span className="flex -space-x-1">
                        {palette.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="size-3.5 rounded-full border border-black/2"
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
        </RecipeControls>

        <RecipeResults />

        <RecipeControls>
          <aside
            className="character-lab-panel relative z-20 flex min-h-0 flex-col overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-2xl"
            data-panel="right"
          >
            <div className="shrink-0 border-b border-[color:var(--wb-line)] p-3">
              <div className="flex items-start gap-2.5">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-[var(--wb-radius)] border ${selectedAccent.border} ${selectedAccent.soft}`}
                >
                  <CharacterLabIcon id={selectedAction.id} size={32} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold leading-tight text-balance text-[color:var(--wb-ink)]">
                    {workflowStateTitle}
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-pretty text-[color:var(--wb-muted)]">
                    {workflowStateCopy}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2.5 custom-scrollbar">
              <div className="mt-2.5">
                <details className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-2.5">
                  <summary>Compiled prompt</summary>
                  <div className="mb-1.5 flex items-center gap-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
                    <FileText size={12} aria-hidden="true" />
                    Compiled prompt
                  </div>
                  <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-[length:var(--wbp-label)] leading-relaxed text-[color:var(--wb-muted)] custom-scrollbar">
                    {selectedPrompt}
                  </p>
                </details>
              </div>

              {capabilityNotice && (
                <div className="mt-4 rounded-[var(--wb-radius)] border border-amber-500/2 bg-amber-500/10 px-4 py-3 text-[12px] font-semibold text-[color:var(--wb-warning)] ">
                  {capabilityNotice}
                </div>
              )}
            </div>

            <RecipePrimaryAction>
              <button
                type="button"
                onClick={() => runAction(selectedAction)}
                data-character-lab-generate-button
                data-generate-active={isGenerating ? 'true' : 'false'}
                className="studio-primary-control group relative min-h-11 w-full gap-2 py-2 text-left"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-[var(--wb-radius)] bg-black">
                  {isGenerating ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CharacterLabIcon id="control:generate" size={22} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[length:var(--wbp-label)] font-semibold tracking-normal">
                    {isGenerating ? 'Queue' : 'Generate'}
                  </span>
                  <span className="mt-0.5 block truncate text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-on-fill)]">
                    Current action
                  </span>
                </span>
              </button>
            </RecipePrimaryAction>
          </aside>
        </RecipeControls>
      </div>
    </RecipeLayout>
  );
};

export const CharacterLabRecipe: React.FC<CharacterLabRecipeProps> = (props) => (
  <CharacterLabRecipeSession key={props.recipeAliasId ?? 'character-lab'} {...props} />
);
