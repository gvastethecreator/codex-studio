import {
  createSpriteAtlasContract,
  createSpriteAtlasPresetSummaries,
  SPRITE_ATLAS_BACKGROUND_REMOVAL,
  SPRITE_ATLAS_FRAME_BUDGETS,
} from '../../packages/shared/src/spriteAtlasContracts';
import { createModuleDirectives, directive, getString } from './directiveHelpers';
import { createRecipeModule, options } from './params';
import { spriteAtlasBackground } from './composerRules';
import type { RecipeDefinition, RecipeParams } from './types';

const SPRITE_ATLAS_OPTIONS = {
  presetId: createSpriteAtlasPresetSummaries().map((preset) => preset.id),
  stylePreset: ['pixel-art', 'illustration', 'painterly', 'realistic', 'anime', 'vector', 'custom'],
  frameBudget: [...SPRITE_ATLAS_FRAME_BUDGETS],
  backgroundRemoval: [...SPRITE_ATLAS_BACKGROUND_REMOVAL],
  qaMode: ['standard', 'strict'],
} as const;

const module = createRecipeModule({
  id: 'sprite-atlas',
  title: 'Sprite Atlas',
  description:
    'Prepare runtime-ready sprite atlases with row prompts, layout guides, handoff, extraction, manifest, and QA.',
  defaultTask: 'sprite_sheet',
  variation: 'none',
  supportedTasks: ['sprite_sheet', 'texture_generate', 'image_generate'],
  parameters: [
    {
      id: 'presetId',
      label: 'Preset',
      kind: 'enum',
      control: 'select',
      group: 'contract',
      defaultValue: 'platformer-character',
      options: options(SPRITE_ATLAS_OPTIONS.presetId),
    },
    {
      id: 'stylePreset',
      label: 'Style Preset',
      kind: 'enum',
      control: 'select',
      group: 'look',
      defaultValue: 'pixel-art',
      options: options(SPRITE_ATLAS_OPTIONS.stylePreset),
    },
    {
      id: 'customStyle',
      label: 'Custom Style',
      kind: 'string',
      control: 'text',
      group: 'look',
      defaultValue: '',
    },
    {
      id: 'frameBudget',
      label: 'Frame Budget',
      kind: 'enum',
      control: 'select',
      group: 'animation',
      defaultValue: 'preset',
      options: options(SPRITE_ATLAS_OPTIONS.frameBudget),
    },
    {
      id: 'backgroundRemoval',
      label: 'Background Removal',
      kind: 'enum',
      control: 'select',
      group: 'extraction',
      defaultValue: 'alpha',
      options: options(SPRITE_ATLAS_OPTIONS.backgroundRemoval),
    },
    {
      id: 'chromaKey',
      label: 'Chroma Key',
      kind: 'color',
      control: 'color',
      group: 'extraction',
      defaultValue: '#00FF00',
    },
    {
      id: 'cellWidth',
      label: 'Cell Width',
      kind: 'number',
      control: 'slider',
      group: 'layout',
      defaultValue: 128,
      min: 16,
      max: 512,
      step: 8,
    },
    {
      id: 'cellHeight',
      label: 'Cell Height',
      kind: 'number',
      control: 'slider',
      group: 'layout',
      defaultValue: 128,
      min: 16,
      max: 512,
      step: 8,
    },
    {
      id: 'columns',
      label: 'Columns',
      kind: 'number',
      control: 'slider',
      group: 'layout',
      defaultValue: 8,
      min: 1,
      max: 16,
      step: 1,
    },
    {
      id: 'qaMode',
      label: 'QA Mode',
      kind: 'enum',
      control: 'select',
      group: 'quality',
      defaultValue: 'standard',
      options: options(SPRITE_ATLAS_OPTIONS.qaMode),
    },
    {
      id: 'rows',
      label: 'Rows',
      kind: 'record',
      control: 'record',
      group: 'contract',
      defaultValue: {},
    },
    {
      id: 'formats',
      label: 'Formats',
      kind: 'string',
      control: 'text',
      group: 'output',
      defaultValue: 'png,webp',
    },
  ],
});

