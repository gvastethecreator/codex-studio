import type { CatalogImage, Job } from '../../../../packages/shared/src/types';
import { compileGoogleImageApiInput } from './externalProviderInputs';
import { createGooglePromptText } from './googleExecutor';
import { compileProviderInputForJob, hasProviderInputCompiler } from './providerInputCompiler';

/** Reuse the provider's prompt compiler and only report a known image model. */
export function jobImageMetadata(job: Job) {
  const provider = job.providerId ?? job.sourceSpec?.providerId;
  const options = job.execution?.providerOptions;
  const http =
    provider === 'chatgpt' ||
    (provider === 'codex' && options?.codex?.transport === 'subscription_http');
  let prompt = job.finalPromptUsed;
  if (provider === 'google') {
    prompt = createGooglePromptText(compileGoogleImageApiInput({ ...job, prompt }).payload);
  } else if (provider && hasProviderInputCompiler(provider)) {
    const { payload } = compileProviderInputForJob(provider, { ...job, prompt });
    if (payload && typeof payload === 'object') {
      if ('text' in payload && typeof payload.text === 'string') prompt = payload.text;
      else if ('prompt' in payload && typeof payload.prompt === 'string') prompt = payload.prompt;
    }
  }
  return {
    prompt,
    model: http
      ? (options?.chatgpt?.imageModel ??
        options?.chatgpt?.image?.model ??
        options?.codex?.imageModel ??
        options?.codex?.image?.model ??
        'unknown')
      : provider === 'codex'
        ? 'unknown'
        : job.execution?.model?.trim() || 'unknown',
  };
}

/** Recover generation provenance for copies that no longer own a job. */
export function catalogImageMetadata(image: CatalogImage) {
  const provenance = image.generationConfig?.imageConversion as
    | { originalPrompt?: unknown; originalModel?: unknown }
    | undefined;
  return {
    prompt:
      typeof provenance?.originalPrompt === 'string'
        ? provenance.originalPrompt
        : image.prompt || '',
    model:
      typeof provenance?.originalModel === 'string'
        ? provenance.originalModel
        : typeof image.generationConfig?.model === 'string'
          ? image.generationConfig.model
          : 'unknown',
  };
}
