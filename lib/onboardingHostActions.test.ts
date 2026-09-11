import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { shouldShowAskCodex } from './onboardingHostActions';

describe('Ask Codex visibility', () => {
  it('is hidden when Codex CLI is missing', () => {
    expect(
      shouldShowAskCodex({
        bunAvailable: true,
        codexCliAvailable: false,
        chatgptLoggedIn: false,
        studioLibraryReady: false,
        studioLibraryPath: 'D:/Codex Studio',
        bootstrapConfigReady: false,
        appServerReady: false,
        grokCliAvailable: false,
        grokLoggedIn: false,
      }),
    ).toBe(false);
    expect(
      shouldShowAskCodex({
        bunAvailable: true,
        codexCliAvailable: true,
        chatgptLoggedIn: false,
        studioLibraryReady: false,
        studioLibraryPath: 'D:/Codex Studio',
        bootstrapConfigReady: false,
        appServerReady: false,
        grokCliAvailable: false,
        grokLoggedIn: false,
      }),
    ).toBe(true);
  });

  it('keeps Ask Codex on the onboarding surface without spawning from the renderer', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '..', 'components', 'OnboardingModal.tsx'),
      'utf8',
    );
    expect(source).toContain('shouldShowAskCodex');
    expect(source).toContain('ONBOARDING_ASK_CODEX_LABEL');
    expect(source).toContain('runOnboardingHostAction');
    expect(source).not.toMatch(/child_process|spawn\(/);
    expect(source).not.toMatch(/codex exec/);
  });
});
