import { describe, expect, it } from 'vitest';

import { ONBOARDING_BUN_INSTALL_URL, ONBOARDING_CODEX_INSTALL_URL } from '../packages/shared/src';
import { resolveOnboardingPrimaryAction } from './onboardingPrimaryAction';

describe('resolveOnboardingPrimaryAction', () => {
  it('opens official installer pages for missing Bun and Codex CLI', () => {
    expect(resolveOnboardingPrimaryAction('open_bun_install')).toEqual({
      type: 'open_url',
      cta: 'open_bun_install',
      label: 'Install Bun',
      url: ONBOARDING_BUN_INSTALL_URL,
    });
    expect(resolveOnboardingPrimaryAction('open_codex_install')).toEqual({
      type: 'open_url',
      cta: 'open_codex_install',
      label: 'Install Codex CLI',
      url: ONBOARDING_CODEX_INSTALL_URL,
    });
  });

  it('uses existing session controls for app-server, in-app Setup, and ready', () => {
    expect(resolveOnboardingPrimaryAction('start_app_server').type).toBe('start_app_server');
    expect(resolveOnboardingPrimaryAction('in_app_setup')).toEqual({
      type: 'in_app_setup',
      cta: 'in_app_setup',
      label: 'Set up Studio',
    });
    expect(resolveOnboardingPrimaryAction('ready').type).toBe('complete');
  });

  it('opens Studio Settings for ChatGPT Sign in', () => {
    expect(resolveOnboardingPrimaryAction('connect_chatgpt')).toEqual({
      type: 'connect_chatgpt',
      cta: 'connect_chatgpt',
      label: 'Sign in with ChatGPT',
    });
    expect(resolveOnboardingPrimaryAction('codex_login')).toEqual({
      type: 'codex_login',
      cta: 'codex_login',
      label: 'Log in with ChatGPT',
    });
  });
});
