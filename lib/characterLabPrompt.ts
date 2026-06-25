import type { CharacterLabAction } from './characterLabCatalog.generated';

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
      ? 'Treat the first image as the primary identity source. Preserve facial structure, body proportions, costume silhouette, distinctive colors, and recognizable accessories.'
      : 'Create one cohesive original character from the subject description and keep all generated details internally consistent.',
    referenceLine,
    'Do not add text, captions, watermarks, UI chrome, labels, or unrelated extra characters unless the selected action explicitly asks for them.',
    '',
    'Global character options:',
    line('Subject', options.subject || 'Use the composer prompt as the subject'),
    line('Style', options.style),
    line('Clothing', options.clothing),
    line('Body type', options.bodyType),
    line('Expression', options.expression),
    line('Background color', options.backgroundColor),
    '',
    'Selected action instructions:',
    getModeInstruction(action),
  ].join('\n');
}
