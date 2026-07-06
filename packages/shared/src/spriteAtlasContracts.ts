export const SPRITE_ATLAS_PRESET_IDS = [
  'codex-pet',
  'platformer-character',
  'topdown-character',
  'isometric-character',
  'combat-character',
  'fighting-game-character',
  'rpg-monster',
  'ui-avatar',
  'tileset-topdown',
  'tileset-platformer',
  'texture-pack',
  'asset-pack',
  'custom-asset-atlas',
  'custom-atlas',
] as const;

export type SpriteAtlasPresetId = (typeof SPRITE_ATLAS_PRESET_IDS)[number];

export const SPRITE_ATLAS_ASSET_KINDS = [
  'sprite',
  'tileset',
  'texture',
  'asset',
  'custom',
] as const;

export type SpriteAtlasAssetKind = (typeof SPRITE_ATLAS_ASSET_KINDS)[number];

export const SPRITE_ATLAS_EXTRACTION_MODES = ['components', 'slots'] as const;

export type SpriteAtlasExtractionMode = (typeof SPRITE_ATLAS_EXTRACTION_MODES)[number];

export const SPRITE_ATLAS_BACKGROUND_REMOVAL = ['chroma', 'rembg', 'auto', 'alpha'] as const;

export type SpriteAtlasBackgroundRemoval = (typeof SPRITE_ATLAS_BACKGROUND_REMOVAL)[number];

export const SPRITE_ATLAS_FRAME_BUDGETS = ['preset', 'micro', 'compact', 'exact'] as const;

export type SpriteAtlasFrameBudget = (typeof SPRITE_ATLAS_FRAME_BUDGETS)[number];

export const SPRITE_ATLAS_RUN_STATUSES = [
  'draft',
  'prepared',
  'waiting_for_rows',
  'ready_to_extract',
  'composed',
  'qa_passed',
  'blocked',
] as const;

export type SpriteAtlasRunStatus = (typeof SPRITE_ATLAS_RUN_STATUSES)[number];

export const SPRITE_ATLAS_ROW_STATUSES = [
  'planned',
  'handoff_ready',
  'generating',
  'raw_imported',
  'blocked',
  'extracted',
] as const;

export type SpriteAtlasRowStatus = (typeof SPRITE_ATLAS_ROW_STATUSES)[number];

export const SPRITE_ATLAS_BLOCKED_REASON_KINDS = [
  'policy_or_safety',
  'imagegen_unavailable',
  'runner_failed',
  'no_image_returned',
  'unknown',
] as const;

export type SpriteAtlasBlockedReasonKind = (typeof SPRITE_ATLAS_BLOCKED_REASON_KINDS)[number];

export interface SpriteAtlasCellSpec {
  width: number;
  height: number;
  safeMarginX: number;
  safeMarginY: number;
}

export interface SpriteAtlasRowSpec {
  id: string;
  frames: number;
  fps: number;
  loop: boolean;
  action: string;
  mirrorPair?: string | null;
}

export interface SpriteAtlasContract {
  presetId: SpriteAtlasPresetId;
  assetKind: SpriteAtlasAssetKind;
  extractionMode: SpriteAtlasExtractionMode;
  stylePreset: string;
  customStyle: string | null;
  frameBudget: SpriteAtlasFrameBudget;
  backgroundRemoval: SpriteAtlasBackgroundRemoval;
  chromaKey: string;
  camera: string;
  columns: number;
  transparent: boolean;
  formats: string[];
  cell: SpriteAtlasCellSpec;
  rows: SpriteAtlasRowSpec[];
  qaMode: 'standard' | 'strict';
}

export interface SpriteAtlasBlockedReason {
  status: 'blocked';
  reasonKind: SpriteAtlasBlockedReasonKind;
  userMessage: string;
  suggestion: string;
}

