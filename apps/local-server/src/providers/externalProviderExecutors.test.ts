import { describe, expect, it } from 'vite-plus/test';

import { createDefaultExternalProviderExecutorRegistry } from './externalProviderExecutors';

describe('external provider executor registry', () => {
  it('registers only concrete default external executors', () => {
    const registry = createDefaultExternalProviderExecutorRegistry();

    expect(Object.keys(registry)).toEqual(['google', 'fal']);
    expect(registry.google).toEqual(expect.any(Function));
    expect(registry.fal).toEqual(expect.any(Function));
    expect(registry.comfy).toBeUndefined();
  });
});
