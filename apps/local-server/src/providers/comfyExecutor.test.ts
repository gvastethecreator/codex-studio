import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, vi } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileComfyWorkflowInput } from './externalProviderInputs';
import type { ExternalProviderFetch } from './externalProviderResults';
import { createComfyWorkflowExecutor } from './comfyExecutor';
import type { GenerationProviderJob } from './types';
import { ProviderExecutionUncertainError } from '../workerErrors';

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
    arrayBuffer: async () => bytes.buffer as ArrayBuffer,
  };
}

function fetchInputUrl(input: string | URL | Request) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function requestBodyText(body: BodyInit | null | undefined) {
  return typeof body === 'string' ? body : '';
}

function createJob(): GenerationProviderJob {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-comfy',
    task: 'texture_generate',
    providerId: 'comfy',
    prompt: 'mossy stone floor',
    negativePrompt: 'text, watermark',
  });

  const job: GenerationProviderJob = {
    id: 'job-comfy',
    workspaceId: 'workspace-1',
    providerId: 'comfy',
    prompt: 'fallback',
    sourceSpec,
    execution: { model: 'local-sdxl', reasoningEffort: 'minimal', serviceTier: null },
  };
  job.checkpointRemoteExecution = (checkpoint) => {
    job.remoteExecution = structuredClone(checkpoint);
  };
  return job;
}

function execute(
  executor: ReturnType<typeof createComfyWorkflowExecutor>,
  job: GenerationProviderJob,
) {
  return executor({
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
      canAttemptExecution: true,
      diagnostics: [],
    },
  });
}

const template = JSON.stringify({
  '6': { class_type: 'CLIPTextEncode', inputs: { text: '{{prompt}}' } },
});
const runtimeEnv = {
  COMFY_API_URL: 'http://127.0.0.1:8188',
  COMFY_WORKFLOW_TEMPLATE_PATH: 'template.json',
};
const nodeInfo = { CLIPTextEncode: { input: { required: { text: ['STRING'] } }, api_node: false } };

