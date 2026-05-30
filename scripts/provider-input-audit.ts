import {
  createProviderInputMetrics,
  createGenerationTaskSpec,
  type CompiledProviderInput,
  type GenerationProviderId,
  type GenerationTaskSpec,
} from '../packages/shared/src/generationContracts';
import {
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from '../packages/shared/src/recipeProviderDirectives';
import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildGenerationTaskSpecFromRecipe,
  createRecipeDefaultParams,
  listRecipeModules,
  type RecipeModule,
  type RecipeParameterDescriptor,
} from '../lib/recipeModules';
import {
  compileProviderInputForJob,
  hasProviderInputCompiler,
} from '../apps/local-server/src/providers/providerInputCompiler';

export interface ProviderInputAuditOptions {
  providerId?: GenerationProviderId;
  recipeId?: string;
  includeExternalFixtures?: boolean;
}

export interface ProviderInputAuditRow {
  id: string;
  kind: 'recipe' | 'external_fixture';
  providerId: GenerationProviderId;
  recipeId: string | null;
  task: string;
  payloadKind: string;
  sourceSpecChars: number;
  compiledInputChars: number;
  compiledPayloadChars: number;
  estimatedPromptChars: number | null;
  assetRefCount: number;
  inlineAssetBytesPresent: boolean;
  providerSessionContractId: string | null;
  legacyRecipeContextChars: number;
  recipeProviderDirectivesChars: number;
  hasRecipeProviderDirectives: boolean;
  omittedStableInstructions: boolean;
  compact: boolean;
  inlineDataLeak: boolean;
  secretLikeLeak: boolean;
  notes: string[];
}

export interface ProviderInputAuditReport {
  generatedAt: string;
  rows: ProviderInputAuditRow[];
  summary: {
    totalRows: number;
    recipeRows: number;
    externalFixtureRows: number;
    providers: GenerationProviderId[];
    failures: string[];
    warnings: string[];
  };
}

const EXTERNAL_FIXTURE_PROVIDERS: GenerationProviderId[] = ['google', 'fal', 'comfy'];
const SECRET_LIKE_PATTERN =
  /(api[_-]?key|secret|bearer|access[_-]?token|refresh[_-]?token|sk-[A-Za-z0-9]|SHOULD_NOT_LEAK|SECRET_INLINE_IMAGE|data:image\/[^;]+;base64)/i;

function createAuditJob(providerId: GenerationProviderId, sourceSpec: GenerationTaskSpec) {
  return {
    id: `${sourceSpec.id}-${providerId}`,
    projectId: 'provider-input-audit',
    providerId,
    prompt: 'fallback prompt that should not replace the source spec',
    execution: {
      model: providerId === 'codex' ? DEFAULT_GENERATION_CONFIG.executionModel : 'audit-model',
      reasoningEffort: DEFAULT_GENERATION_CONFIG.executionReasoningEffort,
    },
    sourceSpec,
  };
}

function sampleValueForParameter(parameter: RecipeParameterDescriptor) {
  if (parameter.options?.length) return parameter.options[0];
  if ('defaultValue' in parameter) return parameter.defaultValue;
  if (parameter.kind === 'number') return parameter.min ?? 1;
  if (parameter.kind === 'boolean') return false;
  if (parameter.kind === 'record') return {};
  if (parameter.kind === 'color') return '#808080';
  return `Sample ${parameter.label}`;
}

function createAuditRecipeParams(module: RecipeModule) {
  const params = createRecipeDefaultParams(module);

  for (const parameter of module.parameters) {
    if (
      parameter.required &&
      (params[parameter.id] === undefined ||
        params[parameter.id] === null ||
        params[parameter.id] === '')
    ) {
      params[parameter.id] = sampleValueForParameter(parameter);
    }
  }

  if (module.id === 'styles') {
    params.presetId = typeof params.presetId === 'string' ? params.presetId : 'SP01-001';
    params.presetName =
      typeof params.presetName === 'string' ? params.presetName : 'Provider Audit Style';
    params.mode = typeof params.mode === 'string' ? params.mode : 'DIRECT_STYLE_SYNTHESIS';
    params.aesthetic =
      typeof params.aesthetic === 'string' ? params.aesthetic : 'precise editorial style card';
    params.colorTone =
      typeof params.colorTone === 'string' ? params.colorTone : 'balanced studio color';
  }

  return params;
}

