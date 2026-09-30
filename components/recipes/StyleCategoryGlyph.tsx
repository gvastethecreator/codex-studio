import {
  Archive,
  Flash as Bolt,
  Box3dCenter as Box,
  Suitcase as Briefcase,
  Building,
  Camera,
  Cpu,
  Gamepad as Gamepad2,
  Tv,
  Folder,
  Leaf,
  MoonSat as MoonStars,
  EditPencil as Pen,
  Play,
  Shirt,
  Sparks as Sparkles,
  MultiplePages as Layers,
  SunLight as Sun,
  ControlSlider as SlidersHorizontal,
  User,
  MagicWand as Wand2,
} from 'iconoir-react';
import React from 'react';

import type { StyleCategoryIconId } from './styleCategoryIdentity';

const ICONS: Record<StyleCategoryIconId, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  archive: Archive,
  bolt: Bolt,
  box: Box,
  briefcase: Briefcase,
  building: Building,
  camera: Camera,
  cpu: Cpu,
  folder: Folder,
  gamepad: Gamepad2,
  layers: Layers,
  leaf: Leaf,
  moon: MoonStars,
  pen: Pen,
  play: Play,
  shirt: Shirt,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  sun: Sun,
  tv: Tv,
  user: User,
  wand: Wand2,
};

export function StyleCategoryGlyph({
  iconId,
  size = 12,
}: {
  iconId: StyleCategoryIconId;
  size?: number;
}) {
  const Icon = ICONS[iconId] ?? Folder;
  return <Icon width={size} height={size} />;
}
