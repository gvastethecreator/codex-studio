import {
  detectCloudSyncLibraryPath,
  looksLikeAbsoluteLibraryPath,
  type OnboardingProbe,
  type OnboardingSetupRequest,
} from '../packages/shared/src';

export function resolveInAppSetupDraftPath(probe: OnboardingProbe | null): string {
  return probe?.studioLibraryPath?.trim() ?? '';
}

export function inAppSetupCloudProvider(libraryPath: string): string | null {
  return detectCloudSyncLibraryPath(libraryPath);
}

export function inAppSetupCanSubmit(input: {
  consent: boolean;
  libraryPath: string;
  confirmCloudSync: boolean;
}): boolean {
  if (!input.consent) return false;
  if (!looksLikeAbsoluteLibraryPath(input.libraryPath)) return false;
  if (inAppSetupCloudProvider(input.libraryPath) && !input.confirmCloudSync) return false;
  return true;
}

export function buildInAppSetupRequest(input: {
  consent: boolean;
  libraryPath: string;
  confirmCloudSync: boolean;
}): OnboardingSetupRequest {
  return {
    consent: input.consent,
    libraryPath: input.libraryPath.trim() || null,
    confirmCloudSync: input.confirmCloudSync,
    initLibrary: true,
    installDeps: true,
  };
}
