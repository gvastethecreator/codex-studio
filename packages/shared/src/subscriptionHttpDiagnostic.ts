export const SUBSCRIPTION_HTTP_DIAGNOSTIC_SCHEMA_VERSION = 1 as const;

export const SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS = [
  'synthetic_or_operator_supplied_evidence_not_live_account_verification',
  'reported_image_count_does_not_establish_provider_quota',
  'no_inference_of_daily_window_or_midnight_reset',
  'no_raw_messages_or_identifiers_in_export',
] as const;

export const SUBSCRIPTION_HTTP_DIAGNOSTIC_CATEGORIES = [
  'source_limit',
  'rate_limit',
  'invalid_grant',
  'entitlement_denied',
  'moderation',
  'http_error',
  'invalid_request',
  'unknown',
] as const;

export const SUBSCRIPTION_HTTP_DIAGNOSTIC_WARNINGS = [
  '429_does_not_identify_the_quota',
  'cached_response_date_not_used_as_clock_anchor',
  'code_type_disagree',
  'conflicting_reset_fields',
  'invalid_reset_candidate',
  'invalid_retry_after',
  'invalid_server_date',
  'numeric_reset_unit_not_verified',
  'remote_result_uncertain_do_not_resubmit',
  'reported_reset_already_past_not_proof_of_recovery',
  'retry_after_is_not_quota_reset',
  'retry_http_date_uses_unverified_client_clock',
  'server_client_clock_difference_over_two_minutes',
  'terminal_sse_failure_not_established',
  'unrecognized_provider_code',
  'unresolved_competing_reset_fields',
] as const;

export const SUBSCRIPTION_HTTP_PROVIDER_CODES = [
  'usage_limit_reached',
  'usage_limit_exceeded',
  'insufficient_quota',
  'quota_exceeded',
  'usagelimitexceeded',
  'rate_limit',
  'rate_limit_exceeded',
  'rate_limit_error',
  'too_many_requests',
  'invalid_grant',
  'invalid_token',
  'token_expired',
  'permission_denied',
  'access_denied',
  'insufficient_permissions',
  'entitlement_denied',
  'content_filter',
  'moderation',
  'moderation_blocked',
  'safety_violation',
  'server_error',
  'internal_error',
  'service_unavailable',
  'invalid_request_error',
] as const;

export const SUBSCRIPTION_HTTP_RESET_PATHS = [
  'payload.resets_at',
  'payload.reset_at',
  'payload.resetsAt',
  'payload.response.resets_at',
  'payload.response.reset_at',
  'payload.response.resetsAt',
  'payload.error.resets_at',
  'payload.error.reset_at',
  'payload.error.resetsAt',
  'payload.response.error.resets_at',
  'payload.response.error.reset_at',
  'payload.response.error.resetsAt',
  'payload.error.resets_in_seconds',
] as const;

const CLASSIFICATION_BASIS = [
  'structured_code',
  'http_status',
  'message_heuristic',
  'none',
] as const;
const CONFIDENCE = ['high', 'medium', 'low', 'unknown'] as const;
const RETRY_STATUS = ['absent', 'invalid', 'parsed'] as const;
const RETRY_KIND = ['delay_seconds', 'http_date'] as const;
const RETRY_BASIS = ['headers_received_at', 'client_clock', 'server_date'] as const;
const RESET_STATUS = ['unknown', 'reported_future', 'reported_past', 'conflicting'] as const;
const CANDIDATE_STATUS = ['parsed', 'invalid', 'unit_unknown'] as const;
const UNIT_BASIS = ['explicit_iso_offset', 'operator_assertion', 'named_seconds_field'] as const;
const RESET_AGREEMENT = [
  'unknown',
  'corroborated',
  'derived_from_server_date',
  'conflicting',
  'unanchored',
] as const;

export type SubscriptionHttpDiagnosticCategory =
  (typeof SUBSCRIPTION_HTTP_DIAGNOSTIC_CATEGORIES)[number];
export type SubscriptionHttpDiagnosticWarning =
  (typeof SUBSCRIPTION_HTTP_DIAGNOSTIC_WARNINGS)[number];
