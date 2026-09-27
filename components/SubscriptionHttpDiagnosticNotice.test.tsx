/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { extractSubscriptionHttpDiagnostic } from '../apps/local-server/src/providers/subscriptionHttpDiagnostic';
import { SubscriptionHttpDiagnosticNotice } from './SubscriptionHttpDiagnosticNotice';
import {
  describeSubscriptionHttpDiagnostic,
  readLatestSubscriptionHttpDiagnostic,
} from '../lib/subscriptionHttpDiagnosticView';

const diagnostic = extractSubscriptionHttpDiagnostic({
  schemaVersion: 1,
  receivedAt: '2026-09-25T22:00:00.000Z',
  provider: 'chatgpt',
  transport: 'subscription_http',
  channel: 'http_json',
  httpStatus: 429,
  headers: { 'Retry-After': '30' },
  payload: { error: { code: 'usage_limit_reached', message: 'PRIVATE_PROMPT_SENTINEL' } },
  synthetic: true,
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('quota diagnostic notice', () => {
  it('reads only the latest terminal event and ignores jobs without a diagnostic', () => {
    expect(readLatestSubscriptionHttpDiagnostic([])).toBeNull();
    expect(
      readLatestSubscriptionHttpDiagnostic([
        {
          type: 'job.failed',
          metadata: { code: 'source_limit', providerCode: 'usage_limit_reached' },
        },
      ]),
    ).toBeNull();
    expect(
      readLatestSubscriptionHttpDiagnostic([
        { type: 'job.failed', metadata: { diagnostic } },
        {
          type: 'job.started',
          metadata: { diagnostic: { schemaVersion: 9, prompt: 'PRIVATE_PROMPT_SENTINEL' } },
        },
      ])?.classification.category,
    ).toBe('source_limit');
    expect(
      readLatestSubscriptionHttpDiagnostic([
        { type: 'job.failed', metadata: { diagnostic } },
        { type: 'job.needs_review', metadata: { code: 'http_error' } },
      ]),
    ).toBeNull();
    expect(
      readLatestSubscriptionHttpDiagnostic([
        { type: 'job.started', metadata: null },
        { type: 'job.failed', metadata: { diagnostic, prompt: 'PRIVATE_PROMPT_SENTINEL' } },
      ])?.classification.category,
    ).toBe('source_limit');
  });

  it('shows classification, wait, and reset without a countdown or the remote message', () => {
    const view = describeSubscriptionHttpDiagnostic(diagnostic);
    render(<SubscriptionHttpDiagnosticNotice value={diagnostic} />);
    expect(
      screen.getByText(/Usage limit \(source_limit, high\)\. Provider code usage_limit_reached/),
    ).toBeTruthy();
    expect(screen.getByText('Structured provider code')).toBeTruthy();
    expect(screen.getByText(/30 seconds from the response headers/)).toBeTruthy();
    expect(screen.getByText(/not a quota reset/)).toBeTruthy();
    expect(screen.getByText(/No reset time was reported/)).toBeTruthy();
    expect(screen.getByText('No recovery time is guaranteed.')).toBeTruthy();
    expect(screen.queryByText(/PRIVATE_PROMPT_SENTINEL/)).toBeNull();
    expect(screen.queryByText(/\b24 hours\b/)).toBeNull();
    expect(view?.copyText).not.toContain('PRIVATE_PROMPT_SENTINEL');
    expect(view?.copyText).toContain('"recoveryGuaranteed": false');
  });

  it('shows a numeric reset field without turning it into a time', () => {
    const liveShape = extractSubscriptionHttpDiagnostic({
      schemaVersion: 1,
      receivedAt: '2026-09-26T02:40:22.341Z',
      provider: 'chatgpt',
      transport: 'subscription_http',
      channel: 'http_json',
      httpStatus: 429,
      headers: { Date: 'Fri, 26 Sep 2026 02:40:22 GMT' },
      payload: {
        error: {
          type: 'usage_limit_reached',
          message: 'PRIVATE_PROMPT_SENTINEL',
          resets_at: 1_790_000_000,
        },
      },
    });
    render(<SubscriptionHttpDiagnosticNotice value={liveShape} />);
    expect(screen.getByText(/Provider type usage_limit_reached/)).toBeTruthy();
    expect(screen.getByText('429')).toBeTruthy();
    expect(screen.getByText('Not reported.')).toBeTruthy();
    expect(
      screen.getByText(
        'A numeric reset field was reported (payload.error.resets_at). Its unit is not verified, so no reset time is shown.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/PRIVATE_PROMPT_SENTINEL/)).toBeNull();
    expect(screen.queryByText(/1790000000/)).toBeNull();
    expect(screen.queryByText(/\b24 hours\b/)).toBeNull();
  });

  it('shows a reset time when the body names the duration in seconds', () => {
    const named = extractSubscriptionHttpDiagnostic({
      schemaVersion: 1,
      receivedAt: '2026-09-26T04:09:27.000Z',
      provider: 'chatgpt',
      transport: 'subscription_http',
      channel: 'http_json',
      httpStatus: 429,
      headers: {
        Date: 'Sat, 26 Sep 2026 04:09:27 GMT',
        'x-codex-primary-used-percent': '100',
      },
      payload: {
        error: {
          type: 'usage_limit_reached',
          message: 'PRIVATE_PROMPT_SENTINEL',
          resets_at: 1_790_737_380,
          resets_in_seconds: 341_613,
          limit_window_minutes: 10_080,
        },
      },
    });
    render(<SubscriptionHttpDiagnosticNotice value={named} />);
    expect(screen.getByText(/Reported reset: .*30 Sept 2026, 00:03/)).toBeTruthy();
    expect(screen.getByText(/Later availability is not verified/)).toBeTruthy();
    expect(screen.getByText(/Automatic retries will not be sent/)).toBeTruthy();
    expect(screen.getByText(/Reported window: 10080 minutes \(7 days\)/)).toBeTruthy();
    expect(screen.getByText(/Primary window use: 100%/)).toBeTruthy();
    expect(screen.queryByText(/Quota available/)).toBeNull();
    expect(screen.getByText('No recovery time is guaranteed.')).toBeTruthy();
    expect(screen.queryByText(/PRIVATE_PROMPT_SENTINEL/)).toBeNull();
    expect(screen.queryByText(/\b24 hours\b/)).toBeNull();
  });

  it('says the reported reset has passed without calling the quota available', () => {
    const named = extractSubscriptionHttpDiagnostic({
      schemaVersion: 1,
      receivedAt: '2026-09-26T04:09:27.000Z',
      provider: 'chatgpt',
      transport: 'subscription_http',
      channel: 'http_json',
      httpStatus: 429,
      headers: { Date: 'Sat, 26 Sep 2026 04:09:27 GMT' },
      payload: {
        error: {
          type: 'usage_limit_reached',
          resets_at: 1_790_737_380,
          resets_in_seconds: 341_613,
        },
      },
    });
    const view = describeSubscriptionHttpDiagnostic(named, Date.parse('2026-09-30T03:03:00.000Z'));
    expect(view?.reset).toMatch(/Reported reset time has passed/);
    expect(view?.reset).toMatch(/Availability is not verified/);
    expect(view?.reset).not.toMatch(/Quota available/);
    expect(view?.reset).not.toMatch(/Automatic retries will not be sent/);
  });

  it('copies the closed export and falls back when the clipboard is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<SubscriptionHttpDiagnosticNotice value={diagnostic} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy diagnostic' }));
    await screen.findByText('Diagnostic copied.');
    expect(writeText).toHaveBeenCalledWith(expect.not.stringContaining('PRIVATE_PROMPT_SENTINEL'));
    expect(JSON.parse(String(writeText.mock.calls[0]?.[0]))).toMatchObject({
      schemaVersion: 1,
      reset: { appliesTo: 'unknown', recoveryGuaranteed: false },
    });

    cleanup();
    writeText.mockRejectedValueOnce(new Error('denied'));
    render(<SubscriptionHttpDiagnosticNotice value={diagnostic} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy diagnostic' }));
    expect(
      await screen.findByText('Clipboard is unavailable. Select the diagnostic and copy it.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Quota diagnostic')).toBeTruthy();
  });
});
