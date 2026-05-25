import type { GenerationProviderId, GenerationTaskKind } from '../packages/shared/src';
import type { RecipeId } from '../types';
import {
  createRecipeDefaultParams,
  listRecipeModules,
  type RecipeModule,
  type RecipeParameterDescriptor,
} from './recipeModules';

type RegisteredRecipeId = Exclude<RecipeId, null>;

export interface RecipeCatalogCardMetadata {
  id: RegisteredRecipeId;
  subtitle: string;
  tag: string;
  buttonText: string;
  accentColor: string;
  cardImageKey: RegisteredRecipeId;
}

export interface RecipeCatalogEntry {
  id: RegisteredRecipeId;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  buttonText: string;
  accentColor: string;
  cardImageKey: RegisteredRecipeId;
  defaultTask: GenerationTaskKind;
  supportedTasks: GenerationTaskKind[];
  supportedProviders: GenerationProviderId[];
  parameters: RecipeParameterDescriptor[];
  defaultParams: Record<string, unknown>;
  parameterGroups: string[];
  requiredParameterIds: string[];
}

export interface RecipeCatalogSearchFilters {
  query?: string;
  task?: GenerationTaskKind;
  providerId?: GenerationProviderId;
  parameterId?: string;
  limit?: number;
}

export interface RecipeCatalogValidation {
  valid: boolean;
  errors: string[];
}

const RECIPE_CARD_METADATA: Record<RegisteredRecipeId, RecipeCatalogCardMetadata> = {
  styles: {
    id: 'styles',
    subtitle: 'Style Transfer',
    tag: 'Fast',
    buttonText: 'Open Styles',
    accentColor: 'purple',
    cardImageKey: 'styles',
  },
  remaster: {
    id: 'remaster',
    subtitle: 'Image Restoration',
    tag: 'Enhance',
    buttonText: 'Open Tool',
    accentColor: 'amber',
    cardImageKey: 'remaster',
  },
  camera: {
    id: 'camera',
    subtitle: 'Camera Guidance',
    tag: 'Control',
    buttonText: 'Open Viewfinder',
    accentColor: 'cyan',
    cardImageKey: 'camera',
  },
  cinematic: {
    id: 'cinematic',
    subtitle: 'Storyboard Creator',
    tag: 'Director',
    buttonText: 'Open Creator',
    accentColor: 'rose',
    cardImageKey: 'cinematic',
  },
  timeline: {
    id: 'timeline',
    subtitle: 'Scene Extrapolation',
    tag: 'Temporal',
    buttonText: 'Open Timeline',
    accentColor: 'teal',
    cardImageKey: 'timeline',
  },
  spritesheet: {
    id: 'spritesheet',
    subtitle: 'Game Assets',
    tag: 'Game Dev',
    buttonText: 'Configure Grid',
    accentColor: 'emerald',
    cardImageKey: 'spritesheet',
  },
  character: {
    id: 'character',
    subtitle: 'Sheet Designer',
    tag: 'Concept Art',
    buttonText: 'Open Designer',
    accentColor: 'indigo',
    cardImageKey: 'character',
  },
};

function toDisplayTitle(module: RecipeModule) {
  return module.title.toUpperCase();
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function getParameterGroups(parameters: RecipeParameterDescriptor[]) {
  return [
    ...new Set(parameters.flatMap((parameter) => (parameter.group ? [parameter.group] : []))),
  ];
}

export function createRecipeCatalog(modules: RecipeModule[] = listRecipeModules()) {
  return modules.map((module): RecipeCatalogEntry => {
    const card = RECIPE_CARD_METADATA[module.id];
    return {
      id: module.id,
      title: toDisplayTitle(module),
      subtitle: card.subtitle,
      description: module.description,
      tag: card.tag,
      buttonText: card.buttonText,
      accentColor: card.accentColor,
      cardImageKey: card.cardImageKey,
      defaultTask: module.defaultTask,
      supportedTasks: module.supportedTasks,
      supportedProviders: module.supportedProviders,
      parameters: module.parameters,
      defaultParams: createRecipeDefaultParams(module),
      parameterGroups: getParameterGroups(module.parameters),
      requiredParameterIds: module.parameters
        .filter((parameter) => parameter.required)
        .map((parameter) => parameter.id),
    };
  });
}

export const RECIPE_CATALOG = createRecipeCatalog();

export function validateRecipeCatalog(catalog: RecipeCatalogEntry[] = RECIPE_CATALOG) {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const moduleIds = new Set(listRecipeModules().map((module) => module.id));

  for (const entry of catalog) {
    if (seenIds.has(entry.id)) errors.push(`Duplicate Recipe Module catalog id: ${entry.id}`);
    seenIds.add(entry.id);
    if (!moduleIds.has(entry.id)) errors.push(`Recipe catalog entry has no module: ${entry.id}`);
    if (!entry.supportedTasks.includes(entry.defaultTask)) {
      errors.push(`Recipe Module ${entry.id} default task is not supported: ${entry.defaultTask}`);
    }
    if (entry.supportedProviders.length === 0) {
      errors.push(`Recipe Module ${entry.id} has no supported providers.`);
    }

    const parameterIds = new Set<string>();
    for (const parameter of entry.parameters) {
      if (parameterIds.has(parameter.id)) {
        errors.push(`Recipe Module ${entry.id} has duplicate parameter: ${parameter.id}`);
      }
      parameterIds.add(parameter.id);
      if (parameter.kind === 'enum' && (!parameter.options || parameter.options.length === 0)) {
        errors.push(`Recipe Module ${entry.id} enum parameter has no options: ${parameter.id}`);
      }
      if (parameter.control === 'slider' && parameter.kind !== 'number') {
        errors.push(`Recipe Module ${entry.id} slider parameter is not numeric: ${parameter.id}`);
      }
      if (parameter.required && entry.defaultParams[parameter.id] !== undefined) {
        errors.push(
          `Recipe Module ${entry.id} required parameter should not have static default: ${parameter.id}`,
        );
      }
    }
  }

  for (const moduleId of moduleIds) {
    if (!seenIds.has(moduleId)) errors.push(`Recipe Module is missing from catalog: ${moduleId}`);
  }

  return { valid: errors.length === 0, errors } satisfies RecipeCatalogValidation;
}

export function searchRecipeCatalog(
  filters: RecipeCatalogSearchFilters = {},
  catalog: RecipeCatalogEntry[] = RECIPE_CATALOG,
) {
  const query = normalize(filters.query);
  const parameterId = normalize(filters.parameterId);
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const results: RecipeCatalogEntry[] = [];

  for (const entry of catalog) {
    const searchableText = [
      entry.id,
      entry.title,
      entry.subtitle,
      entry.description,
      entry.tag,
      entry.defaultTask,
      ...entry.supportedTasks,
      ...entry.supportedProviders,
      ...entry.parameters.flatMap((parameter) => [parameter.id, parameter.label, parameter.kind]),
    ]
      .join(' ')
      .toLowerCase();

    if (query && !searchableText.includes(query)) continue;
    if (filters.task && !entry.supportedTasks.includes(filters.task)) continue;
    if (filters.providerId && !entry.supportedProviders.includes(filters.providerId)) continue;
    if (
      parameterId &&
      !entry.parameters.some((parameter) => normalize(parameter.id) === parameterId)
    ) {
      continue;
    }

    results.push(entry);
    if (limit && results.length >= limit) break;
  }

  return results;
}
