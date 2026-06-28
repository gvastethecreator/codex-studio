import { Hono } from 'hono';
import { readExternalProviderRuntimePreflights } from './providers/runtimeConfig';
import { readProviderCapabilities } from './providerCapabilities';
import type { readEditableStudioSettings } from './studioSettingsStore';

interface ProviderRoutesDependencies {
  readSettings: () => ReturnType<typeof readEditableStudioSettings>;
}

export function createProviderRoutes({ readSettings }: ProviderRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(readProviderCapabilities(readSettings())));

  routes.get('/preflight', (c) => c.json({ providers: readExternalProviderRuntimePreflights() }));

  return routes;
}
