import {
  Flash as Bolt,
  Book as BookOpen,
  Box3dCenter as Box,
  Building,
  Camera,
  Movie as Clapperboard,
  Gamepad as Gamepad2,
  Heart,
  MultiplePages as Layers,
  MoonSat as MoonStars,
  Palette,
  EditPencil as PenTool,
  Play,
  Search,
  Shirt,
  ControlSlider as SlidersHorizontal,
  Emoji as SmilePlus,
  Sparks as Sparkles,
  Star,
  Shield as Sword,
  Tv,
  MagicWand as Wand2,
} from 'iconoir-react';
import type React from 'react';
import type { StyleCollection } from './styles/collections';
import type { StyleTheme } from './StyleRecipeNavigationPanel';
import { USER_STYLE_PACK_ID } from './userStyleRuntimeAdapter';

const FAVORITES_PACK_ID = 'favorites';

export const PACK_THEMES: Record<string, StyleTheme> = {
  [USER_STYLE_PACK_ID]: {
    color: 'sky',
    bg: 'bg-sky-500',
    border: 'border-sky-500/2',
    text: 'text-[color:var(--wb-info)]',
  },
  [FAVORITES_PACK_ID]: {
    color: 'rose',
    bg: 'bg-rose-600',
    border: 'border-rose-600/2',
    text: 'text-rose-500',
  },
  pack_01: {
    color: 'cyan',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/2',
    text: 'text-cyan-400',
  }, // Photography & Realism
  pack_02: {
    color: 'indigo',
    bg: 'bg-indigo-500',
    border: 'border-indigo-500/2',
    text: 'text-indigo-400',
  }, // Cinematic & Media
  pack_03: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500/2',
    text: 'text-[color:var(--wb-danger)]',
  }, // 3D & CGI Rendering
  pack_04: {
    color: 'fuchsia',
    bg: 'bg-fuchsia-500',
    border: 'border-fuchsia-500/2',
    text: 'text-fuchsia-400',
  }, // Illustration & Graphic Novel
  pack_05: {
    color: 'red',
    bg: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-red-500',
  }, // Anime & Manga Universes
  pack_06: {
    color: 'amber',
    bg: 'bg-amber-500',
    border: 'border-amber-500/2',
    text: 'text-[color:var(--wb-warning)]',
  }, // Essential Art Styles
  pack_07: {
    color: 'emerald',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/2',
    text: 'text-[color:var(--wb-success)]',
  }, // Architecture & Interior
  pack_08: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500/2',
    text: 'text-violet-400',
  }, // Fashion & Costume
  pack_09: {
    color: 'lime',
    bg: 'bg-lime-500',
    border: 'border-lime-500/2',
    text: 'text-lime-400',
  }, // Texture & Materiality
  pack_10: {
    color: 'blue',
    bg: 'bg-blue-500',
    border: 'border-blue-500/2',
    text: 'text-blue-400',
  }, // Abstract & Experimental
  pack_11: {
    color: 'orange',
    bg: 'bg-orange-500',
    border: 'border-orange-500/2',
    text: 'text-orange-400',
  }, // Miscellaneous & Fun
  pack_12: {
    color: 'emerald',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/2',
    text: 'text-[color:var(--wb-success)]',
  }, // Video Game Originals Vault
  pack_13: {
    color: 'pink',
    bg: 'bg-pink-500',
    border: 'border-pink-500/2',
    text: 'text-pink-400',
  }, // Anime Character & Lifestyle
  pack_14: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500/2',
    text: 'text-violet-400',
  }, // Mythic Noir Curated Vault
  pack_15: {
    color: 'teal',
    bg: 'bg-teal-500',
    border: 'border-teal-500/2',
    text: 'text-teal-400',
  }, // Punk Spectrum Vault
  pack_16: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500/2',
    text: 'text-[color:var(--wb-danger)]',
  }, // Anime Classics & Prestige
  pack_17: {
    color: 'green',
    bg: 'bg-green-500',
    border: 'border-green-500/2',
    text: 'text-green-400',
  }, // Medieval Fantasy & Dungeon Zine
};

