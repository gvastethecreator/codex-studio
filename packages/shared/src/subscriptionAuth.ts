export const SUBSCRIPTION_PROVIDER_IDS = ['codex', 'xai', 'google'] as const;

export type SubscriptionProviderId = (typeof SUBSCRIPTION_PROVIDER_IDS)[number];

export type SubscriptionAuthStatus = 'logged_out' | 'pending' | 'logged_in' | 'refresh_failed';

export interface SubscriptionAuthPublicStatus {
  providerId: SubscriptionProviderId;
  status: SubscriptionAuthStatus;
  accountLabel: string | null;
  expiresAt: string | null;
  lastError: string | null;
  verificationUrl: string | null;
  authorizationUrl: string | null;
  userCode: string | null;
}

export interface SubscriptionAuthStartResponse {
  providerId: SubscriptionProviderId;
  status: 'pending';
  verificationUrl: string | null;
  authorizationUrl: string | null;
  userCode: string | null;
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
  if (providerId === 'codex') return 'chatgpt';
  if (providerId === 'xai') return 'grok';
  return providerId;
}

export function subscriptionProviderIdForGeneration(
  providerId: string,
): SubscriptionProviderId | null {
  if (providerId === 'chatgpt') return 'codex';
  if (providerId === 'grok') return 'xai';
  if (providerId === 'google') return 'google';
  return null;
}
