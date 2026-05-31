import {
  createGenerationTaskSpec,
  type GenerationQualityPresetId,
  type GenerationProviderId,
  type GenerationTaskKind,
} from '../packages/shared/src/generationContracts';
import { getImageGenSizeForRatio } from '../utils/imageGenSizing';
import type { ImageGenerationConfig, RecipeId } from '../types';
import { RECIPE_CONTEXT_BUILDERS } from './recipeContextBuilders';
import type { RecipeContextParams } from './recipeContextBuilders';
import { buildRecipeProviderDirectives } from './recipeProviderDirectives';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export type RecipeParameterKind = 'string' | 'number' | 'boolean' | 'record' | 'enum' | 'color';
export type RecipeParameterControlKind =
  | 'text'
  | 'select'
  | 'slider'
  | 'toggle'
  | 'color'
  | 'record';

export interface RecipeParameterDescriptor {
  id: string;
  label: string;
  kind: RecipeParameterKind;
  group?: string;
  control?: RecipeParameterControlKind;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface RecipeModule {
  id: RegisteredRecipeId;
  title: string;
  description: string;
  defaultTask: GenerationTaskKind;
  supportedTasks: GenerationTaskKind[];
  supportedProviders: GenerationProviderId[];
  parameters: RecipeParameterDescriptor[];
  buildContext(params: RecipeContextParams | null | undefined): string;
}

export interface BuildGenerationTaskSpecFromRecipeArgs {
  id: string;
  providerId?: GenerationProviderId | null;
  config: ImageGenerationConfig;
  task?: GenerationTaskKind;
}

const CODEX_FIRST_PROVIDERS: GenerationProviderId[] = ['codex', 'dry_run'];

const RECIPE_LIST_ORDER: RegisteredRecipeId[] = [
  'styles',
  'remaster',
  'spritesheet',
  'cinematic',
  'character',
  'camera',
  'timeline',
];

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
    'Lighting Correction',
    'Volumetric Light',
    'Studio Lighting',
    'Natural Light',
    'Golden Hour',
    'Dramatic Contrast',
  ],
  camera: ['Sharp Focus', 'Depth of Field', 'Texture Enhancement', 'Wide Angle'],
  anatomy: ['Fix Anatomy', 'Improve Faces and Eyes', 'Fix Hands', 'Skin Detail'],
  text: ['Keep Original', 'Remove Text', 'Rewrite Logically'],
  color: ['Expanded Dynamic Range', 'Natural Colors', 'Deep Vibrance', 'Color Correction'],
} as const;

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
  background: ['Dark Grey', 'Black', 'Chroma Green', 'White', 'Checkerboard', 'Custom'],
  dividers: ['No Dividers', 'Red Lines', 'Blue Lines', 'Black Lines', 'White Lines'],
} as const;

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

const TIMELINE_OPTIONS = {
  direction: ['forward', 'backward'],
  timeDeltaLabel: ['Split Second', 'Seconds', 'Minutes', 'Hours', 'Years'],
  cameraMode: ['locked', 'dynamic'],
  motionAmount: ['Static', 'Subtle', 'Cinematic', 'High Action'],
  lightingMode: ['Locked', 'Evolving', 'Flickering'],
} as const;

function options(values: readonly string[]) {
  return [...values];
}

export function buildRecipeModuleContext(
  recipeId: RegisteredRecipeId | null | undefined,
  params: RecipeContextParams | null | undefined,
) {
  if (!recipeId || !params) {
    return '';
  }

  const builder = RECIPE_CONTEXT_BUILDERS[recipeId];
  if (!builder) {
    return '';
  }

  return builder.buildContext(params);
}

function createRecipeModule(
  module: Omit<RecipeModule, 'supportedProviders' | 'buildContext'> & {
    supportedProviders?: GenerationProviderId[];
  },
): RecipeModule {
  return {
    ...module,
    supportedProviders: module.supportedProviders ?? CODEX_FIRST_PROVIDERS,
    buildContext(params) {
      return buildRecipeModuleContext(module.id, params);
    },
  };
}

