import {
  IconBolt as Bolt,
  IconBook as BookOpen,
  IconBox as Box,
  IconBuilding as Building,
  IconCamera as Camera,
  IconMovie as Clapperboard,
  IconDeviceGamepad2 as Gamepad2,
  IconHeart as Heart,
  IconStack as Layers,
  IconMoonStars as MoonStars,
  IconPalette as Palette,
  IconPencil as PenTool,
  IconPlayerPlay as Play,
  IconSearch as Search,
  IconShirt as Shirt,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconMoodPlus as SmilePlus,
  IconSparkles as Sparkles,
  IconStar as Star,
  IconSword as Sword,
  IconDeviceTv as Tv,
  IconWand as Wand2,
} from '@tabler/icons-react';
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
      return <Sparkles size={size} />;
    case FAVORITES_PACK_ID:
      return <Heart size={size} fill="currentColor" />;
    case 'pack_01':
      return <Camera size={size} />;
    case 'pack_02':
      return <Clapperboard size={size} />;
    case 'pack_03':
      return <Box size={size} />;
    case 'pack_04':
      return <PenTool size={size} />;
    case 'pack_05':
      return <Sword size={size} />;
    case 'pack_06':
      return <Palette size={size} />;
    case 'pack_07':
      return <Building size={size} />;
    case 'pack_08':
      return <Shirt size={size} />;
    case 'pack_09':
      return <Layers size={size} />;
    case 'pack_10':
      return <Wand2 size={size} />;
    case 'pack_11':
      return <SmilePlus size={size} />;
    case 'pack_12':
      return <Gamepad2 size={size} />;
    case 'pack_13':
      return <Heart size={size} />;
    case 'pack_14':
      return <MoonStars size={size} />;
    case 'pack_15':
      return <Bolt size={size} />;
    case 'pack_16':
      return <Star size={size} />;
    case 'pack_17':
      return <BookOpen size={size} />;
    default:
      return <Layers size={size} />;
  }
}

export function getStyleCollectionIcon(icon: string, size = 18): React.ReactNode {
  switch (icon) {
    case 'sparkles':
      return <Sparkles size={size} />;
    case 'heart':
      return <Heart size={size} fill="currentColor" />;
    case 'clock':
      return <Star size={size} />;
    case 'camera':
      return <Camera size={size} />;
    case 'film':
    case 'clapperboard':
      return <Clapperboard size={size} />;
    case 'bolt':
    case 'zap':
      return <Bolt size={size} />;
    case 'scan':
      return <Search size={size} />;
    case 'tv':
      return <Tv size={size} />;
    case 'play':
      return <Play size={size} />;
    case 'book':
      return <BookOpen size={size} />;
    case 'palette':
    case 'brush':
      return <Palette size={size} />;
    case 'pen':
      return <PenTool size={size} />;
    case 'wand':
      return <Wand2 size={size} />;
    case 'box':
      return <Box size={size} />;
    case 'layers':
    case 'grid':
      return <Layers size={size} />;
    case 'shirt':
      return <Shirt size={size} />;
    case 'building':
      return <Building size={size} />;
    case 'gamepad':
      return <Gamepad2 size={size} />;
    case 'moon':
    case 'moon-stars':
      return <MoonStars size={size} />;
    case 'sword':
      return <Sword size={size} />;
    case 'sliders':
      return <SlidersHorizontal size={size} />;
    case 'smile':
      return <SmilePlus size={size} />;
    default:
      return <Layers size={size} />;
  }
}

export function getStyleCollectionTheme(collection: StyleCollection): StyleTheme {
  return COLLECTION_FAMILY_THEMES[collection.familyId] ?? PACK_THEMES.pack_01;
}
