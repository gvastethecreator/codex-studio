import type {
  SubscriptionAuthPublicStatus,
  SubscriptionAuthUpdatedEventPayload,
  SubscriptionProviderId,
} from '../../../../packages/shared/src';
import { publishEvent } from '../events';
import { startDeviceCode, type DeviceCodeProviderId, type DeviceCodeStart } from './deviceCode';
import {
  startGoogleAuthorizationCode,
  type GoogleAuthorizationCodeStart,
} from './googleAuthorizationCode';
import { safeOAuthText } from './oauthHttp';
import { revokeSubscriptionToken } from './revoke';
import {
  getSubscriptionAuthStore,
  isSubscriptionLoggedIn,
  type StoredSubscriptionTokens,
  type SubscriptionAuthStore,
} from './store';
import type { AuthFetch } from './tokens';

export class SubscriptionAuthRouteError extends Error {
  readonly status: 409 | 503;
  readonly code: string;

  constructor(message: string, status: 409 | 503, code: string) {
    super(message);
    this.name = 'SubscriptionAuthRouteError';
    this.status = status;
    this.code = code;
  }
}

interface PendingLogin {
  start: AuthFlowStart;
  controller: AbortController;
  poll: Promise<void>;
  epoch: number;
}

interface StartingLogin {
  controller: AbortController;
  work: Promise<SubscriptionAuthPublicStatus>;
}

export interface SubscriptionAuthControllerDependencies {
  store?: SubscriptionAuthStore;
  fetch?: AuthFetch;
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  env?: Record<string, string | undefined>;
  startDevice?: typeof startDeviceCode;
  startGoogle?: typeof startGoogleAuthorizationCode;
  ensureCredentialStoreWritable?: () => void;
  revokeToken?: typeof revokeSubscriptionToken;
  publish?: (type: string, payload: SubscriptionAuthUpdatedEventPayload) => void;
}

function publicFromPending(
  providerId: SubscriptionProviderId,
  start: AuthFlowStart,
  lastError: string | null = null,
): SubscriptionAuthPublicStatus {
  return {
    providerId,
    status: 'pending',
    accountLabel: null,
    expiresAt: start.expiresAt,
    lastError,
    verificationUrl: 'verificationUrl' in start ? start.verificationUrl : null,
    authorizationUrl: 'authorizationUrl' in start ? start.authorizationUrl : null,
    userCode: 'userCode' in start ? start.userCode : null,
  };
}

type AuthFlowStart = DeviceCodeStart | GoogleAuthorizationCodeStart;