export interface SpriteAtlasRunPaths {
  runDir: string;
  requestPath: string;
  statusPath: string;
  promptsDir: string;
  layoutGuidesDir: string;
  rawDir: string;
  framesDir: string;
  handoffInboxDir: string;
  handoffOutboxDir: string;
  handoffStatusDir: string;
  handoffLogsDir: string;
  atlasPath: string;
  manifestPath: string;
  qaReportPath: string;
}

export interface SpriteAtlasRowState {
  id: string;
  status: SpriteAtlasRowStatus;
  frames: number;
  promptPath: string;
  layoutGuidePath: string;
  rawPath: string | null;
  jobId: string | null;
  blocked: SpriteAtlasBlockedReason | null;
  updatedAt: string;
}

export interface SpriteAtlasQaReport {
  ok: boolean;
  mode: 'fixture_smoke' | 'generated_art';
  checkedAt: string;
  issues: string[];
  summary: string;
}

export interface SpriteAtlasRun {
  id: string;
  title: string;
  status: SpriteAtlasRunStatus;
  createdAt: string;
  updatedAt: string;
  contract: SpriteAtlasContract;
  paths: SpriteAtlasRunPaths;
  rows: SpriteAtlasRowState[];
  qa: SpriteAtlasQaReport | null;
}

export interface SpriteAtlasPresetSummary {
  id: SpriteAtlasPresetId;
  label: string;
  description: string;
  assetKind: SpriteAtlasAssetKind;
  rows: number;
  frames: number;
  cell: SpriteAtlasCellSpec;
  columns: number;
}

interface SpriteAtlasPresetRowDefinition {
  id: string;
  frames: number;
  fps?: number;
  loop?: boolean;
  action?: string;
  mirrorPair?: string | null;
}

interface SpriteAtlasPresetDefinition {
  id: SpriteAtlasPresetId;
  label: string;
  description: string;
  camera: string;
  assetKind: SpriteAtlasAssetKind;
  extractionMode: SpriteAtlasExtractionMode;
  style: string;
  cell: SpriteAtlasCellSpec;
  columns: number;
  transparent: boolean;
  formats: string[];
  rows: SpriteAtlasPresetRowDefinition[];
}

function row(
  id: string,
  frames: number,
  action = '',
  options: Pick<SpriteAtlasPresetRowDefinition, 'fps' | 'loop' | 'mirrorPair'> = {},
): SpriteAtlasPresetRowDefinition {
  return { id, frames, action, ...options };
}