export type SubscriptionHttpProviderCode = (typeof SUBSCRIPTION_HTTP_PROVIDER_CODES)[number];
export type SubscriptionHttpResetPath = (typeof SUBSCRIPTION_HTTP_RESET_PATHS)[number];

export interface SubscriptionHttpResetCandidate {
  path: SubscriptionHttpResetPath;
  status: (typeof CANDIDATE_STATUS)[number];
  atUtc: string | null;
  unitBasis: (typeof UNIT_BASIS)[number] | null;
  rawInteger: number | null;
}

export interface SubscriptionHttpDiagnostic {
  schemaVersion: typeof SUBSCRIPTION_HTTP_DIAGNOSTIC_SCHEMA_VERSION;
  evidenceOrigin: 'synthetic' | 'operator_capture_unverified';
  receivedAt: string;
  provider: 'chatgpt' | 'codex' | 'unknown';
  transport: 'subscription_http' | 'app_server' | 'unknown';
  channel: 'http_json' | 'sse_event';
  httpStatus: number | null;
  classification: {
    category: SubscriptionHttpDiagnosticCategory;
    basis: (typeof CLASSIFICATION_BASIS)[number];
    confidence: (typeof CONFIDENCE)[number];
    providerCode: SubscriptionHttpProviderCode | null;
    providerType: SubscriptionHttpProviderCode | null;
    terminalSseFailure: boolean;
  };
  clock: {
    serverDateUtc: string | null;
    serverClientDifferenceMs: number | null;
  };
  retryAfter: {
    status: (typeof RETRY_STATUS)[number];
    kind: (typeof RETRY_KIND)[number] | null;
    seconds: number | null;
    notBeforeUtc: string | null;
    basis: (typeof RETRY_BASIS)[number] | null;
  };
  reset: {
    status: (typeof RESET_STATUS)[number];
    atUtc: string | null;
    candidates: SubscriptionHttpResetCandidate[];
    agreement: (typeof RESET_AGREEMENT)[number];
    durationSeconds: number | null;
    windowMinutes: number | null;
    primaryUsedPercent: number | null;
    appliesTo: 'unknown';
    recoveryGuaranteed: false;
  };
  policy: {
    automaticRetry: false;
    automaticFallback: false;
    preserveNeedsReview: boolean;
  };
  warnings: SubscriptionHttpDiagnosticWarning[];
  limitations: typeof SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS;
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const MIN_MS = Date.UTC(2000, 0, 1);
const MAX_MS = Date.UTC(2100, 0, 1);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

export function subscriptionHttpInstantInRange(ms: number) {
  return Number.isFinite(ms) && ms >= MIN_MS && ms < MAX_MS;
}

export function formatSubscriptionHttpInstant(ms: number) {
  return subscriptionHttpInstantInRange(ms) ? new Date(ms).toISOString() : null;
}

export function parseSubscriptionHttpInstant(value: string) {
  if (!ISO.test(value)) return null;
  const hour = Number(value.slice(11, 13));
  const minute = Number(value.slice(14, 16));
  const second = Number(value.slice(17, 19));
  if (hour > 23 || minute > 59 || second > 59) return null;
  const ms = Date.parse(value);
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > maxDay) return null;
  return subscriptionHttpInstantInRange(ms) ? ms : null;
}

function normalizedInstant(value: unknown) {
  if (typeof value !== 'string') return null;
  const ms = parseSubscriptionHttpInstant(value);
  return ms === null ? null : formatSubscriptionHttpInstant(ms);
}

function nullableInstant(value: unknown) {
  if (value === null) return null;
  return normalizedInstant(value);
}

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function projectWindowMinutes(value: unknown) {
  if (value === undefined || value === null) return null;
  if (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 366 * 24 * 60
  ) {
    return value;
  }
  return undefined;
}

function projectOptionalWholeNumber(value: unknown, max: number) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max) {
    return value;
  }
  return undefined;
}

function projectAgreement(value: unknown) {
  if (value === undefined || value === null) return 'unknown' as const;
  return oneOf(value, RESET_AGREEMENT) ? value : undefined;
}