export const RECIPE_MODULES: Record<RegisteredRecipeId, RecipeModule> = {
  remaster: createRecipeModule({
    id: 'remaster',
    title: 'Remaster',
    description: 'Restore or reinterpret a reference image with controlled fidelity.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      {
        id: 'style',
        label: 'Style Interpretation',
        kind: 'enum',
        control: 'select',
        group: 'aesthetic',
        defaultValue: 'Realistic Reconstruction',
        options: options(REMASTER_OPTIONS.style),
      },
      {
        id: 'lighting',
        label: 'Lighting Correction',
        kind: 'enum',
        control: 'select',
        group: 'look',
        defaultValue: 'Lighting Correction',
        options: options(REMASTER_OPTIONS.lighting),
      },
      {
        id: 'camera',
        label: 'Lens And Detail',
        kind: 'enum',
        control: 'select',
        group: 'look',
        defaultValue: 'Sharp Focus',
        options: options(REMASTER_OPTIONS.camera),
      },
      {
        id: 'anatomy',
        label: 'Anatomy Handling',
        kind: 'enum',
        control: 'select',
        group: 'correction',
        defaultValue: 'Fix Anatomy',
        options: options(REMASTER_OPTIONS.anatomy),
      },
      {
        id: 'text',
        label: 'Text Handling',
        kind: 'enum',
        control: 'select',
        group: 'correction',
        defaultValue: 'Rewrite Logically',
        options: options(REMASTER_OPTIONS.text),
      },
      {
        id: 'color',
        label: 'Color Grading',
        kind: 'enum',
        control: 'select',
        group: 'look',
        defaultValue: 'Expanded Dynamic Range',
        options: options(REMASTER_OPTIONS.color),
      },
      {
        id: 'fidelity',
        label: 'Fidelity',
        kind: 'number',
        control: 'slider',
        group: 'source',
        defaultValue: 35,
        min: 0,
        max: 100,
        step: 1,
      },
    ],
  }),
  spritesheet: createRecipeModule({
    id: 'spritesheet',
    title: 'Sprite Sheet',
    description: 'Generate game-ready sprite grids or strips from text and references.',
    defaultTask: 'sprite_sheet',
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
  }),
  cinematic: createRecipeModule({
    id: 'cinematic',
    title: 'Cinematic Storyboard',
    description: 'Build storyboard grids with shot, lens, tone, and continuity controls.',
    defaultTask: 'image_generate',
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
  }),
  character: createRecipeModule({
    id: 'character',
    title: 'Character Sheet',
    description: 'Generate character reference sheets with layout, shot, and style controls.',
    defaultTask: 'image_generate',
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
  }),
  styles: createRecipeModule({
    id: 'styles',
    title: 'Styles',
    description: 'Browse and apply styles, or generate style-card assets.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
    parameters: [
      {
        id: 'presetId',
        label: 'Preset ID',
        kind: 'string',
        control: 'text',
        group: 'identity',
        required: true,
      },
      {
        id: 'presetName',
        label: 'Preset Name',
        kind: 'string',
        control: 'text',
        group: 'identity',
        required: true,
      },
      {
        id: 'mode',
        label: 'Mode',
        kind: 'enum',
        control: 'select',
        group: 'application',
        options: [
          'PACK_CATEGORY_BASE_STYLE_APPLICATION',
          'CREATIVE_REIMAGINING',
          'STRUCTURAL_PRESERVATION',
          'DIRECT_STYLE_SYNTHESIS',
        ],
      },
      {
        id: 'roleInstruction',
        label: 'Role Instruction',
        kind: 'string',
        control: 'text',
        group: 'application',
      },
      {
        id: 'compositionRule',
        label: 'Composition Rule',
        kind: 'string',
        control: 'text',
        group: 'application',
      },
      {
        id: 'styleEmphasis',
        label: 'Style Emphasis',
        kind: 'string',
        control: 'text',
        group: 'application',
      },
      { id: 'aesthetic', label: 'Aesthetic', kind: 'string', control: 'text', group: 'visual-dna' },
      {
        id: 'subjectTreatment',
        label: 'Subject Treatment',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'colorTone',
        label: 'Color And Tone',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'lightingShadow',
        label: 'Lighting And Shadow',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'textureMaterial',
        label: 'Texture And Material',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'cameraComposition',
        label: 'Camera And Composition',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'atmosphereMood',
        label: 'Atmosphere And Mood',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
      {
        id: 'renderingQuality',
        label: 'Rendering And Quality',
        kind: 'string',
        control: 'text',
        group: 'visual-dna',
      },
    ],
  }),
  camera: createRecipeModule({
    id: 'camera',
    title: 'Camera View',
    description: 'Generate alternate camera views from orbit, pitch, zoom, and framing.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      {
        id: 'azimuth',
        label: 'Azimuth',
        kind: 'number',
        control: 'slider',
        group: 'orbit',
        defaultValue: 0,
        min: -180,
        max: 180,
        step: 1,
      },
      {
        id: 'elevation',
        label: 'Elevation',
        kind: 'number',
        control: 'slider',
        group: 'orbit',
        defaultValue: 0,
        min: -85,
        max: 85,
        step: 1,
      },
      {
        id: 'distance',
        label: 'Distance',
        kind: 'number',
        control: 'slider',
        group: 'orbit',
        defaultValue: 100,
        min: 20,
        max: 200,
        step: 1,
      },
      {
        id: 'hasReference',
        label: 'Has Reference',
        kind: 'boolean',
        control: 'toggle',
        group: 'source',
        defaultValue: false,
      },
      {
        id: 'hPos',
        label: 'Horizontal Position',
        kind: 'string',
        control: 'text',
        group: 'derived',
      },
      { id: 'vPos', label: 'Vertical Position', kind: 'string', control: 'text', group: 'derived' },
      { id: 'framing', label: 'Framing', kind: 'string', control: 'text', group: 'derived' },
      {
        id: 'geometryConstraints',
        label: 'Geometry Constraints',
        kind: 'string',
        control: 'text',
        group: 'derived',
      },
    ],
  }),
  timeline: createRecipeModule({
    id: 'timeline',
    title: 'Timeline Frame',
    description: 'Generate neighboring storyboard frames with motion and continuity controls.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      {
        id: 'nextIndex',
        label: 'Sequence Index',
        kind: 'number',
        control: 'text',
        group: 'sequence',
        defaultValue: 1,
      },
      {
        id: 'direction',
        label: 'Direction',
        kind: 'enum',
        control: 'select',
        group: 'sequence',
        defaultValue: 'forward',
        options: options(TIMELINE_OPTIONS.direction),
      },
      {
        id: 'timeDeltaValue',
        label: 'Time Delta Value',
        kind: 'string',
        control: 'text',
        group: 'time',
      },
      {
        id: 'timeDeltaLabel',
        label: 'Time Delta Label',
        kind: 'enum',
        control: 'select',
        group: 'time',
        defaultValue: 'Seconds',
        options: options(TIMELINE_OPTIONS.timeDeltaLabel),
      },
      {
        id: 'cameraMode',
        label: 'Camera Mode',
        kind: 'enum',
        control: 'select',
        group: 'camera',
        defaultValue: 'locked',
        options: options(TIMELINE_OPTIONS.cameraMode),
      },
      {
        id: 'motionAmount',
        label: 'Motion Amount',
        kind: 'enum',
        control: 'select',
        group: 'physics',
        defaultValue: 'Subtle',
        options: options(TIMELINE_OPTIONS.motionAmount),
      },
      {
        id: 'lightingMode',
        label: 'Lighting Mode',
        kind: 'enum',
        control: 'select',
        group: 'physics',
        defaultValue: 'Locked',
        options: options(TIMELINE_OPTIONS.lightingMode),
      },
      {
        id: 'isAnchored',
        label: 'Is Anchored',
        kind: 'boolean',
        control: 'toggle',
        group: 'source',
        defaultValue: false,
      },
    ],
  }),
};

