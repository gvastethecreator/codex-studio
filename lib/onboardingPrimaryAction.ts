import {
  ONBOARDING_BUN_INSTALL_URL,
  ONBOARDING_CODEX_INSTALL_URL,
  ONBOARDING_PRIMARY_CTA_LABEL,
  type OnboardingPrimaryCta,
} from '../packages/shared/src';

export type OnboardingPrimaryAction =
  | { type: 'open_url'; cta: OnboardingPrimaryCta; label: string; url: string }
  | { type: 'start_app_server'; cta: OnboardingPrimaryCta; label: string }
  | { type: 'in_app_setup'; cta: OnboardingPrimaryCta; label: string }
  | { type: 'connect_chatgpt'; cta: OnboardingPrimaryCta; label: string }
  | { type: 'codex_login'; cta: OnboardingPrimaryCta; label: string }
  | { type: 'complete'; cta: OnboardingPrimaryCta; label: string }
  | { type: 'deferred'; cta: OnboardingPrimaryCta; label: string };

export function resolveOnboardingPrimaryAction(cta: OnboardingPrimaryCta): OnboardingPrimaryAction {
  const label = ONBOARDING_PRIMARY_CTA_LABEL[cta];
  if (cta === 'open_bun_install') {
    return { type: 'open_url', cta, label, url: ONBOARDING_BUN_INSTALL_URL };
  }
  if (cta === 'open_codex_install') {
    return { type: 'open_url', cta, label, url: ONBOARDING_CODEX_INSTALL_URL };
  }
  if (cta === 'start_app_server') {
    return { type: 'start_app_server', cta, label };
  }
  if (cta === 'in_app_setup') {
    return { type: 'in_app_setup', cta, label };
  }
  if (cta === 'connect_chatgpt') {
    return { type: 'connect_chatgpt', cta, label };
  }
  if (cta === 'codex_login') {
    return { type: 'codex_login', cta, label };
  }
  if (cta === 'ready') {
    return { type: 'complete', cta, label };
  }
  return { type: 'deferred', cta, label };
}
