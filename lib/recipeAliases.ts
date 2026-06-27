import type { GenerationTaskKind } from '../packages/shared/src';
import type { RecipeId } from '../types';
import type { CharacterLabModeId } from './characterLabCatalog.generated';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export type RecipeAliasId =
  | 'character-poses'
  | 'character-sprites'
  | 'character-scenes'
  | 'character-variants'
  | 'character-transforms';

export interface RecipeAlias {
  id: RecipeAliasId;
  targetRecipeId: RegisteredRecipeId;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  buttonText: string;
  accentColor: string;
  cardImageKey: RecipeAliasId;
  defaultTask: GenerationTaskKind;
  supportedTasks: GenerationTaskKind[];
  characterLabMode: CharacterLabModeId;
  hashSegments: string[];
}

export const CHARACTER_LAB_RECIPE_ALIASES: RecipeAlias[] = [
  {
    id: 'character-poses',
    targetRecipeId: 'character-lab',
    title: 'Character Poses',
    subtitle: 'Pose & Expression',
    description: 'Open Character Lab focused on identity-preserving poses and expressions.',
    tag: 'Pose',
    buttonText: 'Open Poses',
    accentColor: 'cyan',
    cardImageKey: 'character-poses',
    defaultTask: 'image_edit',
    supportedTasks: ['image_edit', 'image_generate'],
    characterLabMode: 'poses',
    hashSegments: ['character-poses', 'character-lab/poses'],
  },
  {
    id: 'character-sprites',
    targetRecipeId: 'character-lab',
    title: 'Character Sprites',
    subtitle: 'Sprite Actions',
    description: 'Open Character Lab focused on animation strips and game-ready sprite states.',
    tag: 'Sprites',
    buttonText: 'Open Sprites',
    accentColor: 'emerald',
    cardImageKey: 'character-sprites',
    defaultTask: 'sprite_sheet',
    supportedTasks: ['sprite_sheet'],
    characterLabMode: 'spritesheets',
    hashSegments: ['character-sprites', 'character-lab/spritesheets'],
  },
  {
    id: 'character-scenes',
    targetRecipeId: 'character-lab',
    title: 'Character Scenes',
    subtitle: 'Scene Staging',
    description: 'Open Character Lab focused on character-in-environment scene generation.',
    tag: 'Scenes',
    buttonText: 'Open Scenes',
    accentColor: 'rose',
    cardImageKey: 'character-scenes',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    characterLabMode: 'scenes',
    hashSegments: ['character-scenes', 'character-lab/scenes'],
  },
  {
    id: 'character-variants',
    targetRecipeId: 'character-lab',
    title: 'Character Variants',
    subtitle: 'Sheets & Gear',
    description: 'Open Character Lab focused on sheets, equipment, transformations, and variants.',
    tag: 'Variants',
    buttonText: 'Open Variants',
    accentColor: 'indigo',
    cardImageKey: 'character-variants',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    characterLabMode: 'special',
    hashSegments: ['character-variants', 'character-lab/special'],
  },
  {
    id: 'character-transforms',
    targetRecipeId: 'character-lab',
    title: 'Character Transforms',
    subtitle: 'Camera & Effects',
    description: 'Open Character Lab focused on camera, canvas, lighting, and quality transforms.',
    tag: 'Transform',
    buttonText: 'Open Transforms',
    accentColor: 'amber',
    cardImageKey: 'character-transforms',
    defaultTask: 'image_edit',
    supportedTasks: ['image_edit', 'image_generate'],
    characterLabMode: 'effects',
    hashSegments: ['character-transforms', 'character-lab/effects'],
  },
];

const RECIPE_ALIAS_BY_ID = new Map(
  CHARACTER_LAB_RECIPE_ALIASES.map((alias) => [alias.id, alias] as const),
);

const RECIPE_ALIAS_BY_HASH_SEGMENT = new Map(
  CHARACTER_LAB_RECIPE_ALIASES.flatMap((alias) =>
    alias.hashSegments.map((segment) => [normalizeHashSegment(segment), alias] as const),
  ),
);

function normalizeHashSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
      .trim()
      .toLowerCase()
      .replace(/^recipe-/, '');
  } catch {
    return segment
      .trim()
      .toLowerCase()
      .replace(/^recipe-/, '');
  }
}

export function resolveRecipeAlias(aliasId: string | null | undefined) {
  if (!aliasId) return null;
  return RECIPE_ALIAS_BY_ID.get(aliasId as RecipeAliasId) ?? null;
}

export function resolveRecipeAliasHashSegment(segment: string | null | undefined) {
  if (!segment) return null;
  return RECIPE_ALIAS_BY_HASH_SEGMENT.get(normalizeHashSegment(segment)) ?? null;
}

export function resolveRecipeRouteHashSegment(
  recipeId: RegisteredRecipeId,
  aliasId?: string | null,
) {
  const alias = resolveRecipeAlias(aliasId);
  return alias?.targetRecipeId === recipeId ? alias.id : recipeId;
}
