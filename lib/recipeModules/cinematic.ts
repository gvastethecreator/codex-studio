import { cinematicPolicy } from '../../packages/shared/src/recipePolicies/cinematic';
import {
  chosenOption,
  createModuleDirectives,
  directive,
  getNumber,
  getRecord,
  getString,
} from './directiveHelpers';
import { createRecipeModule, options } from './params';
import type { RecipeDefinition, RecipeParams } from './types';

const CINEMATIC_OPTIONS = {
  frames: ['3', '6', '9'],
  genre: [
    'Auto-Detect',
    'Sci-Fi',
    'Cyberpunk',
    'Fantasy',
    'Dark Fantasy',
    'Horror',
    'Thriller',
    'Action',
    'Adventure',
    'Drama',
    'Mystery',
    'Noir',
    'Western',
    'Documentary',
    'Historical',
  ],
  tone: [
    'Auto-Detect',
    'Cinematic',
    'Teal & Orange',
    'Noir',
    'Vibrant',
    'Muted',
    'High Contrast',
    'Ethereal',
    'Gritty',
    'Melancholic',
    'Dreamy',
    'Retro',
    'Desaturated',
  ],
  lighting: [
    'Auto-Detect',
    'Soft Window',
    'Neon',
    'Practical',
    'Rembrandt',
    'Silhouette',
    'Volumetric Fog',
    'Studio',
    'Hard Light',
  ],
  time: [
    'Auto-Detect',
    'Golden Hour',
    'Blue Hour',
    'High Noon',
    'Midnight',
    'Dawn',
    'Dusk',
    'Overcast',
  ],
  weather: [
    'Auto-Detect',
    'Clear',
    'Rain',
    'Heavy Rain',
    'Fog',
    'Mist',
    'Snow',
    'Blizzard',
    'Dust Storm',
    'Sandstorm',
    'Haze',
  ],
  movement: [
    'Auto-Detect',
    'Steadycam',
    'Handheld',
    'Drone Flyover',
    'Dolly Zoom',
    'Trucking',
    'Whip Pan',
    'Static Tripod',
    'Crane Shot',
    'POV',
    'Slow Motion',
    'Orbit',
  ],
  lens: [
    'Auto-Detect',
    'Anamorphic',
    '35mm Standard',
    '50mm Portrait',
    '85mm Telephoto',
    '24mm Wide',
    '14mm Ultra-Wide',
    'Macro',
    'Tilt-Shift',
    'Vintage Glass',
    '70mm IMAX',
  ],
  shot: [
    'Auto',
    'Extreme Wide',
    'Wide',
    'Full',
    'Medium',
    'Close-Up',
    'Extreme Close-Up',
    'POV',
    'Over the Shoulder',
  ],
} as const;

const module = createRecipeModule({
  id: 'cinematic',
  title: 'Cinematic Storyboard',
  description: 'Build storyboard grids with shot, lens, tone, and continuity controls.',
  defaultTask: 'image_generate',
  variation: 'details',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'frames',
      label: 'Frames',
      kind: 'number',
      control: 'select',
      group: 'layout',
      defaultValue: 9,
      options: options(CINEMATIC_OPTIONS.frames),
      min: 3,
      max: 9,
      step: 3,
    },
    { id: 'rows', label: 'Rows', kind: 'number', group: 'layout', defaultValue: 3 },
    { id: 'cols', label: 'Columns', kind: 'number', group: 'layout', defaultValue: 3 },
    { id: 'aspectRatio', label: 'Aspect Ratio', kind: 'string', group: 'layout' },
    {
      id: 'frameShots',
      label: 'Frame Shots',
      kind: 'record',
      control: 'record',
      group: 'shots',
      defaultValue: {},
      options: options(CINEMATIC_OPTIONS.shot),
    },
    {
      id: 'genre',
      label: 'Genre',
      kind: 'enum',
      control: 'select',
      group: 'direction',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.genre),
    },
    {
      id: 'tone',
      label: 'Tone',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.tone),
    },
    {
      id: 'lighting',
      label: 'Lighting',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.lighting),
    },
    {
      id: 'time',
      label: 'Time',
      kind: 'enum',
      control: 'select',
      group: 'environment',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.time),
    },
    {
      id: 'weather',
      label: 'Weather',
      kind: 'enum',
      control: 'select',
      group: 'environment',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.weather),
    },
    {
      id: 'movement',
      label: 'Camera Movement',
      kind: 'enum',
      control: 'select',
      group: 'camera',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.movement),
    },
    {
      id: 'lens',
      label: 'Lens',
      kind: 'enum',
      control: 'select',
      group: 'camera',
      defaultValue: 'Auto-Detect',
      options: options(CINEMATIC_OPTIONS.lens),
    },
  ],
});