export const COLLECTION_FAMILY_THEMES: Record<string, StyleTheme> = {
  personal: PACK_THEMES[USER_STYLE_PACK_ID],
  capture_reality: PACK_THEMES.pack_01,
  screen_motion: PACK_THEMES.pack_02,
  illustration_art_media: PACK_THEMES.pack_04,
  design_assets_materials: PACK_THEMES.pack_09,
  worlds_genres: PACK_THEMES.pack_15,
  experimental_play: PACK_THEMES.pack_10,
};

export function getPackIcon(id: string): React.ReactNode {
  const size = 18;
  switch (id) {
    case USER_STYLE_PACK_ID:
      return <Sparkles width={size} height={size} />;
    case FAVORITES_PACK_ID:
      return <Heart width={size} height={size} fill="currentColor" />;
    case 'pack_01':
      return <Camera width={size} height={size} />;
    case 'pack_02':
      return <Clapperboard width={size} height={size} />;
    case 'pack_03':
      return <Box width={size} height={size} />;
    case 'pack_04':
      return <PenTool width={size} height={size} />;
    case 'pack_05':
      return <Sword width={size} height={size} />;
    case 'pack_06':
      return <Palette width={size} height={size} />;
    case 'pack_07':
      return <Building width={size} height={size} />;
    case 'pack_08':
      return <Shirt width={size} height={size} />;
    case 'pack_09':
      return <Layers width={size} height={size} />;
    case 'pack_10':
      return <Wand2 width={size} height={size} />;
    case 'pack_11':
      return <SmilePlus width={size} height={size} />;
    case 'pack_12':
      return <Gamepad2 width={size} height={size} />;
    case 'pack_13':
      return <Heart width={size} height={size} />;
    case 'pack_14':
      return <MoonStars width={size} height={size} />;
    case 'pack_15':
      return <Bolt width={size} height={size} />;
    case 'pack_16':
      return <Star width={size} height={size} />;
    case 'pack_17':
      return <BookOpen width={size} height={size} />;
    default:
      return <Layers width={size} height={size} />;
  }
}

export function getStyleCollectionIcon(icon: string, size = 18): React.ReactNode {
  switch (icon) {
    case 'sparkles':
      return <Sparkles width={size} height={size} />;
    case 'heart':
      return <Heart width={size} height={size} fill="currentColor" />;
    case 'clock':
      return <Star width={size} height={size} />;
    case 'camera':
      return <Camera width={size} height={size} />;
    case 'film':
    case 'clapperboard':
      return <Clapperboard width={size} height={size} />;
    case 'bolt':
    case 'zap':
      return <Bolt width={size} height={size} />;
    case 'scan':
      return <Search width={size} height={size} />;
    case 'tv':
      return <Tv width={size} height={size} />;
    case 'play':
      return <Play width={size} height={size} />;
    case 'book':
      return <BookOpen width={size} height={size} />;
    case 'palette':
    case 'brush':
      return <Palette width={size} height={size} />;
    case 'pen':
      return <PenTool width={size} height={size} />;
    case 'wand':
      return <Wand2 width={size} height={size} />;
    case 'box':
      return <Box width={size} height={size} />;
    case 'layers':
    case 'grid':
      return <Layers width={size} height={size} />;
    case 'shirt':
      return <Shirt width={size} height={size} />;
    case 'building':
      return <Building width={size} height={size} />;
    case 'gamepad':
      return <Gamepad2 width={size} height={size} />;
    case 'moon':
    case 'moon-stars':
      return <MoonStars width={size} height={size} />;
    case 'sword':
      return <Sword width={size} height={size} />;
    case 'sliders':
      return <SlidersHorizontal width={size} height={size} />;
    case 'smile':
      return <SmilePlus width={size} height={size} />;
    default:
      return <Layers width={size} height={size} />;
  }
}

export function getStyleCollectionTheme(collection: StyleCollection): StyleTheme {
  return COLLECTION_FAMILY_THEMES[collection.familyId] ?? PACK_THEMES.pack_01;
}
