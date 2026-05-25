import {
  getRecord,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';
import {
  createSpritesheetCellDirectives,
  getSpritesheetBackgroundDirective,
  getSpritesheetDividerState,
  parseSpritesheetGrid,
} from '../recipePromptFragments';

export function buildSpritesheetContext(params: RecipeContextParams) {
  const view = getString(params, 'view', 'Match Source');
  const style = getString(params, 'style', 'Preserve Style');
  const grid = getString(params, 'grid', '2x2');
  const background = getString(params, 'background', 'Dark Grey');
  const dividers = getString(params, 'dividers', 'No Dividers');
  const customColor = getString(params, 'customColor', '#3f3f46');
  const cellPrompts = getRecord(params, 'cellPrompts');
  const { gridCols, gridRows } = parseSpritesheetGrid(grid);
  const { hasDividers, dividerColor, cellSeparation } = getSpritesheetDividerState(dividers);
  const bgDirective = getSpritesheetBackgroundDirective(background, customColor);
  const cellDirectives = createSpritesheetCellDirectives(cellPrompts);

  const recipeSchema = {
    task_id: 'SPRITESHEET_GENERATION',
    layout_constraints: {
      type: 'GRID_SHEET',
      columns: gridCols,
      rows: gridRows,
      total_cells: gridCols * gridRows,
      cell_separation: cellSeparation,
      consistency: 'CHARACTER_GUIDED',
    },
    visual_style: {
      perspective: view === 'Match Source' ? 'INFER_FROM_SOURCE_IMAGE' : view.toUpperCase(),
      rendering: style === 'Preserve Style' ? 'SOURCE_CONSISTENT' : style.toUpperCase(),
      background_color: bgDirective,
    },
    cell_specifics:
      cellDirectives.length > 0
        ? cellDirectives
        : 'Suggest a readable pose or animation cycle (e.g., walk, run, idle, or attack).',
    directives: [
      'Generate a clean 2D game sprite sheet concept.',
      `Target layout is ${gridCols} columns by ${gridRows} rows; keep the grid easy to read and crop.`,
      'Aim to keep proportions, colors, and design details consistent across cells.',
      view === 'Match Source'
        ? 'Use the input image perspective as a guide across all frames.'
        : `Use ${view} as the target perspective.`,
      hasDividers
        ? `Draw clear ${dividerColor} divider lines between cells as a slicing guide.`
        : 'Avoid visible grid lines or dividers.',
      'Keep clear separation and alignment for local asset review.',
      'Keep the background uniform and clean.',
    ],
  };

  return recipeDocument(
    'spritesheet',
    'SPRITE SHEET PROMPT',
    [
      'Target: Game Asset Generation',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      'Output: one clean sprite sheet image with readable cells.',
    ].join('\n'),
  );
}

export const spritesheetRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'SPRITE SHEET PROMPT',
  buildContext: buildSpritesheetContext,
} satisfies RecipeContextBuilder;
