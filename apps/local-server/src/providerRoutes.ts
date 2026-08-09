import { Hono } from 'hono';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';
import { readGenerationProviderRuntimePreflights } from './providers/runtimeConfig';
import { readProviderCapabilities } from './providerCapabilities';
import type { readEditableStudioSettings } from './studioSettingsStore';

interface ProviderRoutesDependencies {
  readSettings: () => ReturnType<typeof readEditableStudioSettings>;
  readCodexRuntimeDoctor: () => CodexRuntimeDoctorReport;
  readGrokRuntimeDoctor: () => GrokRuntimeDoctorReport;
}

export function createProviderRoutes({
  readSettings,
  readCodexRuntimeDoctor: readCodexRuntimeDoctorFn,
  readGrokRuntimeDoctor: readGrokRuntimeDoctorFn,
}: ProviderRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) =>
    c.json(
      readProviderCapabilities(
        readSettings(),
        process.env,
        readCodexRuntimeDoctorFn(),
        readGrokRuntimeDoctorFn(),
      ),
    ),
  );

  routes.get('/preflight', (c) => {
    return c.json({
      providers: readGenerationProviderRuntimePreflights(
        process.env,
        readCodexRuntimeDoctorFn(),
        readGrokRuntimeDoctorFn(),
      ),
    });
  });

  return routes;
}
