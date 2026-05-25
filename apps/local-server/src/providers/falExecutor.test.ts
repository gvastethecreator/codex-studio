import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileFalImageApiInput } from './externalProviderInputs';
import { createFalImageExecutor } from './falExecutor';
import { getExternalProviderRuntimePreflight } from './runtimeConfig';

function inputToUrl(input: string | URL | Request) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function createFalContext(
  overrides: {
    env?: Record<string, string | undefined>;
    sourceSpec?: Partial<Parameters<typeof createGenerationTaskSpec>[0]>;
  } = {},
) {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-fal',
    task: 'style_preset_card',
    providerId: 'fal',
    prompt: 'small brass key',
    negativePrompt: 'blur',
    output: { imageSize: '1024x1536', count: 2 },
    ...overrides.sourceSpec,
  });
  const env = overrides.env ?? { FAL_KEY: 'secret-fal-value' };

  return {
    providerId: 'fal' as const,
    job: {
      id: 'job-fal',
      projectId: 'project-1',
      providerId: 'fal' as const,
      prompt: 'fallback prompt',
      execution: {
        model: 'fal-ai/flux/schnell',
        reasoningEffort: 'minimal' as const,
        serviceTier: null,
      },
      sourceSpec,
    },
    compiledInput: compileFalImageApiInput({
      id: 'job-fal',
      projectId: 'project-1',
      providerId: 'fal',
      prompt: 'fallback prompt',
      execution: { model: 'fal-ai/flux/schnell', reasoningEffort: 'minimal', serviceTier: null },
      sourceSpec,
    }),
    preflight: getExternalProviderRuntimePreflight('fal', env)!,
  };
}

