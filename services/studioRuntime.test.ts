import { describe, expect, it } from 'vite-plus/test';

import { resolveStudioRuntimeFromSources } from './studioRuntime';

describe('resolveStudioRuntimeFromSources', () => {
  it('prefers the desktop bridge api base and exposes desktop capabilities', () => {
    const runtime = resolveStudioRuntimeFromSources({
      desktopBridge: {
        apiBase: 'http://127.0.0.1:17223/',
        desktop: true,
        platform: 'win32',
      },
      envApiBase: 'http://env.local:17223/',
    });

    expect(runtime).toMatchObject({
      kind: 'desktop',
      isDesktop: true,
      apiBase: 'http://127.0.0.1:17223',
      platform: 'win32',
      capabilities: {
        desktopBridge: true,
        localBackend: true,
        localCodexSession: true,
      },
    });
  });

  it('falls back to the env api base for the web runtime', () => {
    const runtime = resolveStudioRuntimeFromSources({
      envApiBase: 'http://localhost:9999/',
    });

    expect(runtime).toMatchObject({
      kind: 'web',
      isDesktop: false,
      apiBase: 'http://127.0.0.1:9999',
      platform: null,
    });
  });

  it('uses the default local backend when no bridge or env override exists', () => {
    const runtime = resolveStudioRuntimeFromSources();

    expect(runtime).toMatchObject({
      kind: 'web',
      apiBase: 'http://127.0.0.1:17223',
      isDesktop: false,
    });
  });
});
