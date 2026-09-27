import { describe, expect, it } from 'vitest';

import { extractSubscriptionHttpDiagnostic } from './subscriptionHttpDiagnostic';
import { projectSubscriptionHttpDiagnostic } from '../../../../packages/shared/src/subscriptionHttpDiagnostic';

const RECEIVED = '2026-09-25T22:00:00Z';
const FUTURE = '2026-09-26T01:00:00.000Z';
const FUTURE_S = Date.parse(FUTURE) / 1000;

function capture(payload: unknown, extras: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    receivedAt: RECEIVED,
    provider: 'chatgpt',
    transport: 'subscription_http',
    channel: 'http_json',
    httpStatus: 429,
    headers: {},
    payload,
    ...extras,
  };
}

function quota(extras: Record<string, unknown> = {}) {
  return capture({ error: { code: 'usage_limit_reached', ...extras } });
}

describe('subscription HTTP diagnostic extractor', () => {
  it('does not invent a reset or a daily window', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(quota());
    expect(diagnostic?.reset).toMatchObject({
      status: 'unknown',
      atUtc: null,
      appliesTo: 'unknown',
      recoveryGuaranteed: false,
    });
    expect(diagnostic?.limitations).toContain('no_inference_of_daily_window_or_midnight_reset');
  });

  it('ignores a local image count', () => {
    const left = extractSubscriptionHttpDiagnostic(quota());
    const right = extractSubscriptionHttpDiagnostic({
      ...quota(),
      imagesCount: 3200,
      quotaPerDay: 3200,
    });
    expect(right).toEqual(left);
  });

  it('lets a structured rate code beat a quota message', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({
        error: { code: 'rate_limit_exceeded', message: 'The usage limit has been reached' },
      }),
    );
    expect(diagnostic?.classification).toMatchObject({
      category: 'rate_limit',
      basis: 'structured_code',
    });
  });

  it('drops an unknown code instead of exporting it or following quota prose', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        { error: { code: 'SECRET_UNKNOWN_CODE', message: 'The usage limit has been reached' } },
        { httpStatus: 400 },
      ),
    );
    expect(diagnostic?.classification).toMatchObject({ providerCode: null, category: 'unknown' });
    expect(JSON.stringify(diagnostic)).not.toContain('SECRET_UNKNOWN_CODE');
  });

  it('keeps disagreeing code and type visible', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ error: { code: 'usage_limit_reached', type: 'rate_limit_error' } }),
    );
    expect(diagnostic?.classification.category).toBe('source_limit');
    expect(diagnostic?.warnings).toContain('code_type_disagree');
  });

  it('matches a 429 JSON body whose quota token is type and whose reset is numeric', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          error: {
            type: 'usage_limit_reached',
            message: 'The usage limit has been reached',
            resets_at: 1_790_000_000,
          },
        },
        { headers: { Date: 'Fri, 25 Sep 2026 22:00:00 GMT' } },
      ),
    );
    expect(diagnostic).toMatchObject({
      channel: 'http_json',
      httpStatus: 429,
      classification: {
        category: 'source_limit',
        basis: 'structured_code',
        confidence: 'high',
        providerCode: null,
        providerType: 'usage_limit_reached',
        terminalSseFailure: false,
      },
      retryAfter: { status: 'absent', seconds: null },
      reset: {
        status: 'unknown',
        atUtc: null,
        appliesTo: 'unknown',
        recoveryGuaranteed: false,
        candidates: [
          {
            path: 'payload.error.resets_at',
            status: 'unit_unknown',
            atUtc: null,
            unitBasis: null,
          },
        ],
      },
      policy: { automaticRetry: false, automaticFallback: false, preserveNeedsReview: false },
    });
    expect(diagnostic?.warnings).toEqual(['numeric_reset_unit_not_verified']);
    expect(JSON.stringify(diagnostic)).not.toContain('The usage limit has been reached');
    expect(JSON.stringify(diagnostic)).not.toContain('1790000000');
  });

  it('uses type only when code is absent or empty', () => {
    expect(
      extractSubscriptionHttpDiagnostic(capture({ error: { type: 'rate_limit_error' } }))
        ?.classification.category,
    ).toBe('rate_limit');
    expect(
      extractSubscriptionHttpDiagnostic(capture({ error: { code: '', type: 'rate_limit_error' } }))
        ?.classification.category,
    ).toBe('rate_limit');
  });

  it('treats generic quota text as low confidence', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ error: { message: 'The usage limit has been reached' } }),
    );
    expect(diagnostic?.classification).toMatchObject({
      category: 'source_limit',
      confidence: 'low',
    });
  });

  it('does not treat 429 alone as a quota window', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(capture({}));
    expect(diagnostic?.warnings).toContain('429_does_not_identify_the_quota');
    expect(diagnostic?.reset.appliesTo).toBe('unknown');
  });

  it.each([
    [401, 'invalid_grant'],
    [403, 'entitlement_denied'],
    [503, 'http_error'],
  ] as const)('falls back from HTTP %s', (httpStatus, category) => {
    expect(
      extractSubscriptionHttpDiagnostic(capture({}, { httpStatus }))?.classification.category,
    ).toBe(category);
  });

  it('preserves HTTP 200 for a terminal SSE quota failure', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          type: 'response.failed',
          response: { status: 'failed', error: { code: 'usage_limit_reached' } },
        },
        { channel: 'sse_event', httpStatus: 200 },
      ),
    );
    expect(diagnostic).toMatchObject({
      httpStatus: 200,
      classification: { category: 'source_limit', terminalSseFailure: true },
    });
  });

  it('does not call a nonterminal SSE event a terminal failure', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ type: 'response.created' }, { httpStatus: 200, channel: 'sse_event' }),
    );
    expect(diagnostic?.classification.terminalSseFailure).toBe(false);
    expect(diagnostic?.warnings).toContain('terminal_sse_failure_not_established');
  });

  it('does not classify SSE content_filter as quota', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          type: 'response.incomplete',
          response: { status: 'incomplete', incomplete_details: { reason: 'content_filter' } },
        },
        { channel: 'sse_event', httpStatus: 200 },
      ),
    );
    expect(diagnostic?.classification.category).toBe('moderation');
  });

  it('keeps Retry-After distinct from reset', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(quota({ message: 'wait' }));
    const withRetry = extractSubscriptionHttpDiagnostic({
      ...quota(),
      headers: { 'Retry-After': '30' },
    });
    expect(withRetry?.retryAfter.seconds).toBe(30);
    expect(withRetry?.reset.atUtc).toBeNull();
    expect(withRetry?.warnings).toContain('retry_after_is_not_quota_reset');
    expect(diagnostic?.retryAfter.status).toBe('absent');
  });

  it.each([
    ['60', 60],
    [' 30 ', 30],
    ['0', 0],
    ['0.1', 1],
  ])('parses Retry-After delay %j', (value, seconds) => {
    const diagnostic = extractSubscriptionHttpDiagnostic({
      ...quota(),
      headers: { 'Retry-After': value },
    });
    expect(diagnostic?.retryAfter.seconds).toBe(seconds);
  });

  it.each(['-1', 'garbage', '1s', '999999999999999999999999', 'Infinity', '2e3'])(
    'rejects Retry-After %s',
    (value) => {
      const diagnostic = extractSubscriptionHttpDiagnostic({
        ...quota(),
        headers: { 'Retry-After': value },
      });
      expect(diagnostic?.retryAfter.status).toBe('invalid');
    },
  );

  it('uses the server Date header for an HTTP-date Retry-After and warns on clock skew', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic({
      ...capture({}),
      headers: {
        Date: 'Fri, 25 Sep 2026 21:50:00 GMT',
        'Retry-After': 'Fri, 25 Sep 2026 21:51:00 GMT',
      },
    });
    expect(diagnostic?.retryAfter).toMatchObject({
      seconds: 60,
      notBeforeUtc: '2026-09-25T22:01:00.000Z',
      basis: 'server_date',
    });
    expect(diagnostic?.warnings).toContain('server_client_clock_difference_over_two_minutes');
  });

  it('clamps a past HTTP-date Retry-After without calling that recovery', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic({
      ...capture({}),
      headers: { 'Retry-After': 'Fri, 25 Sep 2026 21:00:00 GMT' },
    });
    expect(diagnostic?.retryAfter.seconds).toBe(0);
    expect(diagnostic?.reset.recoveryGuaranteed).toBe(false);
  });

  it('does not use a cached Date as the clock anchor', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic({
      ...capture({}),
      headers: {
        Date: 'Fri, 25 Sep 2026 21:50:00 GMT',
        'Retry-After': 'Fri, 25 Sep 2026 21:51:00 GMT',
        Age: '60',
      },
    });
    expect(diagnostic?.retryAfter.basis).toBe('client_clock');
    expect(diagnostic?.warnings).toContain('cached_response_date_not_used_as_clock_anchor');
  });

  it('uses resets_in_seconds when that duration matches resets_at', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          error: {
            type: 'usage_limit_reached',
            message: 'The usage limit has been reached',
            resets_at: 1_790_737_380,
            resets_in_seconds: 341_613,
            limit_window_minutes: 10_080,
          },
        },
        {
          receivedAt: '2026-09-26T04:09:27.000Z',
          headers: { Date: 'Sat, 26 Sep 2026 04:09:27 GMT' },
        },
      ),
    );
    expect(diagnostic?.reset).toMatchObject({
      status: 'reported_future',
      agreement: 'corroborated',
      atUtc: '2026-09-30T03:03:00.000Z',
      durationSeconds: 341613,
      windowMinutes: 10080,
      primaryUsedPercent: null,
      appliesTo: 'unknown',
      recoveryGuaranteed: false,
    });
    expect(diagnostic?.reset.candidates).toEqual([
      expect.objectContaining({
        path: 'payload.error.resets_at',
        status: 'parsed',
        atUtc: '2026-09-30T03:03:00.000Z',
        unitBasis: 'named_seconds_field',
      }),
      expect.objectContaining({
        path: 'payload.error.resets_in_seconds',
        status: 'parsed',
        unitBasis: 'named_seconds_field',
      }),
    ]);
    expect(diagnostic?.warnings).not.toContain('numeric_reset_unit_not_verified');
  });

  it('keeps a derived reset when resets_at is absent and the server Date is present', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          error: {
            type: 'usage_limit_reached',
            resets_in_seconds: 341_613,
            limit_window_minutes: 10_080,
          },
        },
        {
          receivedAt: '2026-09-26T04:14:27.000Z',
          headers: { Date: 'Sat, 26 Sep 2026 04:09:27 GMT' },
        },
      ),
    );
    expect(diagnostic?.reset).toMatchObject({
      status: 'reported_future',
      agreement: 'derived_from_server_date',
      atUtc: '2026-09-30T03:03:00.000Z',
      durationSeconds: 341613,
    });
    expect(diagnostic?.clock.serverClientDifferenceMs).toBe(-300_000);
  });

  it.each(['2026-09-26T04:14:27.000Z', '2026-09-26T04:04:27.000Z'])(
    'corroborates resets_at against the server Date when the local clock is %s',
    (receivedAt) => {
      const diagnostic = extractSubscriptionHttpDiagnostic(
        capture(
          {
            error: {
              type: 'usage_limit_reached',
              resets_at: 1_790_737_380,
              resets_in_seconds: 341_613,
            },
          },
          {
            receivedAt,
            headers: {
              Date: 'Sat, 26 Sep 2026 04:09:27 GMT',
              'x-codex-primary-used-percent': '100',
            },
          },
        ),
      );
      expect(diagnostic?.reset).toMatchObject({
        status: 'reported_future',
        agreement: 'corroborated',
        atUtc: '2026-09-30T03:03:00.000Z',
        primaryUsedPercent: 100,
      });
      expect(diagnostic?.warnings).toContain('server_client_clock_difference_over_two_minutes');
    },
  );

  it('keeps disagreeing server Date and resets_at as a conflict with both sources', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          error: {
            type: 'usage_limit_reached',
            resets_at: 10,
            resets_in_seconds: 3600,
          },
        },
        {
          headers: { Date: 'Sat, 26 Sep 2026 04:09:27 GMT' },
        },
      ),
    );
    expect(diagnostic?.reset).toMatchObject({
      status: 'conflicting',
      agreement: 'conflicting',
      atUtc: null,
      durationSeconds: 3600,
    });
    expect(diagnostic?.reset.candidates).toEqual([
      expect.objectContaining({
        path: 'payload.error.resets_at',
        status: 'unit_unknown',
        atUtc: null,
        rawInteger: 10,
      }),
    ]);
    expect(diagnostic?.warnings).toContain('conflicting_reset_fields');
  });

  it('does not invent an absolute reset without a usable server Date', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({
        error: {
          type: 'usage_limit_reached',
          resets_at: 10,
          resets_in_seconds: 3600,
        },
      }),
    );
    expect(diagnostic?.reset).toMatchObject({
      status: 'unknown',
      agreement: 'unanchored',
      atUtc: null,
      durationSeconds: 3600,
    });
  });

  it('leaves a numeric reset unused until a unit is asserted', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(quota({ resets_at: FUTURE_S }));
    expect(diagnostic?.reset.atUtc).toBeNull();
    expect(diagnostic?.warnings).toContain('numeric_reset_unit_not_verified');
    const seconds = extractSubscriptionHttpDiagnostic(quota({ resets_at: FUTURE_S }), {
      resetUnit: 'seconds',
    });
    expect(seconds?.reset.atUtc).toBe(FUTURE);
    expect(seconds?.reset.candidates[0]?.unitBasis).toBe('operator_assertion');
    expect(
      extractSubscriptionHttpDiagnostic(quota({ resets_at: FUTURE_S * 1000 }), {
        resetUnit: 'milliseconds',
      })?.reset.atUtc,
    ).toBe(FUTURE);
    expect(
      extractSubscriptionHttpDiagnostic(quota({ resets_at: FUTURE_S * 1000 }), {
        resetUnit: 'seconds',
      })?.reset.atUtc,
    ).toBeNull();
  });

  it('accepts an ISO reset with an explicit offset and rejects zone-less or impossible dates', () => {
    expect(
      extractSubscriptionHttpDiagnostic(quota({ resets_at: '2026-09-25T22:00:00-03:00' }))?.reset
        .atUtc,
    ).toBe(FUTURE);
    for (const value of ['2026-09-26T01:00:00', '2026-02-30T01:00:00Z', true, null, {}, [], -100]) {
      expect(
        extractSubscriptionHttpDiagnostic(quota({ resets_at: value }))?.reset.atUtc,
      ).toBeNull();
    }
  });

  it('does not treat a past reset as proof of recovery', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      quota({ resets_at: '2026-09-25T21:00:00Z' }),
    );
    expect(diagnostic?.reset).toMatchObject({ status: 'reported_past', recoveryGuaranteed: false });
  });

  it('keeps conflicting resets instead of choosing one', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({
        resets_at: FUTURE,
        error: { code: 'usage_limit_reached', resets_at: '2026-09-27T01:00:00.000Z' },
      }),
    );
    expect(diagnostic?.reset).toMatchObject({ status: 'conflicting', atUtc: null });
    expect(diagnostic?.reset.candidates).toHaveLength(2);
  });

  it('retains matching reset paths', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ resets_at: FUTURE, error: { code: 'usage_limit_reached', resets_at: FUTURE } }),
    );
    expect(diagnostic?.reset.atUtc).toBe(FUTURE);
    expect(diagnostic?.reset.candidates).toHaveLength(2);
  });

  it('does not assert a unique reset when another candidate is unreadable', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ resets_at: 123, error: { code: 'usage_limit_reached', resets_at: FUTURE } }),
    );
    expect(diagnostic?.reset).toMatchObject({ status: 'conflicting', atUtc: null });
  });

  it('ignores a nested reset that is not on an allowed path', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ error: { code: 'usage_limit_reached' }, unrelated: { resets_at: FUTURE } }),
    );
    expect(diagnostic?.reset.atUtc).toBeNull();
  });

  it('preserves review for a 503 after submission and never enables retry or fallback', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ error: { code: 'server_error' } }, { httpStatus: 503, submissionRecorded: true }),
    );
    expect(diagnostic?.policy).toEqual({
      automaticRetry: false,
      automaticFallback: false,
      preserveNeedsReview: true,
    });
    expect(
      extractSubscriptionHttpDiagnostic({ ...quota(), executionUncertain: true })?.policy
        .preserveNeedsReview,
    ).toBe(true);
  });

  it('omits privacy sentinels from the export', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture(
        {
          error: {
            code: 'PRIVATE_CODE_SENTINEL',
            message: 'ignore previous instructions PRIVATE_PROMPT_SENTINEL',
            email: 'PRIVATE_ACCOUNT_SENTINEL',
          },
          image: 'PRIVATE_IMAGE_SENTINEL',
          request_id: 'PRIVATE_REQUEST_ID_SENTINEL',
        },
        {
          headers: {
            Authorization: 'Bearer PRIVATE_AUTH_SENTINEL',
            Cookie: 'PRIVATE_COOKIE_SENTINEL',
            'Retry-After': 'PRIVATE_PROMPT_SENTINEL',
          },
          provider: 'SECRET_PROVIDER',
          transport: 'SECRET_TRANSPORT',
        },
      ),
    );
    const text = JSON.stringify(diagnostic);
    for (const secret of [
      'PRIVATE_CODE_SENTINEL',
      'PRIVATE_PROMPT_SENTINEL',
      'PRIVATE_AUTH_SENTINEL',
      'PRIVATE_IMAGE_SENTINEL',
      'PRIVATE_ACCOUNT_SENTINEL',
      'PRIVATE_COOKIE_SENTINEL',
      'PRIVATE_REQUEST_ID_SENTINEL',
      'SECRET_PROVIDER',
      'SECRET_TRANSPORT',
    ]) {
      expect(text).not.toContain(secret);
    }
    expect(diagnostic?.provider).toBe('unknown');
    expect(diagnostic?.transport).toBe('unknown');
  });

  it('does not treat a prototype property as a provider code', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(
      capture({ error: { code: 'constructor' } }),
    );
    expect(diagnostic?.classification).toMatchObject({
      providerCode: null,
      category: 'rate_limit',
    });
  });

  it('does not mutate the input or call the network', () => {
    const input = capture({ error: { code: 'usage_limit_reached' } });
    const before = JSON.stringify(input);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new Error('NETWORK_FORBIDDEN');
    }) as unknown as typeof fetch;
    try {
      expect(extractSubscriptionHttpDiagnostic(input)?.classification.category).toBe(
        'source_limit',
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(JSON.stringify(input)).toBe(before);
  });

  it('returns null for invalid capture shapes without throwing', () => {
    expect(extractSubscriptionHttpDiagnostic([])).toBeNull();
    expect(extractSubscriptionHttpDiagnostic({ ...quota(), schemaVersion: 9 })).toBeNull();
    expect(
      extractSubscriptionHttpDiagnostic({ ...quota(), receivedAt: 'PRIVATE_DATE' }),
    ).toBeNull();
    expect(extractSubscriptionHttpDiagnostic({ ...quota(), channel: 'SECRET_CHANNEL' })).toBeNull();
    expect(extractSubscriptionHttpDiagnostic({ ...quota(), httpStatus: 999 })).toBeNull();
    expect(extractSubscriptionHttpDiagnostic(quota(), { resetUnit: 'days' })).toBeNull();
    const hostile: Record<string, unknown> = {};
    Object.defineProperty(hostile, 'error', {
      get() {
        throw new Error('PRIVATE_PROMPT_SENTINEL');
      },
    });
    expect(extractSubscriptionHttpDiagnostic(capture(hostile))).toBeNull();
  });

  it('strips fields outside the export allowlist', () => {
    const diagnostic = extractSubscriptionHttpDiagnostic(quota());
    const projected = projectSubscriptionHttpDiagnostic({
      ...diagnostic,
      prompt: 'PRIVATE_PROMPT_SENTINEL',
      reset: { ...diagnostic?.reset, recoveryGuaranteed: true, appliesTo: 'daily' },
      policy: { ...diagnostic?.policy, automaticRetry: true },
    });
    const text = JSON.stringify(projected);
    expect(text).not.toContain('PRIVATE_PROMPT_SENTINEL');
    expect(projected?.reset).toMatchObject({ appliesTo: 'unknown', recoveryGuaranteed: false });
    expect(projected?.policy.automaticRetry).toBe(false);
  });
});
