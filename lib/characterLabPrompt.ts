import { buildGenerationBackgroundInstruction } from '../packages/shared/src/generationContracts';
import type { CharacterLabAction } from './characterLabCatalog.generated';
import {
  CHARACTER_LAB_ACTION_PRIORITY,
  resolveCharacterLabControls,
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
      'Apply this transformation to the current image or generated character.',
      action.prompt,
      'Preserve the main subject identity and intent unless the selected effect explicitly changes camera, canvas, lighting, or background.',
    ].join('\n');
  }

  return action.prompt;
}

export function buildCharacterLabPrompt(
  action: CharacterLabAction,
  options: CharacterLabPromptOptions,
) {
  const controls = resolveCharacterLabControls({
    ...options,
    backgroundColor:
      options.outputBackground === 'transparent' || options.hasSource
        ? ''
        : options.backgroundColor,
    mode: action.mode,
    category: action.category,
    actionId: action.id,
  });
  const sourceMode = options.hasSource ? 'source-image guided' : 'prompt guided';
  const referenceLine =
    options.referencesCount > 0
      ? `Use ${options.referencesCount} additional reference image(s) for style, detail, or accessory guidance.`
      : 'No additional reference images supplied.';

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
      ? 'Treat the first image as the primary identity source. Preserve the recognizable identity; the selected action may change body proportions, costume, or surroundings.'
      : 'Create one cohesive original character from the subject description and keep all generated details internally consistent.',
    referenceLine,
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
    buildGenerationBackgroundInstruction(
      options.outputBackground === 'transparent' ? 'transparent' : 'auto',
      options.hasSource,
    ),
    CHARACTER_LAB_ACTION_PRIORITY,
    ...(options.additionalPrompt?.trim()
      ? ['', 'Additional instructions:', options.additionalPrompt.trim()]
      : []),
  ].join('\n');
}
