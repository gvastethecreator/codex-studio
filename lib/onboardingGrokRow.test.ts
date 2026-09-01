import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { ONBOARDING_ACTION_IDS } from '../packages/shared/src';
import { grokRowNeedsInstall, grokRowNeedsLogin } from './onboardingGrokRow';

describe('optional Grok onboarding row', () => {
  it('shows install docs when the CLI is missing and grok login when it is present', () => {
    expect(
      grokRowNeedsInstall({ cliAvailable: false, loggedIn: false, label: 'Grok', detail: '' }),
    ).toBe(true);
    expect(
      grokRowNeedsLogin({ cliAvailable: false, loggedIn: false, label: 'Grok', detail: '' }),
    ).toBe(false);
    expect(
      grokRowNeedsLogin({ cliAvailable: true, loggedIn: false, label: 'Grok', detail: '' }),
    ).toBe(true);
    expect(
      grokRowNeedsInstall({ cliAvailable: true, loggedIn: true, label: 'Grok', detail: '' }),
    ).toBe(false);
    expect(
      grokRowNeedsInstall({ cliAvailable: false, loggedIn: true, label: 'Grok', detail: '' }),
    ).toBe(false);
  });

  it('keeps Grok off the Studio installer contract and primary CTA', () => {
    expect(ONBOARDING_ACTION_IDS).not.toEqual(expect.arrayContaining(['ask_grok']));
    const source = readFileSync(
      path.join(import.meta.dirname, '..', 'components', 'OnboardingModal.tsx'),
      'utf8',
    );
    expect(source).toContain('ONBOARDING_GROK_INSTALL_URL');
    expect(source).toContain('grok_login');
    expect(source).not.toMatch(/Ask Grok/i);
  });
});
