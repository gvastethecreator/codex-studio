import { describe, expect, it } from 'vite-plus/test';

import {
  providerReadyLabel,
  subscriptionAccountTitle,
  subscriptionAuthStatusLabel,
} from './subscriptionAuthUi';

describe('subscription auth UI copy', () => {
  it('uses account names instead of raw status enums', () => {
    expect(subscriptionAccountTitle('codex')).toBe('ChatGPT');
    expect(subscriptionAccountTitle('xai')).toBe('xAI');
    expect(subscriptionAccountTitle('google')).toBe('Google');
    expect(subscriptionAuthStatusLabel('logged_in')).toBe('Signed in');
    expect(subscriptionAuthStatusLabel('pending')).toBe('Waiting for confirmation');
    expect(subscriptionAuthStatusLabel('logged_out')).toBe('Not signed in');
    expect(subscriptionAuthStatusLabel('refresh_failed')).toBe('Sign in expired');
    expect(subscriptionAuthStatusLabel(null)).toBe('Checking');
    expect(providerReadyLabel({ canExecute: true, status: 'not_configured' })).toBe('Ready');
    expect(providerReadyLabel({ canExecute: false, status: 'not_configured' })).toBe('Needs setup');
  });
});
