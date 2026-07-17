import { describe, expect, it, vi } from 'vite-plus/test';
import type { StyleRuntimePack } from './styles/runtimeTypes';
import { createStyleRuntimeRegistry } from './stylesData';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createPack(id: string): StyleRuntimePack {
  return { id, name: id, description: id, presets: [] };
}

describe('createStyleRuntimeRegistry', () => {
  it('shares one per-pack load across focused and all-pack callers', async () => {
    const deferred = createDeferred<StyleRuntimePack | null>();
    const loadPack = vi.fn(() => deferred.promise);
    const loadThumbnail = vi.fn(async () => {});
    const registry = createStyleRuntimeRegistry({
      packIds: ['pack-1'],
      loadPack,
      loadThumbnail,
    });

    const focused = registry.loadRuntimePack('pack-1');
    const all = registry.loadRuntimePacks();
    deferred.resolve(createPack('pack-1'));

    const [focusedPack, allPacks] = await Promise.all([focused, all]);
    expect(focusedPack).toBe(allPacks[0]);
    expect(loadPack).toHaveBeenCalledTimes(1);
    expect(loadThumbnail).toHaveBeenCalledTimes(1);
    await registry.loadRuntimePack('pack-1');
    expect(loadPack).toHaveBeenCalledTimes(1);
  });

  it('evicts rejected promises so a later request can retry', async () => {
    const loadPack = vi
      .fn()
      .mockRejectedValueOnce(new Error('load failed'))
      .mockResolvedValueOnce(createPack('pack-1'));
    const registry = createStyleRuntimeRegistry({
      packIds: ['pack-1'],
      loadPack,
      loadThumbnail: vi.fn(async () => {}),
    });

    await expect(registry.loadRuntimePack('pack-1')).rejects.toThrow('load failed');
    await expect(registry.loadRuntimePack('pack-1')).resolves.toMatchObject({ id: 'pack-1' });
    expect(loadPack).toHaveBeenCalledTimes(2);
  });
});
