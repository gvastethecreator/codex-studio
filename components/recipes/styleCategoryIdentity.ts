export type StyleCategoryIconId =
  | 'archive'
  | 'bolt'
  | 'box'
  | 'briefcase'
  | 'building'
  | 'camera'
  | 'cpu'
  | 'folder'
  | 'gamepad'
  | 'layers'
  | 'leaf'
  | 'moon'
  | 'pen'
  | 'play'
  | 'shirt'
  | 'sliders'
  | 'sparkles'
  | 'sun'
  | 'tv'
  | 'user'
  | 'wand';

export interface StyleCategoryIdentity {
  iconId: StyleCategoryIconId;
  accentClassName: string;
  titleClassName: string;
  categoryId: string;
}

export const STYLE_PACK_THEME: Record<string, { accentClassName: string; titleClassName: string }> =
  {
    user_styles: { accentClassName: 'bg-sky-500', titleClassName: 'text-sky-300' },
    favorites: { accentClassName: 'bg-rose-500', titleClassName: 'text-rose-300' },
    pack_01: { accentClassName: 'bg-cyan-500', titleClassName: 'text-cyan-300' },
    pack_02: { accentClassName: 'bg-indigo-500', titleClassName: 'text-indigo-300' },
    pack_03: { accentClassName: 'bg-rose-500', titleClassName: 'text-rose-300' },
    pack_04: { accentClassName: 'bg-fuchsia-500', titleClassName: 'text-fuchsia-300' },
    pack_05: { accentClassName: 'bg-red-500', titleClassName: 'text-red-300' },
    pack_06: { accentClassName: 'bg-amber-500', titleClassName: 'text-amber-300' },
    pack_07: { accentClassName: 'bg-emerald-500', titleClassName: 'text-emerald-300' },
    pack_08: { accentClassName: 'bg-violet-500', titleClassName: 'text-violet-300' },
    pack_09: { accentClassName: 'bg-lime-500', titleClassName: 'text-lime-300' },
    pack_10: { accentClassName: 'bg-blue-500', titleClassName: 'text-blue-300' },
    pack_11: { accentClassName: 'bg-orange-500', titleClassName: 'text-orange-300' },
    pack_12: { accentClassName: 'bg-emerald-500', titleClassName: 'text-emerald-300' },
    pack_13: { accentClassName: 'bg-pink-500', titleClassName: 'text-pink-300' },
    pack_14: { accentClassName: 'bg-violet-500', titleClassName: 'text-violet-300' },
    pack_15: { accentClassName: 'bg-teal-500', titleClassName: 'text-teal-300' },
    pack_16: { accentClassName: 'bg-rose-500', titleClassName: 'text-rose-300' },
    pack_17: { accentClassName: 'bg-green-500', titleClassName: 'text-green-300' },
  };

const PACK_12_ICONS: Record<string, StyleCategoryIconId> = {
  'neon-urban-and-night-ops': 'tv',
  'arcane-temples-and-mythic-realms': 'wand',
  'sci-fi-frontiers-and-mech-zones': 'box',
  'sieges-warfronts-and-last-stands': 'building',
  'speed-sport-and-competitive-arenas': 'sliders',
  'wilderness-hunts-and-harsh-frontiers': 'archive',
  'heists-horror-and-underworld-runs': 'briefcase',
  'puzzle-chambers-and-adventure-setpieces': 'layers',
};

const FALLBACK_THEME = {
  accentClassName: 'bg-[color:var(--wb-muted)]',
  titleClassName: 'text-[color:var(--wb-ink)]',
};

export function normalizeStyleCategoryId(title: string) {
  return title
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function iconFromCategoryId(categoryId: string): StyleCategoryIconId {
  if (/(portrait|studio|face|character)/.test(categoryId)) return 'user';
  if (/(lighting|light|atmosphere|sun)/.test(categoryId)) return 'sun';
  if (/(film|analog|camera|photo|documentary|street)/.test(categoryId)) return 'camera';
  if (/(commercial|product|heist|horror|underworld)/.test(categoryId)) return 'briefcase';
  if (/(nature|wildlife|wilderness|garden|landscape|leaf)/.test(categoryId)) return 'leaf';
  if (/(technical|specialist|sensor|diagram|mecha|cyber|sci-fi|mech)/.test(categoryId)) {
    return 'cpu';
  }
  if (/(animation|anime|cartoon|manga|shojo|shonen)/.test(categoryId)) return 'play';
  if (/(cgi|render|mesh|3d)/.test(categoryId)) return 'box';
  if (/(comic|illustration|ink|print|drawing|sketch)/.test(categoryId)) return 'pen';
  if (/(architecture|interior|civic|building|siege)/.test(categoryId)) return 'building';
  if (/(fashion|costume|fabric|shirt)/.test(categoryId)) return 'shirt';
  if (/(texture|material|surface|weathering|puzzle|adventure)/.test(categoryId)) return 'layers';
  if (/(abstract|geometric|glitch|surreal)/.test(categoryId)) return 'sparkles';
  if (/(game|dungeon|arena|warfront)/.test(categoryId)) return 'gamepad';
  if (/(mythic|pantheon|ritual|norse|greek|arcane)/.test(categoryId)) return 'moon';
  if (/(punk|neon|cyber)/.test(categoryId)) return 'bolt';
  if (/(sport|speed)/.test(categoryId)) return 'sliders';
  if (/(tv|broadcast|urban|night)/.test(categoryId)) return 'tv';
  return 'folder';
}

export function resolveStyleCategoryIdentity(
  packId: string,
  categoryTitleOrId: string,
): StyleCategoryIdentity {
  const categoryId = normalizeStyleCategoryId(categoryTitleOrId);
  const theme = STYLE_PACK_THEME[packId] ?? FALLBACK_THEME;
  const iconId =
    (packId === 'pack_12' ? PACK_12_ICONS[categoryId] : undefined) ??
    iconFromCategoryId(categoryId);
  return {
    iconId,
    accentClassName: theme.accentClassName,
    titleClassName: theme.titleClassName,
    categoryId,
  };
}
