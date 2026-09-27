import type { JobEventRecord } from '../packages/shared/src';
import {
  projectSubscriptionHttpDiagnostic,
  type SubscriptionHttpDiagnostic,
} from '../packages/shared/src/subscriptionHttpDiagnostic';

const CATEGORY_LABEL: Record<SubscriptionHttpDiagnostic['classification']['category'], string> = {
  source_limit: 'Usage limit',
  rate_limit: 'Request rate limit',
  invalid_grant: 'Authorization',
  entitlement_denied: 'Access denied',
  moderation: 'Moderation',
  http_error: 'Service error',
  invalid_request: 'Invalid request',
  unknown: 'Unknown',
};

const BASIS_LABEL: Record<SubscriptionHttpDiagnostic['classification']['basis'], string> = {
  structured_code: 'Structured provider code',
  http_status: 'HTTP status only',
  message_heuristic: 'Message text, low confidence',
  none: 'None',
};

export function readLatestSubscriptionHttpDiagnostic(
  events: readonly Pick<JobEventRecord, 'type' | 'metadata'>[],
): SubscriptionHttpDiagnostic | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (!event || (event.type !== 'job.failed' && event.type !== 'job.needs_review')) continue;
    return projectSubscriptionHttpDiagnostic(event.metadata?.diagnostic);
  }
  return null;
}

export function subscriptionHttpDiagnosticCopyText(value: unknown) {
  const diagnostic = projectSubscriptionHttpDiagnostic(value);
  return diagnostic ? JSON.stringify(diagnostic, null, 2) : null;
}

function formatReportedInstant(iso: string) {
  const utc = `${iso} UTC`;
  try {
    const local = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hourCycle: 'h23',
    }).format(new Date(iso));
    return `${utc} (${local}, America/Argentina/Buenos_Aires)`;
  } catch {
    return utc;
  }
}

function reportedWindow(minutes: number) {
  const days = minutes / 1440;
  if (Number.isInteger(days) && days > 0) {
    return `${minutes} minutes (${days} ${days === 1 ? 'day' : 'days'})`;
  }
  return `${minutes} minutes`;
}

export function describeSubscriptionHttpDiagnostic(value: unknown, nowMs = Date.now()) {
  const diagnostic = projectSubscriptionHttpDiagnostic(value);
  if (!diagnostic) return null;
  const { classification, retryAfter, reset, httpStatus } = diagnostic;
  const providerTokens = [
    classification.providerCode ? `code ${classification.providerCode}` : '',
    classification.providerType ? `type ${classification.providerType}` : '',
  ].filter(Boolean);
  const minimumWait =
    retryAfter.status === 'parsed'
      ? `${retryAfter.seconds} seconds from the response headers (${formatReportedInstant(retryAfter.notBeforeUtc ?? diagnostic.receivedAt)}). This is a minimum wait, not a quota reset.`
      : retryAfter.status === 'invalid'
        ? 'A Retry-After header was present but could not be read. This is not a quota reset.'
        : 'Not reported.';
  const unverifiedResetPaths = reset.candidates
    .filter((candidate) => candidate.status === 'unit_unknown')
    .map((candidate) => candidate.path);
  let resetText = 'Unknown. No reset time was reported.';
  if (reset.status === 'conflicting' || reset.agreement === 'conflicting') {
    resetText = 'The response reported disagreeing reset fields. No single reset time is shown.';
  } else if (reset.status === 'unknown' && unverifiedResetPaths.length > 0) {
    resetText = `A numeric reset field was reported (${unverifiedResetPaths.join(', ')}). Its unit is not verified, so no reset time is shown.`;
  } else if (
    reset.atUtc &&
    (reset.status === 'reported_future' || reset.status === 'reported_past')
  ) {
    const when = formatReportedInstant(reset.atUtc);
    resetText =
      Date.parse(reset.atUtc) <= nowMs
        ? `Reported reset time has passed (${when}). Availability is not verified.`
        : `Reported reset: ${when}. Later availability is not verified. Automatic retries will not be sent.`;
  }
  const tokenText = providerTokens.length ? `. Provider ${providerTokens.join('; ')}` : '';
  return {
    classification: `${CATEGORY_LABEL[classification.category]} (${classification.category}, ${classification.confidence})${tokenText}`,
    basis: BASIS_LABEL[classification.basis],
    httpStatus: httpStatus === null ? 'Unknown' : String(httpStatus),
    minimumWait,
    reset: resetText,
    scope:
      reset.windowMinutes === null
        ? 'Unknown'
        : `Reported window: ${reportedWindow(reset.windowMinutes)}.${
            reset.primaryUsedPercent === null
              ? ''
              : ` Primary window use: ${reset.primaryUsedPercent}%.`
          } This does not name which product bucket resets.`,
    copyText: JSON.stringify(diagnostic, null, 2),
  };
}
