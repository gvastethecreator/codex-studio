import React from 'react';
import {
  ArrowRight,
  Grid3X3,
  Clapperboard,
  Film,
  User,
  Users,
  Sparkles,
  Wand2,
  Palette,
  LucideIcon,
  Video,
  Clock,
  Hourglass,
  ScanFace,
} from 'lucide-react';
import type { RecipeId } from '../types';
import { RECIPE_CARD_IMAGES } from '../lib/recipeAssetCatalog';
import { RECIPE_CATALOG, type RecipeCatalogEntry } from '../lib/recipeCatalog';

interface RecipesViewProps {
  onSelectRecipe: (id: RecipeId) => void;
}

const RECIPE_TAG_ICONS: Record<Exclude<RecipeId, null>, LucideIcon> = {
  styles: Palette,
  remaster: Wand2,
  camera: Video,
  cinematic: Clapperboard,
  timeline: Hourglass,
  spritesheet: Grid3X3,
  character: User,
};

const RECIPE_BUTTON_ICONS: Record<Exclude<RecipeId, null>, LucideIcon> = {
  styles: Sparkles,
  remaster: Sparkles,
  camera: Film,
  cinematic: Film,
  timeline: Clock,
  spritesheet: ArrowRight,
  character: Users,
};

export const RecipesView: React.FC<RecipesViewProps> = ({ onSelectRecipe }) => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar py-0 px-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Grid Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 pt-4">
          {RECIPE_CATALOG.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={() => onSelectRecipe(recipe.id)}
            />
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

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`;

const RecipeCard: React.FC<{ recipe: RecipeCatalogEntry; onSelect: (id: RecipeId) => void }> =
  React.memo(({ recipe, onSelect }) => {
    const TagIcon = RECIPE_TAG_ICONS[recipe.id] || Sparkles;
    const BtnIcon = RECIPE_BUTTON_ICONS[recipe.id] || ArrowRight;
    const bgImage = RECIPE_CARD_IMAGES[recipe.cardImageKey];

    // Fallback if color is missing
    const colors = COLOR_CLASSES[recipe.accentColor] || COLOR_CLASSES['teal'];

    const handleSelectRecipe = () => {
      if (recipe.id) onSelect(recipe.id);
    };

    return (
      <button
        type="button"
        onClick={handleSelectRecipe}
        className={`
                group relative aspect-[3/2] rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden cursor-pointer appearance-none p-0 m-0 text-left
                grayscale-[0.4] hover:grayscale-0
                transition-all duration-500 ease-out delay-100 hover:delay-0 hover:duration-300
                hover:-translate-y-2 hover:shadow-2xl
                ${colors.border}
            `}
      >
        {/* 0. Base Color + Noise Layer */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 opacity-20 group-hover:opacity-40 ${colors.baseBg}`}
        />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: NOISE_SVG }}
        />

        {/* 1. Background Image Layer */}
        {bgImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-40 transition-all duration-700 ease-out delay-100 group-hover:delay-0 group-hover:scale-110"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
        ) : null}

        {/* 2. Solid Overlay for Text Readability - Replaced Gradient with Solid */}
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-500" />

        {/* Main Layout */}
        <div className="absolute inset-0 flex flex-col p-6">
          {/* 1. ICON AREA (Takes up all available space top to text) */}
          <div className="flex-1 absolute top-2 right-2 flex items-center justify-center overflow-visible size-32">
            <TagIcon
              strokeWidth={0.7} // Very thin architectural lines
              className={`
                            w-full h-full max-w-[120px] max-h-[50px]
                            text-white/20 // Default state: very subtle glass-like
                            transition-all duration-500 ease-out-expo delay-75 hover:delay-0
                            group-hover:scale-110 group-hover:opacity-100
                            ${colors.text} // Hover color
                            ${colors.shadow} // Hover neon glow
                        `}
            />
          </div>

          {/* 2. TEXT CONTENT (Fixed at bottom) */}
          <div className="flex flex-col justify-end z-10 absolute">
            {/* Animated Tag - slides up */}
            <div className="h-6 overflow-hidden mb-1 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 hover:delay-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <TagIcon size={8} /> {recipe.tag}
              </span>
            </div>

            {/* Typography - Slides up slightly on hover */}
            <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
              <h3
                style={{ viewTransitionName: `recipe-title-${recipe.id}` } as React.CSSProperties}
                className={`text-xl md:text-2xl font-black text-zinc-400 uppercase tracking-tighter transition-colors duration-300 leading-none mb-1 group-hover:text-white`}
              >
                {recipe.title}
              </h3>
              <span
                className={`text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] transition-colors duration-300 ${colors.text}`}
              >
                {recipe.subtitle}
              </span>
            </div>

            <div className="relative">
              {/* Description fades out or moves */}
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed opacity-60 group-hover:opacity-80 transition-opacity duration-300 mt-3 line-clamp-2">
                {recipe.description}
              </p>

              {/* Button fades in and slides up */}
              <div className="absolute top-0 left-0 right-0 pt-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 ease-out">
                <button
                  type="button"
                  className={`w-full h-9 bg-white text-black rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-lg hover:text-white ${colors.bg.replace('group-hover:', 'hover:')} transition-colors`}
                >
                  {recipe.buttonText} <BtnIcon size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  });
