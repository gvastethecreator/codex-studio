import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import type { AntigravityRuntimeDoctorReport } from '../antigravityRuntimeDoctor';
import { compileAntigravityImageInput } from './antigravityImageInput';
import {
  createAntigravityImageExecutor,
  parseAntigravityStream,
  runAntigravityCliProcess,
} from './antigravityImageExecutor';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const CONVERSATION_ID = '12345678-abcd-4321-abcd-123456789012';

function runtime(): AntigravityRuntimeDoctorReport {
  return {
    status: 'ready',
    canRunJobs: true,
    checkedAt: '2026-09-02T00:00:00.000Z',
    selectedExecutable: 'agy',
    selectedVersion: '1.1.24',
    selectedVersionNumber: '1.1.24',
    defaultModel: null,
    availableModels: ['gemini-3.8-flash-low'],
    headlessSupported: true,
    generateImageSupported: true,
    recommendedAction: 'ready',
    issues: [],
    candidates: [{ path: 'agy', source: 'test', exists: true, selected: true }],
  };
}

function successStream(cwd = process.cwd()) {
  return [
    JSON.stringify({
      event: 'init',
      conversation_id: CONVERSATION_ID,
      init: { cwd, tools: ['generate_image'], permission_mode: 'request-review' },
    }),
    JSON.stringify({
      event: 'step_update',
      step_update: {
        conversation_id: CONVERSATION_ID,
        step_index: 1,
        state: 'DONE',
        step_type: 'tool',
        tool_name: 'generate_image',
        tool_info: { name: 'generate_image', output: 'created' },
      },
    }),
    JSON.stringify({
      event: 'result',
      result: {
        conversation_id: CONVERSATION_ID,
        status: 'SUCCESS',
        response: 'done',
        num_turns: 1,
      },
    }),
  ].join('\n');
}

