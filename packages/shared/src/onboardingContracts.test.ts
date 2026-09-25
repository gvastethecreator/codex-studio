import { describe, expect, it } from 'vitest';

import {
  buildOnboardingProbe,
  detectCloudSyncLibraryPath,
  looksLikeAbsoluteLibraryPath,
  onboardingFactsFromHealth,
  parseOnboardingHostActionRequest,
  resolvePrimaryCta,
  ONBOARDING_ACTION_IDS,
  type OnboardingFacts,
  type OnboardingPrimaryCta,
} from './onboardingContracts';

const readyFacts: OnboardingFacts = {
  bunAvailable: true,
  codexCliAvailable: true,
  chatgptLoggedIn: true,
  studioLibraryReady: true,
  studioLibraryPath: 'D:/Codex Studio',
  bootstrapConfigReady: true,
  appServerReady: true,
  grokCliAvailable: false,
  grokLoggedIn: false,
};

const matrix: Array<{ name: string; patch: Partial<OnboardingFacts>; cta: OnboardingPrimaryCta }> =
  [
    { name: 'missing Bun', patch: { bunAvailable: false }, cta: 'open_bun_install' },
    {
      name: 'missing Codex CLI on the ChatGPT path',
      patch: { codexCliAvailable: false },
      cta: 'ready',
    },
    {
      name: 'missing ChatGPT login',
      patch: { chatgptLoggedIn: false },
      cta: 'connect_chatgpt',
    },
    { name: 'missing Studio Library', patch: { studioLibraryReady: false }, cta: 'in_app_setup' },
    {
      name: 'missing Bootstrap Configuration',
      patch: { bootstrapConfigReady: false },
      cta: 'in_app_setup',
    },
    {
      name: 'stopped app-server on the ChatGPT path',
      patch: { appServerReady: false },
      cta: 'ready',
    },
    {
      name: 'Codex selected without CLI',
      patch: { selectedProviderId: 'codex', codexCliAvailable: false },
      cta: 'open_codex_install',
    },
    {
      name: 'Codex selected without app-server',
      patch: { selectedProviderId: 'codex', appServerReady: false },
      cta: 'start_app_server',
    },
    {
      name: 'Codex selected with a local session and no HTTP sign-in',
      patch: {
        selectedProviderId: 'codex',
        chatgptLoggedIn: false,
        localCodexSessionReady: true,
      },
      cta: 'ready',
    },
    {
      name: 'Codex selected without a local session or HTTP sign-in',
      patch: { selectedProviderId: 'codex', chatgptLoggedIn: false },
      cta: 'codex_login',
    },
    {
      name: 'Grok selected without ChatGPT',
      patch: { selectedProviderId: 'grok', chatgptLoggedIn: false },
      cta: 'ready',
    },
    { name: 'ready', patch: {}, cta: 'ready' },
  ];

describe('resolvePrimaryCta', () => {
  it('skips Codex CLI install and app-server when Studio Sign in is ready', () => {
    expect(
      resolvePrimaryCta({
        ...readyFacts,
        codexCliAvailable: false,
        chatgptLoggedIn: true,
        codexSubscriptionReady: true,
        appServerReady: false,
      }),
    ).toBe('ready');
  });
  it.each(matrix)('selects $cta when $name', ({ patch, cta }) => {
    expect(resolvePrimaryCta({ ...readyFacts, ...patch })).toBe(cta);
  });

  it('prefers Bun over every later gap', () => {
    expect(
      resolvePrimaryCta({
        bunAvailable: false,
        codexCliAvailable: false,
        chatgptLoggedIn: false,
        studioLibraryReady: false,
        studioLibraryPath: '',
        bootstrapConfigReady: false,
        appServerReady: false,
        grokCliAvailable: false,
        grokLoggedIn: false,
      }),
    ).toBe('open_bun_install');
  });

  it('does not let missing Grok override a ready Studio primary CTA', () => {
    expect(
      resolvePrimaryCta({
        ...readyFacts,
        grokCliAvailable: false,
        grokLoggedIn: false,
      }),
    ).toBe('ready');
  });
});

