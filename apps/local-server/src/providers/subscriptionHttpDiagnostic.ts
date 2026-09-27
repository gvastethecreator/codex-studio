import {
  formatSubscriptionHttpInstant,
  parseSubscriptionHttpInstant,
  projectSubscriptionHttpDiagnostic,
  SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS,
  subscriptionHttpInstantInRange,
  type SubscriptionHttpDiagnostic,
  type SubscriptionHttpDiagnosticCategory,
  type SubscriptionHttpDiagnosticWarning,
  type SubscriptionHttpProviderCode,
  type SubscriptionHttpResetCandidate,
  type SubscriptionHttpResetPath,
} from '../../../../packages/shared/src/subscriptionHttpDiagnostic';
import type { SubscriptionHttpError } from './subscriptionHttpError';

const CATEGORY_BY_CODE: Record<SubscriptionHttpProviderCode, SubscriptionHttpDiagnosticCategory> = {
  usage_limit_reached: 'source_limit',
  usage_limit_exceeded: 'source_limit',
  insufficient_quota: 'source_limit',
  quota_exceeded: 'source_limit',
  usagelimitexceeded: 'source_limit',
  rate_limit: 'rate_limit',
  rate_limit_exceeded: 'rate_limit',
  rate_limit_error: 'rate_limit',
  too_many_requests: 'rate_limit',
  invalid_grant: 'invalid_grant',
  invalid_token: 'invalid_grant',
  token_expired: 'invalid_grant',
  permission_denied: 'entitlement_denied',
  access_denied: 'entitlement_denied',
  insufficient_permissions: 'entitlement_denied',
  entitlement_denied: 'entitlement_denied',
  content_filter: 'moderation',
  moderation: 'moderation',
  moderation_blocked: 'moderation',
  safety_violation: 'moderation',
  server_error: 'http_error',
  internal_error: 'http_error',
  service_unavailable: 'http_error',
  invalid_request_error: 'invalid_request',
};

const RESET_KEYS = ['resets_at', 'reset_at', 'resetsAt'] as const;
const HTTP_DATE =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;
const QUOTA_TEXT =
  /(?:hit|reached|exceeded|exhausted) (?:your |the )?(?:usage limit|quota)|(?:usage limit|quota) (?:has been |is )?(?:reached|exceeded|exhausted)|no available usage/i;

type ResetPrefix = 'payload' | 'payload.response' | 'payload.error' | 'payload.response.error';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function own(value: unknown, key: string) {
  return isRecord(value) && Object.hasOwn(value, key) ? value[key] : undefined;
}

function boundedText(value: unknown) {
  return typeof value === 'string' ? value.slice(0, 4096).trim() : '';
}

function knownCode(value: unknown): SubscriptionHttpProviderCode | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toLowerCase();
  return Object.hasOwn(CATEGORY_BY_CODE, code) ? (code as SubscriptionHttpProviderCode) : null;
}

function headerValue(headers: unknown, name: string) {
  if (!isRecord(headers)) return null;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() !== name) continue;
    const value = headers[key];
    if (typeof value !== 'string' || value.length > 200) return null;
    return value.trim();
  }
  return null;
}

function parseHttpDate(value: string | null) {
  if (value === null || !HTTP_DATE.test(value)) return null;
  const ms = Date.parse(value);
  return subscriptionHttpInstantInRange(ms) && new Date(ms).toUTCString() === value ? ms : null;
}

