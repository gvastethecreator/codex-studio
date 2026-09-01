import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import type {
  SubscriptionAuthStatus,
  SubscriptionProviderId,
} from '../../../../packages/shared/src';
import { resolveLibraryPath } from '../library';
import { STUDIO_OAUTH_FILE_NAME, STUDIO_OAUTH_STORE_VERSION } from './constants';

export interface StoredSubscriptionTokens {
  status: Exclude<SubscriptionAuthStatus, 'pending'>;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  accountLabel: string | null;
  chatgptAccountId: string | null;
  lastError: string | null;
  updatedAt: string;
}

export interface SubscriptionAuthFile {
  version: number;
  providers: Record<SubscriptionProviderId, StoredSubscriptionTokens>;
}

export interface SubscriptionAuthStore {
  filePath(): string;
  read(): SubscriptionAuthFile;
  readProvider(providerId: SubscriptionProviderId): StoredSubscriptionTokens;
  writeProvider(providerId: SubscriptionProviderId, record: StoredSubscriptionTokens): void;
  clearProvider(providerId: SubscriptionProviderId): void;
}

export interface SubscriptionAuthStoreDependencies {
  resolveFilePath?: () => string;
  now?: () => Date;
}

const EMPTY_RECORD: Omit<StoredSubscriptionTokens, 'updatedAt'> = {
  status: 'logged_out',
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  accountLabel: null,
  chatgptAccountId: null,
  lastError: null,
};

function emptyRecord(now: Date): StoredSubscriptionTokens {
  return { ...EMPTY_RECORD, updatedAt: now.toISOString() };
}

function emptyFile(now: Date): SubscriptionAuthFile {
  return {
    version: STUDIO_OAUTH_STORE_VERSION,
    providers: {
      codex: emptyRecord(now),
      xai: emptyRecord(now),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function parseProvider(value: unknown, now: Date): StoredSubscriptionTokens {
  const fallback = emptyRecord(now);
  if (!isRecord(value)) return fallback;
  const status =
    value.status === 'logged_in' ||
    value.status === 'refresh_failed' ||
    value.status === 'logged_out'
      ? value.status
      : 'logged_out';
  return {
    status,
    accessToken: asNullableString(value.accessToken),
    refreshToken: asNullableString(value.refreshToken),
    expiresAt: asNullableString(value.expiresAt),
    accountLabel: asNullableString(value.accountLabel),
    chatgptAccountId: asNullableString(value.chatgptAccountId),
    lastError: asNullableString(value.lastError),
    updatedAt: asNullableString(value.updatedAt) ?? fallback.updatedAt,
  };
}

function parseFile(raw: string, now: Date): SubscriptionAuthFile {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return emptyFile(now);
    const providers = isRecord(parsed.providers) ? parsed.providers : {};
    return {
      version: STUDIO_OAUTH_STORE_VERSION,
      providers: {
        codex: parseProvider(providers.codex, now),
        xai: parseProvider(providers.xai, now),
      },
    };
  } catch {
    return emptyFile(now);
  }
}

function defaultFilePath() {
  return resolveLibraryPath('auth', STUDIO_OAUTH_FILE_NAME);
}

function atomicWrite(filePath: string, contents: string) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, contents, { encoding: 'utf8', mode: 0o600 });
  try {
    renameSync(tempPath, filePath);
  } catch {
    try {
      unlinkSync(filePath);
    } catch {
      // Destination may not exist yet.
    }
    renameSync(tempPath, filePath);
  }
  try {
    chmodSync(filePath, 0o600);
  } catch {
    // Windows may ignore POSIX modes.
  }
}

export function createSubscriptionAuthStore({
  resolveFilePath = defaultFilePath,
  now = () => new Date(),
}: SubscriptionAuthStoreDependencies = {}): SubscriptionAuthStore {
  const readSync = (): SubscriptionAuthFile => {
    const filePath = resolveFilePath();
    if (!existsSync(filePath)) return emptyFile(now());
    return parseFile(readFileSync(filePath, 'utf8'), now());
  };

  const writeSync = (next: SubscriptionAuthFile) => {
    atomicWrite(resolveFilePath(), `${JSON.stringify(next, null, 2)}\n`);
  };

  return {
    filePath: resolveFilePath,
    read: readSync,
    readProvider(providerId) {
      return readSync().providers[providerId];
    },
    writeProvider(providerId, record) {
      const next = readSync();
      next.providers[providerId] = { ...record, updatedAt: now().toISOString() };
      writeSync(next);
    },
    clearProvider(providerId) {
      this.writeProvider(providerId, emptyRecord(now()));
    },
  };
}

let defaultStore: SubscriptionAuthStore | null = null;

export function getSubscriptionAuthStore() {
  defaultStore ??= createSubscriptionAuthStore();
  return defaultStore;
}

export function resetSubscriptionAuthStoreForTests() {
  defaultStore = null;
}

export function isSubscriptionLoggedIn(
  record: Pick<StoredSubscriptionTokens, 'status' | 'accessToken'>,
) {
  return record.status === 'logged_in' && Boolean(record.accessToken);
}
