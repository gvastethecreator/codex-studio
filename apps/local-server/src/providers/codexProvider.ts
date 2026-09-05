import {
  createCompiledProviderInput,
  createGenerationTaskSpec,
  composeGenerationQualityPromptSections,
  type CompiledProviderInput,
  type GenerationTaskSpec,
} from '../../../../packages/shared/src/generationContracts';
import {
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
} from '../../../../packages/shared/src/recipeProviderDirectives';
import {
  CODEX_IMAGEGEN_DENOISE_INSTRUCTION,
  CODEX_IMAGEGEN_SESSION_CONTRACT,
} from '../codex/imagegenContract';
import type { CodexTurn, TurnResult } from '../codex/turn';
import type { GenerationProvider, GenerationProviderJob } from './types';
import { readCodexRuntimeDoctor } from '../codexRuntimeDoctor';
import { isCodexHttpCredentialReady } from '../auth/tokens';
import { ProviderExecutionUncertainError } from '../workerErrors';

export { CODEX_IMAGEGEN_DENOISE_INSTRUCTION } from '../codex/imagegenContract';

export type CodexImagegenInputItem =
  | { type: 'localImage'; path: string }
  | { type: 'image'; url: string };

export type CodexImagegenCompiledInput = CompiledProviderInput<{
  text: string;
  imageInputs: CodexImagegenInputItem[];
}>;

export function compileCodexImagegenInput(job: GenerationProviderJob): CodexImagegenCompiledInput {
  const sourceSpec =
    job.sourceSpec ??
    createGenerationTaskSpec({
      id: job.id,
      task: 'image_generate',
      providerId: 'codex',
      prompt: job.prompt,
    });
  const text = buildCodexPromptText(sourceSpec);
  const imageInputs = buildCodexImageInputs(sourceSpec);

  return createCompiledProviderInput({
    providerId: 'codex',
    contract: CODEX_IMAGEGEN_SESSION_CONTRACT,
    sourceSpec,
    payloadKind: 'codex_prompt',
    payload: { text, imageInputs },
    estimatedPromptChars: text.length,
  });
}

function buildCodexImageInputs(sourceSpec: GenerationTaskSpec): CodexImagegenInputItem[] {
  const items: CodexImagegenInputItem[] = [];
  for (const asset of sourceSpec.assets) {
    const localPath = asset.localPath?.trim();
    if (localPath) {
      items.push({ type: 'localImage', path: localPath });
      continue;
    }

    const sourceUrl = asset.sourceUrl?.trim();
    if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) {
      items.push({ type: 'image', url: sourceUrl });
    }
  }
  return items;
}

function getCodexAssetRoleLabel(role: GenerationTaskSpec['assets'][number]['role']) {
  switch (role) {
    case 'input':
    case 'external_output':
      return 'Input image file';
    case 'mask':
      return 'Mask image file';
    case 'control':
      return 'Control image file';
    case 'reference':
    default:
      return 'Reference image file';
  }
}

function buildCodexAssetLines(sourceSpec: GenerationTaskSpec) {
  return sourceSpec.assets.flatMap((asset) => {
    const location = asset.localPath?.trim() || asset.sourceUrl?.trim() || null;

    if (!location) {
      return [];
    }

    const roleLabel = getCodexAssetRoleLabel(asset.role);
    const details: string[] = [];

    if (asset.role !== 'input' && asset.role !== 'external_output' && asset.name) {
      details.push(asset.name);
    }

    if (asset.role !== 'input' && asset.role !== 'external_output' && asset.strength != null) {
      details.push(`strength ${asset.strength.toFixed(2)}`);
    }

    return [
      details.length > 0
        ? `${roleLabel}: ${location} (${details.join(', ')})`
        : `${roleLabel}: ${location}`,
    ];
  });
}

function buildCodexPromptText(sourceSpec: GenerationTaskSpec) {
  const parts = [`Task: ${sourceSpec.task}`, '', 'Prompt:', sourceSpec.prompt];
  const recipeProviderDirectives = sourceSpec.metadata.recipeProviderDirectives;
  const recipeContext = sourceSpec.metadata.recipeContext;
  const qualitySections = composeGenerationQualityPromptSections(sourceSpec);
  const variationBrief =
    typeof sourceSpec.metadata.variationBrief === 'string'
      ? sourceSpec.metadata.variationBrief.trim()
      : '';
  const assetLines = buildCodexAssetLines(sourceSpec);

  if (qualitySections.length > 0) {
    parts.push('', ...qualitySections);
  }

  if (isRecipeProviderDirectives(recipeProviderDirectives)) {
    parts.push(
      '',
      'Recipe directives:',
      serializeRecipeProviderDirectives(recipeProviderDirectives),
    );
  } else if (typeof recipeContext === 'string' && recipeContext.trim()) {
    parts.push('', 'Recipe instructions:', recipeContext.trim());
  }

  if (variationBrief) {
    parts.push('', 'Variation brief:', variationBrief);
  }

  if (sourceSpec.negativePrompt) {
    parts.push('', 'Avoid:', sourceSpec.negativePrompt);
  }

  if (assetLines.length > 0) {
    parts.push('', 'Local assets:', ...assetLines);
  }

  if (sourceSpec.output.imageSize) {
    parts.push(`Image size: ${sourceSpec.output.imageSize}`);
  }

  if (sourceSpec.output.aspectRatio) {
    parts.push(`Aspect ratio: ${sourceSpec.output.aspectRatio}`);
  }

  parts.push('', CODEX_IMAGEGEN_DENOISE_INSTRUCTION);

  return parts.join('\n');
}

export interface CreateCodexGenerationProviderDependencies {
  turn: CodexTurn;
  runHttp?: (job: GenerationProviderJob) => Promise<TurnResult>;
  isHttpReady?: () => boolean;
  canUseCli?: () => boolean;
}

export function createCodexGenerationProvider({
  turn,
  runHttp,
  isHttpReady = () => isCodexHttpCredentialReady(),
  canUseCli = () => readCodexRuntimeDoctor().canRunJobs,
}: CreateCodexGenerationProviderDependencies): GenerationProvider {
  return {
    id: 'codex',
    async run(job) {
      const compiledInput = compileCodexImagegenInput(job);
      const policy = job.execution?.providerOptions?.codex;
      if (!policy)
        throw new ProviderExecutionUncertainError(
          'The Codex execution policy was not captured. Review the existing job before creating another request.',
        );
      if (policy.transport === 'subscription_http') {
        if (!isHttpReady())
          throw new Error(
            'This job requires its accepted ChatGPT HTTP session. Sign in again and retry.',
          );
        const http =
          runHttp ??
          (await import('./codexResponsesImageExecutor')).createCodexResponsesImageExecutor();
        return http(job);
      }
      if (policy.transport !== 'codex_app_server')
        throw new Error('The saved Codex execution route is invalid.');
      if (!canUseCli())
        throw new Error(
          'This job requires its accepted Codex app-server runtime. Start it and retry.',
        );
      return turn.runTurn({
        jobId: job.id,
        prompt: job.prompt,
        execution: job.execution,
        signal: job.signal,
        compiledInput,
      });
    },
  };
}
