import { describe, expect, it } from 'vitest';

import type { HealthResponse, LocalCodexSessionResponse } from '../packages/shared/src';
import { listRecipeModules } from '../lib/recipeModules';
import { buildRecipeSpec } from './evaluate-recipe-prompts';
import {
  createLiveRecipeEvaluationPlan,
  createLiveRecipeEvaluationReport,
  createLiveVariantSourceSpec,
  evaluateLiveRuntimeReadiness,
  verifyLiveRecipeEvaluationReport,
} from './evaluate-recipe-prompts-live';

function getRecipeModule(recipeId: string) {
  const module = listRecipeModules().find((entry) => entry.id === recipeId);
  if (!module) {
    throw new Error(`Missing recipe module ${recipeId}`);
  }
  return module;
}

describe('live recipe prompt quality evaluation', () => {
  it('disables directives only for the bare variant', () => {
    const spec = buildRecipeSpec(getRecipeModule('styles'));

    expect(createLiveVariantSourceSpec(spec, 'bare').metadata.recipeProviderDirectives).toBeNull();
    expect(
      createLiveVariantSourceSpec(spec, 'directives').metadata.recipeProviderDirectives,
    ).toBeTruthy();
    expect(spec.metadata).not.toHaveProperty('recipeContext');
  });

  it('plans live comparisons where directives add recipe text to the bare prompt', () => {
    const plan = createLiveRecipeEvaluationPlan({ moduleIds: ['styles'] });
    const pair = plan.pairs[0];
    const bare = pair.variants.find((variant) => variant.name === 'bare');
    const directives = pair.variants.find((variant) => variant.name === 'directives');

    expect(plan.pairs).toHaveLength(1);
    expect(bare).toBeTruthy();
    expect(directives).toBeTruthy();
    expect(bare!.compiledPromptChars).toBeLessThan(directives!.compiledPromptChars);
  });

  it('verifies a planned report', () => {
    const plan = createLiveRecipeEvaluationPlan({ moduleIds: ['styles'] });
    const report = createLiveRecipeEvaluationReport(plan, {
      apiBase: 'http://127.0.0.1:17223',
    });

    expect(verifyLiveRecipeEvaluationReport(report)).toEqual([]);
  });

  it('flags runtime blockers when the local Codex session is not ready', () => {
    const health = {
      ok: true,
      checkedAt: '2026-05-26T00:00:00.000Z',
      libraryDir: 'D:/AI-Studio-Library',
      runtime: {
        platform: 'win32',
        arch: 'x64',
        bunVersion: '1.3.13',
        nodeVersion: '22.0.0',
        cwd: 'D:/DEV/cozy-studio',
        envLocalPath: 'D:/DEV/cozy-studio/.env.local',
        envLocalPresent: false,
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
        version: '1.0.0',
        command: 'codex --version',
      },
      codexRuntime: {
        status: 'ready',
        canRunJobs: true,
        checkedAt: '2026-05-26T00:00:00.000Z',
        selectedExecutable: 'codex',
        selectedCommand: 'codex --version',
        selectedVersion: 'codex-cli 1.0.0',
        selectedVersionNumber: '1.0.0',
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
        providerLimits: {},
        activeByProvider: {},
        waiting: [],
        stopping: false,
      },
    } satisfies HealthResponse;
    const session = {
      authMode: 'chatgpt',
      planType: 'Plus',
      usage: null,
      source: 'app-server',
      fetchedAt: '2026-05-26T00:00:00.000Z',
      error: null,
      authLabel: 'ChatGPT',
      state: 'requires_chatgpt_login',
      reason: 'chatgpt_login_required',
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: false,
    } satisfies LocalCodexSessionResponse;

    const readiness = evaluateLiveRuntimeReadiness(health, session, null);

    expect(readiness.ready).toBe(false);
    expect(readiness.failures).toEqual(
      expect.arrayContaining([
        'codex app-server is not running.',
        'Local Codex session cannot run jobs (chatgpt_login_required).',
      ]),
    );
    expect(readiness.defaultWorkspaceId).toBe('default');
    expect(readiness.warnings[0]).toContain('.env.local');
  });
});