describe('Antigravity image executor', () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  it('runs a bounded stream and imports one validated artifact', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-antigravity-test-'));
    roots.push(root);
    const libraryRoot = path.join(root, 'library');
    const antigravityHome = path.join(root, 'antigravity-home');
    mkdirSync(libraryRoot, { recursive: true });
    const invocations: Array<{
      args: string[];
      cwd: string;
      stdin: string;
      env: NodeJS.ProcessEnv;
    }> = [];
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-antigravity',
      task: 'image_generate',
      providerId: 'antigravity',
      prompt: 'A tiny paper lighthouse.',
      output: { aspectRatio: '1:1', imageSize: '1K' },
    });
    const job = {
      id: 'job-antigravity',
      workspaceId: 'workspace-1',
      providerId: 'antigravity' as const,
      prompt: sourceSpec.prompt,
      sourceSpec,
      libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
      execution: { model: 'gemini-3.8-flash-low', reasoningEffort: 'low' as const },
    };
    const executor = createAntigravityImageExecutor({
      env: {
        PATH: 'C:\\tools',
        USERPROFILE: 'C:\\Users\\dev',
        GOOGLE_API_KEY: 'google-secret',
      },
      readRuntimeDoctor: runtime,
      resolveExecutable: () => 'agy',
      resolveHome: () => antigravityHome,
      createTemporaryDirectory: () => {
        const temporary = mkdtempSync(path.join(root, 'codex-studio-antigravity-'));
        return temporary;
      },
      runCli: async ({ args, cwd, stdin, env }) => {
        invocations.push({ args, cwd, stdin, env });
        const artifact = path.join(antigravityHome, 'brain', CONVERSATION_ID);
        mkdirSync(path.join(artifact, '.system_generated'), { recursive: true });
        writeFileSync(path.join(artifact, 'studio-output.png'), PNG);
        writeFileSync(path.join(artifact, '.system_generated', 'screenshot.png'), PNG);
        return { status: 0, stdout: successStream(cwd), stderr: '' };
      },
      now: () => 5000,
    });

    const result = await executor({
      providerId: 'antigravity',
      job,
      compiledInput: compileAntigravityImageInput(job),
      preflight: {
        providerId: 'antigravity',
        runtimeKind: 'agent_cli',
        secretState: 'not_required',
        secretSource: null,
        localRuntimeState: 'configured',
        localRuntimeSource: 'agy',
        canAttemptExecution: true,
        diagnostics: [],
      },
    });

    expect(invocations).toHaveLength(1);
    expect(invocations[0]?.args).toEqual(
      expect.arrayContaining([
        '--input-format',
        'stream-json',
        '--output-format',
        '--sandbox',
        '--print-timeout',
      ]),
    );
    expect(invocations[0]?.args).not.toContain('--dangerously-skip-permissions');
    expect(invocations[0]?.env).toMatchObject({ PATH: 'C:\\tools', NO_COLOR: '1' });
    expect(invocations[0]?.env.GOOGLE_API_KEY).toBeUndefined();
    expect(JSON.parse(invocations[0]!.stdin).event).toBe('user');
    expect(invocations[0]?.stdin).toContain('generate_image exactly once');
    expect(existsSync(invocations[0]!.cwd)).toBe(false);
    expect(result.assets[0]).toMatchObject({ type: 'file', mimeType: 'image/png' });
    expect(readFileSync(result.assets[0]!.sourcePath)).toEqual(PNG);
    const transcript = readFileSync(result.transcript!, 'utf8');
    expect(transcript).toContain(CONVERSATION_ID);
    expect(transcript).not.toContain('A tiny paper lighthouse');
  });

  it('rejects any tool call outside generate_image', () => {
    const output = successStream().replace(
      '"tool_name":"generate_image"',
      '"tool_name":"run_command"',
    );
    expect(() => parseAntigravityStream(output)).toThrow('tool other than generate_image');
  });

  it('rejects the unsafe always-proceed permission mode', () => {
    const output = successStream().replace('request-review', 'always-proceed');
    expect(() => parseAntigravityStream(output)).toThrow('request-review permission mode');
  });

  it('rejects malformed or mixed-conversation streams', () => {
    expect(() => parseAntigravityStream('{not-json}')).toThrow('invalid stream JSON');
    expect(() =>
      parseAntigravityStream(
        successStream().replace(
          `"conversation_id":"${CONVERSATION_ID}","step_index"`,
          '"conversation_id":"87654321-abcd-4321-abcd-123456789012","step_index"',
        ),
      ),
    ).toThrow('unexpected conversation');
    expect(() =>
      parseAntigravityStream(successStream().replaceAll(CONVERSATION_ID, '../escape')),
    ).toThrow('invalid conversation id');
  });

  it('fails when a successful run does not produce an artifact', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-antigravity-test-'));
    roots.push(root);
    const libraryRoot = path.join(root, 'library');
    const antigravityHome = path.join(root, 'antigravity-home');
    mkdirSync(libraryRoot, { recursive: true });
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-antigravity-missing',
      task: 'image_generate',
      providerId: 'antigravity',
      prompt: 'A paper lighthouse.',
    });
    const job = {
      id: 'job-antigravity-missing',
      workspaceId: 'workspace-1',
      providerId: 'antigravity' as const,
      prompt: sourceSpec.prompt,
      sourceSpec,
      libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
      execution: { model: 'gemini-3.8-flash-low', reasoningEffort: 'low' as const },
    };
    const executor = createAntigravityImageExecutor({
      readRuntimeDoctor: runtime,
      resolveExecutable: () => 'agy',
      resolveHome: () => antigravityHome,
      createTemporaryDirectory: () => mkdtempSync(path.join(root, 'codex-studio-antigravity-')),
      runCli: async ({ cwd }) => ({ status: 0, stdout: successStream(cwd), stderr: '' }),
    });

    await expect(
      executor({
        providerId: 'antigravity',
        job,
        compiledInput: compileAntigravityImageInput(job),
        preflight: {
          providerId: 'antigravity',
          runtimeKind: 'agent_cli',
          secretState: 'not_required',
          secretSource: null,
          localRuntimeState: 'configured',
          localRuntimeSource: 'agy',
          canAttemptExecution: true,
          diagnostics: [],
        },
      }),
    ).rejects.toThrow('found 0');
  });

  it('terminates a fake CLI on cancellation and timeout', async () => {
    const input = {
      executable: process.execPath,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      cwd: process.cwd(),
      env: process.env,
      stdin: '',
      timeoutMs: 50,
    };
    await expect(runAntigravityCliProcess(input)).rejects.toThrow('timed out');

    const controller = new AbortController();
    const cancelled = expect(
      runAntigravityCliProcess({ ...input, timeoutMs: 5_000, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    setTimeout(() => controller.abort(), 25);
    await cancelled;
  });
});
