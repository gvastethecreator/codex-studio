import type {
  EditableStudioSettings,
  GenerationProviderId,
  JobExecutionOptions,
} from '../../../packages/shared/src';

function cleanString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function cleanServiceTier(value: unknown): JobExecutionOptions['serviceTier'] | undefined {
  if (value === null) return null;
  return value === 'fast' || value === 'flex' ? value : undefined;
}

export function resolveEffectiveJobExecutionOptions({
  providerId,
  explicit,
  settings,
  bootstrap,
}: {
  providerId: GenerationProviderId;
  explicit?: JobExecutionOptions | null;
  settings: EditableStudioSettings;
  bootstrap: JobExecutionOptions;
}): JobExecutionOptions {
  const providerDefault = settings.providerDefaults[providerId];
  const explicitServiceTier =
    explicit && Object.hasOwn(explicit, 'serviceTier')
      ? cleanServiceTier(explicit.serviceTier)
      : undefined;

  return {
    model: cleanString(explicit?.model) ?? cleanString(providerDefault?.model) ?? bootstrap.model,
    reasoningEffort:
      cleanString(explicit?.reasoningEffort) ??
      cleanString(providerDefault?.reasoningEffort) ??
      bootstrap.reasoningEffort,
    serviceTier:
      explicitServiceTier !== undefined
        ? explicitServiceTier
        : (providerDefault?.serviceTier ?? bootstrap.serviceTier ?? null),
  };
}