export function getRecipeModule(recipeId: RegisteredRecipeId | null | undefined) {
  return recipeId ? RECIPE_MODULES[recipeId] : null;
}

export function listRecipeModules() {
  return RECIPE_LIST_ORDER.map((recipeId) => RECIPE_MODULES[recipeId]);
}

export function getRecipeParameter(module: RecipeModule, parameterId: string) {
  return module.parameters.find((parameter) => parameter.id === parameterId) ?? null;
}

export function getRecipeParameterOptions(module: RecipeModule, parameterId: string) {
  return getRecipeParameter(module, parameterId)?.options ?? [];
}

export function isRecipeTaskSupported(module: RecipeModule, task: GenerationTaskKind) {
  return module.supportedTasks.includes(task);
}

export function isRecipeProviderSupported(
  module: RecipeModule,
  providerId: GenerationProviderId | null | undefined,
) {
  return !providerId || module.supportedProviders.includes(providerId);
}

export function createRecipeDefaultParams(module: RecipeModule) {
  return module.parameters.reduce<Record<string, unknown>>((params, parameter) => {
    if ('defaultValue' in parameter) {
      params[parameter.id] = parameter.defaultValue;
    }
    return params;
  }, {});
}

export function validateRecipeParams(
  module: RecipeModule,
  params: Record<string, unknown> | null | undefined,
) {
  const errors: string[] = [];
  const input = params ?? {};

  for (const parameter of module.parameters) {
    const value = input[parameter.id];
    if (parameter.required && (value === undefined || value === null || value === '')) {
      errors.push(`Recipe Module ${module.id} requires parameter ${parameter.id}.`);
      continue;
    }
    if (value === undefined || value === null) continue;

    if (parameter.kind === 'number' && typeof value !== 'number') {
      errors.push(`Recipe Module ${module.id} parameter ${parameter.id} must be a number.`);
    }
    if (parameter.kind === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Recipe Module ${module.id} parameter ${parameter.id} must be a boolean.`);
    }
    if (parameter.kind === 'record' && (typeof value !== 'object' || Array.isArray(value))) {
      errors.push(`Recipe Module ${module.id} parameter ${parameter.id} must be a record.`);
    }
    const optionValue =
      typeof value === 'string' || typeof value === 'number' ? String(value) : null;
    if (
      (parameter.kind === 'enum' || parameter.options?.length) &&
      optionValue &&
      parameter.options &&
      !new Set(parameter.options).has(optionValue)
    ) {
      errors.push(
        `Recipe Module ${module.id} parameter ${parameter.id} has unsupported option: ${optionValue}.`,
      );
    }
    if (parameter.kind === 'number' && typeof value === 'number') {
      if (parameter.min !== undefined && value < parameter.min) {
        errors.push(
          `Recipe Module ${module.id} parameter ${parameter.id} is below minimum ${parameter.min}.`,
        );
      }
      if (parameter.max !== undefined && value > parameter.max) {
        errors.push(
          `Recipe Module ${module.id} parameter ${parameter.id} is above maximum ${parameter.max}.`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildGenerationTaskSpecFromRecipe({
  id,
  providerId = null,
  config,
  task,
}: BuildGenerationTaskSpecFromRecipeArgs) {
  const module = getRecipeModule(config.recipeId ?? null);
  const recipeContext =
    module?.buildContext(config.recipeParams ?? null) || config.recipeContext || '';
  const recipeProviderDirectives = module
    ? buildRecipeProviderDirectives(module, config.recipeParams ?? null)
    : null;
  const prompt = config.prompt || 'Generate a high-quality image.';
  const taskKind = task ?? module?.defaultTask ?? 'image_generate';
  const resolvedImageSize = config.aspectRatio
    ? getImageGenSizeForRatio(config.aspectRatio).size
    : (config.imageSize ?? null);

  if (module && !isRecipeTaskSupported(module, taskKind)) {
    throw new Error(`Recipe Module ${module.id} does not support task ${taskKind}.`);
  }
  if (module && !isRecipeProviderSupported(module, providerId)) {
    throw new Error(`Recipe Module ${module.id} does not support provider ${providerId}.`);
  }
  if (module) {
    const validation = validateRecipeParams(module, config.recipeParams ?? null);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
  }

  const qualityPresetId = resolveRecipeQualityPresetId({
    task: taskKind,
    recipeId: config.recipeId ?? null,
    hasAttachments: config.attachments.length > 0,
  });

  return createGenerationTaskSpec({
    id,
    task: taskKind,
    providerId,
    prompt,
    negativePrompt: config.negativePrompt ?? null,
    recipeId: config.recipeId ?? null,
    recipeParams: config.recipeParams ?? null,
    stylePresetId:
      config.recipeId === 'styles' && typeof config.recipeParams?.presetId === 'string'
        ? config.recipeParams.presetId
        : null,
    assets: config.attachments.map((attachment) => ({
      role: 'reference' as const,
      name: attachment.name,
      dataUrl: attachment.dataUrl,
      strength: attachment.strength,
    })),
    quality: {
      qualityPresetId,
      subject: null,
      composition: null,
      style:
        config.recipeId === 'styles' && typeof config.recipeParams?.presetName === 'string'
          ? config.recipeParams.presetName
          : null,
      lighting: null,
      color:
        typeof config.recipeParams?.colorTone === 'string' ? config.recipeParams.colorTone : null,
      materials: null,
      constraints: [],
      negative: [],
      referenceRoles: config.attachments.map((attachment) => ({
        role: 'reference' as const,
        assetName: attachment.name,
        instruction:
          config.recipeId === 'styles'
            ? 'Use as style and mood reference while preserving the requested subject.'
            : 'Use as visual reference according to the requested generation task.',
      })),
    },
    output: {
      count: config.batchCount,
      aspectRatio: config.aspectRatio,
      imageSize: resolvedImageSize,
      mimeType: 'image/png',
      requiresCatalogEntry: true,
      requiresExactPath: true,
      requiresLocalAsset: true,
    },
    metadata: {
      recipeContext,
      recipeProviderDirectives,
      recipeModule: module
        ? {
            id: module.id,
            title: module.title,
            defaultTask: module.defaultTask,
            supportedTasks: module.supportedTasks,
            supportedProviders: module.supportedProviders,
          }
        : null,
      execution: {
        model: config.executionModel,
        reasoningEffort: config.executionReasoningEffort,
        serviceTier: config.executionSpeed,
      },
    },
  });
}

function resolveRecipeQualityPresetId({
  task,
  recipeId,
  hasAttachments,
}: {
  task: GenerationTaskKind;
  recipeId: RecipeId;
  hasAttachments: boolean;
}): GenerationQualityPresetId {
  if (task === 'image_edit') return 'image_edit';
  if (task === 'sprite_sheet') return 'sprite_sheet';
  if (task === 'texture_generate') return 'texture';
  if (recipeId === 'styles' && hasAttachments) return 'style_reference';
  if (task === 'style_preset_card') return 'product_or_ui_asset';
  return 'image_general';
}
