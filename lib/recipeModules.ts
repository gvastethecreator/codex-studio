import type { GenerationProviderId, GenerationTaskKind } from '../packages/shared/src';
import { createGenerationTaskSpec } from '../packages/shared/src';
import type { ImageGenerationConfig, RecipeId } from '../types';
import { buildRecipeContext } from './recipeContext';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export type RecipeParameterKind = 'string' | 'number' | 'boolean' | 'record' | 'enum' | 'color';

export interface RecipeParameterDescriptor {
  id: string;
  label: string;
  kind: RecipeParameterKind;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
}

export interface RecipeModule {
  id: RegisteredRecipeId;
  title: string;
  description: string;
  defaultTask: GenerationTaskKind;
  supportedTasks: GenerationTaskKind[];
  supportedProviders: GenerationProviderId[];
  parameters: RecipeParameterDescriptor[];
  buildContext(params: Record<string, unknown> | null | undefined): string;
}

export interface BuildGenerationTaskSpecFromRecipeArgs {
  id: string;
  providerId?: GenerationProviderId | null;
  config: ImageGenerationConfig;
  task?: GenerationTaskKind;
}

const CODEX_FIRST_PROVIDERS: GenerationProviderId[] = ['codex', 'dry_run'];

function createRecipeModule(
  module: Omit<RecipeModule, 'supportedProviders' | 'buildContext'> & {
    supportedProviders?: GenerationProviderId[];
  },
): RecipeModule {
  return {
    ...module,
    supportedProviders: module.supportedProviders ?? CODEX_FIRST_PROVIDERS,
    buildContext(params) {
      return buildRecipeContext(module.id, params);
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
      { id: 'style', label: 'Style Interpretation', kind: 'string' },
      { id: 'lighting', label: 'Lighting Correction', kind: 'string' },
      { id: 'camera', label: 'Lens And Detail', kind: 'string' },
      { id: 'anatomy', label: 'Anatomy Handling', kind: 'string' },
      { id: 'text', label: 'Text Handling', kind: 'string' },
      { id: 'color', label: 'Color Grading', kind: 'string' },
      { id: 'fidelity', label: 'Fidelity', kind: 'number', defaultValue: 35 },
    ],
  }),
  spritesheet: createRecipeModule({
    id: 'spritesheet',
    title: 'Sprite Sheet',
    description: 'Generate game-ready sprite grids or strips from text and references.',
    defaultTask: 'sprite_sheet',
    supportedTasks: ['sprite_sheet', 'image_generate', 'image_edit'],
    parameters: [
      { id: 'view', label: 'View', kind: 'string' },
      { id: 'style', label: 'Style', kind: 'string' },
      { id: 'grid', label: 'Grid', kind: 'string', defaultValue: '2x2' },
      { id: 'background', label: 'Background', kind: 'string' },
      { id: 'dividers', label: 'Dividers', kind: 'string' },
      { id: 'customColor', label: 'Custom Color', kind: 'color' },
      { id: 'cellPrompts', label: 'Cell Prompts', kind: 'record' },
    ],
  }),
  cinematic: createRecipeModule({
    id: 'cinematic',
    title: 'Cinematic Storyboard',
    description: 'Build storyboard grids with shot, lens, tone, and continuity controls.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      { id: 'frames', label: 'Frames', kind: 'number', defaultValue: 9 },
      { id: 'rows', label: 'Rows', kind: 'number', defaultValue: 3 },
      { id: 'cols', label: 'Columns', kind: 'number', defaultValue: 3 },
      { id: 'aspectRatio', label: 'Aspect Ratio', kind: 'string' },
      { id: 'frameShots', label: 'Frame Shots', kind: 'record' },
      { id: 'genre', label: 'Genre', kind: 'string' },
      { id: 'tone', label: 'Tone', kind: 'string' },
      { id: 'lighting', label: 'Lighting', kind: 'string' },
      { id: 'time', label: 'Time', kind: 'string' },
      { id: 'weather', label: 'Weather', kind: 'string' },
      { id: 'movement', label: 'Camera Movement', kind: 'string' },
      { id: 'lens', label: 'Lens', kind: 'string' },
    ],
  }),
  character: createRecipeModule({
    id: 'character',
    title: 'Character Sheet',
    description: 'Generate character reference sheets with layout, shot, and style controls.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      { id: 'layout', label: 'Layout', kind: 'string' },
      { id: 'style', label: 'Style', kind: 'string' },
      { id: 'shot', label: 'Shot', kind: 'string' },
      { id: 'focus', label: 'Design Focus', kind: 'string' },
      { id: 'hasReference', label: 'Has Reference', kind: 'boolean' },
    ],
  }),
  styles: createRecipeModule({
    id: 'styles',
    title: 'Style Preset',
    description: 'Apply a Style Preset Manifest or generate preset-card assets.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
    parameters: [
      { id: 'presetId', label: 'Preset ID', kind: 'string', required: true },
      { id: 'presetName', label: 'Preset Name', kind: 'string', required: true },
      { id: 'mode', label: 'Mode', kind: 'string' },
      { id: 'roleInstruction', label: 'Role Instruction', kind: 'string' },
      { id: 'compositionRule', label: 'Composition Rule', kind: 'string' },
      { id: 'styleEmphasis', label: 'Style Emphasis', kind: 'string' },
      { id: 'aesthetic', label: 'Aesthetic', kind: 'string' },
      { id: 'subjectTreatment', label: 'Subject Treatment', kind: 'string' },
      { id: 'colorTone', label: 'Color And Tone', kind: 'string' },
      { id: 'lightingShadow', label: 'Lighting And Shadow', kind: 'string' },
      { id: 'textureMaterial', label: 'Texture And Material', kind: 'string' },
      { id: 'cameraComposition', label: 'Camera And Composition', kind: 'string' },
      { id: 'atmosphereMood', label: 'Atmosphere And Mood', kind: 'string' },
      { id: 'renderingQuality', label: 'Rendering And Quality', kind: 'string' },
    ],
  }),
  camera: createRecipeModule({
    id: 'camera',
    title: 'Camera View',
    description: 'Generate alternate camera views from orbit, pitch, zoom, and framing.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      { id: 'azimuth', label: 'Azimuth', kind: 'number', defaultValue: 0 },
      { id: 'elevation', label: 'Elevation', kind: 'number', defaultValue: 0 },
      { id: 'distance', label: 'Distance', kind: 'number', defaultValue: 100 },
      { id: 'hasReference', label: 'Has Reference', kind: 'boolean' },
      { id: 'hPos', label: 'Horizontal Position', kind: 'string' },
      { id: 'vPos', label: 'Vertical Position', kind: 'string' },
      { id: 'framing', label: 'Framing', kind: 'string' },
      { id: 'geometryConstraints', label: 'Geometry Constraints', kind: 'string' },
    ],
  }),
  timeline: createRecipeModule({
    id: 'timeline',
    title: 'Timeline Frame',
    description: 'Generate neighboring storyboard frames with motion and continuity controls.',
    defaultTask: 'image_generate',
    supportedTasks: ['image_generate', 'image_edit'],
    parameters: [
      { id: 'nextIndex', label: 'Sequence Index', kind: 'number' },
      { id: 'direction', label: 'Direction', kind: 'string' },
      { id: 'timeDeltaValue', label: 'Time Delta Value', kind: 'string' },
      { id: 'timeDeltaLabel', label: 'Time Delta Label', kind: 'string' },
      { id: 'cameraMode', label: 'Camera Mode', kind: 'string' },
      { id: 'motionAmount', label: 'Motion Amount', kind: 'string' },
      { id: 'lightingMode', label: 'Lighting Mode', kind: 'string' },
      { id: 'isAnchored', label: 'Is Anchored', kind: 'boolean' },
    ],
  }),
};

