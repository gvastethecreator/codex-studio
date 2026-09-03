import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileGoogleImageApiInput } from './externalProviderInputs';
import { createGoogleImageExecutor } from './googleExecutor';
import { getExternalProviderRuntimePreflight } from './runtimeConfig';

const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function inputToUrl(input: string | URL | Request) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

interface GoogleRequestBody {
  model: string;
  input: unknown[];
  response_format: Record<string, unknown>;
}

function parseJsonBody(body: BodyInit | null | undefined): GoogleRequestBody {
  if (typeof body !== 'string') throw new Error('Expected string request body.');
  return JSON.parse(body) as GoogleRequestBody;
}

function createGoogleContext(
  overrides: {
    env?: Record<string, string | undefined>;
    model?: string;
    sourceSpec?: Partial<Parameters<typeof createGenerationTaskSpec>[0]>;
  } = {},
) {
  const sourceSpec = createGenerationTaskSpec({
    id: 'spec-google',
    task: 'image_generate',
    providerId: 'google',
    prompt: 'small brass key',
    negativePrompt: 'blur',
    output: { imageSize: '1024x1536', count: 1 },
    ...overrides.sourceSpec,
  });
  const env = overrides.env ?? { GOOGLE_API_KEY: 'secret-google-value' };
  const model = overrides.model ?? 'gemini-3.1-flash-image';

  return {
    providerId: 'google' as const,
    job: {
      id: 'job-google',
      workspaceId: 'workspace-1',
      providerId: 'google' as const,
      prompt: 'fallback prompt',
      execution: {
        model,
        reasoningEffort: 'minimal' as const,
        serviceTier: null,
      },
      sourceSpec,
    },
    compiledInput: compileGoogleImageApiInput({
      id: 'job-google',
      workspaceId: 'workspace-1',
      providerId: 'google',
      prompt: 'fallback prompt',
      execution: {
        model,
        reasoningEffort: 'minimal',
        serviceTier: null,
      },
      sourceSpec,
    }),
    preflight: getExternalProviderRuntimePreflight('google', env)!,
  };
}

