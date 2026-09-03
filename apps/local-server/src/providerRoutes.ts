import { Hono } from 'hono';
import type { CodexRuntimeDoctorReport } from '../../../packages/shared/src';
import type { GrokRuntimeDoctorReport } from './grokRuntimeDoctor';
import {
  readAntigravityRuntimeDoctor,
  type AntigravityRuntimeDoctorReport,
} from './antigravityRuntimeDoctor';
import { readGenerationProviderRuntimePreflights } from './providers/runtimeConfig';
import { readProviderCapabilities } from './providerCapabilities';
import type { readEditableStudioSettings } from './studioSettingsStore';

interface ProviderRoutesDependencies {
  readSettings: () => ReturnType<typeof readEditableStudioSettings>;
  readCodexRuntimeDoctor: () => CodexRuntimeDoctorReport;
  readGrokRuntimeDoctor: () => GrokRuntimeDoctorReport;
  readAntigravityRuntimeDoctor?: () => AntigravityRuntimeDoctorReport;
}

export function createProviderRoutes({
  readSettings,
  readCodexRuntimeDoctor: readCodexRuntimeDoctorFn,
  readGrokRuntimeDoctor: readGrokRuntimeDoctorFn,
  readAntigravityRuntimeDoctor: readAntigravityRuntimeDoctorFn = readAntigravityRuntimeDoctor,
}: ProviderRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) =>
    c.json(
      readProviderCapabilities(
        readSettings(),
        process.env,
        readCodexRuntimeDoctorFn(),
        readGrokRuntimeDoctorFn(),
        undefined,
        readAntigravityRuntimeDoctorFn(),
      ),
    ),
  );

  routes.get('/preflight', (c) => {
    return c.json({
      providers: readGenerationProviderRuntimePreflights(
        process.env,
        readCodexRuntimeDoctorFn(),
        readGrokRuntimeDoctorFn(),
        readAntigravityRuntimeDoctorFn(),
      ),
    });
  });

  return routes;
}
