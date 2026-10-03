import { characterPolicy } from '../../packages/shared/src/recipePolicies/character';
import { createModuleDirectives, directive, getBoolean, getString } from './directiveHelpers';
import { createRecipeModule, options } from './params';
import type { RecipeDefinition, RecipeParams } from './types';

const CHARACTER_OPTIONS = {
  layout: [
    'Classic Turnaround',
    'Isometric Sheet',
    'Dynamic Sheet',
    'Expression Sheet',
    'Wireframe Sheet',
    'Anatomy Sheet',
    'Clothing Layers',
  ],
  style: [
    'Preserve Source Style',
    'Concept Art (Digital)',
    'Anime (90s Retro)',
    'Anime (Painterly Fantasy)',
    'Anime (Modern Luminous)',
    'Comic Book (Western)',
    'Graphic Novel (Noir)',
    '3D Render (Feature Animation)',
    '3D Render (Next-Gen Engine)',
    'Fantasy Oil Painting',
    'Watercolor Illustration',
    'Pencil Sketch',
    'Technical Blueprint',
    'Vector Art (Flat)',
    'Pixel Art (High Bit)',
    'Cyberpunk Neon',
  ],
  shot: ['Full Body', 'Knee Up', 'Upper Body', 'Portrait (Headshot)', 'Macro Details'],
  focus: [
    'General Design',
    'Facial Features',
    'Outfit & Cloth',
    'Anatomy/Muscle',
    'Weapons/Gear',
    'Hair & Accessories',
  ],
} as const;

const module = createRecipeModule({
  id: 'character',
  title: 'Character Sheet',
  description: 'Generate character reference sheets with layout, shot, and style controls.',
  defaultTask: 'image_generate',
  variation: 'details',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'layout',
      label: 'Layout',
      kind: 'enum',
      control: 'select',
      group: 'sheet',
      defaultValue: 'Classic Turnaround',
      options: options(CHARACTER_OPTIONS.layout),
    },
    {
      id: 'style',
      label: 'Style',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Preserve Source Style',
      options: options(CHARACTER_OPTIONS.style),
    },
    {
      id: 'shot',
      label: 'Shot',
      kind: 'enum',
      control: 'select',
      group: 'camera',
      defaultValue: 'Full Body',
      options: options(CHARACTER_OPTIONS.shot),
    },
    {
      id: 'focus',
      label: 'Design Focus',
      kind: 'enum',
      control: 'select',
      group: 'sheet',
      defaultValue: 'General Design',
      options: options(CHARACTER_OPTIONS.focus),
    },
    {
      id: 'hasReference',
      label: 'Has Reference',
      kind: 'boolean',
      control: 'toggle',
      group: 'source',
      defaultValue: false,
    },
  ],
});

const CHARACTER_LAYOUT_INSTRUCTIONS: Record<string, string> = {
  'Classic Turnaround':
    'a character turnaround reference sheet. Aim for 3 full-body views of the character in a neutral A-pose, arranged horizontally: 1. Front View 2. Side View (Left Profile) 3. Back View. Keep the head and feet visually aligned where possible.',
  'Isometric Sheet':
    'a full character sheet with multiple isometric views of the same character in a neutral A-pose. Aim for 4 views: 1. Front-Right Isometric 2. Front-Left Isometric 3. Back-Right Isometric 4. Back-Left Isometric. Prefer a clean 2x2 grid.',
  'Dynamic Sheet':
    'a dynamic character pose sheet. Aim for 3 views of the character: 1. A main, full-body dynamic action pose. 2. A close-up portrait with a neutral expression. 3. A three-quarter back view.',
  'Expression Sheet':
    'a facial expression sheet. Focus on the head and shoulders. Aim for 6 distinct emotional states (e.g., Neutral, Angry, Happy, Sad, Surprised, Combat-Ready) arranged in a readable 2x3 grid.',
  'Wireframe Sheet':
    'the character visualized as a 3D wireframe-style model, with the form suggested through polygon mesh lines and a visible grid pattern.',
  'Anatomy Sheet':
    "an anatomical reference sheet in the style of a medical or artist's illustration. Show a detailed view of the character's musculature and skeletal structure.",
  'Clothing Layers': "a character sheet showing an 'exploded view' of the character's clothing.",
};

export function getCharacterLayoutInstruction(layout: string) {
  return (
    CHARACTER_LAYOUT_INSTRUCTIONS[layout] ?? CHARACTER_LAYOUT_INSTRUCTIONS['Classic Turnaround']
  );
}

export function getCharacterStyleInstruction(style: string, hasReference: boolean) {
  if (style !== 'Preserve Source Style')
    return `RENDER STYLE: ${style.toUpperCase()}. Ignore reference image style if it conflicts.`;
  return hasReference
    ? "Use the reference image's art style (line weight, shading, color palette) as the main style guide."
    : 'Choose one cohesive art style that fits the prompt and keep it identical in every view.';
}

function buildCharacterDirectives(params: RecipeParams) {
  const layout = getString(params, 'layout') || 'Classic Turnaround';
  const style = getString(params, 'style') || 'Preserve Source Style';
  const shot = getString(params, 'shot') || 'Full Body';
  const focus = getString(params, 'focus') || 'General Design';
  const hasReference = getBoolean(params, 'hasReference');
  const keepsRequestedBackground =
    getBoolean(params, 'transparentBackground') || getBoolean(params, 'preserveBackground');

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          `One clean character reference sheet: ${getCharacterLayoutInstruction(layout)}`,
        ),
        directive(
          'Identity',
          hasReference
            ? 'The reference image shows the character. Keep costume, physique, colors, and facial features in every view.'
            : 'Design one original, cohesive character from the prompt.',
        ),
        directive(
          'Consistency',
          'Same design, proportions, colors, and scale in every view or panel.',
        ),
        directive('Rules', 'No text, labels, captions, arrows, or watermarks.'),
      ],
    },
    {
      title: 'Sheet Layout',
      directives: [
        directive('Layout', layout),
        directive('Shot Framing', `${shot}. Use this crop for every view.`),
        directive(
          'Design Focus',
          focus === 'General Design'
            ? 'Balanced detail across the whole design.'
            : `Give extra detail to ${focus}.`,
        ),
        directive(
          'Background',
          keepsRequestedBackground
            ? ''
            : 'Neutral studio white or light grey, unless the prompt asks for another background.',
        ),
      ],
    },
    {
      title: 'Art Direction',
      directives: [
        directive('Style', style === 'Preserve Source Style' && !hasReference ? '' : style),
        directive('Style Instruction', getCharacterStyleInstruction(style, hasReference)),
      ],
    },
  ]);
}

export const characterRecipe: RecipeDefinition = {
  module,
  policy: characterPolicy,
  referenceInstruction: (_params, _attachment, index) =>
    index === 0
      ? 'Identity source for the character on the sheet.'
      : 'Extra detail reference for the same character.',
  directives: (params) => buildCharacterDirectives(params),
};
