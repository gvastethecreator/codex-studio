import type {
  SubscriptionAuthPublicStatus,
  SubscriptionProviderId,
} from '../../packages/shared/src';
import { request } from './http';

export async function getSubscriptionAuthStatus(
  providerId: SubscriptionProviderId,
  init?: RequestInit,
) {
  return request<SubscriptionAuthPublicStatus>(`/api/auth/${providerId}`, init);
}

export async function startSubscriptionAuth(providerId: SubscriptionProviderId) {
  return request<SubscriptionAuthPublicStatus>(`/api/auth/${providerId}/start`, {
    method: 'POST',
  });
}

export async function cancelSubscriptionAuth(providerId: SubscriptionProviderId) {
  return request<SubscriptionAuthPublicStatus>(`/api/auth/${providerId}/cancel`, {
    method: 'POST',
  });
}

export async function logoutSubscriptionAuth(providerId: SubscriptionProviderId) {
  return request<SubscriptionAuthPublicStatus>(`/api/auth/${providerId}/logout`, {
    method: 'POST',
  });
}