function parseRetryAfter(value: string | null, receivedMs: number, serverMs: number | null) {
  if (value === null || value === '') {
    return {
      status: 'absent' as const,
      kind: null,
      seconds: null,
      notBeforeUtc: null,
      basis: null,
    };
  }
  const text = value.trim();
  let seconds: number;
  let kind: 'delay_seconds' | 'http_date';
  let basis: 'headers_received_at' | 'client_clock' | 'server_date';
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    seconds = Math.ceil(Number(text));
    kind = 'delay_seconds';
    basis = 'headers_received_at';
  } else {
    const absolute = parseHttpDate(text);
    if (absolute === null) {
      return {
        status: 'invalid' as const,
        kind: null,
        seconds: null,
        notBeforeUtc: null,
        basis: null,
      };
    }
    seconds = Math.max(0, Math.ceil((absolute - (serverMs ?? receivedMs)) / 1000));
    kind = 'http_date';
    basis = serverMs === null ? 'client_clock' : 'server_date';
  }
  const at = receivedMs + seconds * 1000;
  if (!Number.isSafeInteger(seconds) || seconds < 0 || !subscriptionHttpInstantInRange(at)) {
    return {
      status: 'invalid' as const,
      kind: null,
      seconds: null,
      notBeforeUtc: null,
      basis: null,
    };
  }
  return {
    status: 'parsed' as const,
    kind,
    seconds,
    notBeforeUtc: formatSubscriptionHttpInstant(at),
    basis,
  };
}

function classify(
  error: unknown,
  response: unknown,
  payload: unknown,
  status: number | null,
  channel: 'http_json' | 'sse_event',
) {
  const rawCode = own(error, 'code');
  const rawType = own(error, 'type');
  const code = knownCode(rawCode);
  const type = knownCode(rawType);
  const hasCode = boundedText(rawCode).length > 0;
  const hasType = boundedText(rawType).length > 0;
  const selected = hasCode ? code : type;
  let category: SubscriptionHttpDiagnosticCategory = selected
    ? CATEGORY_BY_CODE[selected]
    : 'unknown';
  let basis: SubscriptionHttpDiagnostic['classification']['basis'] = selected
    ? 'structured_code'
    : 'none';
  let confidence: SubscriptionHttpDiagnostic['classification']['confidence'] = selected
    ? 'high'
    : 'unknown';
  if (!selected) {
    if (status === 401) category = 'invalid_grant';
    else if (status === 403) category = 'entitlement_denied';
    else if (status !== null && status >= 500) category = 'http_error';
    if (category !== 'unknown') {
      basis = 'http_status';
      confidence = 'medium';
    } else {
      const text = boundedText(
        own(error, 'message') ??
          (typeof error === 'string' ? error : undefined) ??
          own(payload, 'message') ??
          own(own(response, 'incomplete_details'), 'reason'),
      );
      if (!hasCode && !hasType && QUOTA_TEXT.test(text)) {
        category = 'source_limit';
        basis = 'message_heuristic';
        confidence = 'low';
      } else if (status === 429) {
        category = 'rate_limit';
        basis = 'http_status';
        confidence = 'low';
      } else if (!hasCode && !hasType && /rate[ _-]?limit|too many requests/i.test(text)) {
        category = 'rate_limit';
        basis = 'message_heuristic';
        confidence = 'low';
      } else if (!hasCode && !hasType && /moderat|safety|content_filter/i.test(text)) {
        category = 'moderation';
        basis = 'message_heuristic';
        confidence = 'low';
      }
    }
  }
  const eventType = own(payload, 'type');
  const responseStatus = own(response, 'status');
  const terminal =
    (typeof eventType === 'string' &&
      ['response.failed', 'response.incomplete', 'error'].includes(eventType)) ||
    (typeof responseStatus === 'string' && ['failed', 'incomplete'].includes(responseStatus));
  const warnings: SubscriptionHttpDiagnosticWarning[] = [];
  if (hasCode && code === null) warnings.push('unrecognized_provider_code');
  if (code && type && CATEGORY_BY_CODE[code] !== CATEGORY_BY_CODE[type])
    warnings.push('code_type_disagree');
  if (channel === 'sse_event' && !terminal) warnings.push('terminal_sse_failure_not_established');
  if (category === 'rate_limit' && basis === 'http_status')
    warnings.push('429_does_not_identify_the_quota');
  return {
    category,
    basis,
    confidence,
    providerCode: code,
    providerType: type,
    terminalSseFailure: terminal && channel === 'sse_event',
    warnings,
  };
}

