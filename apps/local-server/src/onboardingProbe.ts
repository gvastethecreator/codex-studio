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
import { getSubscriptionAuthStore, isSubscriptionLoggedIn } from './auth/store';
import { readXaiApiKey } from './auth/tokens';

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
  let codexSignedIn = false;
  let grokSignedIn = false;
  try {
    const store = getSubscriptionAuthStore();
    codexSignedIn = isSubscriptionLoggedIn(store.readProvider('codex'));
    grokSignedIn = isSubscriptionLoggedIn(store.readProvider('xai')) || Boolean(readXaiApiKey());
  } catch {
    // Store may be unavailable before the Studio Library exists.
  }

  return buildOnboardingProbe(
    onboardingFactsFromHealth({
      bunVersion,
      codexCliAvailable: doctor.selectedVersion !== null,
      chatgptLoggedIn: codexSignedIn,
      codexSubscriptionReady: codexSignedIn,
      studioLibraryReady,
      studioLibraryPath: settings.libraryDir,
      bootstrapConfigReady: hasEnvLocalFile(),
      appServerReady: isAppServerRunning(),
      grokCliAvailable: grok.grokCliAvailable,
      grokLoggedIn: grok.grokLoggedIn || grokSignedIn,
    }),
  );
}