export function createSubscriptionAuthController({
  store = getSubscriptionAuthStore(),
  fetch: fetchImpl,
  now,
  sleep,
  env = process.env,
  startDevice = startDeviceCode,
  startGoogle = startGoogleAuthorizationCode,
  ensureCredentialStoreWritable = () => store.assertWritable(),
  revokeToken = revokeSubscriptionToken,
  publish = (type, payload) => publishEvent(type, payload),
}: SubscriptionAuthControllerDependencies = {}) {
  const pending = new Map<SubscriptionProviderId, PendingLogin>();
  const starting = new Map<SubscriptionProviderId, StartingLogin>();

  const emit = (
    providerId: SubscriptionProviderId,
    status: SubscriptionAuthPublicStatus['status'],
    accountLabel: string | null,
  ) => {
    publish('auth.updated', { providerId, status, accountLabel });
  };

  const readPublic = (providerId: SubscriptionProviderId): SubscriptionAuthPublicStatus => {
    const active = pending.get(providerId);
    if (active) return publicFromPending(providerId, active.start);
    const record = store.readProvider(providerId);
    const status = isSubscriptionLoggedIn(record)
      ? 'logged_in'
      : record.status === 'logged_in'
        ? 'logged_out'
        : record.status;
    return {
      providerId,
      status,
      accountLabel: record.accountLabel,
      expiresAt: record.expiresAt,
      lastError: record.lastError,
      verificationUrl: null,
      authorizationUrl: null,
      userCode: null,
    };
  };

  const assertWritable = () => {
    try {
      ensureCredentialStoreWritable();
    } catch {
      throw new SubscriptionAuthRouteError(
        'Studio cannot write its private credential store. Repair app-data permissions before Sign in.',
        503,
        'credential_store_not_writable',
      );
    }
  };

  const abortPending = (providerId: SubscriptionProviderId) => {
    const startingLogin = starting.get(providerId);
    if (startingLogin) startingLogin.controller.abort();
    const active = pending.get(providerId);
    if (!active) return;
    active.controller.abort();
    pending.delete(providerId);
  };

  const start = async (
    providerId: SubscriptionProviderId,
  ): Promise<SubscriptionAuthPublicStatus> => {
    assertWritable();
    const existingPending = pending.get(providerId);
    if (existingPending) {
      return publicFromPending(providerId, existingPending.start);
    }
    const inFlight = starting.get(providerId);
    if (inFlight) return inFlight.work;

    const startController = new AbortController();

    const work = (async () => {
      const epoch = store.generation(providerId);
      const current = store.readProvider(providerId);
      if (current.status === 'logged_in' && current.accessToken) {
        throw new SubscriptionAuthRouteError(
          'Already signed in. Sign out first to use a different account.',
          409,
          'already_signed_in',
        );
      }
      let started: AuthFlowStart;
      try {
        started =
          providerId === 'google'
            ? await startGoogle({
                env,
                fetch: fetchImpl,
                now,
                signal: startController.signal,
              })
            : await startDevice(providerId as DeviceCodeProviderId, {
                fetch: fetchImpl,
                now,
                sleep,
                signal: startController.signal,
              });
      } catch (error) {
        if (startController.signal.aborted) return readPublic(providerId);
        throw error;
      }
      if (store.generation(providerId) !== epoch) {
        return readPublic(providerId);
      }
      const controller = new AbortController();
      let issuedTokens: StoredSubscriptionTokens | null = null;
      const login: PendingLogin = {
        start: started,
        controller,
        epoch,
        poll: started
          .poll(controller.signal)
          .then(async (tokens) => {
            issuedTokens = tokens;
            if (
              controller.signal.aborted ||
              pending.get(providerId) !== login ||
              store.generation(providerId) !== epoch
            ) {
              try {
                await revokeToken(providerId, tokens, { fetch: fetchImpl, env });
              } catch {
                // A cancelled login must never restore or retain its issued token locally.
              }
              return;
            }
            store.writeProvider(providerId, tokens);
            pending.delete(providerId);
            emit(providerId, 'logged_in', tokens.accountLabel);
          })
          .catch(async (error) => {
            if (controller.signal.aborted || pending.get(providerId) !== login) return;
            pending.delete(providerId);
            if (error instanceof Error && error.name === 'AbortError') return;
            const message =
              safeOAuthText(error instanceof Error ? error.message : '') || 'Sign in failed.';
            if (issuedTokens) {
              try {
                await revokeToken(providerId, issuedTokens, { fetch: fetchImpl, env });
              } catch {
                // Token persistence already failed; revocation remains best effort.
              }
            }
            try {
              const previous = store.readProvider(providerId);
              store.writeProvider(providerId, {
                ...previous,
                status: previous.accessToken ? previous.status : 'logged_out',
                lastError: message,
              });
              const next = readPublic(providerId);
              emit(providerId, next.status, next.accountLabel);
            } catch {
              emit(providerId, 'logged_out', null);
            }
          }),
      };
      pending.set(providerId, login);
      emit(providerId, 'pending', null);
      return publicFromPending(providerId, started);
    })();

    starting.set(providerId, { controller: startController, work });
    try {
      return await work;
    } finally {
      if (starting.get(providerId)?.work === work) starting.delete(providerId);
    }
  };

  const cancel = (providerId: SubscriptionProviderId) => {
    abortPending(providerId);
    store.bumpGeneration(providerId);
    const next = readPublic(providerId);
    emit(providerId, next.status, next.accountLabel);
    return next;
  };

  const logout = async (providerId: SubscriptionProviderId) => {
    abortPending(providerId);
    const record = store.readProvider(providerId);
    store.clearProvider(providerId);
    emit(providerId, 'logged_out', null);
    try {
      await revokeToken(providerId, record, { fetch: fetchImpl, env });
    } catch {
      // Local logout is authoritative; provider revocation is best effort.
    }
    return readPublic(providerId);
  };

  return {
    readPublic,
    start,
    cancel,
    logout,
    isLoggedIn(providerId: SubscriptionProviderId) {
      return isSubscriptionLoggedIn(store.readProvider(providerId));
    },
  };
}

export type SubscriptionAuthController = ReturnType<typeof createSubscriptionAuthController>;

let defaultController: SubscriptionAuthController | null = null;

export function getSubscriptionAuthController() {
  defaultController ??= createSubscriptionAuthController();
  return defaultController;
}

export function resetSubscriptionAuthControllerForTests() {
  defaultController = null;
}
