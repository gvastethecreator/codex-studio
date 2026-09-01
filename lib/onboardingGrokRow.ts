import { ONBOARDING_GROK_INSTALL_URL, type OnboardingGrokRow } from '../packages/shared/src';

export { ONBOARDING_GROK_INSTALL_URL };

export function grokRowNeedsInstall(row: OnboardingGrokRow) {
  return !row.cliAvailable && !row.loggedIn;
}

export function grokRowNeedsLogin(row: OnboardingGrokRow) {
  return row.cliAvailable && !row.loggedIn;
}
