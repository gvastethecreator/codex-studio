import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  composeGenerationQualityPromptSections,
  createGenerationTaskSpec,
  type GenerationTaskSpec,
} from '../packages/shared/src/generationContracts';
import {
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from '../packages/shared/src/recipeProviderDirectives';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  createRecipeDefaultParams,
  isRecipeTaskSupported,
  listRecipeModules,
  validateRecipeParams,
  type RecipeModule,
} from '../lib/recipeModules';
import { buildRecipeProviderDirectives } from '../lib/recipeProviderDirectives';

export interface EvaluationPair {
  recipeId: string;
  recipeTitle: string;
  task: string;
  prompt: string;
  negativePrompt: string;
  stylePresetId: string | null;
  outputSize: string;
  aspectRatio: string;
  variants: EvaluationVariant[];
}

export interface EvaluationVariant {
  name: 'directives' | 'bare';
  promptText: string;
  promptChars: number;
  recipeDirectivesChars: number;
  metadata: EvaluationVariantMetadata;
}

export interface EvaluationVariantMetadata {
  notes: string[];
  usesProviderDirectives: boolean;
  hasStableInstructions: boolean;
}

export interface EvaluationSession {
  sessionId: string;
  createdAt: string;
  pairs: EvaluationPair[];
}

export interface EvaluationSummary {
  totalPairs: number;
  failures: string[];
}

export function createBareVariant(spec: GenerationTaskSpec): EvaluationVariant {
  const parts = [`Task: ${spec.task}`, '', 'Prompt:', spec.prompt];
  const qualitySections = composeGenerationQualityPromptSections(spec);
  if (qualitySections.length > 0) parts.push('', ...qualitySections);
  if (spec.negativePrompt) parts.push('', 'Avoid:', spec.negativePrompt);
  if (spec.recipeId) parts.push('', `Recipe: ${spec.recipeId}`);
  if (spec.stylePresetId) parts.push(`Style preset: ${spec.stylePresetId}`);
  if (spec.output.imageSize) parts.push(`Image size: ${spec.output.imageSize}`);
  if (spec.output.aspectRatio) parts.push(`Aspect ratio: ${spec.output.aspectRatio}`);

  return {
    name: 'bare',
    promptText: parts.join('\n'),
    promptChars: parts.join('\n').length,
    recipeDirectivesChars: 0,
    metadata: {
      notes: ['No recipe enrichment — baseline for quality comparison.'],
      usesProviderDirectives: false,
      hasStableInstructions: false,
    },
  };
}

export function createDirectivesVariant(spec: GenerationTaskSpec): EvaluationVariant {
  const directives = spec.metadata.recipeProviderDirectives;
  const serialized = isRecipeProviderDirectives(directives)
    ? serializeRecipeProviderDirectives(directives)
    : '';
  const parts = [`Task: ${spec.task}`, '', 'Prompt:', spec.prompt];
  const qualitySections = composeGenerationQualityPromptSections(spec);
  if (qualitySections.length > 0) parts.push('', ...qualitySections);
  if (serialized) parts.push('', 'Recipe directives:', serialized);
  if (spec.negativePrompt) parts.push('', 'Avoid:', spec.negativePrompt);
  if (spec.recipeId) parts.push('', `Recipe: ${spec.recipeId}`);
  if (spec.stylePresetId) parts.push(`Style preset: ${spec.stylePresetId}`);
  if (spec.output.imageSize) parts.push(`Image size: ${spec.output.imageSize}`);
  if (spec.output.aspectRatio) parts.push(`Aspect ratio: ${spec.output.aspectRatio}`);

  return {
    name: 'directives',
    promptText: parts.join('\n'),
    promptChars: parts.join('\n').length,
    recipeDirectivesChars: serialized.length,
    metadata: {
      notes: [
        'Uses structured Recipe Provider Directives — compact, machine-readable key-value format.',
        'They are the only recipe text sent to providers.',
      ],
      usesProviderDirectives: true,
      hasStableInstructions: false,
    },
  };
}

function sampleParamValue(module: RecipeModule, paramId: string, params: Record<string, unknown>) {
  const value = params[paramId];
  if (value !== undefined && value !== null && value !== '') return;
  const descriptor = module.parameters.find((p) => p.id === paramId);
  if (!descriptor) return;
  if (descriptor.options?.length) params[paramId] = descriptor.options[0];
  else if ('defaultValue' in descriptor) params[paramId] = descriptor.defaultValue;
  else if (descriptor.kind === 'number') params[paramId] = descriptor.min ?? 1;
  else if (descriptor.kind === 'boolean') params[paramId] = false;
  else if (descriptor.kind === 'color') params[paramId] = '#808080';
  else params[paramId] = `Auto ${descriptor.label}`;
}

