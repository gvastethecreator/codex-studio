import {
  buildOnboardingProbe,
  onboardingFactsFromHealth,
  type OnboardingProbe,
} from '../../../packages/shared/src';
import { getSettings, hasEnvLocalFile } from './config';
import { readCodexRuntimeDoctor } from './codexRuntimeDoctor';
import { grokOnboardingFactsFromDoctor, readGrokRuntimeDoctor } from './grokRuntimeDoctor';
import { inspectLibrary } from './library';
import { isAppServerRunning } from './codex/processSupervisor';

export function readLocalOnboardingProbe(): OnboardingProbe {
  const bunVersion =
    typeof globalThis === 'object' && 'Bun' in globalThis
      ? ((globalThis as { Bun?: { version?: string } }).Bun?.version ?? null)
      : null;
  const settings = getSettings();
  const library = inspectLibrary();
  const doctor = readCodexRuntimeDoctor();
  const studioLibraryReady =
    library.exists && library.writable && library.missingFolders.length === 0;

  const grok = grokOnboardingFactsFromDoctor(readGrokRuntimeDoctor());

  return buildOnboardingProbe(
    onboardingFactsFromHealth({
      bunVersion,
      codexCliAvailable: doctor.selectedVersion !== null,
      chatgptLoggedIn: false,
      studioLibraryReady,
      studioLibraryPath: settings.libraryDir,
      bootstrapConfigReady: hasEnvLocalFile(),
      appServerReady: isAppServerRunning(),
      ...grok,
    }),
  );
}
