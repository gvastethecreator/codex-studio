import { describe, expect, it } from 'vite-plus/test';

import type {
  HealthResponse,
  LocalCodexSessionResponse,
  StudioReadinessSnapshot,
} from '../packages/shared/src';
import {
  buildCodexStudioSetupPrompt,
  CODEX_STUDIO_SETUP_SKILL_PATH,
} from './onboardingSetupPrompt';

function createReadiness(overrides?: Partial<StudioReadinessSnapshot>): StudioReadinessSnapshot {
  return {
    stage: 'action_required',
    isReady: false,
    nextAction: 'login-chatgpt',
    title: 'Use ChatGPT login',
    description: 'Re-authenticate the local Codex CLI with ChatGPT.',
    checks: [
      {
        key: 'backend',
        label: 'Backend',
        ok: true,
        detail: 'The local Studio backend is reachable.',
        blocking: true,
      },
      {
        key: 'localCodexSession',
        label: 'Local Codex Session',
        ok: false,
        detail: 'Run `codex login` and choose ChatGPT.',
        blocking: true,
      },
    ],
    ...overrides,
  };
}

function createHealth(overrides?: Partial<HealthResponse>): HealthResponse {
  return {
    ok: true,
    checkedAt: '2026-06-27T00:00:00.000Z',
    libraryDir: 'D:/AI-Studio-Library',
    runtime: {
      platform: 'win32',
      arch: 'x64',
      bunVersion: 'reported Bun metadata',
      nodeVersion: 'reported Node metadata',
      cwd: 'D:/DEV/codex-studio',
      envLocalPath: 'D:/DEV/codex-studio/.env.local',
      envLocalPresent: true,
    },
    config: {
      serverPort: 17223,
      codexWsPort: 17224,
    },
    library: {
      exists: true,
      writable: true,
      readmePresent: true,
      missingFolders: [],
    },
    codexCli: {
      available: true,
      version: 'reported Codex CLI metadata',
      command: 'codex --version',
    },
    codexRuntime: {
      status: 'ready',
      canRunJobs: true,
      checkedAt: '2026-06-27T00:00:00.000Z',
      selectedExecutable: 'codex',
      selectedCommand: 'codex --version',
      selectedVersion: 'reported Codex runtime metadata',
      selectedVersionNumber: null,
      appServerSupported: true,
      recommendedAction: 'Codex Product Runtime is ready.',
      issues: [],
      candidates: [],
    },
    appServer: {
      running: false,
      wsUrl: 'ws://127.0.0.1:17224',
      pid: null,
      lastExitCode: null,
      lastExitAt: null,
      lastInvocation: null,
      lastStartAt: null,
      lastStartError: null,
      lastEnsureAt: null,
      lastEnsureReason: null,
    },
    checks: {
      libraryReady: true,
      codexReady: true,
      onboardingReady: false,
    },
    worker: {
      maxConcurrentJobs: 1,
      activeWorkerCount: 0,
      queuedJobs: 0,
      trackedJobs: 0,
    },
    ...overrides,
  };
}

function createSession(overrides?: Partial<LocalCodexSessionResponse>): LocalCodexSessionResponse {
  return {
    authMode: null,
    planType: null,
    usage: null,
    source: 'app-server',
    fetchedAt: '2026-06-27T00:00:00.000Z',
    error: null,
    authLabel: 'Not signed in',
    state: 'requires_chatgpt_login',
    reason: 'chatgpt_login_required',
    isChatgptLogin: false,
    isSupportedAuthMode: true,
    canRunLocalJobs: false,
    ...overrides,
  };
}

describe('buildCodexStudioSetupPrompt', () => {
  it('builds a ready-to-copy setup prompt with local context and guardrails', () => {
    const prompt = buildCodexStudioSetupPrompt({
      apiBase: 'http://127.0.0.1:17223',
      health: createHealth(),
      isDesktopRuntime: true,
      localCodexSession: createSession(),
      readiness: createReadiness(),
    });

    expect(prompt).toContain(CODEX_STUDIO_SETUP_SKILL_PATH);
    expect(prompt).toContain('D:/DEV/codex-studio');
    expect(prompt).toContain('D:/AI-Studio-Library');
    expect(prompt).toContain('Local Codex Session: chatgpt_login_required');
    expect(prompt).toContain('Codex Runtime Capability: ready; app-server support: yes');
    expect(prompt).toContain('Codex Runtime Action: Codex Product Runtime is ready.');
    expect(prompt).toContain('Bun and Codex command output as diagnostic metadata only');
    expect(prompt).toContain('Run or repair `bun run studio:init`');
    expect(prompt).toContain('Provider Secrets out of SQLite');
    expect(prompt).toContain('bun run test');
    expect(prompt).toContain('bun run check');
    expect(prompt).toContain('bun run build');
  });

  it('stays useful before backend health is available', () => {
    const prompt = buildCodexStudioSetupPrompt({
      apiBase: 'http://127.0.0.1:17223',
      health: null,
      isDesktopRuntime: false,
      localCodexSession: null,
      readiness: createReadiness({ checks: [] }),
    });

    expect(prompt).toContain('Project root: Codex Studio repository root');
    expect(prompt).toContain('Runtime: Web runtime');
    expect(prompt).toContain('Studio Library not detected yet');
    expect(prompt).toContain('Bun runtime metadata: not reported');
    expect(prompt).toContain('No readiness checks were available yet.');
  });
});
