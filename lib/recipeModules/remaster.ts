import { remasterPolicy } from '../../packages/shared/src/recipePolicies/remaster';
import { createModuleDirectives, directive, getNumber, getString } from './directiveHelpers';
import { createRecipeModule, options } from './params';
import type { RecipeDefinition, RecipeParams } from './types';

const REMASTER_OPTIONS = {
  style: [
    'Realistic Reconstruction',
    'Cinematic Rendering',
    'Pro Digital Art',
    'Archive Restoration',
    'Analog Film',
    'Oil Detail',
  ],
  lighting: [
    'Preserve Lighting',
    'Lighting Correction',
    'Volumetric Light',
    'Studio Lighting',
    'Natural Light',
    'Golden Hour',
    'Dramatic Contrast',
  ],
  camera: ['Preserve Detail', 'Sharp Focus', 'Depth of Field', 'Texture Enhancement', 'Wide Angle'],
  anatomy: [
    'Preserve Geometry and Identity',
    'Fix Anatomy',
    'Improve Faces and Eyes',
    'Fix Hands',
    'Skin Detail',
  ],
  text: ['Keep Original', 'Remove Text', 'Rewrite Logically'],
  color: [
    'Preserve Colors',
    'Expanded Dynamic Range',
    'Natural Colors',
    'Deep Vibrance',
    'Color Correction',
  ],
} as const;

const module = createRecipeModule({
  id: 'remaster',
  title: 'Remaster',
  description: 'Restore or reinterpret a reference image with controlled fidelity.',
  defaultTask: 'image_generate',
  variation: 'none',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'style',
      label: 'Style Interpretation',
      kind: 'enum',
      control: 'select',
      group: 'aesthetic',
      defaultValue: 'Archive Restoration',
      options: options(REMASTER_OPTIONS.style),
    },
    {
      id: 'lighting',
      label: 'Lighting Correction',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Preserve Lighting',
      options: options(REMASTER_OPTIONS.lighting),
    },
    {
      id: 'camera',
      label: 'Lens And Detail',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Preserve Detail',
      options: options(REMASTER_OPTIONS.camera),
    },
    {
      id: 'anatomy',
      label: 'Anatomy Handling',
      kind: 'enum',
      control: 'select',
      group: 'correction',
      defaultValue: 'Preserve Geometry and Identity',
      options: options(REMASTER_OPTIONS.anatomy),
    },
    {
      id: 'text',
      label: 'Text Handling',
      kind: 'enum',
      control: 'select',
      group: 'correction',
      defaultValue: 'Keep Original',
      options: options(REMASTER_OPTIONS.text),
    },
    {
      id: 'color',
      label: 'Color Grading',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Preserve Colors',
      options: options(REMASTER_OPTIONS.color),
    },
    {
      id: 'fidelity',
      label: 'Fidelity',
      kind: 'number',
      control: 'slider',
      group: 'source',
      defaultValue: 100,
      min: 0,
      max: 100,
      step: 1,
    },
  ],
});

const REMASTER_KEEP_INSTRUCTIONS: Record<string, string> = {
  'Preserve Lighting': 'Keep the original lighting. Do not relight.',
  'Preserve Detail': 'Keep the framing and the existing detail.',
  'Preserve Geometry and Identity':
    'Keep geometry, faces, and identity exactly. Do not reconstruct anatomy.',
  'Keep Original': 'Keep existing text and lettering as they are.',
  'Remove Text': 'Remove text and lettering, and fill the area naturally.',
  'Rewrite Logically': 'Rewrite damaged text so it reads correctly in the same lettering style.',
  'Preserve Colors': 'Keep the original colors. Do not apply a new grade.',
};

function remasterInstruction(params: RecipeParams, key: string, fallback: string) {
  const value = getString(params, key) || fallback;
  return REMASTER_KEEP_INSTRUCTIONS[value] ?? `${value}.`;
}

function describeRemasterFidelity(fidelity: number) {
  if (fidelity >= 80)
    return 'Stay very close to the source: same composition, framing, subject, pose, and proportions. Only repair and refine.';
  if (fidelity >= 50)
    return 'Keep the composition and subject. Moderate enhancement of rendering and detail is allowed.';
  return 'Keep the subject recognizable. Free reinterpretation of rendering and missing detail is allowed.';
}

/** Below half fidelity the user asks for a new look, not a restoration. */
function isReinterpretation(params: RecipeParams) {
  return Math.max(0, Math.min(100, getNumber(params, 'fidelity', 100))) < 50;
}

function buildRemasterDirectives(params: RecipeParams) {
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 100)));

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          fidelity >= 50
            ? 'Restore and remaster the input image into one clean, polished version of the same picture.'
            : 'Reinterpret the input image in the finish, light, and color below and in the prompt. Keep its subject and composition recognizable; change rendering, texture, and color boldly.',
        ),
        directive(
          'Rules',
          fidelity >= 50
            ? 'Keep the full frame. Do not crop, extend, or reframe. No watermarks or added text.'
            : 'No watermarks or added text.',
        ),
      ],
    },
    {
      title: 'Restoration Goals',
      directives: [
        directive('Finish', getString(params, 'style') || 'Archive Restoration'),
        directive('Lighting', remasterInstruction(params, 'lighting', 'Preserve Lighting')),
        directive('Lens And Detail', remasterInstruction(params, 'camera', 'Preserve Detail')),
        directive(
          'Anatomy',
          remasterInstruction(params, 'anatomy', 'Preserve Geometry and Identity'),
        ),
        directive('Text', remasterInstruction(params, 'text', 'Keep Original')),
        directive('Color', remasterInstruction(params, 'color', 'Preserve Colors')),
      ],
    },
    {
      title: 'Fidelity Control',
      directives: [directive('Fidelity', `${fidelity}/100. ${describeRemasterFidelity(fidelity)}`)],
    },
  ]);
}

export const remasterRecipe: RecipeDefinition = {
  module,
  policy: remasterPolicy,
  referencePromptFallback: 'Restore and remaster the provided image.',
  /** A restoration edits its source. A reinterpretation renders anew from it as a reference. */
  resolveTask: (task, referenceCount, params) =>
    referenceCount > 0 && !isReinterpretation(params) ? 'image_edit' : task,
  attachmentRole: (params, index) =>
    index === 0 && !isReinterpretation(params) ? 'input' : 'reference',
  referenceInstruction: (params, _attachment, index) =>
    index !== 0
      ? 'Extra detail reference only. Do not merge it into the picture.'
      : isReinterpretation(params)
        ? 'The image to reinterpret. Keep its subject and composition recognizable.'
        : 'The image to restore. Output this same picture, restored.',
  directives: (params) => buildRemasterDirectives(params),
};