export function buildRecipeSpec(module: RecipeModule): GenerationTaskSpec {
  const params = createRecipeDefaultParams(module);
  for (const param of module.parameters) {
    if (param.required) sampleParamValue(module, param.id, params);
  }

  if (module.id === 'styles') {
    params.presetId = 'SP01-001';
    params.presetName = 'Evaluation Style';
    params.mode = 'DIRECT_STYLE_SYNTHESIS';
    params.aesthetic = 'editorial quality study';
    params.colorTone = 'neutral studio reference';
  }

  const validation = validateRecipeParams(module, params);
  if (!validation.valid) {
    throw new Error(`Recipe ${module.id} params invalid: ${validation.errors[0]}`);
  }

  const task = module.defaultTask;
  if (!isRecipeTaskSupported(module, task)) {
    throw new Error(`Recipe ${module.id} does not support task ${task}`);
  }

  const recipeProviderDirectives = buildRecipeProviderDirectives(module, params);

  return createGenerationTaskSpec({
    id: `eval-${module.id}`,
    task,
    providerId: 'codex',
    prompt: `Evaluation prompt for ${module.title}: generate a high-quality image following the recipe.`,
    negativePrompt: 'text, watermark, signature, UI elements, low quality',
    recipeId: module.id,
    recipeParams: params,
    stylePresetId: module.id === 'styles' ? 'SP01-001' : null,
    assets: [],
    quality: {
      qualityPresetId:
        task === 'sprite_sheet'
          ? 'sprite_sheet'
          : task === 'texture_generate'
            ? 'texture'
            : task === 'style_preset_card'
              ? 'product_or_ui_asset'
              : 'image_general',
      subject: null,
      composition: null,
      style: module.title,
      lighting: null,
      color: null,
      materials: null,
      constraints: [],
      negative: [],
      referenceRoles: [],
    },
    output: {
      count: 1,
      aspectRatio: DEFAULT_GENERATION_CONFIG.aspectRatio,
      imageSize: DEFAULT_GENERATION_CONFIG.imageSize,
      mimeType: 'image/png',
      requiresCatalogEntry: false,
    },
    metadata: {
      recipeProviderDirectives,
      recipeModule: {
        id: module.id,
        version: '1.0.0',
        task: module.defaultTask,
      },
      execution: {
        model: DEFAULT_GENERATION_CONFIG.executionModel,
        reasoningEffort: DEFAULT_GENERATION_CONFIG.executionReasoningEffort,
      },
    },
  });
}

export function evaluateRecipePrompts(moduleIds?: string[]): EvaluationSession {
  const requestedModuleIds = new Set(moduleIds ?? []);
  const modules =
    requestedModuleIds.size > 0
      ? listRecipeModules().filter((module) => requestedModuleIds.has(module.id))
      : listRecipeModules();

  const pairs: EvaluationPair[] = [];

  for (const module of modules) {
    if (!module) continue;

    try {
      const spec = buildRecipeSpec(module);
      const bare = createBareVariant(spec);
      const directives = createDirectivesVariant(spec);

      pairs.push({
        recipeId: module.id,
        recipeTitle: module.title,
        task: module.defaultTask,
        prompt: spec.prompt,
        negativePrompt: spec.negativePrompt ?? '',
        stylePresetId: spec.stylePresetId,
        outputSize: spec.output.imageSize ?? '',
        aspectRatio: spec.output.aspectRatio ?? '',
        variants: [bare, directives],
      });
    } catch (err) {
      console.error(
        `Failed to evaluate recipe ${module.id}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  return {
    sessionId: `eval-${Date.now()}`,
    createdAt: new Date().toISOString(),
    pairs,
  };
}

export function createEvaluationSummary(session: EvaluationSession): EvaluationSummary {
  const failures: string[] = [];

  if (session.pairs.length === 0) {
    failures.push('No recipe prompt evaluation pairs generated.');
  }

  for (const pair of session.pairs) {
    const variantsByName = new Map(pair.variants.map((variant) => [variant.name, variant]));
    const bare = variantsByName.get('bare');
    const directives = variantsByName.get('directives');

    if (!bare || !directives) {
      failures.push(`${pair.recipeId} missing bare/directives variants.`);
      continue;
    }
    if (!directives.metadata.usesProviderDirectives || directives.recipeDirectivesChars <= 0) {
      failures.push(`${pair.recipeId} directives variant missing Recipe Provider Directives.`);
    }
    if (bare.promptChars >= directives.promptChars) {
      failures.push(`${pair.recipeId} bare prompt is not smaller than directives prompt.`);
    }
  }

  return {
    totalPairs: session.pairs.length,
    failures,
  };
}

export function writeEvaluationReport(session: EvaluationSession, outputDir: string) {
  mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, `${session.sessionId}.json`);
  writeFileSync(jsonPath, JSON.stringify(session, null, 2), 'utf8');
  console.log(`[eval] report: ${jsonPath}`);

  console.log(`[eval] session=${session.sessionId} pairs=${session.pairs.length}`);
  for (const pair of session.pairs) {
    const variantsByName = new Map(pair.variants.map((v) => [v.name, v]));
    const dirSize = variantsByName.get('directives')?.promptChars ?? 0;
    const bareSize = variantsByName.get('bare')?.promptChars ?? 0;

    console.log(
      `  ${pair.recipeId} (${pair.recipeTitle})` +
        ` bare=${bareSize} directives=${dirSize} recipeText=${dirSize - bareSize}`,
    );
  }
}

if (import.meta.main) {
  const outputArg = process.argv.find((a) => a.startsWith('--out='))?.split('=')[1];
  const recipeFilter = process.argv.reduce<string[]>((acc, a) => {
    if (a.startsWith('--recipe=')) acc.push(a.split('=')[1]);
    return acc;
  }, []);
  const isDryRun = process.argv.includes('--dry-run') || !outputArg;
  const shouldVerify = process.argv.includes('--verify');

  const session = evaluateRecipePrompts(recipeFilter.length ? recipeFilter : undefined);
  const summary = createEvaluationSummary(session);

  if (isDryRun) {
    console.log(`[eval] dry-run session=${session.sessionId} pairs=${session.pairs.length}`);
  } else {
    writeEvaluationReport(session, outputArg!);
  }

  if (shouldVerify) {
    console.log(`[eval] verify pairs=${summary.totalPairs} failures=${summary.failures.length}`);
    for (const failure of summary.failures) console.error(`- ${failure}`);
    if (summary.failures.length > 0) process.exitCode = 1;
  }
}