export const SPRITE_ATLAS_PRESET_DEFINITIONS = {
  'codex-pet': {
    id: 'codex-pet',
    label: 'Codex Pet',
    description: 'Codex custom pet atlas compatible with hatch-pet output.',
    camera: 'mascot',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 192, height: 208, safeMarginX: 18, safeMarginY: 16 },
    columns: 8,
    transparent: true,
    formats: ['webp', 'png'],
    rows: [
      row('idle', 6),
      row('running-right', 8, '', { mirrorPair: 'running-left' }),
      row('running-left', 8, '', { mirrorPair: 'running-right' }),
      row('waving', 4),
      row('jumping', 5),
      row('failed', 8),
      row('waiting', 6),
      row('running', 6),
      row('review', 6),
    ],
  },
  'platformer-character': {
    id: 'platformer-character',
    label: 'Platformer Character',
    description: 'Side-view platformer character sheet.',
    camera: 'side',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 128, height: 128, safeMarginX: 16, safeMarginY: 16 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle', 6),
      row('run', 8),
      row('jump', 4),
      row('fall', 4),
      row('land', 4),
      row('attack', 6),
      row('hurt', 4),
      row('death', 8),
    ],
  },
  'topdown-character': {
    id: 'topdown-character',
    label: 'Topdown Character',
    description: 'Four-direction RPG or adventure character sheet.',
    camera: 'topdown',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 64, height: 64, safeMarginX: 8, safeMarginY: 8 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle-down', 4),
      row('idle-left', 4, '', { mirrorPair: 'idle-right' }),
      row('idle-right', 4, '', { mirrorPair: 'idle-left' }),
      row('idle-up', 4),
      row('walk-down', 8),
      row('walk-left', 8, '', { mirrorPair: 'walk-right' }),
      row('walk-right', 8, '', { mirrorPair: 'walk-left' }),
      row('walk-up', 8),
      row('attack-down', 6),
      row('attack-left', 6, '', { mirrorPair: 'attack-right' }),
      row('attack-right', 6, '', { mirrorPair: 'attack-left' }),
      row('attack-up', 6),
    ],
  },
  'isometric-character': {
    id: 'isometric-character',
    label: 'Isometric Character',
    description: 'Four-diagonal isometric character sheet.',
    camera: 'isometric',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 96, height: 96, safeMarginX: 12, safeMarginY: 12 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle-se', 4, '', { mirrorPair: 'idle-sw' }),
      row('idle-sw', 4, '', { mirrorPair: 'idle-se' }),
      row('idle-ne', 4, '', { mirrorPair: 'idle-nw' }),
      row('idle-nw', 4, '', { mirrorPair: 'idle-ne' }),
      row('walk-se', 8, '', { mirrorPair: 'walk-sw' }),
      row('walk-sw', 8, '', { mirrorPair: 'walk-se' }),
      row('walk-ne', 8, '', { mirrorPair: 'walk-nw' }),
      row('walk-nw', 8, '', { mirrorPair: 'walk-ne' }),
      row('attack-se', 6, '', { mirrorPair: 'attack-sw' }),
      row('attack-sw', 6, '', { mirrorPair: 'attack-se' }),
      row('attack-ne', 6, '', { mirrorPair: 'attack-nw' }),
      row('attack-nw', 6, '', { mirrorPair: 'attack-ne' }),
    ],
  },
  'combat-character': {
    id: 'combat-character',
    label: 'Combat Character',
    description: 'Action RPG or beat-em-up combat character sheet.',
    camera: 'side',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 160, height: 160, safeMarginX: 20, safeMarginY: 20 },
    columns: 10,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle', 6),
      row('walk', 8),
      row('run', 8),
      row('light-attack', 8),
      row('heavy-attack', 10),
      row('block', 4),
      row('dodge', 6),
      row('hit', 4),
      row('death', 10),
    ],
  },
  'fighting-game-character': {
    id: 'fighting-game-character',
    label: 'Fighting Game Character',
    description: 'Large side-view fighting game character sheet.',
    camera: 'side',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 192, height: 192, safeMarginX: 24, safeMarginY: 24 },
    columns: 12,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle', 8),
      row('walk-forward', 8),
      row('walk-back', 8),
      row('crouch', 4),
      row('jump', 8),
      row('punch', 6),
      row('kick', 8),
      row('special', 12),
      row('hitstun', 6),
      row('knockdown', 10),
      row('win', 10),
    ],
  },
  'rpg-monster': {
    id: 'rpg-monster',
    label: 'RPG Monster',
    description: 'RPG enemy or creature animation sheet.',
    camera: 'side-or-three-quarter',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 128, height: 128, safeMarginX: 16, safeMarginY: 16 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle', 6),
      row('move', 6),
      row('attack', 8),
      row('cast', 8),
      row('hit', 4),
      row('death', 8),
      row('taunt', 6),
      row('sleep', 4),
    ],
  },
  'ui-avatar': {
    id: 'ui-avatar',
    label: 'UI Avatar',
    description: 'Portrait or avatar expression animation sheet.',
    camera: 'portrait',
    assetKind: 'sprite',
    extractionMode: 'components',
    style: 'pixel-art',
    cell: { width: 256, height: 256, safeMarginX: 24, safeMarginY: 24 },
    columns: 6,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('idle', 6),
      row('blink', 4),
      row('talk', 6),
      row('happy', 4),
      row('sad', 4),
      row('thinking', 6),
      row('alert', 4),
      row('success', 4),
    ],
  },
  'tileset-topdown': {
    id: 'tileset-topdown',
    label: 'Topdown Tileset',
    description: 'Top-down tilemap atlas for terrain, paths, water, walls, cliffs, and decor.',
    camera: 'topdown-tile',
    assetKind: 'tileset',
    extractionMode: 'slots',
    style:
      'game-ready top-down tilemap art, consistent grid scale, coherent palette, clean readable materials',
    cell: { width: 64, height: 64, safeMarginX: 0, safeMarginY: 0 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('terrain', 8, 'grass, dirt, stone, sand, mud, snow, and cracked ground tile variants', {
        fps: 1,
        loop: false,
      }),
      row('paths', 8, 'path and road tiles: straight, corner, tee, cross, bridge, worn variants', {
        fps: 1,
        loop: false,
      }),
      row('water', 8, 'water, shoreline, foam, pond, river, and wet edge tiles', {
        fps: 1,
        loop: false,
      }),
      row('walls', 8, 'wall, fence, cliff, ledge, gate, and obstacle tiles', {
        fps: 1,
        loop: false,
      }),
      row('decor', 8, 'rocks, flowers, shrubs, crates, signs, debris, and ground decals', {
        fps: 1,
        loop: false,
      }),
    ],
  },
  'tileset-platformer': {
    id: 'tileset-platformer',
    label: 'Platformer Tileset',
    description: 'Side-view platformer tileset atlas for ground, slopes, ledges, hazards, decor.',
    camera: 'side-tile',
    assetKind: 'tileset',
    extractionMode: 'slots',
    style: 'game-ready side-view platformer tileset art with strong collision surfaces',
    cell: { width: 64, height: 64, safeMarginX: 0, safeMarginY: 0 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('ground', 8, 'solid ground tiles: center, top, side, corner, cap, broken variants', {
        fps: 1,
        loop: false,
      }),
      row('slopes', 8, 'slope and ramp tiles with clean collision-readable silhouettes', {
        fps: 1,
        loop: false,
      }),
      row('ledges', 8, 'platform, bridge, one-way ledge, hanging edge, cracked ledge, supports', {
        fps: 1,
        loop: false,
      }),
      row('hazards', 8, 'spikes, lava edge, thorns, saw base, acid, warning hazard tiles', {
        fps: 1,
        loop: false,
      }),
      row('decor', 8, 'grass tufts, vines, signs, rocks, chains, background trims, decals', {
        fps: 1,
        loop: false,
      }),
    ],
  },
  'texture-pack': {
    id: 'texture-pack',
    label: 'Texture Pack',
    description: 'Seamless material texture atlas for terrain, props, and environment surfaces.',
    camera: 'material-flat',
    assetKind: 'texture',
    extractionMode: 'slots',
    style: 'game-ready seamless material textures, orthographic flat samples, no labels',
    cell: { width: 128, height: 128, safeMarginX: 0, safeMarginY: 0 },
    columns: 6,
    transparent: false,
    formats: ['png', 'webp'],
    rows: [
      row('stone', 6, 'rough block, cracked slate, cobble, carved tile, wet stone, mossy stone', {
        fps: 1,
        loop: false,
      }),
      row('wood', 6, 'plank, bark, worn board, dark beam, painted wood, splintered wood', {
        fps: 1,
        loop: false,
      }),
      row('metal', 6, 'clean steel, rust, brass, scratched plate, riveted panel, dark iron', {
        fps: 1,
        loop: false,
      }),
      row('fabric', 6, 'canvas, wool, leather, stitched cloth, banner weave, padded textile', {
        fps: 1,
        loop: false,
      }),
      row('ground', 6, 'soil, sand, snow, grass, gravel, and mud material samples', {
        fps: 1,
        loop: false,
      }),
    ],
  },
  'asset-pack': {
    id: 'asset-pack',
    label: 'Asset Pack',
    description: 'Mixed still asset atlas for props, pickups, UI icons, VFX, and decals.',
    camera: 'asset',
    assetKind: 'asset',
    extractionMode: 'slots',
    style: 'game-ready isolated asset art, consistent palette, scale, and runtime readability',
    cell: { width: 128, height: 128, safeMarginX: 8, safeMarginY: 8 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [
      row('props', 8, 'crate, barrel, lantern, sign, plant, rock, tool, furniture item', {
        fps: 1,
        loop: false,
      }),
      row('pickups', 8, 'coin, gem, potion, key, scroll, food, ammo, power-up', {
        fps: 1,
        loop: false,
      }),
      row('ui-icons', 8, 'heart, shield, sword, map, bag, gear, star, alert marker', {
        fps: 1,
        loop: false,
      }),
      row(
        'vfx',
        8,
        'impact, spark, smoke puff, flame burst, magic glint, slash arc, splash, dust',
        {
          fps: 1,
          loop: false,
        },
      ),
      row(
        'decals',
        8,
        'crack, scorch, footprint, stain, moss patch, arrow mark, scrape, rune mark',
        {
          fps: 1,
          loop: false,
        },
      ),
    ],
  },
  'custom-asset-atlas': {
    id: 'custom-asset-atlas',
    label: 'Custom Asset Atlas',
    description: 'User-defined still asset, texture, tileset, icon, prop, or VFX atlas contract.',
    camera: 'custom-asset',
    assetKind: 'asset',
    extractionMode: 'slots',
    style: 'custom user-provided game asset style',
    cell: { width: 128, height: 128, safeMarginX: 8, safeMarginY: 8 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [],
  },
  'custom-atlas': {
    id: 'custom-atlas',
    label: 'Custom Atlas',
    description: 'User-defined atlas contract.',
    camera: 'custom',
    assetKind: 'custom',
    extractionMode: 'components',
    style: 'custom user-provided sprite atlas style',
    cell: { width: 128, height: 128, safeMarginX: 16, safeMarginY: 16 },
    columns: 8,
    transparent: true,
    formats: ['png', 'webp'],
    rows: [],
  },
} satisfies Record<SpriteAtlasPresetId, SpriteAtlasPresetDefinition>;

export interface CreateSpriteAtlasRunRequest {
  title?: string;
  presetId?: SpriteAtlasPresetId;
  prompt?: string;
  stylePreset?: string;
  customStyle?: string | null;
  frameBudget?: SpriteAtlasFrameBudget;
  backgroundRemoval?: SpriteAtlasBackgroundRemoval;
  chromaKey?: string;
  qaMode?: 'standard' | 'strict';
}

export interface CreateSpriteAtlasRowJobRequest {
  rowId: string;
}

export interface CreateSpriteAtlasRowJobsRequest {
  rowIds?: string[];
}

export interface CreateSpriteAtlasRowJobsResponse {
  jobs: SpriteAtlasRowHandoffJob[];
  run: SpriteAtlasRun;
}

export interface SpriteAtlasRowPromptResponse {
  rowId: string;
  prompt: string;
  promptPath: string;
}

export interface ImportSpriteAtlasRowRequest {
  rowId: string;
  sourcePath?: string | null;
  blocked?: SpriteAtlasBlockedReason | null;
}

export interface SpriteAtlasRowHandoffJob {
  jobId: string;
  runId: string;
  rowId: string;
  status: 'ready';
  requestPath: string;
  promptPath: string;
  layoutGuidePath: string;
  identityAnchorPath: string | null;
  expectedOutputPath: string;
  outboxPattern: string;
  createdAt: string;
}

export function isSpriteAtlasPresetId(value: string): value is SpriteAtlasPresetId {
  return SPRITE_ATLAS_PRESET_IDS.includes(value as SpriteAtlasPresetId);
}

export function isSpriteAtlasFrameBudget(value: string): value is SpriteAtlasFrameBudget {
  return SPRITE_ATLAS_FRAME_BUDGETS.includes(value as SpriteAtlasFrameBudget);
}

export function isSpriteAtlasBackgroundRemoval(
  value: string,
): value is SpriteAtlasBackgroundRemoval {
  return SPRITE_ATLAS_BACKGROUND_REMOVAL.includes(value as SpriteAtlasBackgroundRemoval);
}

export function isSpriteAtlasBlockedReasonKind(
  value: string,
): value is SpriteAtlasBlockedReasonKind {
  return SPRITE_ATLAS_BLOCKED_REASON_KINDS.includes(value as SpriteAtlasBlockedReasonKind);
}

function readString(params: Record<string, unknown>, key: string, fallback = '') {
  const value = params[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(params: Record<string, unknown>, key: string, fallback: number) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readStringList(params: Record<string, unknown>, key: string, fallback: string[]) {
  const value = params[key];
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.flatMap((item) =>
    typeof item === 'string' && item.trim() ? [item.trim()] : [],
  );
  return cleaned.length > 0 ? cleaned : fallback;
}

function isQaMode(value: string): value is SpriteAtlasContract['qaMode'] {
  return value === 'standard' || value === 'strict';
}

export function createSpriteAtlasPresetSummaries(): SpriteAtlasPresetSummary[] {
  return SPRITE_ATLAS_PRESET_IDS.map((presetId) => {
    const preset = SPRITE_ATLAS_PRESET_DEFINITIONS[presetId];
    return {
      id: preset.id,
      label: preset.label,
      description: preset.description,
      assetKind: preset.assetKind,
      rows: preset.rows.length,
      frames: preset.rows.reduce((total, presetRow) => total + presetRow.frames, 0),
      cell: preset.cell,
      columns: preset.columns,
    };
  });
}

export function createSpriteAtlasContract(
  params: Record<string, unknown> | null | undefined = {},
): SpriteAtlasContract {
  const input = params ?? {};
  const requestedPresetId = readString(input, 'presetId', 'platformer-character');
  const presetId = isSpriteAtlasPresetId(requestedPresetId)
    ? requestedPresetId
    : 'platformer-character';
  const preset = SPRITE_ATLAS_PRESET_DEFINITIONS[presetId];
  const frameBudgetValue = readString(input, 'frameBudget', 'preset');
  const backgroundRemovalValue = readString(input, 'backgroundRemoval', 'chroma');
  const qaModeValue = readString(input, 'qaMode', 'standard');
  const stylePreset = readString(input, 'stylePreset', preset.style || 'pixel-art');
  const customStyle = readString(input, 'customStyle');
  const cellWidth = Math.max(16, Math.round(readNumber(input, 'cellWidth', preset.cell.width)));
  const cellHeight = Math.max(16, Math.round(readNumber(input, 'cellHeight', preset.cell.height)));
  const columns = Math.max(1, Math.round(readNumber(input, 'columns', preset.columns)));
  const formats = readStringList(input, 'formats', preset.formats);

  return {
    presetId,
    assetKind: preset.assetKind,
    extractionMode: preset.extractionMode,
    stylePreset,
    customStyle: customStyle || null,
    frameBudget: isSpriteAtlasFrameBudget(frameBudgetValue) ? frameBudgetValue : 'preset',
    backgroundRemoval: isSpriteAtlasBackgroundRemoval(backgroundRemovalValue)
      ? backgroundRemovalValue
      : 'chroma',
    chromaKey: readString(input, 'chromaKey', '#00FF00'),
    camera: preset.camera,
    columns,
    transparent: preset.transparent,
    formats,
    cell: {
      width: cellWidth,
      height: cellHeight,
      safeMarginX: Math.max(
        0,
        Math.round(readNumber(input, 'safeMarginX', preset.cell.safeMarginX)),
      ),
      safeMarginY: Math.max(
        0,
        Math.round(readNumber(input, 'safeMarginY', preset.cell.safeMarginY)),
      ),
    },
    rows: preset.rows.map((presetRow) => ({
      id: presetRow.id,
      frames: Math.max(1, Math.round(presetRow.frames)),
      fps: Math.max(1, Math.round(presetRow.fps ?? 8)),
      loop: presetRow.loop ?? true,
      action: presetRow.action ?? '',
      mirrorPair: presetRow.mirrorPair ?? null,
    })),
    qaMode: isQaMode(qaModeValue) ? qaModeValue : 'standard',
  };
}
