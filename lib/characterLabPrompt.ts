import { buildGenerationBackgroundInstruction } from '../packages/shared/src/generationContracts';
import type { CharacterLabAction } from './characterLabCatalog.generated';
import {
  CHARACTER_LAB_ACTION_PRIORITY,
  resolveCharacterLabControls,
  resolveCharacterLabOutputBackground,
} from './characterLabWorkflows';

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
  const sourceMode = options.hasSource ? 'source-image guided' : 'prompt guided';
  const background =
    outputBackground === 'transparent'
      ? 'transparent'
      : action.mode === 'spritesheets' && controls.backgroundColor
        ? 'opaque'
        : 'auto';

  return [
    'Character Lab generation request.',
    '',
    line('Workflow', action.mode),
    line('Category', action.category),
    line('Action', action.label),
    line('Source mode', sourceMode),
    line('Requested aspect ratio', options.labAspectRatio),
    '',
    'Character identity contract:',
    options.hasSource
      ? `Treat the first image as the primary identity source${action.isCouplesPose ? ' for Character A' : ''}. Preserve the recognizable identity; the selected action may change body proportions, costume, or surroundings.`
      : 'Create one cohesive original character from the subject description and keep all generated details internally consistent.',
    getReferenceLine(action, options.referencesCount),
    'Do not add text, captions, watermarks, UI chrome, labels, or unrelated extra characters unless the selected action explicitly asks for them.',
    '',
    'Global character options:',
    line('Subject', options.subject || 'Use the composer prompt as the subject'),
    ...Object.entries({
      Style: controls.style,
      Clothing: controls.clothing,
      'Body type': controls.bodyType,
      Expression: controls.expression,
      'Background color': controls.backgroundColor,
    })
      .filter(([, value]) => value)
      .map(([label, value]) => line(label, value)),
    '',
    'Selected action instructions:',
    getModeInstruction(action),
    buildGenerationBackgroundInstruction(background, options.hasSource),
    CHARACTER_LAB_ACTION_PRIORITY,
    ...(options.additionalPrompt?.trim()
      ? ['', 'Additional instructions:', options.additionalPrompt.trim()]
      : []),
  ].join('\n');
}
