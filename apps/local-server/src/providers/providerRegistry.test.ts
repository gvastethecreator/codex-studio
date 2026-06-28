import { describe, expect, it } from 'vite-plus/test';

import {
  hasProviderRegistryCompiler,
  listExternalExecutableProviderEntries,
  listProviderCapabilityDefinitions,
  listProviderRegistryEntries,
  resolveProviderWorkerRuntimeTarget,
} from './providerRegistry';

describe('providerRegistry', () => {
  it('publishes one provider fact source for capability, compiler, and worker routing', () => {
    const ids = listProviderRegistryEntries().map((entry) => entry.providerId);

    expect(ids).toEqual(['codex', 'google', 'fal', 'comfy', 'dry_run']);
    expect(listProviderCapabilityDefinitions().map((entry) => entry.providerId)).toEqual(ids);
    expect(ids.every((providerId) => hasProviderRegistryCompiler(providerId))).toBe(true);
    expect(resolveProviderWorkerRuntimeTarget('codex')).toBe('codex');
    expect(resolveProviderWorkerRuntimeTarget('dry_run')).toBe('dry_run');
    expect(resolveProviderWorkerRuntimeTarget('google')).toBe('external');
    expect(resolveProviderWorkerRuntimeTarget('local-experiment')).toBeNull();
  });

  it('keeps executable external provider runtime env names behind the registry', () => {
    expect(
      listExternalExecutableProviderEntries().map((entry) => ({
        providerId: entry.providerId,
        secretEnvNames: entry.secretEnvNames,
        localRuntimeEnvNames: entry.localRuntimeEnvNames,
      })),
    ).toEqual([
      {
        providerId: 'google',
        secretEnvNames: ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'NANO_BANANA_API_KEY'],
        localRuntimeEnvNames: [],
      },
      { providerId: 'fal', secretEnvNames: ['FAL_KEY', 'FAL_API_KEY'], localRuntimeEnvNames: [] },
      {
        providerId: 'comfy',
        secretEnvNames: [],
        localRuntimeEnvNames: ['COMFY_API_URL', 'COMFYUI_API_URL'],
      },
    ]);
  });
});
