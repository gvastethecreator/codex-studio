import { buildGenerationBackgroundInstruction } from '../../packages/shared/src/generationContracts';
import { characterLabPolicy } from '../../packages/shared/src/recipePolicies/characterLab';
import type { CharacterLabAction } from '../characterLabCatalog.generated';
import {
  CHARACTER_LAB_ACTION_PRIORITY,
  resolveCharacterLabControls,
  resolveCharacterLabOutputBackground,
} from '../characterLabWorkflows';
import {
  createModuleDirectives,
  directive,
  getBoolean,
  getNumber,
  getString,
} from './directiveHelpers';
import { createRecipeModule, options } from './params';
import { characterLabBackground, sequenceReferenceRules } from './composerRules';
import type { RecipeDefinition, RecipeParams } from './types';

const CHARACTER_LAB_OPTIONS = {
  totalActions: 261,
  mode: ['poses', 'spritesheets', 'scenes', 'special', 'effects', 'motion', 'profile'],
  styleDefault: "Preserve Original: Keep the source image's style.",
  clothingDefault: 'Preserve Original',
  bodyTypeDefault: 'Preserve Original',
  expressionDefault: 'Neutral',
  labAspectRatio: ['1:1', '21:9', '16:9', '4:3', '3:2', '9:16', '3:4', '2:3', '5:4', '4:5'],
} as const;

const module = createRecipeModule({
  id: 'character-lab',
  title: 'Character Lab',
  description: `Produce character poses, sheets, scenes, sprites, effects, and gated profile/motion workflows from ${CHARACTER_LAB_OPTIONS.totalActions} ported actions.`,
  defaultTask: 'image_generate',
  variation: 'details',
  supportedTasks: ['image_generate', 'image_edit', 'sprite_sheet'],
  parameters: [
    {
      id: 'mode',
      label: 'Workflow',
      kind: 'enum',
      control: 'select',
      group: 'action',
      defaultValue: 'poses',
      options: options(CHARACTER_LAB_OPTIONS.mode),
    },
    { id: 'actionId', label: 'Action ID', kind: 'string', control: 'text', group: 'action' },
    { id: 'actionLabel', label: 'Action', kind: 'string', control: 'text', group: 'action' },
    { id: 'category', label: 'Category', kind: 'string', control: 'text', group: 'action' },
    {
      id: 'actionPrompt',
      label: 'Action Prompt',
      kind: 'string',
      control: 'text',
      group: 'action',
    },
    { id: 'task', label: 'Task', kind: 'string', control: 'text', group: 'action' },
    { id: 'mediaType', label: 'Media Type', kind: 'string', control: 'text', group: 'action' },
    { id: 'frames', label: 'Frames', kind: 'number', control: 'text', group: 'action' },
    {
      id: 'isCouplesPose',
      label: 'Couples Or Group Pose',
      kind: 'boolean',
      control: 'toggle',
      group: 'action',
      defaultValue: false,
    },
    {
      id: 'capability',
      label: 'Capability',
      kind: 'string',
      control: 'text',
      group: 'action',
      defaultValue: 'ready',
    },
    { id: 'subject', label: 'Subject', kind: 'string', control: 'text', group: 'character' },
    {
      id: 'style',
      label: 'Style',
      kind: 'string',
      control: 'text',
      group: 'character',
      defaultValue: CHARACTER_LAB_OPTIONS.styleDefault,
    },
    {
      id: 'clothing',
      label: 'Clothing',
      kind: 'string',
      control: 'text',
      group: 'character',
      defaultValue: CHARACTER_LAB_OPTIONS.clothingDefault,
    },
    {
      id: 'bodyType',
      label: 'Body Type',
      kind: 'string',
      control: 'text',
      group: 'character',
      defaultValue: CHARACTER_LAB_OPTIONS.bodyTypeDefault,
    },
    {
      id: 'expression',
      label: 'Expression',
      kind: 'string',
      control: 'text',
      group: 'character',
      defaultValue: CHARACTER_LAB_OPTIONS.expressionDefault,
    },
    {
      id: 'backgroundColor',
      label: 'Background Color',
      kind: 'color',
      control: 'color',
      group: 'character',
      defaultValue: '#FFFFFF',
    },
    {
      id: 'labAspectRatio',
      label: 'Requested Aspect Ratio',
      kind: 'enum',
      control: 'select',
      group: 'output',
      defaultValue: '1:1',
      options: options(CHARACTER_LAB_OPTIONS.labAspectRatio),
    },
    {
      id: 'hasSource',
      label: 'Has Source',
      kind: 'boolean',
      control: 'toggle',
      group: 'source',
      defaultValue: false,
    },
    {
      id: 'referencesCount',
      label: 'References',
      kind: 'number',
      control: 'text',
      group: 'source',
      defaultValue: 0,
    },
  ],
});

export interface CharacterLabPromptOptions {
  subject: string;
  style: string;
  clothing: string;
  bodyType: string;
  expression: string;
  backgroundColor: string;
  labAspectRatio: string;
  referencesCount: number;
  hasSource: boolean;
  additionalPrompt?: string;
  outputBackground?: 'workflow' | 'transparent';
}

function line(label: string, value: string | number | boolean) {
  return `${label}: ${value}`;
}