function projectCandidate(value: unknown): SubscriptionHttpResetCandidate | null {
  if (!isPlainRecord(value) || !oneOf(value.path, SUBSCRIPTION_HTTP_RESET_PATHS)) return null;
  if (!oneOf(value.status, CANDIDATE_STATUS)) return null;
  const unitBasis =
    value.unitBasis === null
      ? null
      : oneOf(value.unitBasis, UNIT_BASIS)
        ? value.unitBasis
        : undefined;
  if (unitBasis === undefined) return null;
  const atUtc = nullableInstant(value.atUtc);
  if (value.atUtc !== null && atUtc === null) return null;
  if (value.status === 'parsed' && atUtc === null) return null;
  if (value.status !== 'parsed' && atUtc !== null) return null;
  const rawInteger = projectOptionalWholeNumber(value.rawInteger, 4_102_444_800);
  if (rawInteger === undefined) return null;
  if (value.status === 'parsed' && rawInteger !== null) return null;
  return { path: value.path, status: value.status, atUtc, unitBasis, rawInteger };
}

function projectRetryAfter(value: unknown): SubscriptionHttpDiagnostic['retryAfter'] | null {
  if (!isPlainRecord(value) || !oneOf(value.status, RETRY_STATUS)) return null;
  const kind = value.kind === null ? null : oneOf(value.kind, RETRY_KIND) ? value.kind : undefined;
  const basis =
    value.basis === null ? null : oneOf(value.basis, RETRY_BASIS) ? value.basis : undefined;
  if (kind === undefined || basis === undefined) return null;
  const seconds =
    value.seconds === null
      ? null
      : Number.isSafeInteger(value.seconds) && Number(value.seconds) >= 0
        ? Number(value.seconds)
        : undefined;
  if (seconds === undefined) return null;
  const notBeforeUtc = nullableInstant(value.notBeforeUtc);
  if (value.notBeforeUtc !== null && notBeforeUtc === null) return null;
  if (value.status === 'parsed' && (seconds === null || notBeforeUtc === null || kind === null))
    return null;
  if (
    value.status !== 'parsed' &&
    (seconds !== null || notBeforeUtc !== null || kind !== null || basis !== null)
  ) {
    return null;
  }
  return { status: value.status, kind, seconds, notBeforeUtc, basis };
}