function createRecipeAuditSpec(module: RecipeModule, providerId: GenerationProviderId) {
  return buildGenerationTaskSpecFromRecipe({
    id: `audit-${module.id}-${providerId}`,
    providerId,
    config: {
      ...DEFAULT_GENERATION_CONFIG,
      prompt: `Provider audit sample for ${module.title}.`,
      recipeId: module.id,
      recipeParams: createAuditRecipeParams(module),
      negativePrompt: 'text, watermark, signature',
    },
    task: module.defaultTask,
  });
}

function cloneSpecForProvider(sourceSpec: GenerationTaskSpec, providerId: GenerationProviderId) {
  return createGenerationTaskSpec({
    id: `audit-external-${providerId}-${sourceSpec.recipeId ?? sourceSpec.task}`,
    task: sourceSpec.task,
    providerId,
    prompt: sourceSpec.prompt,
    negativePrompt: sourceSpec.negativePrompt,
    recipeId: sourceSpec.recipeId,
    recipeParams: sourceSpec.recipeParams,
    stylePresetId: sourceSpec.stylePresetId,
    assets: [
      {
        role: 'reference',
        name: 'inline-reference.png',
        dataUrl: 'data:image/png;base64,SECRET_INLINE_IMAGE_SHOULD_NOT_LEAK',
        localPath: 'D:/audit/reference.png',
        strength: 0.5,
      },
    ],
    output: sourceSpec.output,
    metadata: sourceSpec.metadata,
  });
}

function createExternalFixtureSpecs() {
  const stylesModule = listRecipeModules().find((module) => module.id === 'styles');
  if (!stylesModule) return [];

  const styleSpec = createRecipeAuditSpec(stylesModule, 'codex');
  const hostedSpecs = EXTERNAL_FIXTURE_PROVIDERS.reduce<ReturnType<typeof cloneSpecForProvider>[]>(
    (acc, providerId) => {
      if (providerId !== 'comfy') acc.push(cloneSpecForProvider(styleSpec, providerId));
      return acc;
    },
    [],
  );
  const comfySpec = createGenerationTaskSpec({
    id: 'audit-external-comfy-texture',
    task: 'texture_generate',
    providerId: 'comfy',
    prompt: 'seamless glazed ceramic texture with normal-map-ready surface detail',
    negativePrompt: 'visible seams, watermark, text',
    assets: [
      {
        role: 'reference',
        name: 'texture-reference.png',
        dataUrl: 'data:image/png;base64,SECRET_INLINE_IMAGE_SHOULD_NOT_LEAK',
        localPath: 'D:/audit/texture-reference.png',
      },
    ],
    output: {
      aspectRatio: '1:1',
      imageSize: '2048x2048',
      mimeType: 'image/png',
    },
    metadata: {
      fixture: 'provider-input-audit',
    },
  });

  return [...hostedSpecs, comfySpec];
}

function createAuditRow({
  kind,
  providerId,
  sourceSpec,
  compiled,
}: {
  kind: ProviderInputAuditRow['kind'];
  providerId: GenerationProviderId;
  sourceSpec: GenerationTaskSpec;
  compiled: CompiledProviderInput;
}): ProviderInputAuditRow {
  const compiledJson = JSON.stringify(compiled);
  const payloadJson = JSON.stringify(compiled.payload);
  const metrics = createProviderInputMetrics(sourceSpec, compiled);
  const recipeProviderDirectives = sourceSpec.metadata.recipeProviderDirectives;
  const serializedDirectives = isRecipeProviderDirectives(recipeProviderDirectives)
    ? serializeRecipeProviderDirectives(recipeProviderDirectives)
    : '';
  const legacyRecipeContext =
    typeof sourceSpec.metadata.recipeContext === 'string' ? sourceSpec.metadata.recipeContext : '';
  const notes: string[] = [];

  if (serializedDirectives && compiled.audit.estimatedPromptChars !== null) {
    const legacyPromptChars =
      sourceSpec.prompt.length +
      legacyRecipeContext.length +
      (sourceSpec.negativePrompt?.length ?? 0);
    if (legacyPromptChars > 0 && compiled.audit.estimatedPromptChars < legacyPromptChars) {
      const saved = legacyPromptChars - compiled.audit.estimatedPromptChars;
      notes.push(`prompt_delta=-${saved}`);
    }
  }

  return {
    id: `${kind}:${providerId}:${sourceSpec.recipeId ?? sourceSpec.task}`,
    kind,
    providerId,
    recipeId: sourceSpec.recipeId,
    task: sourceSpec.task,
    payloadKind: compiled.payloadKind,
    sourceSpecChars: metrics.sourceSpecChars,
    compiledInputChars: metrics.compiledInputChars,
    compiledPayloadChars: metrics.compiledPayloadChars,
    estimatedPromptChars: metrics.estimatedPromptChars,
    assetRefCount: metrics.assetRefCount,
    inlineAssetBytesPresent: metrics.inlineAssetBytesPresent,
    providerSessionContractId: metrics.providerSessionContractId,
    legacyRecipeContextChars: legacyRecipeContext.length,
    recipeProviderDirectivesChars: serializedDirectives.length,
    hasRecipeProviderDirectives: Boolean(serializedDirectives),
    omittedStableInstructions: compiled.audit.omittedStableInstructions,
    compact: compiled.audit.compact,
    inlineDataLeak: /data:image\/[^;]+;base64/i.test(compiledJson),
    secretLikeLeak: SECRET_LIKE_PATTERN.test(payloadJson),
    notes,
  };
}

