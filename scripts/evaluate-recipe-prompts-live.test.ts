import { describe, expect, it } from 'vite-plus/test';

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
  it('preserves recipe context while disabling directives for the legacy variant', () => {
    const spec = buildRecipeSpec(getRecipeModule('styles'));
    const legacySpec = createLiveVariantSourceSpec(spec, 'legacy');

    expect(typeof legacySpec.metadata.recipeContext).toBe('string');
    expect(legacySpec.metadata.recipeProviderDirectives).toBeNull();
  });

  it('keeps both legacy metadata and compact directives for the directives variant', () => {
    const spec = buildRecipeSpec(getRecipeModule('styles'));
    const directivesSpec = createLiveVariantSourceSpec(spec, 'directives');

    expect(typeof directivesSpec.metadata.recipeContext).toBe('string');
    expect(directivesSpec.metadata.recipeProviderDirectives).toBeTruthy();
  });

  it('plans live comparisons with a smaller compiled directives prompt than legacy', () => {
    const plan = createLiveRecipeEvaluationPlan({ moduleIds: ['styles'] });
    const pair = plan.pairs[0];
    const legacy = pair.variants.find((variant) => variant.name === 'legacy');
    const directives = pair.variants.find((variant) => variant.name === 'directives');

    expect(plan.pairs).toHaveLength(1);
    expect(legacy).toBeTruthy();
    expect(directives).toBeTruthy();
    expect(directives!.compiledPromptChars).toBeLessThan(legacy!.compiledPromptChars);
  });

  it('verifies a planned report when legacy remains larger than directives', () => {
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
        cwd: 'D:/DEV/codex-studio',
        envLocalPath: 'D:/DEV/codex-studio/.env.local',
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
        'No default Studio project is available.',
      ]),
    );
    expect(readiness.warnings[0]).toContain('.env.local');
  });
});
