export type SubscriptionHttpErrorCode =
  | 'empty_response'
  | 'invalid_grant'
  | 'refresh_failed'
  | 'http_error'
  | 'timeout'
  | 'entitlement_denied'
  | 'source_limit'
  | 'rate_limit'
  | 'cancelled'
  | 'not_signed_in'
  | 'moderation'
  | 'invalid_request';

export class SubscriptionHttpError extends Error {
  readonly code: SubscriptionHttpErrorCode;
  readonly fallbackAllowed: boolean;
  readonly httpStatus: number | null;
  readonly providerCode: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(
    message: string,
    options: {
      code: SubscriptionHttpErrorCode;
      fallbackAllowed: boolean;
      httpStatus?: number | null;
      providerCode?: string | null;
      retryAfterSeconds?: number | null;
    },
  ) {
    super(message);
    this.name = 'SubscriptionHttpError';
    this.code = options.code;
    this.fallbackAllowed = options.fallbackAllowed;
    this.httpStatus = options.httpStatus ?? null;
    this.providerCode = options.providerCode ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

export function isSubscriptionHttpFallbackAllowed(error: unknown): boolean {
  if (isAbortError(error)) return false;
  if (error instanceof SubscriptionHttpError) return error.fallbackAllowed;
  return false;
}
