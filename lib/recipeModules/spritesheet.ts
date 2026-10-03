import { spritesheetPolicy } from '../../packages/shared/src/recipePolicies/spritesheet';
import { createModuleDirectives, directive, getRecord, getString } from './directiveHelpers';
import { createRecipeModule, options } from './params';
import { spritesheetBackground } from './composerRules';
import type { RecipeDefinition, RecipeDirectiveContext, RecipeParams } from './types';

const SPRITESHEET_OPTIONS = {
  view: [
    'Match Source',
    'Isometric',
    'Top Down',
    'Side Scroll',
    'Front View',
    'Back View',
    '3/4 View',
  ],
  style: [
    'Preserve Style',
    'Pixel Art (16-bit)',
    'Pixel Art (32-bit)',
    'Vector Flat',
    'Hand Drawn',
    'Voxel',
    'Low Poly 3D',
  ],
  grid: ['2x2', '3x3', '4x2', '4x4', '5x5', '6x4', '8x8', '1x6 Strip'],
  background: ['Dark Grey', 'Black', 'Chroma Green', 'White', 'Custom'],
  dividers: ['No Dividers', 'Red Lines', 'Blue Lines', 'Black Lines', 'White Lines'],
} as const;

const module = createRecipeModule({
  id: 'spritesheet',
  title: 'Sprite Sheet',
  description: 'Generate one sprite-sheet image from text and references.',
  defaultTask: 'sprite_sheet',
  variation: 'details',
  supportedTasks: ['sprite_sheet', 'image_generate', 'image_edit'],
  parameters: [
    {
      id: 'view',
      label: 'View',
      kind: 'enum',
      control: 'select',
      group: 'camera',
      defaultValue: 'Match Source',
      options: options(SPRITESHEET_OPTIONS.view),
    },
    {
      id: 'style',
      label: 'Style',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'Preserve Style',
      options: options(SPRITESHEET_OPTIONS.style),
    },
    {
      id: 'grid',
      label: 'Grid',
      kind: 'enum',
      control: 'select',
      group: 'layout',
      defaultValue: '2x2',
      options: options(SPRITESHEET_OPTIONS.grid),
    },
    {
      id: 'background',
      label: 'Background',
      kind: 'enum',
      control: 'select',
      group: 'layout',
      defaultValue: 'Dark Grey',
      options: options(SPRITESHEET_OPTIONS.background),
    },
    {
      id: 'dividers',
      label: 'Dividers',
      kind: 'enum',
      control: 'select',
      group: 'layout',
      defaultValue: 'No Dividers',
      options: options(SPRITESHEET_OPTIONS.dividers),
    },
    {
      id: 'customColor',
      label: 'Custom Color',
      kind: 'color',
      control: 'color',
      group: 'layout',
      defaultValue: '#3f3f46',
    },
    {
      id: 'cellPrompts',
      label: 'Cell Prompts',
      kind: 'record',
      control: 'record',
      group: 'cells',
      defaultValue: {},
    },
  ],
});

export function parseSpritesheetGrid(grid: string) {
  if (grid.includes('Strip')) return { gridCols: 6, gridRows: 1 };

  const [rawCols, rawRows] = grid.split('x').map((value) => Number(value));
  const gridCols = Number.isFinite(rawCols) && rawCols > 0 ? rawCols : 2;
  const gridRows = Number.isFinite(rawRows) && rawRows > 0 ? rawRows : 2;
  return { gridCols, gridRows };
}

export function getSpritesheetDividerState(dividers: string) {
  const hasDividers = dividers !== 'No Dividers';
  const dividerColor = dividers.split(' ')[0].toUpperCase();
  return {
    hasDividers,
    dividerColor,
    cellSeparation: hasDividers ? `VISIBLE_${dividerColor}_LINES` : 'NO_VISIBLE_SEPARATION',
  };
}

