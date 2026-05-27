import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type {
  CatalogImage,
  CatalogPage,
  GenerationTaskSpec,
  HealthResponse,
  Job,
  JobDetailResponse,
  JobExecutionOptions,
  JobMetricSummary,
  JobStatus,
  LocalCodexSessionResponse,
  Project,
} from '../packages/shared/src';
import { compileCodexImagegenInput } from '../apps/local-server/src/providers/codexProvider';
import { listRecipeModules } from '../lib/recipeModules';
import {
  buildRecipeSpec,
  createBareVariant,
  createDirectivesVariant,
  createLegacyVariant,
  type EvaluationVariant,
  type EvaluationVariantMetadata,
} from './evaluate-recipe-prompts';

export const LIVE_EVALUATION_VARIANT_NAMES = ['bare', 'legacy', 'directives'] as const;

export type LiveEvaluationVariantName = (typeof LIVE_EVALUATION_VARIANT_NAMES)[number];

export interface LiveRecipeEvaluationVariantPlan {
  name: LiveEvaluationVariantName;
  promptText: string;
  promptChars: number;
  recipeContextChars: number;
  recipeDirectivesChars: number;
  compiledPromptText: string;
  compiledPromptChars: number;
  metadata: EvaluationVariantMetadata;
  sourceSpec: GenerationTaskSpec;
}

export interface LiveRecipeEvaluationPairPlan {
  recipeId: string;
  recipeTitle: string;
  task: string;
  prompt: string;
  negativePrompt: string;
  stylePresetId: string | null;
  outputSize: string;
  aspectRatio: string;
  variants: LiveRecipeEvaluationVariantPlan[];
}

export interface LiveRecipeEvaluationPlan {
  sessionId: string;
  createdAt: string;
  pairs: LiveRecipeEvaluationPairPlan[];
}

export interface LiveCatalogImageRef {
  id: string;
  publicUrl: string;
  filePath: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  createdAt: string;
}

export interface LiveRecipeEvaluationVariantReport {
  name: LiveEvaluationVariantName;
  promptText: string;
  promptChars: number;
  recipeContextChars: number;
  recipeDirectivesChars: number;
  compiledPromptText: string;
  compiledPromptChars: number;
  metadata: EvaluationVariantMetadata;
  status: JobStatus | 'planned';
  jobId: string | null;
  error: string | null;
  createdAt: string | null;
  completedAt: string | null;
  finalPromptUsedChars: number | null;
  transcriptPath: string | null;
  metrics: JobMetricSummary | null;
  catalogImages: LiveCatalogImageRef[];
}

export interface LiveRecipeEvaluationPairReport {
  recipeId: string;
  recipeTitle: string;
  task: string;
  prompt: string;
  negativePrompt: string;
  stylePresetId: string | null;
  outputSize: string;
  aspectRatio: string;
  variants: LiveRecipeEvaluationVariantReport[];
}

export interface LiveRuntimeSnapshot {
  ready: boolean;
  defaultProjectId: string | null;
  failures: string[];
  warnings: string[];
  health: {
    libraryDir: string;
    envLocalPath: string;
    envLocalPresent: boolean;
    libraryReady: boolean;
    codexCliAvailable: boolean;
    codexCliVersion: string | null;
    appServerRunning: boolean;
  };
  codexSession: {
    state: LocalCodexSessionResponse['state'];
    reason: LocalCodexSessionResponse['reason'];
    canRunLocalJobs: boolean;
    authMode: LocalCodexSessionResponse['authMode'];
    planType: string | null;
  };
}

export interface LiveRecipeEvaluationReport {
  sessionId: string;
  createdAt: string;
  executedAt: string | null;
  apiBase: string;
  executionRequested: boolean;
  runtime: LiveRuntimeSnapshot | null;
  failures: string[];
  notes: string[];
  pairs: LiveRecipeEvaluationPairReport[];
}

export interface ExecuteLiveRecipeEvaluationOptions {
  apiBase?: string;
  pollMs?: number;
  timeoutMs?: number;
  continueOnError?: boolean;
}

