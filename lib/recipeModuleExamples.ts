import {
  createGenerationTaskSpec,
  isGenerationTaskKind,
  type GenerationProviderId,
  type GenerationTaskKind,
} from '../packages/shared/src/generationContracts';
import type { RecipeParameterDescriptor } from './recipeModules';

export type RecipeModuleExampleId = 'sprite-sheet-grid-v1' | 'texture-material-tile-v1';

export interface RecipeModuleExample {
  id: RecipeModuleExampleId;
  moduleId: string;
  title: string;
  task: GenerationTaskKind;
  prompt: string;
  negativePrompt: string | null;
  supportedProviders: GenerationProviderId[];
  parameters: RecipeParameterDescriptor[];
  recipeParams: Record<string, unknown>;
  output: {
    count: number;
    aspectRatio: string;
    imageSize: string;
  };
  activation: 'example_only';
  providerBoundary: 'provider_independent';
}

export interface RecipeModuleExampleValidation {
  valid: boolean;
  errors: string[];
}

const EXAMPLE_PROVIDERS: GenerationProviderId[] = ['codex', 'dry_run'];
const REQUIRED_EXAMPLE_TASKS: GenerationTaskKind[] = ['sprite_sheet', 'texture_generate'];

export const RECIPE_MODULE_EXAMPLES: RecipeModuleExample[] = [
  {
    id: 'sprite-sheet-grid-v1',
    moduleId: 'spritesheet',
    title: 'Sprite Sheet Grid',
    task: 'sprite_sheet',
    prompt: 'small fantasy hero idle and run poses, readable game sprite silhouettes',
    negativePrompt: 'text, watermark, cropped limbs, inconsistent character',
    supportedProviders: EXAMPLE_PROVIDERS,
    parameters: [
      {
        id: 'grid',
        label: 'Grid',
        kind: 'enum',
        control: 'select',
        group: 'layout',
        defaultValue: '4x2',
        options: ['2x2', '4x2', '4x4', '1x6 Strip'],
      },
      {
        id: 'view',
        label: 'View',
        kind: 'enum',
        control: 'select',
        group: 'camera',
        defaultValue: 'Side Scroll',
        options: ['Side Scroll', 'Isometric', 'Top Down'],
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
    recipeParams: {
      grid: '4x2',
      view: 'Side Scroll',
      cellPrompts: {
        0: 'idle frame 1',
        1: 'idle frame 2',
        2: 'run contact',
        3: 'run passing',
      },
    },
    output: {
      count: 1,
      aspectRatio: '1:1',
      imageSize: '1K',
    },
    activation: 'example_only',
    providerBoundary: 'provider_independent',
  },
  {
    id: 'texture-material-tile-v1',
    moduleId: 'texture-material',
    title: 'Texture Material Tile',
    task: 'texture_generate',
    prompt: 'seamless stylized basalt floor material, tileable square texture, clear albedo detail',
    negativePrompt: 'perspective scene, object render, labels, watermark, non-tileable seams',
    supportedProviders: EXAMPLE_PROVIDERS,
    parameters: [
      {
        id: 'materialFamily',
        label: 'Material Family',
        kind: 'enum',
        control: 'select',
        group: 'material',
        defaultValue: 'Stone',
        options: ['Stone', 'Wood', 'Metal', 'Fabric', 'Organic'],
      },
      {
        id: 'tileable',
        label: 'Tileable',
        kind: 'boolean',
        control: 'toggle',
        group: 'layout',
        defaultValue: true,
      },
      {
        id: 'mapTargets',
        label: 'Map Targets',
        kind: 'record',
        control: 'record',
        group: 'outputs',
        defaultValue: {
          albedo: true,
          normal: false,
          roughness: false,
        },
      },
    ],
    recipeParams: {
      materialFamily: 'Stone',
      tileable: true,
      mapTargets: {
        albedo: true,
        normal: false,
        roughness: false,
      },
    },
    output: {
      count: 1,
      aspectRatio: '1:1',
      imageSize: '1K',
    },
    activation: 'example_only',
    providerBoundary: 'provider_independent',
  },
];

export function buildRecipeModuleExampleSpec(example: RecipeModuleExample) {
  return createGenerationTaskSpec({
    id: example.id,
    task: example.task,
    providerId: null,
    prompt: example.prompt,
    negativePrompt: example.negativePrompt,
    recipeId: example.moduleId,
    recipeParams: example.recipeParams,
    output: {
      count: example.output.count,
      aspectRatio: example.output.aspectRatio,
      imageSize: example.output.imageSize,
      mimeType: 'image/png',
      requiresCatalogEntry: true,
      requiresExactPath: true,
      requiresLocalAsset: true,
    },
    metadata: {
      recipeModuleExample: {
        id: example.id,
        title: example.title,
        activation: example.activation,
        providerBoundary: example.providerBoundary,
        supportedProviders: example.supportedProviders,
      },
    },
  });
}

export function validateRecipeModuleExamples(
  examples: RecipeModuleExample[] = RECIPE_MODULE_EXAMPLES,
): RecipeModuleExampleValidation {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const coveredTasks = new Set<GenerationTaskKind>();
  const exampleProvidersSet = new Set(EXAMPLE_PROVIDERS);

  for (const example of examples) {
    const taskValue = String(example.task);

    if (seenIds.has(example.id)) errors.push(`Duplicate Recipe Module example id: ${example.id}`);
    seenIds.add(example.id);

    if (!example.moduleId.trim())
      errors.push(`Recipe Module example ${example.id} has no moduleId.`);
    if (!example.prompt.trim()) errors.push(`Recipe Module example ${example.id} has no prompt.`);
    if (!isGenerationTaskKind(taskValue)) {
      errors.push(`Recipe Module example ${example.id} has unsupported task: ${taskValue}`);
    } else {
      coveredTasks.add(taskValue);
    }
    if (example.activation !== 'example_only') {
      errors.push(`Recipe Module example ${example.id} must stay example_only.`);
    }
    if (example.providerBoundary !== 'provider_independent') {
      errors.push(`Recipe Module example ${example.id} must stay provider_independent.`);
    }
    if (example.supportedProviders.length === 0) {
      errors.push(`Recipe Module example ${example.id} has no supported providers.`);
    }
    for (const providerId of example.supportedProviders) {
      if (!exampleProvidersSet.has(providerId)) {
        errors.push(
          `Recipe Module example ${example.id} uses non Codex-first provider: ${providerId}.`,
        );
      }
    }

    const parameterIds = new Set<string>();
    for (const parameter of example.parameters) {
      if (parameterIds.has(parameter.id)) {
        errors.push(`Recipe Module example ${example.id} has duplicate parameter: ${parameter.id}`);
      }
      parameterIds.add(parameter.id);
      if (parameter.kind === 'enum' && (!parameter.options || parameter.options.length === 0)) {
        errors.push(`Recipe Module example ${example.id} enum has no options: ${parameter.id}`);
      }
    }

    try {
      buildRecipeModuleExampleSpec(example);
    } catch (error) {
      errors.push(
        `Recipe Module example ${example.id} cannot build spec: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  for (const task of REQUIRED_EXAMPLE_TASKS) {
    if (!coveredTasks.has(task)) errors.push(`Recipe Module examples missing task: ${task}`);
  }

  return { valid: errors.length === 0, errors };
}
