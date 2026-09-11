import { describe, expect, it, vi } from 'vitest';

import { buildOnboardingProbe } from '../packages/shared/src';
import {
  loadStudioOnboardProbe,
  parseStudioOnboardSetupFlags,
  resolveStudioOnboardCommand,
  resolveStudioOnboardConsent,
  runStudioOnboardHostAction,
  runStudioOnboardSetup,
} from './studio-onboard';

const sampleProbe = buildOnboardingProbe({
  bunAvailable: true,
  codexCliAvailable: true,
  chatgptLoggedIn: true,
  studioLibraryReady: true,
  studioLibraryPath: 'D:/Codex Studio',
  bootstrapConfigReady: true,
  appServerReady: true,
  grokCliAvailable: false,
  grokLoggedIn: false,
});

describe('studio:onboard CLI', () => {
  it('accepts --probe, --setup, --login, and --ask-codex', () => {
    expect(resolveStudioOnboardCommand(['--probe'])).toBe('probe');
    expect(resolveStudioOnboardCommand(['--setup', '--yes'])).toBe('setup');
    expect(resolveStudioOnboardCommand(['--login', '--yes'])).toBe('login');
    expect(resolveStudioOnboardCommand(['--ask-codex', '--yes'])).toBe('ask_codex');
    expect(resolveStudioOnboardCommand([])).toBe(null);
  });

  it('parses Setup flags including documented --yes', () => {
    expect(
      parseStudioOnboardSetupFlags(['--setup', '--yes', '--library-path', 'D:/Codex Studio']),
    ).toEqual({
      yes: true,
      libraryPath: 'D:/Codex Studio',
      confirmCloudSync: false,
      installDeps: true,
    });
    expect(
      parseStudioOnboardSetupFlags(['--setup', '--no-install-deps', '--confirm-cloud-sync']),
    ).toEqual({
      yes: false,
      libraryPath: null,
      confirmCloudSync: true,
      installDeps: false,
    });
  });

  it('asks on a TTY and requires --yes when there is no TTY', () => {
    expect(resolveStudioOnboardConsent({ yes: true, isTty: false })).toBe('proceed');
    expect(resolveStudioOnboardConsent({ yes: false, isTty: true })).toBe('ask');
    expect(resolveStudioOnboardConsent({ yes: false, isTty: false })).toBe('needs_yes');
  });

  it('does not mutate without --yes on a non-TTY', async () => {
    const applySetup = vi.fn();
    await expect(
      runStudioOnboardSetup({
        flags: {
          yes: false,
          libraryPath: 'D:/Codex Studio',
          confirmCloudSync: false,
          installDeps: false,
        },
        isTty: false,
        applySetup,
      }),
    ).resolves.toMatchObject({
      ok: false,
      status: 2,
      error: expect.stringContaining('--yes'),
    });
    expect(applySetup).not.toHaveBeenCalled();
  });

  it('applies Setup after --yes', async () => {
    const applySetup = vi.fn(() => ({
      ok: true as const,
      libraryPath: 'D:/Codex Studio',
      wroteEnv: true,
      initializedLibrary: true,
      installedDeps: false,
      skippedDepInstall: true,
      cloudSyncProvider: null,
    }));
    await expect(
      runStudioOnboardSetup({
        flags: {
          yes: true,
          libraryPath: 'D:/Codex Studio',
          confirmCloudSync: false,
          installDeps: true,
        },
        isTty: false,
        applySetup,
      }),
    ).resolves.toMatchObject({
      ok: true,
      result: { libraryPath: 'D:/Codex Studio', wroteEnv: true },
    });
    expect(applySetup).toHaveBeenCalledWith({
      consent: true,
      libraryPath: 'D:/Codex Studio',
      confirmCloudSync: false,
      initLibrary: true,
      installDeps: true,
    });
  });

  it('prefers the HTTP probe when the local API is up', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(sampleProbe), { status: 200 }));
    const fallback = vi.fn(() => {
      throw new Error('fallback should not run');
    });

    await expect(
      loadStudioOnboardProbe({
        apiBase: 'http://127.0.0.1:17223',
        fetchImpl: fetchImpl as unknown as typeof fetch,
        fallback,
      }),
    ).resolves.toMatchObject({ primaryCta: 'ready', studioLibraryPath: 'D:/Codex Studio' });
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses the local collect fallback when HTTP fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('backend down');
    });
    const fallback = vi.fn(() => sampleProbe);

    await expect(
      loadStudioOnboardProbe({
        fetchImpl: fetchImpl as unknown as typeof fetch,
        fallback,
      }),
    ).resolves.toEqual(sampleProbe);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('opens login only after --yes', async () => {
    const applyHostAction = vi.fn(() => ({
      ok: true,
      action: 'codex_login' as const,
      command: 'codex login',
      cwd: 'D:/codex-studio',
      error: null,
    }));
    await expect(
      runStudioOnboardHostAction({
        action: 'codex_login',
        yes: false,
        isTty: false,
        applyHostAction,
      }),
    ).resolves.toMatchObject({ ok: false, status: 2 });
    expect(applyHostAction).not.toHaveBeenCalled();

    await expect(
      runStudioOnboardHostAction({
        action: 'codex_login',
        yes: true,
        isTty: false,
        applyHostAction,
      }),
    ).resolves.toMatchObject({ ok: true, result: { command: 'codex login' } });
    expect(applyHostAction).toHaveBeenCalledWith({
      consent: true,
      action: 'codex_login',
      prompt: null,
    });
  });
});
