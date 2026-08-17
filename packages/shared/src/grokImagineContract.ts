import type { GenerationTaskSpec } from './generationContracts';
import type { JobExecutionOptions } from './types';

export const GROK_IMAGINE_ASPECT_RATIO_VALUES = [
  'auto',
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
] as const;

export type GrokImagineAspectRatio = (typeof GROK_IMAGINE_ASPECT_RATIO_VALUES)[number];

export const GROK_IMAGINE_ASPECT_RATIOS = new Set<string>(GROK_IMAGINE_ASPECT_RATIO_VALUES);

export const MAX_GROK_IMAGINE_SOURCE_IMAGES = 5;

export const GROK_IMAGINE_RECIPE_IDS = ['styles'] as const;

export type GrokImagineRecipeId = (typeof GROK_IMAGINE_RECIPE_IDS)[number];

export interface GrokImagineJobIssue {
  code: string;
  field: string;
  message: string;
}

export function isGrokImagineAspectRatio(
  value: string | null | undefined,
): value is GrokImagineAspectRatio {
  return Boolean(value && GROK_IMAGINE_ASPECT_RATIOS.has(value));
}

export function isGrokImagineRecipeId(
  value: string | null | undefined,
): value is GrokImagineRecipeId {
  return Boolean(value && (GROK_IMAGINE_RECIPE_IDS as readonly string[]).includes(value));
}

export function collectGrokImagineJobIssues({
  sourceSpec,
  execution,
  availableModels = [],
}: {
  sourceSpec?: Pick<GenerationTaskSpec, 'recipeId' | 'assets' | 'output'> | null;
  execution?: Pick<JobExecutionOptions, 'model'> | null;
  availableModels?: readonly string[];
}): GrokImagineJobIssue[] {
  const issues: GrokImagineJobIssue[] = [];
  if (!sourceSpec) {
    issues.push({
      code: 'missing_source_spec',
      field: 'sourceSpec',
      message: 'Grok Imagine requires a Generation Task Spec.',
    });
    return issues;
  }
  const outputCount = sourceSpec.output.count ?? 1;
  if (outputCount !== 1) {
    issues.push({
      code: 'invalid_grok_output_count',
      field: 'sourceSpec.output.count',
      message: 'Grok Imagine requires exactly one output image per Persistent Job.',
    });
  }

  const aspectRatio = sourceSpec?.output.aspectRatio?.trim() || null;
  if (aspectRatio && !isGrokImagineAspectRatio(aspectRatio)) {
    issues.push({
      code: 'invalid_grok_aspect_ratio',
      field: 'sourceSpec.output.aspectRatio',
      message: `Grok Imagine accepts ${GROK_IMAGINE_ASPECT_RATIO_VALUES.join(', ')}.`,
    });
  }

  const recipeId = sourceSpec?.recipeId?.trim() || null;
  if (recipeId && !isGrokImagineRecipeId(recipeId)) {
    issues.push({
      code: 'unsupported_grok_recipe',
      field: 'sourceSpec.recipeId',
      message: 'This recipe uses Codex.',
    });
  }

  const assets = sourceSpec?.assets ?? [];
  if (assets.length > MAX_GROK_IMAGINE_SOURCE_IMAGES) {
    issues.push({
      code: 'invalid_grok_source_count',
      field: 'sourceSpec.assets',
      message: `Grok Imagine accepts up to ${MAX_GROK_IMAGINE_SOURCE_IMAGES} library images.`,
    });
  }

  for (const [index, asset] of assets.entries()) {
    if (asset.localPath?.trim()) continue;
    issues.push({
      code: 'unresolved_grok_source',
      field: `sourceSpec.assets.${index}.localPath`,
      message: 'Import the image into the Studio Library first.',
    });
  }

  const model = execution?.model?.trim() || null;
  if (model && availableModels.length > 0 && !availableModels.includes(model)) {
    issues.push({
      code: 'unavailable_grok_model',
      field: 'execution.model',
      message: 'Choose a current Grok model.',
    });
  }

  return issues;
}
