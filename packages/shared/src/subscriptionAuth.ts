export const SUBSCRIPTION_PROVIDER_IDS = ['codex', 'xai'] as const;

export type SubscriptionProviderId = (typeof SUBSCRIPTION_PROVIDER_IDS)[number];

export type SubscriptionAuthStatus = 'logged_out' | 'pending' | 'logged_in' | 'refresh_failed';

export interface SubscriptionAuthPublicStatus {
  providerId: SubscriptionProviderId;
  status: SubscriptionAuthStatus;
  accountLabel: string | null;
  expiresAt: string | null;
  lastError: string | null;
  verificationUrl: string | null;
  userCode: string | null;
}

export interface SubscriptionAuthStartResponse {
  providerId: SubscriptionProviderId;
  status: 'pending';
  verificationUrl: string;
  userCode: string;
  expiresAt: string;
}

export interface SubscriptionAuthUpdatedEventPayload {
  providerId: SubscriptionProviderId;
  status: SubscriptionAuthStatus;
  accountLabel: string | null;
}

export function isSubscriptionProviderId(value: string): value is SubscriptionProviderId {
  return (SUBSCRIPTION_PROVIDER_IDS as readonly string[]).includes(value);
}

export function generationProviderIdForSubscription(providerId: SubscriptionProviderId) {
  return providerId === 'xai' ? 'grok' : 'codex';
}

export function subscriptionProviderIdForGeneration(
  providerId: string,
): SubscriptionProviderId | null {
  if (providerId === 'codex') return 'codex';
  if (providerId === 'grok') return 'xai';
  return null;
}
