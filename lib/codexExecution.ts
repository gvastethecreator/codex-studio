import type { CodexModel, CodexServiceTier } from '../packages/shared/src';

const PREFERRED_MODEL_IDS = ['gpt-5.4-mini', 'gpt-5.3-codex-spark'] as const;
const FALLBACK_REASONING_EFFORTS = ['low', 'medium', 'high'];
const KNOWN_SPEED_TIERS: Exclude<CodexServiceTier, 'standard'>[] = ['fast', 'flex'];

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function pickPreferredCodexModel(models: CodexModel[], currentModel?: string | null) {
  if (currentModel && models.some((model) => model.id === currentModel)) {
    return currentModel;
  }

  for (const preferred of PREFERRED_MODEL_IDS) {
    if (models.some((model) => model.id === preferred)) {
      return preferred;
    }
  }

  const defaultModel = models.find((model) => model.isDefault);
  return defaultModel?.id ?? models[0]?.id ?? null;
}

export function getCodexReasoningOptions(model: CodexModel | null | undefined) {
  const supported =
    model?.supportedReasoningEfforts
      ?.map((option) => option.reasoningEffort?.trim())
      .filter(Boolean) ?? [];

  return unique(supported.length > 0 ? supported : FALLBACK_REASONING_EFFORTS);
}

export function normalizeCodexReasoningEffort(
  model: CodexModel | null | undefined,
  requestedEffort?: string | null,
) {
  const supported = getCodexReasoningOptions(model);
  const trimmedRequested = requestedEffort?.trim();

  if (trimmedRequested && supported.includes(trimmedRequested)) {
    return trimmedRequested;
  }

  const defaultEffort = model?.defaultReasoningEffort?.trim();
  if (defaultEffort && supported.includes(defaultEffort)) {
    return defaultEffort;
  }

  return supported[0] ?? 'low';
}

export function getCodexSpeedOptions(model: CodexModel | null | undefined): CodexServiceTier[] {
  const supported =
    model?.additionalSpeedTiers?.filter((tier): tier is Exclude<CodexServiceTier, 'standard'> =>
      KNOWN_SPEED_TIERS.includes(tier),
    ) ?? [];

  return ['standard', ...unique(supported)];
}

export function normalizeCodexSpeed(
  model: CodexModel | null | undefined,
  requestedSpeed?: CodexServiceTier | null,
): CodexServiceTier {
  const supported = getCodexSpeedOptions(model);
  return requestedSpeed && supported.includes(requestedSpeed) ? requestedSpeed : 'standard';
}

export function formatCodexModelLabel(modelId?: string | null, displayName?: string | null) {
  const source = (displayName || modelId || 'Default').trim();

  return source
    .replace(/^GPT-/i, '')
    .replace(/^gpt-/i, '')
    .replace(/-Codex-Spark/i, ' Spark')
    .replace(/-Codex/i, ' Codex')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCodexSpeedLabel(speed: CodexServiceTier) {
  switch (speed) {
    case 'fast':
      return 'Fast';
    case 'flex':
      return 'Flex';
    default:
      return 'Standard';
  }
}
