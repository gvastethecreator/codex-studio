import { describe, expect, it } from 'vite-plus/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  appendOnboardingLogLine,
  formatOnboardingStageLine,
  onboardingLogLineFromSystemLog,
  shouldAutoOpenOnboarding,
  shouldCloseOnboardingBecauseReady,
} from './onboardingEventLog';

describe('onboarding event log', () => {
  it('formats stage lines and keeps a bounded log', () => {
    const first = appendOnboardingLogLine(
      [],
      {
        id: '1',
        kind: 'stage',
        text: formatOnboardingStageLine({
          action: 'setup',
          stage: 'setup_start',
          message: 'Starting Setup.',
        }),
      },
      2,
    );
    const next = appendOnboardingLogLine(
      first,
      { id: '2', kind: 'log', text: 'Wrote Bootstrap Configuration.' },
      2,
    );
    const clipped = appendOnboardingLogLine(next, { id: '3', kind: 'log', text: 'Done.' }, 2);
    expect(first[0]?.text).toBe('setup_start: Starting Setup.');
    expect(clipped.map((line) => line.id)).toEqual(['2', '3']);
  });

  it('ignores non-onboarding system logs', () => {
    expect(
      onboardingLogLineFromSystemLog({
        id: 9,
        level: 'info',
        scope: 'worker',
        message: 'job started',
        jobId: 'job-1',
        createdAt: '2026-08-26T00:00:00.000Z',
      }),
    ).toBeNull();
  });

  it('opens only when Studio Readiness is not ready, and closes when it is', () => {
    expect(
      shouldAutoOpenOnboarding({
        hasSeenOnboarding: false,
        shouldAutoOpen: true,
        isReady: true,
        hasHealthSnapshot: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoOpenOnboarding({
        hasSeenOnboarding: false,
        shouldAutoOpen: true,
        isReady: false,
        hasHealthSnapshot: false,
      }),
    ).toBe(false);
    expect(
      shouldAutoOpenOnboarding({
        hasSeenOnboarding: false,
        shouldAutoOpen: true,
        isReady: false,
        hasHealthSnapshot: true,
      }),
    ).toBe(true);
    expect(shouldCloseOnboardingBecauseReady(true, true)).toBe(true);
    expect(shouldCloseOnboardingBecauseReady(false, true)).toBe(false);
  });

  it('uses the existing /api/events bus from the onboarding surface', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '..', 'components', 'OnboardingModal.tsx'),
      'utf8',
    );
    expect(source).toContain('ONBOARDING_LOG_PANEL_EMPTY');
    expect(source).toContain('createStudioEventStream');
    expect(source).toContain('onOnboardingStage');
    expect(source).not.toMatch(/WebSocket|new EventSource/);
    expect(source).toContain('onStartAppServer');
  });

  it('keeps Start app-server on the existing Codex Product Runtime route', () => {
    const hook = readFileSync(
      path.join(import.meta.dirname, '..', 'hooks', 'useStudioOnboarding.ts'),
      'utf8',
    );
    const runtime = readFileSync(
      path.join(import.meta.dirname, '..', 'services', 'studio-api', 'runtime.ts'),
      'utf8',
    );
    expect(hook).toContain('startStudioAppServer');
    expect(runtime).toContain('/api/app-server/start');
    expect(hook).not.toMatch(/\/onboarding\/.*app-server/);
  });
});
