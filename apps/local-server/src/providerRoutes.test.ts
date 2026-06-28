import { describe, expect, it } from 'vite-plus/test';
import {
  createDefaultEditableStudioSettings,
  type GenerationProviderId,
} from '../../../packages/shared/src';
import { createProviderRoutes } from './providerRoutes';

describe('providerRoutes', () => {
  it('returns provider capabilities from Studio Settings', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
    });

    const response = await routes.request('/');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { providers?: unknown[] };
    expect(Array.isArray(payload.providers)).toBe(true);
  });

  it('returns runtime preflight providers snapshot', async () => {
    const routes = createProviderRoutes({
      readSettings: () => createDefaultEditableStudioSettings(),
    });

    const response = await routes.request('/preflight');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { providers?: unknown };
    expect(payload).toHaveProperty('providers');
  });

  it('reads Studio Settings fresh for every provider capability request', async () => {
    let defaultProviderId: GenerationProviderId = 'codex';
    const routes = createProviderRoutes({
      readSettings: () => ({ ...createDefaultEditableStudioSettings(), defaultProviderId }),
    });

    const first = (await (await routes.request('/')).json()) as {
      providers: Array<{ providerId: string; isDefault: boolean }>;
    };
    defaultProviderId = 'dry_run';
    const second = (await (await routes.request('/')).json()) as {
      providers: Array<{ providerId: string; isDefault: boolean }>;
    };

    expect(first.providers.find((provider) => provider.providerId === 'codex')?.isDefault).toBe(
      true,
    );
    expect(second.providers.find((provider) => provider.providerId === 'dry_run')?.isDefault).toBe(
      true,
    );
  });
});
