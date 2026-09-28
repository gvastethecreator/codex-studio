import { describe, expect, it } from 'vitest';
import {
  codexModelFromHttpEntry,
  readChatgptHttpSession,
  usageFromCodexUsagePayload,
} from './chatgptAccountHttp';

const usagePayload = {
  plan_type: 'pro',
  rate_limit: {
    allowed: true,
    limit_reached: false,
    primary_window: {
      used_percent: 5,
      limit_window_seconds: 604800,
      reset_after_seconds: 422403,
      reset_at: 1791057499,
    },
    secondary_window: null,
  },
  credits: { has_credits: false, unlimited: false, balance: '0' },
};

describe('ChatGPT account over HTTP', () => {
  it('maps the Codex usage payload to the weekly window app-server reports', () => {
    expect(usageFromCodexUsagePayload(usagePayload)).toMatchObject({
      available: 95,
      display: '95%',
      limits: [{ label: 'Weekly', usedPercent: 5, windowMinutes: 10080, resetsAt: 1791057499 }],
    });
  });

  it('reads plan and usage without claiming local Codex jobs can run', async () => {
    const session = await readChatgptHttpSession({
      getAccessToken: async () => 'token',
      fetch: (async () => new Response(JSON.stringify(usagePayload))) as unknown as typeof fetch,
    });
    expect(session).toMatchObject({
      source: 'chatgpt-http',
      authMode: 'chatgpt',
      planType: 'pro',
      state: 'ready',
      canRunLocalJobs: false,
    });
  });

  it('maps a Codex backend model entry to the catalog shape', () => {
    expect(
      codexModelFromHttpEntry({
        slug: 'gpt-6-astra',
        display_name: 'GPT-6 Astra',
        visibility: 'list',
        default_reasoning_level: 'medium',
        supported_reasoning_levels: [{ effort: 'low', description: 'Fast' }],
        additional_speed_tiers: ['fast'],
        input_modalities: ['text', 'image'],
      }),
    ).toMatchObject({
      id: 'gpt-6-astra',
      displayName: 'GPT-6 Astra',
      hidden: false,
      supportedReasoningEfforts: [{ reasoningEffort: 'low', description: 'Fast' }],
      additionalSpeedTiers: ['fast'],
    });
    expect(codexModelFromHttpEntry({ slug: 'gpt-reserve', visibility: 'hide' })?.hidden).toBe(true);
  });
});