const DEFAULT_API_BASE = 'http://127.0.0.1:17223';
const DEFAULT_VARIANT_NAMES: LiveEvaluationVariantName[] = ['legacy', 'directives'];
const DEFAULT_POLL_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 15 * 60_000;

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneGenerationTaskSpec(spec: GenerationTaskSpec): GenerationTaskSpec {
  return {
    ...spec,
    recipeParams: spec.recipeParams ? cloneJson(spec.recipeParams) : null,
    assets: spec.assets.map((asset) => ({ ...asset })),
    output: { ...spec.output },
    metadata: cloneJson(spec.metadata ?? {}),
  };
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function serializeCatalogImage(image: CatalogImage): LiveCatalogImageRef {
  return {
    id: image.id,
    publicUrl: image.publicUrl,
    filePath: image.filePath,
    thumbnailUrl: image.thumbnailUrl,
    width: image.width,
    height: image.height,
    mimeType: image.mimeType,
    createdAt: image.createdAt,
  };
}

function normalizeApiBase(apiBase?: string) {
  const trimmed = apiBase?.trim() || DEFAULT_API_BASE;
  return trimmed.replace(/\/+$/, '');
}

function formatDuration(durationMs: number | null | undefined) {
  if (durationMs == null) return 'n/a';
  if (durationMs < 1_000) return `${durationMs} ms`;
  return `${(durationMs / 1_000).toFixed(1)} s`;
}

function formatTokenUsage(metrics: JobMetricSummary | null) {
  const usage = metrics?.tokenUsage;
  if (!usage) return 'n/a';
  const input = usage.inputTokens ?? 'n/a';
  const output = usage.outputTokens ?? 'n/a';
  const total = usage.totalTokens ?? 'n/a';
  return `input=${input} output=${output} total=${total} source=${usage.source}`;
}

function absoluteAssetUrl(apiBase: string, publicUrl: string) {
  return `${apiBase}${publicUrl}`;
}

function createEvaluationVariantForLiveSpec(
  spec: GenerationTaskSpec,
  name: LiveEvaluationVariantName,
): EvaluationVariant {
  if (name === 'bare') return createBareVariant(spec);
  if (name === 'legacy') return createLegacyVariant(spec);
  return createDirectivesVariant(spec);
}

function calculatePromptSavings(
  pair:
    | Pick<LiveRecipeEvaluationPairPlan, 'variants'>
    | Pick<LiveRecipeEvaluationPairReport, 'variants'>,
) {
  const legacy = pair.variants.find((variant) => variant.name === 'legacy') ?? null;
  const directives = pair.variants.find((variant) => variant.name === 'directives') ?? null;
  if (!legacy || !directives) return null;

  const savings = legacy.compiledPromptChars - directives.compiledPromptChars;
  const savingsPercent =
    legacy.compiledPromptChars > 0 ? (savings / legacy.compiledPromptChars) * 100 : 0;

  return {
    legacyChars: legacy.compiledPromptChars,
    directivesChars: directives.compiledPromptChars,
    savings,
    savingsPercent,
  };
}

function parseMultiValueArg(name: string) {
  const prefix = `--${name}=`;
  const result: string[] = [];
  for (const arg of process.argv) {
    if (!arg.startsWith(prefix)) continue;
    for (const part of arg.slice(prefix.length).split('|')) {
      const trimmed = part.trim();
      if (trimmed) result.push(trimmed);
    }
  }
  return uniqueStrings(result);
}

function parseOptionalPositiveIntArg(name: string, fallback: number) {
  const raw = process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return parsed;
}

function parseVariantNames(): LiveEvaluationVariantName[] {
  const rawValues = parseMultiValueArg('variant');
  if (rawValues.length === 0) return [...DEFAULT_VARIANT_NAMES];

  const normalized = uniqueStrings(rawValues.map((value) => value.toLowerCase()));
  const allowed = new Set<string>(LIVE_EVALUATION_VARIANT_NAMES);
  for (const value of normalized) {
    if (!allowed.has(value)) {
      throw new Error(
        `Unknown --variant=${value}. Expected one of ${LIVE_EVALUATION_VARIANT_NAMES.join(', ')}.`,
      );
    }
  }

  return normalized as LiveEvaluationVariantName[];
}

function extractExecutionOptions(sourceSpec: GenerationTaskSpec): JobExecutionOptions | null {
  const execution = isRecordLike(sourceSpec.metadata.execution)
    ? sourceSpec.metadata.execution
    : null;
  const model = typeof execution?.model === 'string' ? execution.model.trim() : '';
  const reasoningEffort =
    typeof execution?.reasoningEffort === 'string' ? execution.reasoningEffort.trim() : '';
  if (!model || !reasoningEffort) return null;

  const serviceTier =
    execution?.serviceTier === 'fast' || execution?.serviceTier === 'flex'
      ? execution.serviceTier
      : null;

  return {
    model,
    reasoningEffort,
    serviceTier,
  };
}

export function createLiveVariantSourceSpec(
  spec: GenerationTaskSpec,
  name: LiveEvaluationVariantName,
): GenerationTaskSpec {
  const nextSpec = cloneGenerationTaskSpec(spec);

  if (name === 'legacy') {
    nextSpec.metadata = {
      ...nextSpec.metadata,
      recipeProviderDirectives: null,
    };
  }

  if (name === 'bare') {
    nextSpec.metadata = {
      ...nextSpec.metadata,
      recipeContext: null,
      recipeProviderDirectives: null,
    };
  }

  return nextSpec;
}

export function createLiveRecipeEvaluationPlan(
  options: {
    moduleIds?: string[];
    variantNames?: LiveEvaluationVariantName[];
  } = {},
): LiveRecipeEvaluationPlan {
  const variantNames = options.variantNames?.length ? options.variantNames : DEFAULT_VARIANT_NAMES;
  const modules = listRecipeModules();
  const orderedModuleIds =
    options.moduleIds && options.moduleIds.length > 0
      ? uniqueStrings(options.moduleIds)
      : modules.map((module) => module.id);
  const moduleMap = new Map<string, (typeof modules)[number]>(
    modules.map((module) => [module.id, module]),
  );
  const pairs: LiveRecipeEvaluationPairPlan[] = [];

  for (const moduleId of orderedModuleIds) {
    const module = moduleMap.get(moduleId);
    if (!module) {
      throw new Error(`Unknown recipe module: ${moduleId}`);
    }

    const baseSpec = buildRecipeSpec(module);
    const variants = variantNames.map((variantName) => {
      const sourceSpec = createLiveVariantSourceSpec(baseSpec, variantName);
      const evaluation = createEvaluationVariantForLiveSpec(sourceSpec, variantName);
      const compiled = compileCodexImagegenInput({
        id: `${baseSpec.id}-${variantName}`,
        projectId: 'recipe-quality-eval',
        prompt: sourceSpec.prompt,
        execution: extractExecutionOptions(sourceSpec),
        providerId: 'codex',
        sourceSpec,
      });

      return {
        name: variantName,
        promptText: evaluation.promptText,
        promptChars: evaluation.promptChars,
        recipeContextChars: evaluation.recipeContextChars,
        recipeDirectivesChars: evaluation.recipeDirectivesChars,
        compiledPromptText: compiled.payload.text,
        compiledPromptChars: compiled.payload.text.length,
        metadata: evaluation.metadata,
        sourceSpec,
      } satisfies LiveRecipeEvaluationVariantPlan;
    });

    pairs.push({
      recipeId: module.id,
      recipeTitle: module.title,
      task: baseSpec.task,
      prompt: baseSpec.prompt,
      negativePrompt: baseSpec.negativePrompt ?? '',
      stylePresetId: baseSpec.stylePresetId,
      outputSize: baseSpec.output.imageSize ?? '',
      aspectRatio: baseSpec.output.aspectRatio ?? '',
      variants,
    });
  }

  return {
    sessionId: `live-eval-${Date.now()}`,
    createdAt: new Date().toISOString(),
    pairs,
  };
}

export function createLiveRecipeEvaluationReport(
  plan: LiveRecipeEvaluationPlan,
  options: {
    apiBase?: string;
    executionRequested?: boolean;
    runtime?: LiveRuntimeSnapshot | null;
    executedAt?: string | null;
  } = {},
): LiveRecipeEvaluationReport {
  return {
    sessionId: plan.sessionId,
    createdAt: plan.createdAt,
    executedAt: options.executedAt ?? null,
    apiBase: normalizeApiBase(options.apiBase),
    executionRequested: options.executionRequested ?? false,
    runtime: options.runtime ?? null,
    failures: [],
    notes: [
      'Images stay in the Studio Library; this report stores only job ids, catalog refs, metrics, and transcript paths.',
      'Keep legacy Recipe Context in stored job metadata until live quality evidence is satisfactory.',
    ],
    pairs: plan.pairs.map((pair) => ({
      recipeId: pair.recipeId,
      recipeTitle: pair.recipeTitle,
      task: pair.task,
      prompt: pair.prompt,
      negativePrompt: pair.negativePrompt,
      stylePresetId: pair.stylePresetId,
      outputSize: pair.outputSize,
      aspectRatio: pair.aspectRatio,
      variants: pair.variants.map((variant) => ({
        name: variant.name,
        promptText: variant.promptText,
        promptChars: variant.promptChars,
        recipeContextChars: variant.recipeContextChars,
        recipeDirectivesChars: variant.recipeDirectivesChars,
        compiledPromptText: variant.compiledPromptText,
        compiledPromptChars: variant.compiledPromptChars,
        metadata: variant.metadata,
        status: 'planned',
        jobId: null,
        error: null,
        createdAt: null,
        completedAt: null,
        finalPromptUsedChars: null,
        transcriptPath: null,
        metrics: null,
        catalogImages: [],
      })),
    })),
  };
}

export function evaluateLiveRuntimeReadiness(
  health: HealthResponse,
  session: LocalCodexSessionResponse,
  projectId: string | null,
): LiveRuntimeSnapshot {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!health.checks.libraryReady) {
    failures.push('Studio Library is not ready for local generation.');
  }
  if (!health.codexCli.available) {
    failures.push('Codex CLI is not available in the local backend environment.');
  }
  if (!health.appServer.running) {
    failures.push('codex app-server is not running.');
  }
  if (!session.canRunLocalJobs) {
    failures.push(
      `Local Codex session cannot run jobs (${session.reason ?? session.state ?? 'unknown'}).`,
    );
  }
  if (!projectId) {
    failures.push('No default Studio project is available.');
  }
  if (!health.runtime.envLocalPresent) {
    warnings.push(
      `No .env.local found at ${health.runtime.envLocalPath}. \`bun run studio:init\` can create it if needed.`,
    );
  }

  return {
    ready: failures.length === 0,
    defaultProjectId: projectId,
    failures,
    warnings,
    health: {
      libraryDir: health.libraryDir,
      envLocalPath: health.runtime.envLocalPath,
      envLocalPresent: health.runtime.envLocalPresent,
      libraryReady: health.checks.libraryReady,
      codexCliAvailable: health.codexCli.available,
      codexCliVersion: health.codexCli.version,
      appServerRunning: health.appServer.running,
    },
    codexSession: {
      state: session.state,
      reason: session.reason,
      canRunLocalJobs: session.canRunLocalJobs,
      authMode: session.authMode,
      planType: session.planType,
    },
  };
}