export function projectSubscriptionHttpDiagnostic(
  value: unknown,
): SubscriptionHttpDiagnostic | null {
  if (!isPlainRecord(value) || value.schemaVersion !== SUBSCRIPTION_HTTP_DIAGNOSTIC_SCHEMA_VERSION)
    return null;
  if (!oneOf(value.evidenceOrigin, ['synthetic', 'operator_capture_unverified'] as const))
    return null;
  const receivedAt = normalizedInstant(value.receivedAt);
  if (receivedAt === null) return null;
  if (!oneOf(value.provider, ['chatgpt', 'codex', 'unknown'] as const)) return null;
  if (!oneOf(value.transport, ['subscription_http', 'app_server', 'unknown'] as const)) return null;
  if (!oneOf(value.channel, ['http_json', 'sse_event'] as const)) return null;
  if (
    value.httpStatus !== null &&
    (!Number.isInteger(value.httpStatus) ||
      Number(value.httpStatus) < 100 ||
      Number(value.httpStatus) > 599)
  ) {
    return null;
  }
  if (!isPlainRecord(value.classification)) return null;
  const classification = value.classification;
  if (!oneOf(classification.category, SUBSCRIPTION_HTTP_DIAGNOSTIC_CATEGORIES)) return null;
  if (!oneOf(classification.basis, CLASSIFICATION_BASIS)) return null;
  if (!oneOf(classification.confidence, CONFIDENCE)) return null;
  if (typeof classification.terminalSseFailure !== 'boolean') return null;
  const providerCode =
    classification.providerCode === null
      ? null
      : oneOf(classification.providerCode, SUBSCRIPTION_HTTP_PROVIDER_CODES)
        ? classification.providerCode
        : null;
  const providerType =
    classification.providerType === null
      ? null
      : oneOf(classification.providerType, SUBSCRIPTION_HTTP_PROVIDER_CODES)
        ? classification.providerType
        : null;
  if (
    classification.providerCode !== null &&
    providerCode === null &&
    !oneOf(classification.providerCode, SUBSCRIPTION_HTTP_PROVIDER_CODES)
  ) {
    if (typeof classification.providerCode !== 'string') return null;
  }
  if (
    classification.providerType !== null &&
    providerType === null &&
    typeof classification.providerType !== 'string'
  ) {
    return null;
  }
  if (!isPlainRecord(value.clock)) return null;
  const serverDateUtc = nullableInstant(value.clock.serverDateUtc);
  if (value.clock.serverDateUtc !== null && serverDateUtc === null) return null;
  const skew = value.clock.serverClientDifferenceMs;
  if (skew !== null && finiteNumber(skew) === null) return null;
  const retryAfter = projectRetryAfter(value.retryAfter);
  if (!retryAfter) return null;
  if (!isPlainRecord(value.reset) || !Array.isArray(value.reset.candidates)) return null;
  if (value.reset.candidates.length > 12) return null;
  if (!oneOf(value.reset.status, RESET_STATUS)) return null;
  const resetAt = nullableInstant(value.reset.atUtc);
  if (value.reset.atUtc !== null && resetAt === null) return null;
  if (
    (value.reset.status === 'unknown' || value.reset.status === 'conflicting') &&
    resetAt !== null
  )
    return null;
  if (
    (value.reset.status === 'reported_future' || value.reset.status === 'reported_past') &&
    resetAt === null
  ) {
    return null;
  }
  const candidates: SubscriptionHttpResetCandidate[] = [];
  for (const candidate of value.reset.candidates) {
    const projected = projectCandidate(candidate);
    if (!projected) return null;
    candidates.push(projected);
  }
  const windowMinutes = projectWindowMinutes(value.reset.windowMinutes);
  if (windowMinutes === undefined) return null;
  const agreement = projectAgreement(value.reset.agreement);
  if (agreement === undefined) return null;
  const durationSeconds = projectOptionalWholeNumber(
    value.reset.durationSeconds,
    366 * 24 * 60 * 60,
  );
  if (durationSeconds === undefined) return null;
  const primaryUsedPercent = projectOptionalWholeNumber(value.reset.primaryUsedPercent, 100);
  if (primaryUsedPercent === undefined) return null;
  if (!isPlainRecord(value.policy) || typeof value.policy.preserveNeedsReview !== 'boolean')
    return null;
  if (!Array.isArray(value.warnings) || !Array.isArray(value.limitations)) return null;
  if (value.limitations.length !== SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS.length) return null;
  for (let index = 0; index < SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS.length; index += 1) {
    if (value.limitations[index] !== SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS[index]) return null;
  }
  const warnings: SubscriptionHttpDiagnosticWarning[] = [];
  for (const warning of value.warnings) {
    if (!oneOf(warning, SUBSCRIPTION_HTTP_DIAGNOSTIC_WARNINGS) || warnings.includes(warning))
      continue;
    warnings.push(warning);
  }
  if (
    providerCode === null &&
    typeof classification.providerCode === 'string' &&
    classification.providerCode
  ) {
    if (!warnings.includes('unrecognized_provider_code'))
      warnings.push('unrecognized_provider_code');
  }

  return {
    schemaVersion: 1,
    evidenceOrigin: value.evidenceOrigin,
    receivedAt,
    provider: value.provider,
    transport: value.transport,
    channel: value.channel,
    httpStatus: value.httpStatus === null ? null : Number(value.httpStatus),
    classification: {
      category: classification.category,
      basis: classification.basis,
      confidence: classification.confidence,
      providerCode,
      providerType,
      terminalSseFailure: classification.terminalSseFailure,
    },
    clock: {
      serverDateUtc,
      serverClientDifferenceMs: skew === null ? null : finiteNumber(skew),
    },
    retryAfter,
    reset: {
      status: value.reset.status,
      atUtc: resetAt,
      candidates,
      agreement,
      durationSeconds,
      windowMinutes,
      primaryUsedPercent,
      appliesTo: 'unknown',
      recoveryGuaranteed: false,
    },
    policy: {
      automaticRetry: false,
      automaticFallback: false,
      preserveNeedsReview: value.policy.preserveNeedsReview,
    },
    warnings,
    limitations: SUBSCRIPTION_HTTP_DIAGNOSTIC_LIMITATIONS,
  };
}
