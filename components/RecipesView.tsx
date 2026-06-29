import React from 'react';
import {
  IconArrowRight as ArrowRight,
  IconGrid3x3 as Grid3X3,
  IconMovie as Clapperboard,
  IconMovie as Film,
  IconUser as User,
  IconUsers as Users,
  IconSparkles as Sparkles,
  IconWand as Wand2,
  IconPalette as Palette,
  type TablerIcon,
  IconVideo as Video,
  IconClock as Clock,
  IconHourglass as Hourglass,
  IconUserScan as ScanFace,
  IconBoxMultiple as Boxes,
} from '@tabler/icons-react';
import type { RecipeAliasId } from '../lib/recipeAliases';
import type { RecipeId } from '../types';
import { RECIPE_CARD_IMAGES } from '../lib/recipeCardCatalog';
import type { RecipeCatalogDisplayEntry } from '../lib/recipeCatalog';
import { createRecipesGridProjection } from '../lib/recipeDiscoveryProjection';

interface RecipesViewProps {
  onSelectRecipe: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
}

const RECIPE_TAG_ICONS: Record<Exclude<RecipeId, null>, TablerIcon> = {
  styles: Palette,
  remaster: Wand2,
  camera: Video,
  cinematic: Clapperboard,
  'character-lab': Boxes,
  timeline: Hourglass,
  spritesheet: Grid3X3,
  character: User,
};

const RECIPE_BUTTON_ICONS: Record<Exclude<RecipeId, null>, TablerIcon> = {
  styles: Sparkles,
  remaster: Sparkles,
  camera: Film,
  cinematic: Film,
  'character-lab': Sparkles,
  timeline: Clock,
  spritesheet: ArrowRight,
  character: Users,
};

export const RecipesView: React.FC<RecipesViewProps> = ({ onSelectRecipe }) => {
  const recipeDiscovery = React.useMemo(() => createRecipesGridProjection(), []);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar py-0 px-3">
      <div className="max-w-[1680px] mx-auto">
        <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {recipeDiscovery.entries.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelectRecipe} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Safe color mapping to ensure Tailwind compiler picks these up (or use safelist, but this is safer in sandbox)
const COLOR_CLASSES: Record<
  string,
  { text: string; shadow: string; border: string; bg: string; baseBg: string }
> = {
  teal: {
    text: 'group-hover:text-teal-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(45,212,191,0.6)]',
    border: 'group-hover:border-teal-500/50',
    bg: 'group-hover:bg-teal-500',
    baseBg: 'bg-teal-950',
  },
  purple: {
    text: 'group-hover:text-purple-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(192,132,252,0.6)]',
    border: 'group-hover:border-purple-500/50',
    bg: 'group-hover:bg-purple-500',
    baseBg: 'bg-purple-950',
  },
  cyan: {
    text: 'group-hover:text-cyan-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]',
    border: 'group-hover:border-cyan-500/50',
    bg: 'group-hover:bg-cyan-500',
    baseBg: 'bg-cyan-950',
  },
  indigo: {
    text: 'group-hover:text-indigo-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(129,140,248,0.6)]',
    border: 'group-hover:border-indigo-500/50',
    bg: 'group-hover:bg-indigo-500',
    baseBg: 'bg-indigo-950',
  },
  rose: {
    text: 'group-hover:text-rose-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(251,113,133,0.6)]',
    border: 'group-hover:border-rose-500/50',
    bg: 'group-hover:bg-rose-500',
    baseBg: 'bg-rose-950',
  },
  emerald: {
    text: 'group-hover:text-emerald-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]',
    border: 'group-hover:border-emerald-500/50',
    bg: 'group-hover:bg-emerald-500',
    baseBg: 'bg-emerald-950',
  },
  amber: {
    text: 'group-hover:text-amber-400',
    shadow: 'group-hover:drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]',
    border: 'group-hover:border-amber-500/50',
    bg: 'group-hover:bg-amber-500',
    baseBg: 'bg-amber-950',
  },
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.25'/%3E%3C/svg%3E")`;

const RecipeCard: React.FC<{
  recipe: RecipeCatalogDisplayEntry;
  onSelect: (id: RecipeId, aliasId?: RecipeAliasId | null) => void;
}> = React.memo(({ recipe, onSelect }) => {
  const TagIcon = RECIPE_TAG_ICONS[recipe.targetRecipeId] || Sparkles;
  const BtnIcon = RECIPE_BUTTON_ICONS[recipe.targetRecipeId] || ArrowRight;
  const bgImage = RECIPE_CARD_IMAGES[recipe.cardImageKey];

  // Fallback if color is missing
  const colors = COLOR_CLASSES[recipe.accentColor] || COLOR_CLASSES['teal'];

  const handleSelectRecipe = () => {
    onSelect(recipe.targetRecipeId, recipe.routeAliasId);
  };

  return (
    <button
      type="button"
      onClick={handleSelectRecipe}
      className={`
                group relative isolate flex aspect-[3/5] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950 p-1 text-left shadow-black/30 sm:aspect-[2/3]
                cursor-pointer appearance-none grayscale-[0.25] transition-[color,background-color,border-color,opacity,transform] duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:grayscale-0
                ${colors.border}
            `}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-xl saturate-125 transition-[opacity,transform] duration-500 group-hover:scale-[1.32] group-hover:opacity-45"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/55" />
      <div
        className={`pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply ${colors.baseBg}`}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay"
        style={{ backgroundImage: NOISE_SVG }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col rounded-md border border-white/10 bg-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-2 py-1">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/55">
            <TagIcon size={10} className={colors.text.replace('group-hover:', '')} />
            <span className="truncate">{recipe.tag}</span>
          </span>
          <span className="max-w-[58%] truncate text-right font-mono text-[8px] font-bold text-white/25">
            {recipe.id.toUpperCase()}
          </span>
        </div>

        <div className="relative m-1.5 overflow-hidden rounded-md border border-white/10 bg-black/40 shadow-lg shadow-black/20">
          <div className="aspect-square">
            {bgImage ? (
              <img
                src={bgImage}
                alt=""
                className="h-full w-full object-cover opacity-90 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="grid h-full place-items-center text-white/20">
                <TagIcon size={42} strokeWidth={0.9} />
              </div>
            )}
          </div>
          <div className="absolute right-1.5 top-1.5 rounded-md border border-black/45 bg-black/55 p-1 text-white/70 backdrop-blur-sm">
            <TagIcon size={14} strokeWidth={1.4} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-1.5 pb-1.5">
          <h3 className="line-clamp-2 text-[13px] font-black uppercase leading-[0.95] text-zinc-100 transition-colors group-hover:text-white">
            {recipe.title}
          </h3>
          <span className={`mt-1 text-[8px] font-black uppercase tracking-widest ${colors.text}`}>
            {recipe.subtitle}
          </span>
          <p className="mt-1 line-clamp-1 text-[9px] font-medium leading-snug text-zinc-500 transition-colors group-hover:text-zinc-300">
            {recipe.description}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-1.5">
            <span className="truncate text-[8px] font-bold uppercase tracking-widest text-white/30">
              {recipe.defaultTask.replaceAll('_', ' ')}
            </span>
            <span
              className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-white text-black transition-colors hover:text-white ${colors.bg.replace('group-hover:', 'hover:')}`}
              aria-hidden="true"
            >
              <BtnIcon size={13} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
});
