import type {
  SubscriptionAuthPublicStatus,
  SubscriptionAuthUpdatedEventPayload,
  SubscriptionProviderId,
} from '../../../../packages/shared/src';
import { inspectLibrary } from '../library';
import { publishEvent } from '../events';
import { startDeviceCode, type DeviceCodeStart } from './deviceCode';
import {
  getSubscriptionAuthStore,
  isSubscriptionLoggedIn,
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
  start: DeviceCodeStart;
  controller: AbortController;
  poll: Promise<void>;
}

export interface SubscriptionAuthControllerDependencies {
  store?: SubscriptionAuthStore;
  fetch?: AuthFetch;
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  inspectLibraryWritable?: () => boolean;
  publish?: (type: string, payload: SubscriptionAuthUpdatedEventPayload) => void;
}

function publicFromPending(
  providerId: SubscriptionProviderId,
  start: DeviceCodeStart,
  lastError: string | null = null,
): SubscriptionAuthPublicStatus {
  return {
    providerId,
    status: 'pending',
    accountLabel: null,
    expiresAt: start.expiresAt,
    lastError,
    verificationUrl: start.verificationUrl,
    userCode: start.userCode,
  };
}

export function createSubscriptionAuthController({
  store = getSubscriptionAuthStore(),
  fetch: fetchImpl,
  now,
  sleep,
  inspectLibraryWritable = () => inspectLibrary().writable,
  publish = (type, payload) => publishEvent(type, payload),
}: SubscriptionAuthControllerDependencies = {}) {
  const pending = new Map<SubscriptionProviderId, PendingLogin>();

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
      userCode: null,
    };
  };

  const assertWritable = () => {
    if (!inspectLibraryWritable()) {
      throw new SubscriptionAuthRouteError(
        'Studio Library is not writable. Repair the library before Sign in.',
        503,
        'library_not_writable',
      );
    }
  };

  const start = async (
    providerId: SubscriptionProviderId,
  ): Promise<SubscriptionAuthPublicStatus> => {
    assertWritable();
    const existingPending = pending.get(providerId);
    if (existingPending) {
      return publicFromPending(providerId, existingPending.start);
    }
    const current = store.readProvider(providerId);
    if (current.status === 'logged_in' && current.accessToken) {
      throw new SubscriptionAuthRouteError(
        'Already signed in. Sign out first to use a different account.',
        409,
        'already_signed_in',
      );
    }
    const started = await startDeviceCode(providerId, { fetch: fetchImpl, now, sleep });
    const controller = new AbortController();
    const login: PendingLogin = {
      start: started,
      controller,
      poll: started
        .poll(controller.signal)
        .then((tokens) => {
          if (pending.get(providerId) !== login) return;
          pending.delete(providerId);
          store.writeProvider(providerId, tokens);
          emit(providerId, 'logged_in', tokens.accountLabel);
        })
        .catch((error) => {
          if (pending.get(providerId) !== login) return;
          pending.delete(providerId);
          if (error instanceof Error && error.name === 'AbortError') {
            emit(
              providerId,
              store.readProvider(providerId).status,
              store.readProvider(providerId).accountLabel,
            );
            return;
          }
          const message = error instanceof Error ? error.message : 'Sign in failed.';
          const previous = store.readProvider(providerId);
          store.writeProvider(providerId, {
            ...previous,
            status: previous.accessToken ? previous.status : 'logged_out',
            lastError: message,
          });
          emit(providerId, 'logged_out', null);
        }),
    };
    pending.set(providerId, login);
    emit(providerId, 'pending', null);
    return publicFromPending(providerId, started);
  };

  const cancel = (providerId: SubscriptionProviderId) => {
    const active = pending.get(providerId);
    if (active) {
      pending.delete(providerId);
      active.controller.abort();
    }
    emit(
      providerId,
      store.readProvider(providerId).status,
      store.readProvider(providerId).accountLabel,
    );
    return readPublic(providerId);
  };

  const logout = (providerId: SubscriptionProviderId) => {
    const active = pending.get(providerId);
    if (active) {
      pending.delete(providerId);
      active.controller.abort();
    }
    store.clearProvider(providerId);
    emit(providerId, 'logged_out', null);
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
