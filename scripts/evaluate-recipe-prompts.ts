import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  createGenerationTaskSpec,
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
  type GenerationTaskSpec,
} from '../packages/shared/src';
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
  name: 'legacy' | 'directives' | 'bare';
  promptText: string;
  promptChars: number;
  recipeContextChars: number;
  recipeDirectivesChars: number;
  metadata: EvaluationVariantMetadata;
}

export interface EvaluationVariantMetadata {
  notes: string[];
  usesLegacyContext: boolean;
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
  minDirectiveSavingsPercent: number;
  failures: string[];
}

export function createBareVariant(spec: GenerationTaskSpec): EvaluationVariant {
  const parts = [`Task: ${spec.task}`, '', 'Prompt:', spec.prompt];
  if (spec.negativePrompt) parts.push('', 'Avoid:', spec.negativePrompt);
  if (spec.recipeId) parts.push('', `Recipe: ${spec.recipeId}`);
  if (spec.stylePresetId) parts.push(`Style preset: ${spec.stylePresetId}`);
  if (spec.output.imageSize) parts.push(`Image size: ${spec.output.imageSize}`);
  if (spec.output.aspectRatio) parts.push(`Aspect ratio: ${spec.output.aspectRatio}`);

  return {
    name: 'bare',
    promptText: parts.join('\n'),
    promptChars: parts.join('\n').length,
    recipeContextChars: 0,
    recipeDirectivesChars: 0,
    metadata: {
      notes: ['No recipe enrichment — baseline for quality comparison.'],
      usesLegacyContext: false,
      usesProviderDirectives: false,
      hasStableInstructions: false,
    },
  };
}

export function createLegacyVariant(spec: GenerationTaskSpec): EvaluationVariant {
  const recipeContext =
    typeof spec.metadata.recipeContext === 'string' ? spec.metadata.recipeContext : '';
  const parts = [`Task: ${spec.task}`, '', 'Prompt:', spec.prompt];
  if (recipeContext) parts.push('', 'Recipe instructions:', recipeContext.trim());
  if (spec.negativePrompt) parts.push('', 'Avoid:', spec.negativePrompt);
  if (spec.recipeId) parts.push('', `Recipe: ${spec.recipeId}`);
  if (spec.stylePresetId) parts.push(`Style preset: ${spec.stylePresetId}`);
  if (spec.output.imageSize) parts.push(`Image size: ${spec.output.imageSize}`);
  if (spec.output.aspectRatio) parts.push(`Aspect ratio: ${spec.output.aspectRatio}`);

  return {
    name: 'legacy',
    promptText: parts.join('\n'),
    promptChars: parts.join('\n').length,
    recipeContextChars: recipeContext.length,
    recipeDirectivesChars: 0,
    metadata: {
      notes: [
        'Uses legacy CODEX RECIPE CONTEXT envelope with full JSON schema.',
        'This is the current fallback when Recipe Provider Directives are absent.',
      ],
      usesLegacyContext: true,
      usesProviderDirectives: false,
      hasStableInstructions: false,
    },
  };
}

export function createDirectivesVariant(spec: GenerationTaskSpec): EvaluationVariant {
  const directives = spec.metadata.recipeProviderDirectives;
  const recipeContext =
    typeof spec.metadata.recipeContext === 'string' ? spec.metadata.recipeContext : '';
  const serialized = isRecipeProviderDirectives(directives)
    ? serializeRecipeProviderDirectives(directives)
    : '';
  const parts = [`Task: ${spec.task}`, '', 'Prompt:', spec.prompt];
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
    recipeContextChars: recipeContext.length,
    recipeDirectivesChars: serialized.length,
    metadata: {
      notes: [
        'Uses structured Recipe Provider Directives — compact, machine-readable key-value format.',
        'This is the new primary path when Recipe Provider Directives are present.',
      ],
      usesLegacyContext: false,
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

  const recipeContext = module.buildContext ? module.buildContext(params) : '';
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
    output: {
      count: 1,
      aspectRatio: DEFAULT_GENERATION_CONFIG.aspectRatio,
      imageSize: DEFAULT_GENERATION_CONFIG.imageSize,
      mimeType: 'image/png',
      requiresCatalogEntry: false,
    },
    metadata: {
      recipeContext,
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
      const legacy = createLegacyVariant(spec);
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
        variants: [bare, legacy, directives],
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

export function createEvaluationSummary(
  session: EvaluationSession,
  { minDirectiveSavingsPercent = 30 } = {},
): EvaluationSummary {
  const failures: string[] = [];

  if (session.pairs.length === 0) {
    failures.push('No recipe prompt evaluation pairs generated.');
  }

  for (const pair of session.pairs) {
    const bare = pair.variants.find((variant) => variant.name === 'bare');
    const legacy = pair.variants.find((variant) => variant.name === 'legacy');
    const directives = pair.variants.find((variant) => variant.name === 'directives');

    if (!bare || !legacy || !directives) {
      failures.push(`${pair.recipeId} missing bare/legacy/directives variants.`);
      continue;
    }
    if (!legacy.metadata.usesLegacyContext || legacy.recipeContextChars <= 0) {
      failures.push(`${pair.recipeId} legacy variant missing Recipe Context.`);
    }
    if (!directives.metadata.usesProviderDirectives || directives.recipeDirectivesChars <= 0) {
      failures.push(`${pair.recipeId} directives variant missing Recipe Provider Directives.`);
    }
    if (directives.promptChars >= legacy.promptChars) {
      failures.push(`${pair.recipeId} directives prompt is not smaller than legacy prompt.`);
      continue;
    }
    if (bare.promptChars >= directives.promptChars) {
      failures.push(`${pair.recipeId} bare prompt is not smaller than directives prompt.`);
    }

    const savingsPercent =
      ((legacy.promptChars - directives.promptChars) / legacy.promptChars) * 100;
    if (savingsPercent < minDirectiveSavingsPercent) {
      failures.push(
        `${pair.recipeId} directives savings ${savingsPercent.toFixed(1)}% < ${minDirectiveSavingsPercent}%.`,
      );
    }
  }

  return {
    totalPairs: session.pairs.length,
    minDirectiveSavingsPercent,
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
    const dirSize = pair.variants.find((v) => v.name === 'directives')?.promptChars ?? 0;
    const legacySize = pair.variants.find((v) => v.name === 'legacy')?.promptChars ?? 0;
    const bareSize = pair.variants.find((v) => v.name === 'bare')?.promptChars ?? 0;
    const savings = legacySize > 0 ? legacySize - dirSize : 0;
    const savingsPct = legacySize > 0 ? ((savings / legacySize) * 100).toFixed(1) : '0';

    console.log(
      `  ${pair.recipeId} (${pair.recipeTitle})` +
        ` bare=${bareSize} legacy=${legacySize} directives=${dirSize}` +
        ` savings=${savings} (${savingsPct}%)`,
    );
  }
}

if (import.meta.main) {
  const outputArg = process.argv.find((a) => a.startsWith('--out='))?.split('=')[1];
  const recipeFilter = process.argv
    .filter((a) => a.startsWith('--recipe='))
    .map((a) => a.split('=')[1]);
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
    console.log(
      `[eval] verify pairs=${summary.totalPairs} minSavings=${summary.minDirectiveSavingsPercent}% failures=${summary.failures.length}`,
    );
    for (const failure of summary.failures) console.error(`- ${failure}`);
    if (summary.failures.length > 0) process.exitCode = 1;
  }
}