function headerPercent(headers: unknown, name: string) {
  const value = headerValue(headers, name);
  if (value === null || !/^\d+$/.test(value)) return null;
  const percent = Number(value);
  return percent <= 100 ? percent : null;
}

function epochSeconds(value: unknown) {
  if (typeof value === 'string' && /^\d+$/.test(value))
    return safeWholeNumber(Number(value), 4_102_444_800);
  return safeWholeNumber(value, 4_102_444_800);
}

function safeWholeNumber(value: unknown, max: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max
    ? value
    : null;
}

function parseResetCandidate(value: unknown, unit: 'unknown' | 'seconds' | 'milliseconds') {
  if (typeof value === 'string' && parseSubscriptionHttpInstant(value) !== null) {
    const ms = parseSubscriptionHttpInstant(value);
    return ms === null
      ? { status: 'invalid' as const, ms: null, unitBasis: null }
      : { status: 'parsed' as const, ms, unitBasis: 'explicit_iso_offset' as const };
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return { status: 'invalid' as const, ms: null, unitBasis: null };
  }
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : null;
  if (numeric === null || !Number.isSafeInteger(numeric) || numeric < 0) {
    return { status: 'invalid' as const, ms: null, unitBasis: null };
  }
  if (unit === 'unknown') return { status: 'unit_unknown' as const, ms: null, unitBasis: null };
  const ms = unit === 'seconds' ? numeric * 1000 : numeric;
  return subscriptionHttpInstantInRange(ms)
    ? { status: 'parsed' as const, ms, unitBasis: 'operator_assertion' as const }
    : { status: 'invalid' as const, ms: null, unitBasis: 'operator_assertion' as const };
}

function resetPath(
  prefix: ResetPrefix,
  key: (typeof RESET_KEYS)[number],
): SubscriptionHttpResetPath {
  return `${prefix}.${key}`;
}