async function requestJson<T>(apiBase: string, pathname: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${apiBase}${pathname}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `${init?.method ?? 'GET'} ${pathname} failed: ${response.status} ${text || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

async function sleep(durationMs: number) {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function readLiveRuntimeSnapshot(apiBase: string) {
  const [health, session, projects] = await Promise.all([
    requestJson<HealthResponse>(apiBase, '/api/health'),
    requestJson<LocalCodexSessionResponse>(apiBase, '/api/codex/session'),
    requestJson<Project[]>(apiBase, '/api/projects'),
  ]);

  return evaluateLiveRuntimeReadiness(health, session, projects[0]?.id ?? null);
}

async function waitForJobDetail(
  apiBase: string,
  jobId: string,
  { pollMs, timeoutMs }: { pollMs: number; timeoutMs: number },
) {
  const startedAt = Date.now();

  while (true) {
    const detail = await requestJson<JobDetailResponse>(apiBase, `/api/jobs/${jobId}`);
    const { job } = detail;
    if (
      job.status === 'completed' ||
      job.status === 'failed' ||
      job.status === 'cancelled' ||
      job.status === 'needs_review'
    ) {
      return detail;
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Job ${jobId} timed out after ${timeoutMs} ms.`);
    }

    await sleep(pollMs);
  }
}

