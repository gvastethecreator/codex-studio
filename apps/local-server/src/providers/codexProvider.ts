import {
  createCompiledProviderInput,
  createGenerationTaskSpec,
  isRecipeProviderDirectives,
  serializeRecipeProviderDirectives,
  type CompiledProviderInput,
  type GenerationTaskSpec,
} from '../../../../packages/shared/src';
import { CODEX_IMAGEGEN_SESSION_CONTRACT } from '../codex/imagegenContract';
import type { CodexTurn } from '../codex/turn';
import type { GenerationProvider, GenerationProviderJob } from './types';

export type CodexImagegenCompiledInput = CompiledProviderInput<{ text: string }>;

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

  return createCompiledProviderInput({
    providerId: 'codex',
    contract: CODEX_IMAGEGEN_SESSION_CONTRACT,
    sourceSpec,
    payloadKind: 'codex_prompt',
    payload: { text },
    estimatedPromptChars: text.length,
  });
}

function buildCodexPromptText(sourceSpec: GenerationTaskSpec) {
  const parts = [`Task: ${sourceSpec.task}`, '', 'Prompt:', sourceSpec.prompt];
  const recipeProviderDirectives = sourceSpec.metadata.recipeProviderDirectives;
  const recipeContext = sourceSpec.metadata.recipeContext;

  if (isRecipeProviderDirectives(recipeProviderDirectives)) {
    parts.push(
      '',
      'Recipe directives:',
      serializeRecipeProviderDirectives(recipeProviderDirectives),
    );
  } else if (typeof recipeContext === 'string' && recipeContext.trim()) {
    parts.push('', 'Recipe instructions:', recipeContext.trim());
  }

  if (sourceSpec.negativePrompt) {
    parts.push('', 'Avoid:', sourceSpec.negativePrompt);
  }

  if (sourceSpec.recipeId) {
    parts.push('', `Recipe: ${sourceSpec.recipeId}`);
  }

  if (sourceSpec.stylePresetId) {
    parts.push(`Style preset: ${sourceSpec.stylePresetId}`);
  }

  if (sourceSpec.output.imageSize) {
    parts.push(`Image size: ${sourceSpec.output.imageSize}`);
  }

  if (sourceSpec.output.aspectRatio) {
    parts.push(`Aspect ratio: ${sourceSpec.output.aspectRatio}`);
  }

  return parts.join('\n');
}

export interface CreateCodexGenerationProviderDependencies {
  turn: CodexTurn;
}

export function createCodexGenerationProvider({
  turn,
}: CreateCodexGenerationProviderDependencies): GenerationProvider {
  return {
    id: 'codex',
    run(job) {
      return turn.runTurn({
        jobId: job.id,
        projectId: job.projectId,
        prompt: job.prompt,
        execution: job.execution,
        signal: job.signal,
        compiledInput: compileCodexImagegenInput(job),
      });
    },
  };
}
