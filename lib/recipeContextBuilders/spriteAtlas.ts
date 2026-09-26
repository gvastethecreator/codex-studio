import {
  createSpriteAtlasContract,
  type SpriteAtlasContract,
} from '../../packages/shared/src/spriteAtlasContracts';
import {
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function summarizeRows(contract: SpriteAtlasContract) {
  return contract.rows
    .map((row) => `${row.id}:${row.frames}f@${row.fps}fps${row.loop ? ':loop' : ':once'}`)
    .join(', ');
}

function buildSpriteAtlasContext(params: RecipeContextParams) {
  const contract = createSpriteAtlasContract(params);
  const recipeSchema = {
    task_id: 'SPRITE_ATLAS_WORKFLOW',
    asset_kind: contract.assetKind,
    extraction_mode: contract.extractionMode,
    workflow_lane: contract.workflowLane,
    frame_semantics: contract.frameSemantics,
    preset: contract.presetId,
    camera: contract.camera,
    style: contract.customStyle || contract.stylePreset,
    frame_budget: contract.frameBudget,
    background_removal: contract.backgroundRemoval,
    chroma_key: contract.chromaKey,
    layout: {
      columns: contract.columns,
      cell: contract.cell,
      transparent: contract.transparent,
      formats: contract.formats,
    },
    rows: contract.rows,
    qa_mode: contract.qaMode,
  };

  return recipeDocument(
    'sprite-atlas',
    'SPRITE ATLAS WORKFLOW',
    [
      'Target: Runtime-ready game atlas workflow.',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      `Rows: ${summarizeRows(contract) || 'custom rows required before generation.'}`,
      `Frame semantics: ${contract.frameSemantics}. Treat slots as ${contract.frameSemantics === 'temporal' ? 'ordered motion phases' : contract.frameSemantics === 'tiles' ? 'adjacent runtime tiles' : 'independent items or variants'}.`,
      'Output intent: one horizontal row strip per state at the declared cell size, then transparent frames, atlas PNG, and manifest.json.frame_layout.',
      'Do not generate a whole atlas as one final image unless importing an existing sheet.',
      contract.backgroundRemoval === 'chroma'
        ? `Legacy key color ${contract.chromaKey}. This is a key color for a later import, not transparent pixels.`
        : 'Use native transparency. Do not paint a green, blue, cyan, or magenta backdrop.',
      'Preserve identity, camera, scale, pivot, and cell occupancy across every row. Do not rotate or resize individual cells.',
    ].join('\n'),
  );
}

export const spriteAtlasRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'SPRITE ATLAS WORKFLOW',
  buildContext: buildSpriteAtlasContext,
} satisfies RecipeContextBuilder;
