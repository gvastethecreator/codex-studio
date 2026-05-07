import { getSettings } from '../config';
import type { JobExecutionOptions } from '../../../../packages/shared/src';

export function resolveJobExecutionOptions(execution?: JobExecutionOptions | null) {
  const settings = getSettings();

  return {
    model: execution?.model?.trim() || settings.codexImagegenModel,
    reasoningEffort:
      execution?.reasoningEffort?.trim() || settings.codexImagegenReasoningEffort,
    serviceTier: execution?.serviceTier ?? settings.codexImagegenServiceTier ?? null,
  };
}