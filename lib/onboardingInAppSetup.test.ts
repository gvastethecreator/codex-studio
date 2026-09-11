import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildOnboardingProbe } from '../packages/shared/src';
import {
  buildInAppSetupRequest,
  inAppSetupCanSubmit,
  inAppSetupCloudProvider,
  resolveInAppSetupDraftPath,
} from './onboardingInAppSetup';

const probe = buildOnboardingProbe({
  bunAvailable: true,
  codexCliAvailable: true,
  chatgptLoggedIn: true,
  studioLibraryReady: false,
  studioLibraryPath: 'D:/Codex Studio',
  bootstrapConfigReady: false,
  appServerReady: false,
  grokCliAvailable: false,
  grokLoggedIn: false,
});

describe('in-app Setup form', () => {
  it('shows the resolved Studio Library path from the probe', () => {
    expect(resolveInAppSetupDraftPath(probe)).toBe('D:/Codex Studio');
    expect(resolveInAppSetupDraftPath(null)).toBe('');
  });

  it('does not submit without consent or an absolute path', () => {
    expect(
      inAppSetupCanSubmit({
        consent: false,
        libraryPath: 'D:/Codex Studio',
        confirmCloudSync: false,
      }),
    ).toBe(false);
    expect(
      inAppSetupCanSubmit({
        consent: true,
        libraryPath: 'Codex Studio',
        confirmCloudSync: false,
      }),
    ).toBe(false);
    expect(
      inAppSetupCanSubmit({
        consent: true,
        libraryPath: 'D:/Codex Studio',
        confirmCloudSync: false,
      }),
    ).toBe(true);
  });

  it('requires a cloud-sync confirm for OneDrive-like paths', () => {
    expect(inAppSetupCloudProvider('C:/Users/a/OneDrive/Codex Studio')).toBe('OneDrive');
    expect(
      inAppSetupCanSubmit({
        consent: true,
        libraryPath: 'C:/Users/a/OneDrive/Codex Studio',
        confirmCloudSync: false,
      }),
    ).toBe(false);
    expect(
      inAppSetupCanSubmit({
        consent: true,
        libraryPath: 'C:/Users/a/OneDrive/Codex Studio',
        confirmCloudSync: true,
      }),
    ).toBe(true);
  });

  it('asks the backend to init the library and install deps only when needed', () => {
    expect(
      buildInAppSetupRequest({
        consent: true,
        libraryPath: 'D:/Codex Studio',
        confirmCloudSync: false,
      }),
    ).toEqual({
      consent: true,
      libraryPath: 'D:/Codex Studio',
      confirmCloudSync: false,
      initLibrary: true,
      installDeps: true,
    });
  });
});

describe('OnboardingModal Setup surface', () => {
  it('wires consent-gated in-app Setup and does not add a second generate folder', () => {
    const onboardingSource = readFileSync(
      path.join(import.meta.dirname, '..', 'components', 'OnboardingModal.tsx'),
      'utf8',
    );
    expect(onboardingSource).toContain('runOnboardingSetup');
    expect(onboardingSource).toContain('inAppSetupCanSubmit');
    expect(onboardingSource).toContain('Studio Library path');
    expect(onboardingSource).not.toMatch(/preferredOutputPath/);
    expect(onboardingSource).not.toMatch(/Preferred Output Path/);
  });
});
