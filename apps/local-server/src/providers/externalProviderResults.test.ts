import { describe, expect, it } from 'vite-plus/test';

import {
  fetchExternalProviderWithRetry,
  findFirstHostedImageUrl,
  findFirstInlineImageData,
  responseSnippet,
  storeHostedImageResult,
  storeInlineImageResult,
} from './externalProviderResults';

function inputToUrl(input: string | URL | Request) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

describe('external provider results', () => {
  it('finds hosted image URLs across common provider response shapes', () => {
    expect(findFirstHostedImageUrl({ images: [{ url: 'https://cdn.example/a.png' }] })).toBe(
      'https://cdn.example/a.png',
    );
    expect(
      findFirstHostedImageUrl({ data: { images: [{ url: 'https://cdn.example/b.png' }] } }),
    ).toBe('https://cdn.example/b.png');
    expect(
      findFirstHostedImageUrl({ output: { image: { url: 'https://cdn.example/c.png' } } }),
    ).toBe('https://cdn.example/c.png');
    expect(findFirstHostedImageUrl({ images: [{ notUrl: true }] })).toBeNull();
  });

  it('finds inline image data across Gemini response shapes', () => {
    expect(
      findFirstInlineImageData({
        candidates: [
          {
            content: {
              parts: [{ text: 'ok' }, { inlineData: { mimeType: 'image/png', data: 'AQID' } }],
            },
          },
        ],
      }),
    ).toEqual({ data: 'AQID', mimeType: 'image/png' });
    expect(findFirstInlineImageData({ parts: [{ inline_data: { data: 'BAUG' } }] })).toEqual({
      data: 'BAUG',
      mimeType: null,
    });
    expect(
      findFirstInlineImageData({ candidates: [{ content: { parts: [{ text: 'no' }] } }] }),
    ).toBeNull();
  });

  it('redacts secrets in response snippets', () => {
    expect(responseSnippet('failure secret-value with    whitespace', ['secret-value'])).toBe(
      'failure [redacted] with whitespace',
    );
  });

  it('retries transient responses and stores hosted image results', async () => {
    const calls: string[] = [];
    const sleeps: number[] = [];
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];
    const fetch = async (input: string | URL | Request) => {
      calls.push(inputToUrl(input));
      if (calls.length === 1) {
        return new Response('temporary image failure', {
          status: 502,
          statusText: 'Bad Gateway',
        });
      }
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/jpeg' },
      });
    };

    const result = await storeHostedImageResult({
      providerId: 'test-provider',
      providerSlug: 'test',
      model: 'model-a',
      endpointBase: 'https://provider.example',
      job: { id: 'job/unsafe' },
      compiledInput: { sourceSpecId: 'spec-1', task: 'image_generate' },
      responseJson: { data: { images: [{ url: 'https://cdn.example/out.jpg' }] } },
      imageUrl: 'https://cdn.example/out.jpg',
      requestAttempts: 2,
      startedAt: 1000,
      fetch,
      files: {
        resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
        mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
        writeFile: ((filePath, content, encoding) => {
          writes.push({ filePath: String(filePath), content, encoding });
        }) as typeof import('node:fs').writeFileSync,
        now: () => 1200,
      },
      maxAttempts: 3,
      retryDelayMs: 25,
      sleep: async (durationMs) => {
        sleeps.push(durationMs);
      },
    });

    const normalizedTranscript = result.transcript.replaceAll('\\', '/');
    const transcriptWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-unsafe/test.json'),
    );
    const transcript = JSON.parse(String(transcriptWrite?.content));

    expect(result).toMatchObject({
      assets: [
        {
          type: 'file',
          sourcePath: 'D:/studio-library/assets/job-unsafe-test-1200.jpg',
          mimeType: 'image/jpeg',
        },
      ],
      durationMs: 200,
    });
    expect(normalizedTranscript).toBe('D:/studio-library/transcripts/job-unsafe/test.json');
    expect(calls).toEqual(['https://cdn.example/out.jpg', 'https://cdn.example/out.jpg']);
    expect(sleeps).toEqual([25]);
    expect(transcript).toMatchObject({
      providerId: 'test-provider',
      model: 'model-a',
      requestAttempts: 2,
      imageAttempts: 2,
      responseShape: ['data'],
    });
  });

  it('stores inline image results without a provider image download', () => {
    const writes: Array<{ filePath: string; content: unknown; encoding?: unknown }> = [];

    const result = storeInlineImageResult({
      providerId: 'google',
      providerSlug: 'google',
      model: 'gemini-2.5-flash-image',
      endpointBase: 'https://generativelanguage.googleapis.com/v1beta',
      job: { id: 'job-inline' },
      compiledInput: { sourceSpecId: 'spec-1', task: 'image_generate' },
      responseJson: { candidates: [] },
      image: { data: 'AQID', mimeType: 'image/png' },
      requestAttempts: 1,
      startedAt: 1000,
      diagnostics: { requestFieldNames: ['contents'] },
      files: {
        resolveLibraryPath: (...segments) => `D:/studio-library/${segments.join('/')}`,
        mkdir: (() => undefined) as typeof import('node:fs').mkdirSync,
        writeFile: ((filePath, content, encoding) => {
          writes.push({ filePath: String(filePath), content, encoding });
        }) as typeof import('node:fs').writeFileSync,
        now: () => 1200,
      },
    });

    const assetWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/assets/job-inline-google-1200.png'),
    );
    const transcriptWrite = writes.find((write) =>
      write.filePath.replaceAll('\\', '/').endsWith('/transcripts/job-inline/google.json'),
    );
    const transcript = JSON.parse(String(transcriptWrite?.content));

    expect(result.assets[0]).toEqual({
      type: 'file',
      sourcePath: 'D:/studio-library/assets/job-inline-google-1200.png',
      mimeType: 'image/png',
    });
    expect(Buffer.isBuffer(assetWrite?.content)).toBe(true);
    expect(Array.from(assetWrite?.content as Buffer)).toEqual([1, 2, 3]);
    expect(transcript).toMatchObject({
      providerId: 'google',
      requestAttempts: 1,
      imageAttempts: 0,
      diagnostics: { requestFieldNames: ['contents'] },
    });
  });

  it('returns final retryable failure after max attempts', async () => {
    const response = await fetchExternalProviderWithRetry({
      label: 'test request',
      fetch: async () =>
        new Response('still down', { status: 503, statusText: 'Service Unavailable' }),
      input: 'https://provider.example',
      maxAttempts: 2,
      retryDelayMs: 1,
      sleep: async () => undefined,
    });

    expect(response.attempts).toBe(2);
    expect(response.response.ok).toBe(false);
    expect(response.response.status).toBe(503);
  });
});
