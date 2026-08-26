import { describe, expect, it } from 'vite-plus/test';

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
    { name: 'missing Codex CLI', patch: { codexCliAvailable: false }, cta: 'open_codex_install' },
    { name: 'missing ChatGPT login', patch: { chatgptLoggedIn: false }, cta: 'codex_login' },
    { name: 'missing Studio Library', patch: { studioLibraryReady: false }, cta: 'in_app_setup' },
    {
      name: 'missing Bootstrap Configuration',
      patch: { bootstrapConfigReady: false },
      cta: 'in_app_setup',
    },
    { name: 'stopped app-server', patch: { appServerReady: false }, cta: 'start_app_server' },
    { name: 'ready', patch: {}, cta: 'ready' },
  ];

describe('resolvePrimaryCta', () => {
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
