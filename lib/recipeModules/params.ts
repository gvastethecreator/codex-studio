import type {
  GenerationProviderId,
  GenerationTaskKind,
} from '../../packages/shared/src/generationContracts';
import type { RecipeModule } from './types';

const CODEX_FIRST_PROVIDERS: GenerationProviderId[] = ['codex', 'chatgpt', 'dry_run'];

export function options(values: readonly string[]) {
  return [...values];
}

export function createRecipeModule(
  module: Omit<RecipeModule, 'supportedProviders'> & {
    supportedProviders?: GenerationProviderId[];
  },
): RecipeModule {
  return {
    ...module,
    supportedProviders: module.supportedProviders ?? CODEX_FIRST_PROVIDERS,
  };
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