describe('comfyExecutor', () => {
  it('submits a template-backed workflow and imports the Comfy view output', async () => {
    const tmp = path.join(tmpdir(), `comfy-executor-${Date.now()}`);
    const job = createJob();
    const compiledInput = compileComfyWorkflowInput(job);
    const promptBodies: string[] = [];
    let historyCalls = 0;
    const fetch: ExternalProviderFetch = async (input, init) => {
      const url = fetchInputUrl(input);
      if (url.includes('/object_info/')) return jsonResponse(nodeInfo);
      if (url.endsWith('/prompt')) {
        promptBodies.push(requestBodyText(init?.body));
        return jsonResponse({ prompt_id: 'prompt-1' });
      }
      if (url.endsWith('/jobs/prompt-1')) {
        historyCalls += 1;
        if (historyCalls < 35) return jsonResponse({ status: 'pending' });
        return jsonResponse({
          status: 'completed',
          outputs: {
            '9': {
              images: [{ filename: 'out.png', subfolder: 'studio', type: 'output' }],
            },
          },
        });
      }
      if (url.includes('/view?')) {
        expect(url).toContain('filename=out.png');
        expect(url).toContain('subfolder=studio');
        expect(url).toContain('type=output');
        return imageResponse(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
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
          '6': { class_type: 'CLIPTextEncode', inputs: { text: '{{prompt}}' } },
          '7': { class_type: 'CLIPTextEncode', inputs: { text: '{{negativePrompt}}' } },
        }),
      files: {
        resolveLibraryPath: (...parts) => path.join(tmp, ...parts),
        mkdir: mkdirSync,
        writeFile: writeFileSync,
        now: () => 1000,
      },
      sleep: async () => undefined,
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
      sourcePath: path.join(tmp, 'assets', 'job-comfy-comfy-500.png'),
      mimeType: 'image/png',
    });
    expect(result.transcript).toBe(path.join(tmp, 'transcripts', 'job-comfy', 'comfy.json'));
    expect(readFileSync(result.transcript, 'utf8')).toContain(
      '"workflowPreset": "texture_generate"',
    );
    expect(historyCalls).toBe(35);
    expect(promptBodies).toHaveLength(1);
    expect(job.remoteExecution).toMatchObject({ promptId: 'prompt-1', phase: 'completed' });
  });

  it('persists identity before submission and resumes on A after rejecting a different runtime B', async () => {
    const job = createJob();
    const signal = new AbortController();
    job.signal = signal.signal;
    const posts: string[] = [];
    const executor = createComfyWorkflowExecutor({
      env: runtimeEnv,
      readFile: () => template,
      fetch: async (input, init) => {
        const url = fetchInputUrl(input);
        if (url.includes('object_info')) return jsonResponse(nodeInfo);
        if (init?.method === 'POST') {
          posts.push(url);
          expect(job.remoteExecution?.phase).toBe('submitting');
          const body = JSON.parse(requestBodyText(init.body));
          expect(body.prompt_id).toBe(job.remoteExecution?.promptId);
          return jsonResponse({ prompt_id: body.prompt_id });
        }
        return jsonResponse({ status: 'pending' });
      },
      sleep: async () => {
        signal.abort('studio_shutdown');
      },
    });
    await expect(execute(executor, job)).rejects.toMatchObject({ name: 'AbortError' });
    const recovered = createJob();
    recovered.remoteExecution = structuredClone(job.remoteExecution);
    const wrongRuntime = vi.fn(async () => jsonResponse({}));
    await expect(
      execute(
        createComfyWorkflowExecutor({
          env: { ...runtimeEnv, COMFY_API_URL: 'http://127.0.0.1:8288' },
          fetch: wrongRuntime,
        }),
        recovered,
      ),
    ).rejects.toBeInstanceOf(ProviderExecutionUncertainError);
    expect(wrongRuntime).not.toHaveBeenCalled();
    const reads: string[] = [];
    const writtenPaths = new Set<string>();
    const resumed = createComfyWorkflowExecutor({
      env: runtimeEnv,
      fetch: async (input, init) => {
        expect(init?.method).not.toBe('POST');
        const url = fetchInputUrl(input);
        reads.push(url);
        if (url.includes('/view?'))
          return imageResponse(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
        return jsonResponse({
          status: 'completed',
          outputs: { '9': { images: [{ filename: 'recovered.png', type: 'output' }] } },
        });
      },
      files: {
        resolveLibraryPath: (...parts) => path.join('test-library', ...parts),
        mkdir: () => undefined,
        writeFile: (output) => {
          writtenPaths.add(String(output));
        },
        now: () => Date.now(),
      },
    });
    const firstImport = await execute(resumed, recovered);
    const repeatedImport = await execute(resumed, recovered);
    expect(firstImport.assets[0]?.sourcePath).toBe(repeatedImport.assets[0]?.sourcePath);
    expect([...writtenPaths].filter((output) => output.includes('assets'))).toHaveLength(1);
    expect(reads.filter((url) => url.includes('/jobs/'))).toEqual(
      Array(2).fill(`http://127.0.0.1:8188/api/jobs/${job.remoteExecution?.promptId}`),
    );
    expect(posts).toHaveLength(1);
  });

  it('never resends a submission after a lost acknowledgement', async () => {
    const job = createJob();
    const send = vi.fn(async () => {
      throw new Error('socket closed after acceptance');
    });
    const fetch: ExternalProviderFetch = async (input, init) => {
      if (init?.method === 'POST') return send();
      if (fetchInputUrl(input).includes('object_info')) return jsonResponse(nodeInfo);
      return jsonResponse({ error: 'not yet visible' }, false, 404);
    };
    const executor = createComfyWorkflowExecutor({
      env: runtimeEnv,
      readFile: () => template,
      fetch,
      sleep: async () => {},
    });
    await expect(execute(executor, job)).rejects.toBeInstanceOf(ProviderExecutionUncertainError);
    expect(job.remoteExecution?.phase).toBe('submitting');
    await expect(execute(executor, job)).rejects.toBeInstanceOf(ProviderExecutionUncertainError);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rejects paid partner nodes from the actual REST api_node flag before sending', async () => {
    const fetch = vi.fn(async () =>
      jsonResponse({ CLIPTextEncode: { ...nodeInfo.CLIPTextEncode, api_node: true } }),
    );
    await expect(
      execute(
        createComfyWorkflowExecutor({ env: runtimeEnv, readFile: () => template, fetch }),
        createJob(),
      ),
    ).rejects.toThrow('separately authorized paid workflow');
    expect(fetch.mock.calls).toHaveLength(1);
  });

  it.each([true, false])(
    'cancels only its remote ID and requires terminal confirmation: %s',
    async (confirmed) => {
      const job = createJob();
      const signal = new AbortController();
      job.signal = signal.signal;
      const mutations: string[] = [];
      let cancelling = false;
      const executor = createComfyWorkflowExecutor({
        env: runtimeEnv,
        readFile: () => template,
        fetch: async (input, init) => {
          const url = fetchInputUrl(input);
          if (url.includes('object_info')) return jsonResponse(nodeInfo);
          if (init?.method === 'POST') {
            mutations.push(url);
            if (url.endsWith('/cancel')) {
              cancelling = true;
              return jsonResponse({ cancelled: true });
            }
            return jsonResponse({ prompt_id: job.remoteExecution?.promptId });
          }
          return jsonResponse({ status: cancelling && confirmed ? 'cancelled' : 'in_progress' });
        },
        sleep: async () => {
          signal.abort();
        },
      });
      await expect(execute(executor, job)).rejects.toMatchObject({
        name: confirmed ? 'AbortError' : 'ProviderExecutionUncertainError',
      });
      expect(job.remoteExecution?.phase).toBe(confirmed ? 'cancelled' : 'accepted');
      expect(mutations).toEqual([
        'http://127.0.0.1:8188/api/prompt',
        `http://127.0.0.1:8188/api/jobs/${job.remoteExecution?.promptId}/cancel`,
      ]);
    },
  );

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
