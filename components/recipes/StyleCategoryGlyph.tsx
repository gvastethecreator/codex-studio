import {
  IconArchive as Archive,
  IconBolt as Bolt,
  IconBox as Box,
  IconBriefcase as Briefcase,
  IconBuilding as Building,
  IconCamera as Camera,
  IconCpu as Cpu,
  IconDeviceGamepad2 as Gamepad2,
  IconDeviceTv as Tv,
  IconFolder as Folder,
  IconLeaf as Leaf,
  IconMoonStars as MoonStars,
  IconPencil as Pen,
  IconPlayerPlay as Play,
  IconShirt as Shirt,
  IconSparkles as Sparkles,
  IconStack as Layers,
  IconSun as Sun,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconUser as User,
  IconWand as Wand2,
} from '@tabler/icons-react';
import React from 'react';

import type { StyleCategoryIconId } from './styleCategoryIdentity';

const ICONS: Record<StyleCategoryIconId, React.ComponentType<{ size?: number }>> = {
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
  return <Icon size={size} />;
}
