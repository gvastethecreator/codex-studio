import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src';
import { createProviderRoutes } from './providerRoutes';

describe('providerRoutes', () => {
  it('returns provider capabilities from Studio Settings', async () => {
    const routes = createProviderRoutes({
      readSettings: createDefaultEditableStudioSettings(),
    });

    const response = await routes.request('/');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { providers?: unknown[] };
    expect(Array.isArray(payload.providers)).toBe(true);
  });

  it('returns runtime preflight providers snapshot', async () => {
    const routes = createProviderRoutes({
      readSettings: createDefaultEditableStudioSettings(),
    });

    const response = await routes.request('/preflight');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { providers?: unknown };
    expect(payload).toHaveProperty('providers');
  });
});