describe('fal executor', () => {
  it('runs fal HTTP request, downloads image, stores transcript without leaking secrets', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const dirs: string[] = [];
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ input: inputToUrl(input), init });
      if (calls.length === 1) {
        return new Response(JSON.stringify({ images: [{ url: 'https://cdn.example/out.webp' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/webp' },
      });
    };
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: ((dir) => {
        dirs.push(String(dir));
        return undefined;
      }) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content, encoding) => {
        writes.push({ filePath: String(filePath), content, encoding });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    const result = await executor(createFalContext());
    const normalizedTranscript = result.transcript.replaceAll('\\', '/');
    const normalizedWrites = writes.map((write) => write.filePath.replaceAll('\\', '/'));

    expect(result.assets).toEqual([
      {
        type: 'file',
        sourcePath: 'D:/studio-library/assets/job-fal-fal-1000.webp',
        mimeType: 'image/webp',
      },
    ]);
    expect(normalizedTranscript).toBe('D:/studio-library/transcripts/job-fal/fal.json');
    expect(calls).toHaveLength(2);
    expect(calls[0].input).toBe('https://fal.run/fal-ai/flux/schnell');
    expect(calls[0].init?.headers).toMatchObject({
      Authorization: 'Key secret-fal-value',
      'Content-Type': 'application/json',
    });
    const requestBody = calls[0].init?.body;
    expect(typeof requestBody).toBe('string');
    expect(JSON.parse(requestBody as string)).toEqual({
      prompt: 'small brass key',
      negative_prompt: 'blur',
      image_size: '1024x1536',
      num_images: 2,
    });
    expect(calls[1].input).toBe('https://cdn.example/out.webp');
    expect(dirs).toEqual(
      expect.arrayContaining(['D:/studio-library/assets', 'D:/studio-library/transcripts/job-fal']),
    );
    expect(normalizedWrites).toEqual(
      expect.arrayContaining([
        'D:/studio-library/assets/job-fal-fal-1000.webp',
        'D:/studio-library/transcripts/job-fal/fal.json',
      ]),
    );
    expect(JSON.stringify(result)).not.toContain('secret-fal-value');
    expect(JSON.stringify(writes)).not.toContain('secret-fal-value');
  });

  it('adds hosted task asset URLs to fal request body', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ input: inputToUrl(input), init });
      if (calls.length === 1) {
        return new Response(JSON.stringify({ images: [{ url: 'https://cdn.example/out.webp' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/webp' },
      });
    };
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    await executor(
      createFalContext({
        sourceSpec: {
          assets: [
            { role: 'input', name: 'input.png', sourceUrl: 'https://cdn.example/input.png' },
            { role: 'mask', name: 'mask.png', sourceUrl: 'https://cdn.example/mask.png' },
            {
              role: 'reference',
              name: 'reference.png',
              sourceUrl: 'https://cdn.example/reference.png',
            },
          ],
        },
      }),
    );

    const requestBody = calls[0].init?.body;
    expect(typeof requestBody).toBe('string');
    expect(JSON.parse(requestBody as string)).toMatchObject({
      image_url: 'https://cdn.example/input.png',
      mask_url: 'https://cdn.example/mask.png',
      reference_image_urls: ['https://cdn.example/reference.png'],
    });
  });

  it('uploads local task assets before fal request body creation', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const uploads: string[] = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ input: inputToUrl(input), init });
      if (calls.length === 1) {
        return new Response(JSON.stringify({ images: [{ url: 'https://cdn.example/out.webp' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/webp' },
      });
    };
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
      uploadLocalAsset: async (asset) => {
        uploads.push(asset.localPath ?? '');
        return `https://v3.fal.media/files/${asset.name}`;
      },
    });

    await executor(
      createFalContext({
        sourceSpec: {
          assets: [
            { role: 'input', name: 'input.png', localPath: 'D:/inputs/input.png' },
            { role: 'mask', name: 'mask.png', localPath: 'D:/inputs/mask.png' },
          ],
        },
      }),
    );

    const requestBody = calls[0].init?.body;
    expect(uploads).toEqual(['D:/inputs/input.png', 'D:/inputs/mask.png']);
    expect(typeof requestBody).toBe('string');
    expect(JSON.parse(requestBody as string)).toMatchObject({
      image_url: 'https://v3.fal.media/files/input.png',
      mask_url: 'https://v3.fal.media/files/mask.png',
    });
  });

  it('requires an input asset for fal image_edit tasks', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: async (input, init) => {
        calls.push({ input: inputToUrl(input), init });
        return new Response(JSON.stringify({ images: [{ url: 'https://cdn.example/out.webp' }] }));
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    await expect(
      executor(
        createFalContext({
          sourceSpec: {
            task: 'image_edit',
            assets: [
              { role: 'reference', name: 'ref.png', sourceUrl: 'https://cdn.example/ref.png' },
            ],
          },
        }),
      ),
    ).rejects.toThrow('fal.ai image_edit task requires an input or external_output asset');
    expect(calls).toHaveLength(0);
  });

  it('fails HTTP errors without exposing secret values', async () => {
    const calls: string[] = [];
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: async (input) => {
        calls.push(inputToUrl(input));
        return new Response(JSON.stringify({ error: 'bad prompt secret-fal-value' }), {
          status: 400,
          statusText: 'Bad Request',
        });
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
      sleep: async () => undefined,
    });

    let message = '';
    try {
      await executor(createFalContext());
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(calls).toHaveLength(1);
    expect(message).toContain('fal.ai request failed after 1 attempt(s): 400 Bad Request');
    expect(message).not.toContain('secret-fal-value');
  });

  it('retries retryable request and image download failures', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const sleeps: number[] = [];
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ input: inputToUrl(input), init });
      if (calls.length === 1) {
        return new Response('temporary request failure', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      }
      if (calls.length === 2) {
        return new Response(
          JSON.stringify({ data: { images: [{ url: 'https://cdn.example/out.png' }] } }),
          {
            headers: { 'content-type': 'application/json' },
          },
        );
      }
      if (calls.length === 3) {
        return new Response('temporary image failure', {
          status: 502,
          statusText: 'Bad Gateway',
        });
      }
      return new Response(new Uint8Array([4, 5, 6]), {
        headers: { 'content-type': 'image/png' },
      });
    };
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content, encoding) => {
        writes.push({ filePath: String(filePath), content, encoding });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 2000,
      sleep: async (durationMs) => {
        sleeps.push(durationMs);
      },
      retryDelayMs: 25,
    });

    const result = await executor(createFalContext());
    const transcriptWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-fal/fal.json'),
    );
    const transcript = JSON.parse(String(transcriptWrite?.content));

    expect(result.assets[0]?.sourcePath).toBe('D:/studio-library/assets/job-fal-fal-2000.png');
    expect(calls.map((call) => call.input)).toEqual([
      'https://fal.run/fal-ai/flux/schnell',
      'https://fal.run/fal-ai/flux/schnell',
      'https://cdn.example/out.png',
      'https://cdn.example/out.png',
    ]);
    expect(sleeps).toEqual([25, 25]);
    expect(transcript).toMatchObject({
      requestAttempts: 2,
      imageAttempts: 2,
      diagnostics: {
        assetCount: 0,
        assetRoles: [],
        referenceImageCount: 0,
        usesInputImage: false,
        usesMask: false,
      },
    });
    expect(transcript.diagnostics.requestFieldNames).toEqual(
      expect.arrayContaining(['image_size', 'negative_prompt', 'num_images', 'prompt']),
    );
    expect(JSON.stringify(writes)).not.toContain('secret-fal-value');
  });

  it('stores fal transcript diagnostics without hosted asset URLs', async () => {
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const fetchMock = async (input: string | URL | Request) => {
      if (inputToUrl(input).startsWith('https://fal.run')) {
        return new Response(JSON.stringify({ images: [{ url: 'https://cdn.example/out.webp' }] }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/webp' },
      });
    };
    const executor = createFalImageExecutor({
      env: { FAL_KEY: 'secret-fal-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content, encoding) => {
        writes.push({ filePath: String(filePath), content, encoding });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 3000,
    });

    await executor(
      createFalContext({
        sourceSpec: {
          task: 'image_edit',
          assets: [
            { role: 'input', name: 'input.png', sourceUrl: 'https://cdn.example/input.png' },
            { role: 'mask', name: 'mask.png', sourceUrl: 'https://cdn.example/mask.png' },
            { role: 'reference', name: 'ref.png', sourceUrl: 'https://cdn.example/ref.png' },
          ],
        },
      }),
    );

    const transcriptWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-fal/fal.json'),
    );
    const transcriptText = String(transcriptWrite?.content);
    const transcript = JSON.parse(transcriptText);

    expect(transcript.diagnostics).toEqual({
      assetCount: 3,
      assetRoles: ['input', 'mask', 'reference'],
      referenceImageCount: 1,
      requestFieldNames: [
        'image_size',
        'image_url',
        'mask_url',
        'negative_prompt',
        'num_images',
        'prompt',
        'reference_image_urls',
      ],
      usesInputImage: true,
      usesMask: true,
    });
    expect(transcriptText).not.toContain('https://cdn.example/input.png');
    expect(transcriptText).not.toContain('secret-fal-value');
  });
});
