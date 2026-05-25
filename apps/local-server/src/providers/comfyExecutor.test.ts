import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileComfyWorkflowInput } from './externalProviderInputs';
import type { ExternalProviderFetch } from './externalProviderResults';
import { createComfyWorkflowExecutor } from './comfyExecutor';
import type { GenerationProviderJob } from './types';

function jsonResponse(value: unknown, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => value,
    text: async () => JSON.stringify(value),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

function imageResponse(bytes: Uint8Array) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'image/png' }),
    json: async () => ({}),
    text: async () => '',
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

function createJob(): GenerationProviderJob {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-comfy',
    task: 'texture_generate',
    providerId: 'comfy',
    prompt: 'mossy stone floor',
    negativePrompt: 'text, watermark',
  });

  return {
    id: 'job-comfy',
    projectId: 'project-1',
    providerId: 'comfy',
    prompt: 'fallback',
    sourceSpec,
    execution: { model: 'local-sdxl', reasoningEffort: 'minimal', serviceTier: null },
  };
}

describe('comfyExecutor', () => {
  it('submits a template-backed workflow and imports the Comfy view output', async () => {
    const tmp = path.join(tmpdir(), `comfy-executor-${Date.now()}`);
    const job = createJob();
    const compiledInput = compileComfyWorkflowInput(job);
    const promptBodies: string[] = [];
    let historyCalls = 0;
    const fetch: ExternalProviderFetch = async (input, init) => {
      const url = String(input);
      if (url.endsWith('/prompt')) {
        promptBodies.push(String(init?.body));
        return jsonResponse({ prompt_id: 'prompt-1' });
      }
      if (url.endsWith('/history/prompt-1')) {
        historyCalls += 1;
        if (historyCalls === 1) return jsonResponse({ prompt-1: { outputs: {} } });
        return jsonResponse({
          'prompt-1': {
            outputs: {
              '9': {
                images: [{ filename: 'out.png', subfolder: 'studio', type: 'output' }],
              },
            },
          },
        });
      }
      if (url.includes('/view?')) {
        expect(url).toContain('filename=out.png');
        expect(url).toContain('subfolder=studio');
        expect(url).toContain('type=output');
        return imageResponse(new Uint8Array([1, 2, 3, 4]));
      }
      throw new Error(`unexpected fetch ${url}`);
    };
    const executor = createComfyWorkflowExecutor({
      fetch,
      env: {
        COMFY_API_URL: 'http://127.0.0.1:8188',
        COMFY_WORKFLOW_TEMPLATE_PATH: 'template.json',
      },
      readFile: () =>
        JSON.stringify({
          '6': { inputs: { text: '{{prompt}}' } },
          '7': { inputs: { text: '{{negativePrompt}}' } },
        }),
      files: {
        resolveLibraryPath: (...parts) => path.join(tmp, ...parts),
        mkdir: mkdirSync,
        writeFile: writeFileSync,
        now: () => 1000,
      },
      sleep: async () => undefined,
      maxPollAttempts: 2,
      pollIntervalMs: 1,
      now: () => 500,
    });

    const result = await executor({
      providerId: 'comfy',
      job,
      compiledInput,
      preflight: {
        providerId: 'comfy',
        runtimeKind: 'local_workflow',
        secretState: 'not_required',
        secretSource: null,
        localRuntimeState: 'configured',
        localRuntimeSource: 'COMFY_API_URL',
        canAttemptExecution: true,
        diagnostics: [],
      },
    });

    expect(JSON.parse(promptBodies[0] ?? '{}')).toMatchObject({
      client_id: 'job-comfy',
      prompt: {
        '6': { inputs: { text: 'mossy stone floor' } },
        '7': { inputs: { text: 'text, watermark' } },
      },
    });
    expect(result.assets[0]).toMatchObject({
      sourcePath: path.join(tmp, 'assets', 'job-comfy-comfy-1000.png'),
      mimeType: 'image/png',
    });
    expect(result.transcript).toBe(path.join(tmp, 'transcripts', 'job-comfy', 'comfy.json'));
    expect(readFileSync(result.transcript, 'utf8')).toContain('"workflowPreset": "texture_generate"');
  });

  it('fails before network when the workflow template path is missing', async () => {
    const job = createJob();
    const executor = createComfyWorkflowExecutor({
      env: { COMFY_API_URL: 'http://127.0.0.1:8188' },
      fetch: async () => {
        throw new Error('network should not run');
      },
    });

    await expect(
      executor({
        providerId: 'comfy',
        job,
        compiledInput: compileComfyWorkflowInput(job),
        preflight: {
          providerId: 'comfy',
          runtimeKind: 'local_workflow',
          secretState: 'not_required',
          secretSource: null,
          localRuntimeState: 'configured',
          localRuntimeSource: 'COMFY_API_URL',
          canAttemptExecution: false,
          diagnostics: ['Missing provider config source: COMFY_WORKFLOW_TEMPLATE_PATH.'],
        },
      }),
    ).rejects.toThrow('Comfy executor missing COMFY_WORKFLOW_TEMPLATE_PATH.');
  });
});