function getModeInstruction(action: CharacterLabAction) {
  if (action.mode === 'spritesheets') {
    return [
      `Create a clean spritesheet for: ${action.prompt}`,
      action.frames ? `Frame count: ${action.frames}.` : 'Frame count: infer from the action.',
      'Arrange the frames as an evenly spaced horizontal strip or compact grid suitable for extraction.',
      'Keep character scale, silhouette, outfit, palette, and camera angle consistent across frames.',
    ].join('\n');
  }

  if (action.mode === 'scenes') {
    return [
      `Place the character ${action.prompt}`,
      'Integrate the character with coherent lighting, shadows, contact with the ground, reflections when relevant, and environmental color spill.',
    ].join('\n');
  }

  if (action.mode === 'effects') {
    return [
      'Apply this transformation to the source image.',
      action.prompt,
      'Preserve the main subject identity and intent unless the selected effect explicitly changes camera, canvas, lighting, or background.',
    ].join('\n');
  }

  // Catalog pose and variant prompts are sentence tails ("in a full-body shot…", "a tarot card…").
  if (action.mode === 'special') {
    if (/^(a|an|the)\s/i.test(action.prompt)) return `Create ${action.prompt}`;
    if (/^by\s/i.test(action.prompt)) return `Create a new character ${action.prompt}`;
    return `Show the character ${action.prompt}`;
  }
  if (action.mode === 'poses' && !action.isCouplesPose)
    return `Show the character ${action.prompt}`;
  return action.prompt;
}

function getReferenceLine(action: CharacterLabAction, referencesCount: number) {
  if (referencesCount === 0) return 'No additional reference images supplied.';
  if (!action.isCouplesPose) {
    return `Use ${referencesCount} additional reference image(s) for style, detail, or accessory guidance.`;
  }
  return [
    'Treat the second image as the identity source for Character B.',
    referencesCount > 1 ? 'Treat the third image as the identity source for Character C.' : '',
    referencesCount > 2
      ? `Use the remaining ${referencesCount - 2} reference image(s) for style, detail, or accessory guidance.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildCharacterLabPrompt(
  action: CharacterLabAction,
  options: CharacterLabPromptOptions,
) {
  const outputBackground = resolveCharacterLabOutputBackground(action.id, options.outputBackground);
  // Sprite sheets need a clean extraction backdrop even when a source image is attached.
  const keepsBackgroundColor = action.mode === 'spritesheets' || !options.hasSource;
  const controls = resolveCharacterLabControls({
    ...options,
    backgroundColor:
      outputBackground === 'transparent' || !keepsBackgroundColor ? '' : options.backgroundColor,
    mode: action.mode,
    category: action.category,
    actionId: action.id,
  });
  const background =
    outputBackground === 'transparent'
      ? 'transparent'
      : action.mode === 'spritesheets' && controls.backgroundColor
        ? 'opaque'
        : 'auto';

  // The action leads: it is the request. Identity, options, and background rules follow.
  const characterOptions = Object.entries({
    Style: controls.style,
    Clothing: controls.clothing,
    'Body type': controls.bodyType,
    Expression: controls.expression,
    'Background color': controls.backgroundColor,
  }).filter(([, value]) => value);
  return [
    getModeInstruction(action),
    line('Subject', options.subject || 'Use the composer prompt as the subject'),
    '',
    'Character identity:',
    options.hasSource
      ? `Treat the first image as the primary identity source${action.isCouplesPose ? ' for Character A' : ''}. Preserve the recognizable identity; the selected action may change body proportions, costume, or surroundings.`
      : 'Create one cohesive original character from the subject description and keep all generated details internally consistent.',
    getReferenceLine(action, options.referencesCount),
    'Do not add text, captions, watermarks, UI chrome, labels, or unrelated extra characters unless the selected action explicitly asks for them.',
    ...(characterOptions.length > 0 ? ['', 'Character options:'] : []),
    ...characterOptions.map(([label, value]) => line(label, value)),
    '',
    buildGenerationBackgroundInstruction(background, options.hasSource),
    CHARACTER_LAB_ACTION_PRIORITY,
    ...(options.additionalPrompt?.trim()
      ? ['', 'Additional instructions:', options.additionalPrompt.trim()]
      : []),
  ].join('\n');
}

/** The Lab prompt already carries the action, controls, and identity contract. */
function buildCharacterLabDirectives(params: RecipeParams) {
  const frames = getNumber(params, 'frames', 0);

  return createModuleDirectives(module, [
    {
      title: 'Character Lab Action',
      directives: [
        directive('Mode', getString(params, 'mode') || 'poses'),
        directive('Action', getString(params, 'actionLabel')),
        directive('Action ID', getString(params, 'actionId')),
        directive('Frames', frames > 0 ? frames : ''),
        directive(
          'Couples Or Group Pose',
          getBoolean(params, 'isCouplesPose')
            ? 'yes: every attached character image is a separate person in the same image.'
            : '',
        ),
      ],
    },
  ]);
}

export const characterLabRecipe: RecipeDefinition = {
  module,
  policy: characterLabPolicy,
  /** The source image plus the extra character identities a group pose needs. */
  ...sequenceReferenceRules,
  attachmentRole: (_params, index) => (index === 0 ? 'input' : 'reference'),
  referenceInstruction(params, _attachment, index) {
    if (index === 0) return 'Use as the primary character identity source.';
    return params.isCouplesPose === true
      ? `Identity source for character ${String.fromCharCode(65 + index)}, a separate person in the same image.`
      : 'Style, detail, or accessory reference for the same character.';
  },
  background: characterLabBackground,
  directives: (params) => buildCharacterLabDirectives(params),
};