describe('google executor', () => {
  it('runs Interactions, stores output_image, and avoids secret leaks', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const fetchMock = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ input: inputToUrl(input), init });
      return new Response(
        JSON.stringify({
          id: 'interaction-1',
          steps: [
            {
              type: 'model_output',
              content: [{ type: 'image', mime_type: 'image/png', data: PNG_B64 }],
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' } },
      );
    };
    const executor = createGoogleImageExecutor({
      env: { GOOGLE_API_KEY: 'secret-google-value' },
      fetch: fetchMock,
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content, encoding) => {
        writes.push({ filePath: String(filePath), content, encoding });
      }) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    const result = await executor(createGoogleContext());
    const requestBody = parseJsonBody(calls[0].init?.body);
    const transcriptWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-google/google.json'),
    );
    const transcript = JSON.parse(String(transcriptWrite?.content));

    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe('https://generativelanguage.googleapis.com/v1beta/interactions');
    expect(calls[0].init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-goog-api-key': 'secret-google-value',
    });
    expect(requestBody).toMatchObject({
      model: 'gemini-3.1-flash-image',
      input: [{ type: 'text', text: 'small brass key\n\nAvoid: blur' }],
      response_format: { type: 'image', mime_type: 'image/png', image_size: '1K' },
      store: false,
    });
    expect(result.assets).toEqual([
      {
        type: 'file',
        sourcePath: 'D:/studio-library/assets/job-google-google-1000.png',
        mimeType: 'image/png',
      },
    ]);
    expect(transcript).toMatchObject({
      providerId: 'google',
      requestAttempts: 1,
      imageAttempts: 0,
      diagnostics: {
        assetCount: 0,
        inlineImagePartCount: 0,
        requestFieldNames: ['input', 'model', 'response_format', 'store'],
      },
    });
    expect(JSON.stringify(writes)).not.toContain('secret-google-value');
  });

  it('inlines local image assets for image_edit without storing input bytes in transcript', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const executor = createGoogleImageExecutor({
      env: { GEMINI_API_KEY: 'secret-google-value' },
      fetch: async (input, init) => {
        calls.push({ input: inputToUrl(input), init });
        return new Response(
          JSON.stringify({
            output_image: { mime_type: 'image/jpeg', data: '/9j/4A==' },
          }),
        );
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: ((filePath, content, encoding) => {
        writes.push({ filePath: String(filePath), content, encoding });
      }) as typeof import('node:fs').writeFileSync,
      readFile: (filePath) => {
        expect(filePath).toBe('D:/inputs/source.png');
        return new Uint8Array([1, 2, 3]);
      },
      now: () => 2000,
    });

    await executor(
      createGoogleContext({
        sourceSpec: {
          task: 'image_edit',
          assets: [{ role: 'input', name: 'source.png', localPath: 'D:/inputs/source.png' }],
        },
      }),
    );

    const requestBody = parseJsonBody(calls[0].init?.body);
    const transcriptText = String(
      writes.find((write) =>
        write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-google/google.json'),
      )?.content,
    );
    const transcript = JSON.parse(transcriptText);

    expect(requestBody.input).toEqual([
      { type: 'image', mime_type: 'image/png', data: 'AQID' },
      {
        type: 'text',
        text: 'small brass key\n\nAvoid: blur Edit the input image following the instructions above. Preserve the original composition, subject identity, and overall structure while applying the requested changes.',
      },
    ]);
    expect(transcript.diagnostics).toMatchObject({
      assetCount: 1,
      assetRoles: ['input'],
      inlineImagePartCount: 1,
    });
    expect(transcriptText).not.toContain('AQID');
    expect(transcriptText).not.toContain('secret-google-value');
  });

  it('blocks unsupported image_edit and sourceUrl asset cases before network', async () => {
    const calls: string[] = [];
    const executor = createGoogleImageExecutor({
      env: { GOOGLE_API_KEY: 'secret-google-value' },
      fetch: async (input) => {
        calls.push(inputToUrl(input));
        return new Response('{}');
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 1000,
    });

    await expect(
      executor(
        createGoogleContext({
          sourceSpec: {
            task: 'image_edit',
            assets: [{ role: 'reference', name: 'ref.png', localPath: 'D:/inputs/ref.png' }],
          },
        }),
      ),
    ).rejects.toThrow('Google image_edit task requires an input or external_output asset');
    await expect(
      executor(
        createGoogleContext({
          sourceSpec: {
            assets: [{ role: 'input', name: 'source.png', sourceUrl: 'https://cdn.example/a.png' }],
          },
        }),
      ),
    ).rejects.toThrow('must be imported as a localPath asset');
    expect(calls).toHaveLength(0);
  });

  it('keeps model-specific image sizes inside the supported catalog', async () => {
    const executor = createGoogleImageExecutor({
      env: { GOOGLE_API_KEY: 'secret-google-value' },
      fetch: async () => new Response('{}'),
    });

    await expect(
      executor(
        createGoogleContext({
          model: 'gemini-3.1-flash-lite-image',
          sourceSpec: { output: { count: 1, imageSize: '4K' } },
        }),
      ),
    ).rejects.toThrow('does not support 4K output');
  });

  it('uses Studio-owned OAuth with the billing project when no API key exists', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    let accessTokenCalls = 0;
    const executor = createGoogleImageExecutor({
      env: {
        GOOGLE_OAUTH_CLIENT_ID: 'desktop.apps.googleusercontent.com',
        GOOGLE_CLOUD_PROJECT_ID: 'studio-billing-project',
      },
      getAccessToken: async () => {
        accessTokenCalls += 1;
        return 'oauth-access-secret';
      },
      fetch: async (input, init) => {
        calls.push({ input: inputToUrl(input), init });
        return new Response(
          JSON.stringify({ output_image: { mime_type: 'image/png', data: PNG_B64 } }),
        );
      },
      resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
      mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
      writeFile: (() => undefined) as typeof import('node:fs').writeFileSync,
      now: () => 3000,
    });

    await executor(
      createGoogleContext({
        env: {
          GOOGLE_OAUTH_CLIENT_ID: 'desktop.apps.googleusercontent.com',
          GOOGLE_CLOUD_PROJECT_ID: 'studio-billing-project',
        },
      }),
    );

    expect(accessTokenCalls).toBe(1);
    expect(calls[0]?.init?.headers).toMatchObject({
      Authorization: 'Bearer oauth-access-secret',
      'x-goog-user-project': 'studio-billing-project',
    });
    expect(calls[0]?.input).not.toContain('oauth-access-secret');
  });

  it('rejects unsafe custom API bases before network access', async () => {
    const calls: string[] = [];
    const executor = createGoogleImageExecutor({
      env: {
        GOOGLE_API_KEY: 'secret-google-value',
        GOOGLE_API_BASE: 'https://user:pass@example.com/v1beta?key=secret-google-value',
      },
      fetch: async (input) => {
        calls.push(inputToUrl(input));
        return new Response('{}');
      },
    });

    await expect(
      executor(
        createGoogleContext({
          env: {
            GOOGLE_API_KEY: 'secret-google-value',
            GOOGLE_API_BASE: 'https://user:pass@example.com/v1beta?key=secret-google-value',
          },
        }),
      ),
    ).rejects.toThrow('credential-free loopback URL');
    expect(calls).toHaveLength(0);
  });
});