function buildDiagnostic(
  input: Record<string, unknown>,
  resetUnit: 'unknown' | 'seconds' | 'milliseconds',
) {
  const receivedMs =
    typeof input.receivedAt === 'string' ? parseSubscriptionHttpInstant(input.receivedAt) : null;
  if (receivedMs === null) return null;
  if (input.schemaVersion !== 1) return null;
  const channel =
    input.channel === 'http_json' || input.channel === 'sse_event' ? input.channel : null;
  if (channel === null) return null;
  if (
    input.httpStatus !== null &&
    (!Number.isInteger(input.httpStatus) ||
      Number(input.httpStatus) < 100 ||
      Number(input.httpStatus) > 599)
  ) {
    return null;
  }
  const status = input.httpStatus === null ? null : Number(input.httpStatus);
  const payload = isRecord(input.payload) ? input.payload : {};
  const response = isRecord(own(payload, 'response'))
    ? (payload.response as Record<string, unknown>)
    : payload;
  const error = own(response, 'error') ?? own(payload, 'error') ?? response;
  const classified = classify(error, response, payload, status, channel);
  const warnings = [...classified.warnings];
  const serverDateHeader = headerValue(input.headers, 'date');
  const serverDateMs = parseHttpDate(serverDateHeader);
  const age = headerValue(input.headers, 'age');
  const cached = age !== null && /^\d+$/.test(age) && Number(age) > 0;
  const trustedServerMs = cached ? null : serverDateMs;
  if (cached) warnings.push('cached_response_date_not_used_as_clock_anchor');
  if (serverDateHeader !== null && serverDateMs === null) warnings.push('invalid_server_date');
  const skew = trustedServerMs === null ? null : trustedServerMs - receivedMs;
  if (skew !== null && Math.abs(skew) > 120_000)
    warnings.push('server_client_clock_difference_over_two_minutes');
  const retry = parseRetryAfter(
    headerValue(input.headers, 'retry-after'),
    receivedMs,
    trustedServerMs,
  );
  if (retry.status === 'invalid') warnings.push('invalid_retry_after');
  if (retry.kind === 'http_date' && retry.basis === 'client_clock') {
    warnings.push('retry_http_date_uses_unverified_client_clock');
  }
  if (retry.status === 'parsed' && classified.category === 'source_limit')
    warnings.push('retry_after_is_not_quota_reset');

  const candidates: SubscriptionHttpResetCandidate[] = [];
  const nodes: Array<[ResetPrefix, Record<string, unknown>]> = [['payload', payload]];
  if (response !== payload) nodes.push(['payload.response', response]);
  if (isRecord(error) && error !== response) {
    nodes.push([response === payload ? 'payload.error' : 'payload.response.error', error]);
  }
  for (const [prefix, node] of nodes) {
    for (const key of RESET_KEYS) {
      if (!Object.hasOwn(node, key)) continue;
      const parsed = parseResetCandidate(node[key], resetUnit);
      candidates.push({
        path: resetPath(prefix, key),
        status: parsed.status,
        atUtc: parsed.ms === null ? null : formatSubscriptionHttpInstant(parsed.ms),
        unitBasis: parsed.unitBasis,
        rawInteger: null,
      });
    }
  }
  const durationSeconds = safeWholeNumber(
    isRecord(error) ? error.resets_in_seconds : undefined,
    366 * 24 * 60 * 60,
  );
  const windowMinutes = safeWholeNumber(
    isRecord(error) ? error.limit_window_minutes : undefined,
    366 * 24 * 60,
  );
  const primaryUsedPercent = headerPercent(input.headers, 'x-codex-primary-used-percent');
  let agreement: SubscriptionHttpDiagnostic['reset']['agreement'] = 'unknown';
  if (durationSeconds !== null && trustedServerMs !== null) {
    const durationMs = trustedServerMs + durationSeconds * 1000;
    const durationAt = subscriptionHttpInstantInRange(durationMs)
      ? formatSubscriptionHttpInstant(durationMs)
      : null;
    const rawResetSeconds = epochSeconds(isRecord(error) ? error.resets_at : undefined);
    const numeric = candidates.find(
      (candidate) =>
        candidate.path === 'payload.error.resets_at' && candidate.status === 'unit_unknown',
    );
    if (durationAt && rawResetSeconds !== null && numeric) {
      const agrees = Math.abs(rawResetSeconds * 1000 - durationMs) <= 2_000;
      if (agrees) {
        numeric.status = 'parsed';
        numeric.atUtc = durationAt;
        numeric.unitBasis = 'named_seconds_field';
        agreement = 'corroborated';
        candidates.push({
          path: 'payload.error.resets_in_seconds',
          status: 'parsed',
          atUtc: durationAt,
          unitBasis: 'named_seconds_field',
          rawInteger: null,
        });
      } else {
        numeric.rawInteger = rawResetSeconds;
        agreement = 'conflicting';
      }
    } else if (durationAt && rawResetSeconds === null) {
      agreement = 'derived_from_server_date';
      candidates.push({
        path: 'payload.error.resets_in_seconds',
        status: 'parsed',
        atUtc: durationAt,
        unitBasis: 'named_seconds_field',
        rawInteger: null,
      });
    }
  } else if (durationSeconds !== null) {
    agreement = 'unanchored';
  }
  const parsed = candidates.filter((candidate) => candidate.status === 'parsed' && candidate.atUtc);
  const distinct = [...new Set(parsed.map((candidate) => candidate.atUtc))];
  let resetStatus: SubscriptionHttpDiagnostic['reset']['status'] = 'unknown';
  let resetAt: string | null = null;
  if (distinct.length > 1) {
    resetStatus = 'conflicting';
    warnings.push('conflicting_reset_fields');
  } else if (
    distinct.length === 1 &&
    candidates.some((candidate) => candidate.status !== 'parsed')
  ) {
    resetStatus = 'conflicting';
    warnings.push('unresolved_competing_reset_fields');
  } else if (distinct.length === 1 && distinct[0]) {
    resetAt = distinct[0];
    const anchor = trustedServerMs ?? receivedMs;
    resetStatus = Date.parse(resetAt) > anchor ? 'reported_future' : 'reported_past';
    if (resetStatus === 'reported_past')
      warnings.push('reported_reset_already_past_not_proof_of_recovery');
  }
  if (candidates.some((candidate) => candidate.status === 'unit_unknown')) {
    warnings.push('numeric_reset_unit_not_verified');
  }
  if (candidates.some((candidate) => candidate.status === 'invalid'))
    warnings.push('invalid_reset_candidate');
  if (agreement === 'conflicting') {
    resetStatus = 'conflicting';
    resetAt = null;
    warnings.push('conflicting_reset_fields');
  }
  const uncertain =
    input.executionUncertain === true ||
    (input.submissionRecorded === true && status !== null && status >= 500);
  if (uncertain) warnings.push('remote_result_uncertain_do_not_resubmit');

  return {
    schemaVersion: 1 as const,
    evidenceOrigin:
      input.synthetic === true ? ('synthetic' as const) : ('operator_capture_unverified' as const),
    receivedAt: formatSubscriptionHttpInstant(receivedMs),
    provider:
      input.provider === 'chatgpt' || input.provider === 'codex' ? input.provider : 'unknown',
    transport:
      input.transport === 'subscription_http' || input.transport === 'app_server'
        ? input.transport
        : 'unknown',
    channel,
    httpStatus: status,
    classification: {
      category: classified.category,
      basis: classified.basis,
      confidence: classified.confidence,
      providerCode: classified.providerCode,
      providerType: classified.providerType,
      terminalSseFailure: classified.terminalSseFailure,
    },
    clock: {
      serverDateUtc: serverDateMs === null ? null : formatSubscriptionHttpInstant(serverDateMs),
      serverClientDifferenceMs: skew,
    },
    retryAfter: retry,
    reset: {
      status: resetStatus,
      atUtc: resetAt,
      candidates,
      agreement,
      durationSeconds,
      windowMinutes,
      primaryUsedPercent,
      appliesTo: 'unknown' as const,
      recoveryGuaranteed: false as const,
    },
    policy: {
      automaticRetry: false as const,
      automaticFallback: false as const,
      preserveNeedsReview: uncertain,
    },
    warnings: [...new Set(warnings)],
    limitations: SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS,
  };
}

export function extractSubscriptionHttpDiagnostic(
  input: unknown,
  options: { resetUnit?: unknown } = {},
): SubscriptionHttpDiagnostic | null {
  try {
    if (!isRecord(input)) return null;
    const resetUnit = options.resetUnit ?? 'unknown';
    if (resetUnit !== 'unknown' && resetUnit !== 'seconds' && resetUnit !== 'milliseconds')
      return null;
    const built = buildDiagnostic(input, resetUnit);
    if (!built || built.receivedAt === null) return null;
    return projectSubscriptionHttpDiagnostic(built);
  } catch {
    return null;
  }
}

export function subscriptionHttpFailureMetadata(error: SubscriptionHttpError) {
  const metadata: Record<string, unknown> = {
    code: error.code,
    providerCode: error.providerCode,
    httpStatus: error.httpStatus,
    retryAfterSeconds: error.retryAfterSeconds,
  };
  try {
    const diagnostic = projectSubscriptionHttpDiagnostic(error.diagnostic);
    if (diagnostic) metadata.diagnostic = diagnostic;
  } catch {
    // A diagnostic projection failure must leave the classified job result unchanged.
  }
  return metadata;
}
