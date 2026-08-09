import type { GenerationProviderId, JobExecutionOptions } from '../../../../packages/shared/src';
import { getSettings } from '../config';

export const DEFAULT_GOOGLE_IMAGE_MODEL = 'gemini-2.5-flash-image';
export const DEFAULT_GROK_IMAGE_MODEL = 'grok-4.5';
export const DEFAULT_FAL_IMAGE_MODEL = 'fal-ai/flux/schnell';
export const DEFAULT_COMFY_MODEL = 'workflow-template';

export function resolveBootstrapProviderExecutionOptions(
  providerId: GenerationProviderId,
  env: Record<string, string | undefined> = process.env,
): JobExecutionOptions {
  if (providerId === 'codex') {
    const settings = getSettings();
    return {
      model: settings.codexImagegenModel,
      reasoningEffort: settings.codexImagegenReasoningEffort,
      serviceTier: settings.codexImagegenServiceTier,
    };
  }

  if (providerId === 'google') {
    return {
      model: env.GOOGLE_IMAGE_MODEL?.trim() || DEFAULT_GOOGLE_IMAGE_MODEL,
      reasoningEffort: 'minimal',
      serviceTier: null,
    };
  }

  if (providerId === 'grok') {
    return {
      model: env.GROK_IMAGE_MODEL?.trim() || DEFAULT_GROK_IMAGE_MODEL,
      reasoningEffort: 'low',
      serviceTier: null,
    };
  }

  if (providerId === 'fal') {
    return {
      model: env.FAL_MODEL?.trim() || DEFAULT_FAL_IMAGE_MODEL,
      reasoningEffort: 'minimal',
      serviceTier: null,
    };
  }

  if (providerId === 'comfy') {
    return {
      model: DEFAULT_COMFY_MODEL,
      reasoningEffort: 'minimal',
      serviceTier: null,
    };
  }

  return {
    model: 'dry-run',
    reasoningEffort: 'minimal',
    serviceTier: null,
  };
}