export function createCinematicLayoutInstruction(frames: number, rows: number, cols: number) {
  const layoutDescription = `${rows} rows by ${cols} columns`;
  if (frames === 3) return `Create a cinematic triptych (${layoutDescription}).`;
  if (frames === 6) return `Create a 6-frame storyboard grid (${layoutDescription}).`;
  return `Create a ${frames}-frame storyboard contact sheet (${layoutDescription}).`;
}

/** Shot picks for visible panels only, in panel order. */
export function createCinematicFrameDirectives(frameShots: RecipeParams, frames: number) {
  return Object.entries(frameShots)
    .map(([index, shot]) => ({ index: Number(index), shot }))
    .filter(
      (entry): entry is { index: number; shot: string } =>
        Number.isInteger(entry.index) &&
        entry.index >= 0 &&
        entry.index < frames &&
        typeof entry.shot === 'string' &&
        entry.shot !== 'Auto',
    )
    .sort((left, right) => left.index - right.index)
    .map(({ index, shot }) => `Frame ${index + 1}: ${shot} Shot`);
}

export function createCinematicFrameInstructions(frameShots: RecipeParams, frames: number) {
  const frameDirectives = createCinematicFrameDirectives(frameShots, frames);
  return frameDirectives.length > 0
    ? `\nSPECIFIC FRAME SHOTS:\n${frameDirectives.map((line) => `- ${line}`).join('\n')}`
    : '';
}

function describePanelAspect(sheetAspect: string, rows: number, cols: number) {
  const [width, height] = sheetAspect.split(':').map(Number);
  if (!width || !height) return '';
  const ratio = ((width / height) * rows) / cols;
  if (Math.abs(ratio - 1) < 0.05) return 'Each panel is about square.';
  return ratio > 1
    ? `Each panel is about ${ratio.toFixed(2)}:1 (landscape).`
    : `Each panel is about 1:${(1 / ratio).toFixed(2)} (portrait).`;
}

function buildCinematicDirectives(params: RecipeParams) {
  const frames = Math.max(1, getNumber(params, 'frames', 9));
  const rows = Math.max(1, getNumber(params, 'rows', 3));
  const cols = Math.max(1, getNumber(params, 'cols', 3));
  const frameDirectives = createCinematicFrameDirectives(getRecord(params, 'frameShots'), frames);
  const sheetAspect = getString(params, 'aspectRatio') || '1:1';

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          `One single image laid out as a storyboard of ${frames} panels in ${rows} rows by ${cols} columns, read left to right, top to bottom.`,
        ),
        directive(
          'Story',
          'The panels show one short beat in order: setup, action, reaction. Keep the same cast, wardrobe, setting, and light direction in every panel.',
        ),
        directive(
          'Rules',
          'Thin, even gutters between panels. No captions, panel numbers, speech bubbles, UI, or watermarks.',
        ),
      ],
    },
    {
      title: 'Storyboard Layout',
      directives: [
        directive('Layout Instruction', createCinematicLayoutInstruction(frames, rows, cols)),
        directive('Sheet Aspect Ratio', `${sheetAspect} for the whole image`),
        directive('Panel Shape', describePanelAspect(sheetAspect, rows, cols)),
        directive(
          'Frame Shots',
          frameDirectives.length > 0
            ? frameDirectives.join('; ')
            : 'Vary the shot sizes so the beat reads clearly.',
        ),
      ],
    },
    {
      title: 'Cinematic Direction',
      directives: [
        directive('Genre', chosenOption(params, 'genre')),
        directive('Tone', chosenOption(params, 'tone')),
        directive('Lighting', chosenOption(params, 'lighting')),
        directive('Time', chosenOption(params, 'time')),
        directive('Weather', chosenOption(params, 'weather')),
        directive('Camera Movement', chosenOption(params, 'movement')),
        directive('Lens', chosenOption(params, 'lens')),
      ],
    },
  ]);
}

export const cinematicRecipe: RecipeDefinition = {
  module,
  policy: cinematicPolicy,
  referenceInstruction: () => 'Cast, setting, and look reference for every panel.',
  directives: (params) => buildCinematicDirectives(params),
};