const SPRITE_ATLAS_FRAME_MEANING = {
  temporal: 'Frames are consecutive moments of one motion, in time order.',
  tiles: 'Frames are separate tiles that share projection, scale, and matching edges.',
  variants: 'Frames are separate variants. Do not imply motion between them.',
  items: 'Frames are separate items. Do not imply motion between them.',
} as const;

function describeSpriteAtlasRow(row: {
  id: string;
  frames: number;
  loop: boolean;
  action: string;
}) {
  const action = row.action ? `: ${row.action}` : '';
  return `${row.id}${action} (${row.frames} frames, ${row.loop ? 'loops back to frame 1' : 'plays once'})`;
}

function buildSpriteAtlasDirectives(params: RecipeParams) {
  const contract = createSpriteAtlasContract(params);
  const rowId = getString(params, 'rowId');
  const row = rowId ? contract.rows.find((item) => item.id === rowId) : undefined;
  const cellAspect = `${contract.cell.width}:${contract.cell.height}`;

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          row
            ? `One horizontal strip of exactly ${row.frames} equal frames for the "${row.id}" row, side by side from left to right. Each frame has a ${cellAspect} shape. No gaps, extra rows, or labels.`
            : `Sprite atlas rows for ${contract.presetId}. Each row is one horizontal strip of equal ${cellAspect} frames.`,
        ),
        directive('Frame Meaning', SPRITE_ATLAS_FRAME_MEANING[contract.frameSemantics]),
        directive(
          'Consistency',
          'Keep the same identity, scale, baseline, outline weight, and palette in every frame. Keep each frame upright and inside its slot with a small margin.',
        ),
        directive('Rules', 'No text, labels, guide marks, watermarks, or merged atlas pages.'),
      ],
    },
    {
      title: 'Atlas Contract',
      directives: [
        directive('Asset Kind', contract.assetKind),
        directive('Camera', contract.camera),
        directive('Style', contract.customStyle || contract.stylePreset),
        directive('Row', row ? describeSpriteAtlasRow(row) : ''),
        directive(
          'Rows',
          row
            ? ''
            : contract.rows.length > 0
              ? contract.rows.map(describeSpriteAtlasRow).join('; ')
              : 'Custom rows required before generation.',
        ),
      ],
    },
    {
      title: 'Background',
      directives: [
        directive(
          'Background',
          !contract.transparent
            ? 'Keep the background the prompt or preset asks for.'
            : contract.backgroundRemoval === 'chroma'
              ? `Flat ${contract.chromaKey} key color. This is a key color for a later import, not transparent pixels.`
              : 'Native transparency. Do not paint a green, blue, cyan, or magenta backdrop.',
        ),
      ],
    },
  ]);
}

export const spriteAtlasRecipe: RecipeDefinition = {
  module,
  policy: {},
  referenceInstruction: (_params, _attachment, index) =>
    index === 0
      ? 'Identity anchor: match this character or asset in every frame.'
      : 'Extra identity reference for the same character or asset.',
  background: spriteAtlasBackground,
  directives: (params) => buildSpriteAtlasDirectives(params),
  plan({ config, params }) {
    const contract = createSpriteAtlasContract(params);
    const rowId = config.recipeParams?.rowId;
    return {
      directives: buildSpriteAtlasDirectives(params),
      quality: {
        style: contract.customStyle || contract.stylePreset,
        color: contract.backgroundRemoval === 'chroma' ? contract.chromaKey : undefined,
        materials: contract.assetKind,
        constraints: [
          typeof rowId === 'string' && rowId
            ? `Generate only the ${rowId} row strip.`
            : `Generate one row strip per state for ${contract.presetId}.`,
        ],
        negative: [
          'labels',
          'watermarks',
          'guide marks',
          ...(contract.transparent ? ['scene background'] : []),
          'cropped sprites',
        ],
      },
      metadata: { spriteAtlas: contract },
    };
  },
};