export function getRecipeModule(recipeId: RegisteredRecipeId | null | undefined) {
  return recipeId ? RECIPE_MODULES[recipeId] : null;
}

export function listRecipeModules() {
  return Object.values(RECIPE_MODULES);
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

export function buildGenerationTaskSpecFromRecipe({
  id,
  providerId = null,
  config,
  task,
}: BuildGenerationTaskSpecFromRecipeArgs) {
  const module = getRecipeModule(config.recipeId ?? null);
  const recipeContext =
    module?.buildContext(config.recipeParams ?? null) || config.recipeContext || '';
  const prompt = config.prompt || 'Generate a high-quality image.';
  const taskKind = task ?? module?.defaultTask ?? 'image_generate';

  if (module && !isRecipeTaskSupported(module, taskKind)) {
    throw new Error(`Recipe Module ${module.id} does not support task ${taskKind}.`);
  }
  if (module && !isRecipeProviderSupported(module, providerId)) {
    throw new Error(`Recipe Module ${module.id} does not support provider ${providerId}.`);
  }

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
    output: {
      count: config.batchCount,
      aspectRatio: config.aspectRatio,
      imageSize: config.imageSize ?? null,
      mimeType: 'image/png',
      requiresCatalogEntry: true,
      requiresExactPath: true,
      requiresLocalAsset: true,
    },
    metadata: {
      recipeContext,
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