async function createLiveJob(
  apiBase: string,
  projectId: string,
  variant: LiveRecipeEvaluationVariantPlan,
) {
  return requestJson<Job>(apiBase, '/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      kind: variant.sourceSpec.task,
      providerId: 'codex',
      sourceSpec: variant.sourceSpec,
      prompt: variant.sourceSpec.prompt,
      execution: extractExecutionOptions(variant.sourceSpec),
    }),
  });
}

async function readCatalogImagesForJob(apiBase: string, jobId: string) {
  const catalog = await requestJson<CatalogPage>(
    apiBase,
    `/api/catalog?job_id=${encodeURIComponent(jobId)}&limit=20`,
  );
  return catalog.images.map(serializeCatalogImage);
}

export async function executeLiveRecipeEvaluation(
  plan: LiveRecipeEvaluationPlan,
  options: ExecuteLiveRecipeEvaluationOptions = {},
): Promise<LiveRecipeEvaluationReport> {
  const apiBase = normalizeApiBase(options.apiBase);
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const continueOnError = options.continueOnError ?? true;
  const runtime = await readLiveRuntimeSnapshot(apiBase);
  const report = createLiveRecipeEvaluationReport(plan, {
    apiBase,
    executionRequested: true,
    runtime,
    executedAt: new Date().toISOString(),
  });

  if (!runtime.ready) {
    report.failures.push(...runtime.failures);
    return report;
  }

  for (let pairIndex = 0; pairIndex < plan.pairs.length; pairIndex += 1) {
    const pairPlan = plan.pairs[pairIndex];
    const pairReport = report.pairs[pairIndex];

    for (let variantIndex = 0; variantIndex < pairPlan.variants.length; variantIndex += 1) {
      const variantPlan = pairPlan.variants[variantIndex];
      const variantReport = pairReport.variants[variantIndex];

      try {
        const created = await createLiveJob(apiBase, runtime.defaultProjectId!, variantPlan);
        variantReport.jobId = created.id;
        variantReport.status = created.status;
        variantReport.createdAt = created.createdAt;

        const detail = await waitForJobDetail(apiBase, created.id, { pollMs, timeoutMs });
        const { job: detailJob } = detail;
        variantReport.status = detailJob.status;
        variantReport.error = detailJob.error;
        variantReport.completedAt = detailJob.completedAt;
        variantReport.finalPromptUsedChars = detailJob.finalPromptUsed.length;
        variantReport.transcriptPath = detail.turn?.transcriptPath ?? null;
        variantReport.metrics = detail.metrics;
        variantReport.catalogImages = await readCatalogImagesForJob(apiBase, created.id);

        if (detailJob.status !== 'completed') {
          report.failures.push(
            `${pairPlan.recipeId}/${variantPlan.name} ended as ${detailJob.status}: ${detailJob.error || 'no error'}`,
          );
        }
        if (detail.job.status === 'completed' && variantReport.catalogImages.length === 0) {
          report.failures.push(
            `${pairPlan.recipeId}/${variantPlan.name} completed without any catalog images.`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        variantReport.status = 'failed';
        variantReport.error = message;
        report.failures.push(`${pairPlan.recipeId}/${variantPlan.name} failed: ${message}`);
        if (!continueOnError) {
          return report;
        }
      }
    }
  }

  return report;
}

export function verifyLiveRecipeEvaluationReport(report: LiveRecipeEvaluationReport) {
  const failures: string[] = [];

  if (report.pairs.length === 0) {
    failures.push('No live recipe evaluation pairs were generated.');
  }

  for (const pair of report.pairs) {
    const savings = calculatePromptSavings(pair);
    if (savings && savings.directivesChars >= savings.legacyChars) {
      failures.push(
        `${pair.recipeId} directives compiled prompt is not smaller than legacy compiled prompt.`,
      );
    }

    if (!report.executionRequested) continue;

    for (const variant of pair.variants) {
      if (variant.status !== 'completed') {
        failures.push(`${pair.recipeId}/${variant.name} did not complete successfully.`);
        continue;
      }
      if (variant.catalogImages.length === 0) {
        failures.push(`${pair.recipeId}/${variant.name} completed without a catalog image.`);
      }
    }
  }

  if (report.executionRequested && report.runtime && !report.runtime.ready) {
    failures.push(...report.runtime.failures);
  }

  return failures;
}

function printPlanSummary(report: LiveRecipeEvaluationReport) {
  console.log(
    `[live-eval] session=${report.sessionId} pairs=${report.pairs.length} execution=${report.executionRequested ? 'live' : 'plan'}`,
  );

  for (const pair of report.pairs) {
    const savings = calculatePromptSavings(pair);
    const summary = savings
      ? ` legacy=${savings.legacyChars} directives=${savings.directivesChars} savings=${savings.savings} (${savings.savingsPercent.toFixed(1)}%)`
      : '';

    console.log(`  ${pair.recipeId} (${pair.recipeTitle})${summary}`);
    if (!report.executionRequested) continue;

    for (const variant of pair.variants) {
      const firstImage = variant.catalogImages[0];
      console.log(
        `    - ${variant.name}: status=${variant.status} job=${variant.jobId ?? 'n/a'} images=${variant.catalogImages.length}` +
          (firstImage ? ` asset=${absoluteAssetUrl(report.apiBase, firstImage.publicUrl)}` : ''),
      );
    }
  }

  if (report.runtime) {
    console.log(
      `[live-eval] runtime ready=${report.runtime.ready} appServer=${report.runtime.health.appServerRunning} codexSession=${report.runtime.codexSession.state}`,
    );
    for (const warning of report.runtime.warnings) {
      console.warn(`[live-eval] warning: ${warning}`);
    }
  }
}

export function createLiveEvaluationReviewMarkdown(report: LiveRecipeEvaluationReport) {
  const lines: string[] = [
    `# Live Recipe Prompt Quality Review — ${report.sessionId}`,
    '',
    `- Created: ${report.createdAt}`,
    `- Executed: ${report.executedAt ?? 'not executed (plan only)'}`,
    `- API base: ${report.apiBase}`,
    `- Execution requested: ${report.executionRequested ? 'yes' : 'no'}`,
  ];

  if (report.runtime) {
    lines.push(
      `- Runtime ready: ${report.runtime.ready ? 'yes' : 'no'}`,
      `- Studio Library: ${report.runtime.health.libraryDir}`,
      `- Codex session: ${report.runtime.codexSession.state}` +
        (report.runtime.codexSession.planType ? ` (${report.runtime.codexSession.planType})` : ''),
    );
  }

  lines.push('', ...report.notes.map((note) => `> ${note}`), '');

  if (report.failures.length > 0) {
    lines.push('## Blockers', '');
    for (const failure of report.failures) lines.push(`- ${failure}`);
    lines.push('');
  }

  for (const pair of report.pairs) {
    const savings = calculatePromptSavings(pair);

    lines.push(`## ${pair.recipeId} — ${pair.recipeTitle}`, '');
    lines.push(`- Task: ${pair.task}`);
    if (pair.outputSize) lines.push(`- Output size: ${pair.outputSize}`);
    if (pair.aspectRatio) lines.push(`- Aspect ratio: ${pair.aspectRatio}`);
    if (pair.stylePresetId) lines.push(`- Style preset: ${pair.stylePresetId}`);
    if (savings) {
      lines.push(
        `- Compiled prompt savings: ${savings.legacyChars} → ${savings.directivesChars} (${savings.savingsPercent.toFixed(1)}%)`,
      );
    }
    lines.push('');

    lines.push('### Variants', '');
    for (const variant of pair.variants) {
      const firstImage = variant.catalogImages[0] ?? null;
      lines.push(`- **${variant.name}**`);
      lines.push(`  - Status: ${variant.status}`);
      lines.push(`  - Compiled prompt chars: ${variant.compiledPromptChars}`);
      lines.push(`  - Final prompt chars: ${variant.finalPromptUsedChars ?? 'n/a'}`);
      lines.push(`  - Job: ${variant.jobId ?? 'n/a'}`);
      lines.push(`  - Tokens: ${formatTokenUsage(variant.metrics)}`);
      const timingsMap = variant.metrics?.timings
        ? new Map(variant.metrics.timings.map((segment) => [segment.id, segment]))
        : null;
      lines.push(
        `  - Provider duration: ${formatDuration(timingsMap?.get('provider')?.durationMs ?? null)}`,
      );
      lines.push(`  - Transcript: ${variant.transcriptPath ?? 'n/a'}`);
      if (firstImage) {
        lines.push(`  - Asset: ${absoluteAssetUrl(report.apiBase, firstImage.publicUrl)}`);
        lines.push(`  - File: ${firstImage.filePath}`);
      }
      if (variant.error) {
        lines.push(`  - Error: ${variant.error}`);
      }
    }
    lines.push('');

    lines.push('### Review notes', '');
    for (const variant of pair.variants) {
      lines.push(`- ${variant.name} notes:`);
    }
    lines.push('- Winner:');
    lines.push('- Confidence:');
    lines.push('- Follow-up:');
    lines.push('');
  }

  return lines.join('\n');
}

export function writeLiveRecipeEvaluationReport(
  report: LiveRecipeEvaluationReport,
  outputDir: string,
) {
  mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, `${report.sessionId}.json`);
  const markdownPath = path.join(outputDir, `${report.sessionId}.md`);

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(markdownPath, `${createLiveEvaluationReviewMarkdown(report)}\n`, 'utf8');

  console.log(`[live-eval] report: ${jsonPath}`);
  console.log(`[live-eval] review: ${markdownPath}`);

  return { jsonPath, markdownPath };
}

if (import.meta.main) {
  try {
    const recipeIds = parseMultiValueArg('recipe');
    const variantNames = parseVariantNames();
    const shouldExecute = process.argv.includes('--execute') || process.argv.includes('--run');
    const shouldVerify = process.argv.includes('--verify');
    const outputArg = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
    const apiBase = normalizeApiBase(
      process.argv.find((arg) => arg.startsWith('--api-base='))?.slice('--api-base='.length),
    );
    const pollMs = parseOptionalPositiveIntArg('poll-ms', DEFAULT_POLL_MS);
    const timeoutMs = parseOptionalPositiveIntArg('timeout-ms', DEFAULT_TIMEOUT_MS);
    const defaultOutputDir = path.resolve('logs', 'recipe-prompt-quality');
    const outputDir = shouldExecute ? path.resolve(outputArg || defaultOutputDir) : outputArg;

    const plan = createLiveRecipeEvaluationPlan({
      moduleIds: recipeIds.length > 0 ? recipeIds : undefined,
      variantNames,
    });
    const report = shouldExecute
      ? await executeLiveRecipeEvaluation(plan, {
          apiBase,
          pollMs,
          timeoutMs,
        })
      : createLiveRecipeEvaluationReport(plan, { apiBase });

    printPlanSummary(report);

    if (outputDir) {
      writeLiveRecipeEvaluationReport(report, path.resolve(outputDir));
    }

    if (shouldVerify) {
      const failures = verifyLiveRecipeEvaluationReport(report);
      console.log(`[live-eval] verify failures=${failures.length}`);
      for (const failure of failures) console.error(`- ${failure}`);
      if (failures.length > 0) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