describe('buildOnboardingProbe', () => {
  it('returns checks, path, and primary CTA from facts', () => {
    const probe = buildOnboardingProbe({
      ...readyFacts,
      studioLibraryReady: false,
      studioLibraryPath: '  D:/Codex Studio  ',
    });
    expect(probe.primaryCta).toBe('in_app_setup');
    expect(probe.studioLibraryPath).toBe('D:/Codex Studio');
    expect(probe.checks.map((check) => check.id)).toEqual([
      'bun',
      'codex_cli',
      'chatgpt_login',
      'studio_library',
      'bootstrap_config',
      'app_server',
    ]);
    expect(probe.checks.find((check) => check.id === 'studio_library')).toMatchObject({
      ready: false,
      meta: 'D:/Codex Studio',
    });
    expect(probe.checks.map((check) => check.id)).not.toContain('grok');
    expect(probe.grok).toMatchObject({ cliAvailable: false, loggedIn: false });
  });

  it('keeps Codex CLI and app-server not required when ChatGPT is connected', () => {
    const probe = buildOnboardingProbe({
      ...readyFacts,
      codexCliAvailable: false,
      chatgptLoggedIn: true,
      codexSubscriptionReady: true,
      appServerReady: false,
    });
    expect(probe.primaryCta).toBe('ready');
    expect(probe.checks.find((check) => check.id === 'codex_cli')).toMatchObject({
      ready: false,
      requirement: 'not_required',
    });
    expect(probe.checks.find((check) => check.id === 'app_server')).toMatchObject({
      ready: false,
      requirement: 'not_required',
    });
    expect(probe.checks.find((check) => check.id === 'chatgpt_login')).toMatchObject({
      ready: true,
      detail: 'ChatGPT is connected. Availability is checked when you generate.',
    });
  });

  it('points a missing ChatGPT login at ChatGPT sign-in', () => {
    const probe = buildOnboardingProbe({ ...readyFacts, chatgptLoggedIn: false });
    expect(probe.primaryCta).toBe('connect_chatgpt');
    expect(probe.checks.find((check) => check.id === 'chatgpt_login')?.detail).toBe(
      'Sign in with ChatGPT. Codex CLI is only for the Codex connection.',
    );
  });
});

describe('onboardingFactsFromHealth', () => {
  it('treats a missing bun version as unavailable', () => {
    expect(
      onboardingFactsFromHealth({
        bunVersion: null,
        codexCliAvailable: true,
        chatgptLoggedIn: true,
        studioLibraryReady: true,
        studioLibraryPath: 'D:/Codex Studio',
        bootstrapConfigReady: true,
        appServerReady: true,
      }).bunAvailable,
    ).toBe(false);
  });
});

describe('detectCloudSyncLibraryPath', () => {
  it('flags OneDrive-like paths without treating them as invalid', () => {
    expect(detectCloudSyncLibraryPath('C:\\Users\\a\\OneDrive\\Codex Studio')).toBe('OneDrive');
    expect(detectCloudSyncLibraryPath('D:/Codex Studio')).toBe(null);
  });
});

describe('looksLikeAbsoluteLibraryPath', () => {
  it('accepts Windows, POSIX, and UNC paths', () => {
    expect(looksLikeAbsoluteLibraryPath('D:/Codex Studio')).toBe(true);
    expect(looksLikeAbsoluteLibraryPath('C:\\Users\\a\\Codex Studio')).toBe(true);
    expect(looksLikeAbsoluteLibraryPath('/home/a/Codex Studio')).toBe(true);
    expect(looksLikeAbsoluteLibraryPath('Codex Studio')).toBe(false);
  });
});

describe('parseOnboardingHostActionRequest', () => {
  it('requires an explicit host action', () => {
    expect(parseOnboardingHostActionRequest({ consent: true, action: 'codex_login' })).toEqual({
      consent: true,
      action: 'codex_login',
      prompt: null,
    });
    expect(parseOnboardingHostActionRequest({ consent: true, action: 'codex exec' }).action).toBe(
      null,
    );
  });
});

describe('onboarding action contract', () => {
  it('allows grok login and open_url but has no Grok installer id', () => {
    expect(ONBOARDING_ACTION_IDS).toContain('spawn_grok_login');
    expect(ONBOARDING_ACTION_IDS).toContain('open_url');
    expect(ONBOARDING_ACTION_IDS.join(' ')).not.toMatch(/ask_grok|install_grok|grok_install/i);
  });
});
