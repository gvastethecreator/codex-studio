import { Hono } from 'hono';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import { readGenerationProviderRuntimePreflights } from './providers/runtimeConfig';
import { readProviderCapabilities } from './providerCapabilities';
import type { readEditableStudioSettings } from './studioSettingsStore';

interface ProviderRoutesDependencies {
  readSettings: () => ReturnType<typeof readEditableStudioSettings>;
  readCodexRuntimeDoctor?: () => CodexRuntimeDoctorReport;
}

export function createProviderRoutes({
  readSettings,
  readCodexRuntimeDoctor: readCodexRuntimeDoctorFn = readCodexRuntimeDoctor,
}: ProviderRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) =>
    c.json(readProviderCapabilities(readSettings(), process.env, readCodexRuntimeDoctorFn())),
  );

  routes.get('/preflight', (c) => {
    return c.json({
      providers: readGenerationProviderRuntimePreflights(process.env, readCodexRuntimeDoctorFn()),
    });
  });

  return routes;
}
