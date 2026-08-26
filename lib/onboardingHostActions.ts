import type { OnboardingFacts } from '../packages/shared/src';

export function shouldShowAskCodex(facts: OnboardingFacts | null | undefined) {
  return Boolean(facts?.codexCliAvailable);
}
