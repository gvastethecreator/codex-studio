import { CodexRpcClient } from './rpcClient';
import type {
  CodexAuthMode,
  CodexModel,
  CodexModelCatalogResponse,
} from '../../../../packages/shared/src';

const FALLBACK_MODELS: CodexModel[] = [
  {
    id: 'gpt-5.4-mini',
    model: 'gpt-5.4-mini',
    displayName: 'GPT-5.4 mini',
    description: 'Fast, efficient Codex model for routine local tasks and subagents.',
    hidden: false,
    defaultReasoningEffort: 'low',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: [],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: false,
  },
  {
    id: 'gpt-5.3-codex-spark',
    model: 'gpt-5.3-codex-spark',
    displayName: 'GPT-5.3-Codex-Spark',
    description: 'Near-instant research-preview Codex model for fast day-to-day coding iteration.',
    hidden: false,
    defaultReasoningEffort: 'low',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
    ],
    additionalSpeedTiers: [],
    inputModalities: ['text'],
    supportsPersonality: true,
    isDefault: false,
  },
  {
    id: 'gpt-5.5',
    model: 'gpt-5.5',
    displayName: 'GPT-5.5',
    description: 'Recommended Codex model for most implementation, debugging, and validation work.',
    hidden: false,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: ['fast'],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: true,
  },
  {
    id: 'gpt-5.4',
    model: 'gpt-5.4',
    displayName: 'GPT-5.4',
    description: 'Capable frontier Codex model for complex workflows and long-horizon tasks.',
    hidden: false,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: ['fast'],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: false,
  },
  {
    id: 'gpt-5.3-codex',
    model: 'gpt-5.3-codex',
    displayName: 'GPT-5.3-Codex',
    description: 'Agentic coding model tuned for complex real-world software engineering tasks.',
    hidden: false,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: [],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: false,
  },
  {
    id: 'gpt-5.2',
    model: 'gpt-5.2',
    displayName: 'GPT-5.2',
    description: 'Broadly compatible Codex fallback model for ChatGPT sign-in users.',
    hidden: false,
    defaultReasoningEffort: 'medium',
    supportedReasoningEfforts: [
      { reasoningEffort: 'low', description: 'Lower latency' },
      { reasoningEffort: 'medium', description: 'Balanced' },
      { reasoningEffort: 'high', description: 'More thinking' },
    ],
    additionalSpeedTiers: [],
    inputModalities: ['text', 'image'],
    supportsPersonality: true,
    isDefault: false,
  },
];

function now() {
  return new Date().toISOString();
}

function resolveAuthMode(account: any): CodexAuthMode {
  if (!account || typeof account !== 'object') return null;
  if (account.type === 'apiKey') return 'apikey';
  if (account.type === 'chatgpt') return 'chatgpt';
  if (account.type === 'chatgptAuthTokens') return 'chatgptAuthTokens';
  return null;
}

function normalizeSpeedTiers(value: unknown): CodexModel['additionalSpeedTiers'] {
  if (!Array.isArray(value)) return [];
  return value.filter((tier): tier is CodexModel['additionalSpeedTiers'][number] => {
    return tier === 'fast' || tier === 'flex';
  });
}

function normalizeReasoningOptions(value: unknown): CodexModel['supportedReasoningEfforts'] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => ({
      reasoningEffort:
        entry && typeof entry === 'object' && typeof (entry as any).reasoningEffort === 'string'
          ? (entry as any).reasoningEffort
          : '',
      description:
        entry && typeof entry === 'object' && typeof (entry as any).description === 'string'
          ? (entry as any).description
          : null,
    }))
    .filter((entry) => Boolean(entry.reasoningEffort));
}

function mapModel(entry: any): CodexModel | null {
  const id = typeof entry?.id === 'string' ? entry.id : null;
  if (!id) return null;

  const model = typeof entry?.model === 'string' ? entry.model : id;
  const displayName = typeof entry?.displayName === 'string' ? entry.displayName : model;

  return {
    id,
    model,
    displayName,
    description: typeof entry?.description === 'string' ? entry.description : null,
    hidden: Boolean(entry?.hidden),
    defaultReasoningEffort:
      typeof entry?.defaultReasoningEffort === 'string' ? entry.defaultReasoningEffort : null,
    supportedReasoningEfforts: normalizeReasoningOptions(entry?.supportedReasoningEfforts),
    additionalSpeedTiers: normalizeSpeedTiers(entry?.additionalSpeedTiers),
    inputModalities: Array.isArray(entry?.inputModalities)
      ? entry.inputModalities.filter((modality: unknown): modality is string => typeof modality === 'string')
      : ['text', 'image'],
    supportsPersonality: Boolean(entry?.supportsPersonality),
    isDefault: Boolean(entry?.isDefault),
  };
}

function pickRecommendedModel(models: CodexModel[]) {
  const preferred = ['gpt-5.4-mini', 'gpt-5.3-codex-spark'];
  for (const modelId of preferred) {
    if (models.some((model) => model.id === modelId)) {
      return modelId;
    }
  }

  return models.find((model) => model.isDefault)?.id ?? models[0]?.id ?? null;
}

function buildFallbackCatalog(error: unknown): CodexModelCatalogResponse {
  return {
    models: FALLBACK_MODELS,
    authMode: null,
    planType: null,
    recommendedDefaultModel: pickRecommendedModel(FALLBACK_MODELS),
    source: 'fallback',
    fetchedAt: now(),
    error: error instanceof Error ? error.message : String(error),
  };
}

export async function getCodexModelCatalog(): Promise<CodexModelCatalogResponse> {
  const client = new CodexRpcClient();

  try {
    await client.connect();
    await client.request('initialize', {
      clientInfo: {
        name: 'codex-studio',
        title: 'Codex Studio',
        version: '0.1.0',
      },
      capabilities: null,
    });
    client.notify('initialized');

    const [modelResponse, accountResponse] = await Promise.all([
      client.request('model/list', { limit: 100, includeHidden: false }),
      client.request('account/read', { refreshToken: false }).catch(() => null),
    ]);

    const models = Array.isArray((modelResponse as any)?.data)
      ? ((modelResponse as any).data as any[])
          .map(mapModel)
          .filter((model): model is CodexModel => Boolean(model))
      : [];

    const account = (accountResponse as any)?.account ?? null;

    return {
      models,
      authMode: resolveAuthMode(account),
      planType: typeof account?.planType === 'string' ? account.planType : null,
      recommendedDefaultModel: pickRecommendedModel(models),
      source: 'app-server',
      fetchedAt: now(),
      error: null,
    };
  } catch (error) {
    return buildFallbackCatalog(error);
  } finally {
    client.close();
  }
}