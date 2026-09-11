/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SubscriptionAuthPublicStatus } from '../../packages/shared/src/subscriptionAuth';
import {
  cancelSubscriptionAuth,
  getSubscriptionAuthStatus,
  logoutSubscriptionAuth,
  startSubscriptionAuth,
} from '../../services/studio-api/auth';
import { SubscriptionAuthControls } from './SubscriptionAuthControls';

vi.mock('../../services/studio-api/auth', () => ({
  cancelSubscriptionAuth: vi.fn(),
  getSubscriptionAuthStatus: vi.fn(),
  logoutSubscriptionAuth: vi.fn(),
  startSubscriptionAuth: vi.fn(),
}));

vi.mock('../../services/studioEventSource', () => ({
  createStudioEventStream: () => ({
    onAuthUpdated: () => () => undefined,
    close: () => undefined,
  }),
}));

const loggedOutStatus: SubscriptionAuthPublicStatus = {
  providerId: 'codex',
  status: 'logged_out',
  accountLabel: null,
  expiresAt: null,
  lastError: null,
  verificationUrl: null,
  authorizationUrl: null,
  userCode: null,
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.mocked(cancelSubscriptionAuth).mockReset();
  vi.mocked(getSubscriptionAuthStatus).mockReset();
  vi.mocked(logoutSubscriptionAuth).mockReset();
  vi.mocked(startSubscriptionAuth).mockReset();
});

describe('SubscriptionAuthControls', () => {
  it('retries a failed initial status request', async () => {
    vi.mocked(getSubscriptionAuthStatus)
      .mockRejectedValueOnce(new Error('Status request failed.'))
      .mockResolvedValueOnce(loggedOutStatus);

    render(<SubscriptionAuthControls providerId="codex" />);

    expect((await screen.findByRole('alert')).textContent).toContain('Status request failed.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry status' }));

    await waitFor(() => expect(getSubscriptionAuthStatus).toHaveBeenCalledTimes(2));
    expect(
      (await screen.findByRole('button', { name: 'Sign in' })) as HTMLButtonElement,
    ).toHaveProperty('disabled', false);
  });

  it('explains how to recover when copying the device code fails', async () => {
    vi.mocked(getSubscriptionAuthStatus).mockResolvedValueOnce({
      ...loggedOutStatus,
      status: 'pending',
      verificationUrl: 'https://example.com/device',
      userCode: 'ABCD-1234',
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    render(<SubscriptionAuthControls providerId="codex" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Copy user code' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Unable to copy. Copy the code manually.',
    );
  });

  it('opens Google authorization without showing a device code', async () => {
    vi.mocked(getSubscriptionAuthStatus).mockResolvedValueOnce({
      ...loggedOutStatus,
      providerId: 'google',
      status: 'pending',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?state=safe',
    });

    render(<SubscriptionAuthControls providerId="google" />);

    const link = await screen.findByRole('link', { name: 'Open Google' });
    expect(link.getAttribute('href')).toContain('accounts.google.com');
    expect(screen.queryByRole('button', { name: 'Copy user code' })).toBeNull();
    expect(screen.getByText(/Google Cloud project for billing/)).toBeTruthy();
  });
});