export function getSpritesheetBackgroundDirective(background: string, customColor: string) {
  if (background.toLowerCase() === 'preserve') return 'PRESERVE_SOURCE_UNLESS_REQUESTED_OTHERWISE';
  if (background.toLowerCase() === 'transparent')
    return 'NATIVE_TRANSPARENT_ALPHA_NO_PAINTED_CHECKERBOARD';
  if (background.includes('Green')) {
    return 'SOLID_GREEN_#00FF00. This is a key color for a later import, not transparent pixels.';
  }
  if (background === 'Custom') return `SOLID_COLOR_${customColor.toUpperCase()}`;
  if (background === 'Black') return 'SOLID_BLACK';
  return background.toUpperCase();
}

/** Cell prompts inside the current grid, in reading order. */
export function createSpritesheetCellDirectives(cellPrompts: RecipeParams, totalCells: number) {
  return Object.entries(cellPrompts)
    .map(([index, prompt]) => ({ index: Number(index), prompt }))
    .filter(
      (entry): entry is { index: number; prompt: string } =>
        Number.isInteger(entry.index) &&
        entry.index >= 0 &&
        entry.index < totalCells &&
        typeof entry.prompt === 'string' &&
        entry.prompt.trim() !== '',
    )
    .sort((left, right) => left.index - right.index)
    .map(({ index, prompt }) => `Cell ${index + 1}: ${prompt.trim()}`);
}

function buildSpritesheetDirectives(params: RecipeParams, context: RecipeDirectiveContext) {
  const hasReference = context.referenceCount > 0;
  const view = getString(params, 'view') || 'Match Source';
  const style = getString(params, 'style') || 'Preserve Style';
  const grid = getString(params, 'grid') || '2x2';
  const background = getString(params, 'background') || 'Dark Grey';
  const dividers = getString(params, 'dividers') || 'No Dividers';
  const customColor = getString(params, 'customColor') || '#3f3f46';
  const { gridCols, gridRows } = parseSpritesheetGrid(grid);
  const { hasDividers, dividerColor } = getSpritesheetDividerState(dividers);
  const totalCells = gridCols * gridRows;
  const cellDirectives = createSpritesheetCellDirectives(
    getRecord(params, 'cellPrompts'),
    totalCells,
  );

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          `One sprite sheet image: a grid of ${gridCols} columns by ${gridRows} rows, ${totalCells} equal cells, read left to right, top to bottom.`,
        ),
        directive(
          'Consistency',
          'The same character or asset in every cell, at the same scale, facing, and baseline, centered in its cell.',
        ),
        directive(
          'Rules',
          'No text, labels, cell numbers, or watermarks. Nothing crosses a cell edge.',
        ),
      ],
    },
    {
      title: 'Grid Layout',
      directives: [
        directive(
          'Cell Separation',
          hasDividers
            ? `Thin ${dividerColor.toLowerCase()} divider lines between cells.`
            : 'No grid lines. Leave clear empty space between cells.',
        ),
      ],
    },
    {
      title: 'Visual Style',
      directives: [
        directive(
          'Perspective',
          view !== 'Match Source'
            ? view
            : hasReference
              ? 'Match the reference image.'
              : 'Pick one camera angle that suits the subject and keep it in every cell.',
        ),
        directive(
          'Rendering',
          style !== 'Preserve Style'
            ? style
            : hasReference
              ? 'Match the reference image style.'
              : 'Pick one style that suits the prompt and keep it in every cell.',
        ),
        directive('Background', getSpritesheetBackgroundDirective(background, customColor)),
      ],
    },
    {
      title: 'Cells',
      directives: [
        directive(
          'Cell Prompts',
          cellDirectives.length > 0
            ? cellDirectives.join('; ')
            : 'Fill the cells in order with readable poses or animation states.',
        ),
      ],
    },
  ]);
}

export const spritesheetRecipe: RecipeDefinition = {
  module,
  policy: spritesheetPolicy,
  referenceInstruction: () =>
    'Identity reference for the character or asset in every cell. Do not copy its background or framing.',
  /** A sprite sheet keeps its chosen sheet fill. A reference sets identity, not the backdrop. */
  background: spritesheetBackground,
  directives: buildSpritesheetDirectives,
};
