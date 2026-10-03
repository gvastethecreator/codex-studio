import type { CharacterLabModeId } from './characterLabCatalog.generated';

export type CharacterLabControl =
  | 'expression'
  | 'labAspectRatio'
  | 'style'
  | 'clothing'
  | 'bodyType'
  | 'backgroundColor';

export interface CharacterLabWorkflow {
  title: string;
  actionId: string;
  aspectRatio: string;
  backgroundColor: string;
  expression: string;
  output: string;
  primaryControls: CharacterLabControl[];
  /** Edits an existing image; prompt-only runs have nothing to transform. */
  requiresSource: boolean;
}

export const CHARACTER_LAB_WORKFLOWS: Record<CharacterLabModeId, CharacterLabWorkflow> = {
  poses: {
    title: 'Character Poses',
    actionId: 'poses:front',
    aspectRatio: '2:3',
    backgroundColor: '#FFFFFF',
    expression: '',
    output: 'One full-body character pose.',
    primaryControls: ['expression', 'labAspectRatio'],
    requiresSource: false,
  },
  spritesheets: {
    title: 'Character Sprites',
    actionId: 'spritesheets:walk',
    aspectRatio: '1:1',
    backgroundColor: '#FFFFFF',
    expression: '',
    output: 'One sprite-sheet image. Frames are defined by the selected action.',
    primaryControls: ['labAspectRatio', 'backgroundColor'],
    requiresSource: false,
  },
  scenes: {
    title: 'Character Scenes',
    actionId: 'scenes:char_home',
    aspectRatio: '16:9',
    backgroundColor: '',
    expression: '',
    output: 'One character integrated into the selected scene.',
    primaryControls: ['style', 'labAspectRatio'],
    requiresSource: false,
  },
  special: {
    title: 'Character Variants',
    actionId: 'special:outfit_variations',
    aspectRatio: '3:2',
    backgroundColor: '',
    expression: '',
    output: 'One image with the variants or assets requested by the action.',
    primaryControls: ['style', 'labAspectRatio'],
    requiresSource: false,
  },
  effects: {
    title: 'Character Transforms',
    actionId: 'effects:zoom_out_fill',
    aspectRatio: '1:1',
    backgroundColor: '',
    expression: '',
    output: 'One transformed image preserving the character identity.',
    primaryControls: ['labAspectRatio'],
    requiresSource: true,
  },
  motion: {
    title: 'Character Motion',
    actionId: 'motion:motion_idle',
    aspectRatio: '1:1',
    backgroundColor: '',
    expression: '',
    output: 'Video generation is not yet available.',
    primaryControls: ['labAspectRatio'],
    requiresSource: false,
  },
  profile: {
    title: 'Character Profile',
    actionId: 'profile:basic-info',
    aspectRatio: '1:1',
    backgroundColor: '',
    expression: '',
    output: 'Character analysis is not yet available.',
    primaryControls: [],
    requiresSource: false,
  },
};

export const CHARACTER_LAB_ACTION_PRIORITY =
  'Preserve the character identity except for changes explicitly requested by the selected action. The selected action takes precedence over appearance preservation, including clothing, body, expression, style, and environment.';

export function getCharacterLabControls(params: Record<string, unknown>): CharacterLabControl[] {
  const controls: CharacterLabControl[] = [
    'expression',
    'labAspectRatio',
    'style',
    'clothing',
    'bodyType',
    'backgroundColor',
  ];
  const excluded = new Set<CharacterLabControl>();
  if (params.mode === 'scenes' || params.mode === 'effects') {
    excluded.add('backgroundColor');
    excluded.add('expression');
  }
  if (params.mode === 'effects') {
    excluded.add('clothing');
    excluded.add('bodyType');
  }
  if (params.actionId === 'special:outfit_variations') excluded.add('clothing');
  if (params.category === 'Character Transformations') {
    excluded.add('bodyType');
    excluded.add('clothing');
  }
  if (params.category === 'Reactions & Emotions' || params.actionId === 'poses:expressions') {
    excluded.add('expression');
  }
  return controls.filter((control) => !excluded.has(control));
}

/** Categories whose actions replace the rendering style, so "keep the source style" conflicts. */
const CHARACTER_LAB_RESTYLE_CATEGORIES = new Set(['Creative & Fun', 'Image Quality & Style']);

/** Remove Background asks for alpha output; the workflow background would contradict it. */
export function resolveCharacterLabOutputBackground(
  actionId: string,
  outputBackground: 'workflow' | 'transparent' | undefined,
): 'workflow' | 'transparent' {
  return actionId === 'effects:bg_remove' ? 'transparent' : (outputBackground ?? 'workflow');
}

/** The same effective controls feed the preview, context, and provider directives. */
export function resolveCharacterLabControls(params: Record<string, unknown>) {
  const allowed = getCharacterLabControls(params);
  const restyles = CHARACTER_LAB_RESTYLE_CATEGORIES.has(String(params.category));
  return Object.fromEntries(
    (
      ['style', 'clothing', 'bodyType', 'expression', 'backgroundColor', 'labAspectRatio'] as const
    ).map((key) => {
      const raw = params[key];
      const value = allowed.includes(key) && typeof raw === 'string' ? raw : '';
      const nothingToPreserve =
        value.startsWith('Preserve Original') &&
        (params.hasSource !== true || (key === 'style' && restyles));
      return [key, nothingToPreserve ? '' : value];
    }),
  ) as Record<CharacterLabControl, string>;
}