function shouldIncludeRow(
  options: ProviderInputAuditOptions,
  providerId: GenerationProviderId,
  recipeId: string | null,
) {
  if (options.providerId && options.providerId !== providerId) return false;
  if (options.recipeId && options.recipeId !== recipeId) return false;
  return true;
}

export function createProviderInputAuditReport(
  options: ProviderInputAuditOptions = {},
): ProviderInputAuditReport {
  const rows: ProviderInputAuditRow[] = [];
  const failures: string[] = [];
  const warnings: string[] = [];

  for (const module of listRecipeModules()) {
    for (const providerId of module.supportedProviders) {
      if (!shouldIncludeRow(options, providerId, module.id)) continue;
      if (!hasProviderInputCompiler(providerId)) {
        failures.push(`${module.id}:${providerId} has no Provider Input Compiler.`);
        continue;
      }

      const sourceSpec = createRecipeAuditSpec(module, providerId);
      const compiled = compileProviderInputForJob(
        providerId,
        createAuditJob(providerId, sourceSpec),
      );
      rows.push(createAuditRow({ kind: 'recipe', providerId, sourceSpec, compiled }));
    }
  }

  if (options.includeExternalFixtures ?? true) {
    for (const sourceSpec of createExternalFixtureSpecs()) {
      const providerId = sourceSpec.providerId;
      if (!providerId || !shouldIncludeRow(options, providerId, sourceSpec.recipeId)) continue;
      if (!hasProviderInputCompiler(providerId)) {
        failures.push(`external:${providerId} has no Provider Input Compiler.`);
        continue;
      }

      const compiled = compileProviderInputForJob(
        providerId,
        createAuditJob(providerId, sourceSpec),
      );
      rows.push(createAuditRow({ kind: 'external_fixture', providerId, sourceSpec, compiled }));
    }
  }

  for (const row of rows) {
    if (!row.compact) failures.push(`${row.id} is not marked compact.`);
    if (!row.omittedStableInstructions) failures.push(`${row.id} repeats stable instructions.`);
    if (row.inlineAssetBytesPresent && row.kind === 'recipe') {
      failures.push(`${row.id} has inline asset bytes in source spec.`);
    }
    if (row.inlineDataLeak) failures.push(`${row.id} leaks inline image data.`);
    if (row.secretLikeLeak) failures.push(`${row.id} leaks secret-like payload content.`);
    if (row.kind === 'recipe' && !row.hasRecipeProviderDirectives) {
      failures.push(`${row.id} has no Recipe Provider Directives.`);
    }
    if (
      row.kind === 'recipe' &&
      row.legacyRecipeContextChars > 0 &&
      row.recipeProviderDirectivesChars >= row.legacyRecipeContextChars
    ) {
      warnings.push(`${row.id} directives are not smaller than legacy Recipe Context.`);
    }
  }

  const providers = [...new Set(rows.map((row) => row.providerId))];

  return {
    generatedAt: new Date().toISOString(),
    rows,
    summary: {
      totalRows: rows.length,
      recipeRows: rows.filter((row) => row.kind === 'recipe').length,
      externalFixtureRows: rows.filter((row) => row.kind === 'external_fixture').length,
      providers,
      failures,
      warnings,
    },
  };
}
