import type {
  SubscriptionAuthStatus,
  SubscriptionProviderId,
} from '../packages/shared/src/subscriptionAuth';

export function subscriptionAccountTitle(providerId: SubscriptionProviderId) {
  if (providerId === 'codex') return 'ChatGPT';
  if (providerId === 'xai') return 'xAI';
  return 'Google';
}

export function subscriptionAccountUsedBy(providerId: SubscriptionProviderId) {
  if (providerId === 'codex') return 'Codex image generation';
  if (providerId === 'xai') return 'Grok Imagine';
  return 'Nano Banana image generation';
}

export function subscriptionAuthStatusLabel(
  status: SubscriptionAuthStatus | 'loading' | null | undefined,
) {
  if (status === 'logged_in') return 'Signed in';
  if (status === 'pending') return 'Waiting for confirmation';
  if (status === 'refresh_failed') return 'Sign in expired';
  if (status === 'logged_out') return 'Not signed in';
  return 'Checking';
}

export function subscriptionAuthOpenLabel(providerId: SubscriptionProviderId) {
  if (providerId === 'codex') return 'Open ChatGPT';
  if (providerId === 'xai') return 'Open xAI';
  return 'Open Google';
}

export function providerReadyLabel({
  canExecute,
  status,
}: {
  canExecute: boolean;
  status: string;
}) {
  if (canExecute) return 'Ready';
  if (status === 'planned') return 'Planned';
  if (status === 'unknown') return 'Checking';
  return 'Needs setup';
}

export function providerRuntimeLabel(state: string | null | undefined) {
  if (state === 'configured') return 'CLI available';
  if (state === 'missing') return 'CLI missing';
  if (state === 'invalid') return 'CLI needs repair';
  if (state === 'not_required') return 'CLI not required';
  return null;
}

export function providerSecretLabel(
  state: string | null | undefined,
  source: string | null | undefined,
) {
  if (state === 'configured') return source ? `Key configured (${source})` : 'Key configured';
  if (state === 'missing') return 'API key missing';
  if (state === 'not_required') return null;
  return null;
}
