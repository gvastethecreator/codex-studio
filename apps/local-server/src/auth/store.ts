import {
  accessSync,
  chmodSync,
  constants,
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
import { resolveUserHome } from '../platformHome';
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
  assertWritable(): void;
  read(): SubscriptionAuthFile;
  readProvider(providerId: SubscriptionProviderId): StoredSubscriptionTokens;
  writeProvider(providerId: SubscriptionProviderId, record: StoredSubscriptionTokens): void;
  clearProvider(providerId: SubscriptionProviderId): void;
  generation(providerId: SubscriptionProviderId): number;
  bumpGeneration(providerId: SubscriptionProviderId): void;
}

export interface SubscriptionAuthStoreDependencies {
  resolveFilePath?: () => string;
  now?: () => Date;
}

export interface SubscriptionAuthStorePathOptions {
  env?: Record<string, string | undefined>;
  platform?: NodeJS.Platform;
  homeDir?: string;
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
      google: emptyRecord(now),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseNullableString(
  value: unknown,
  field: string,
  options: { maximum: number; allowWhitespace?: boolean },
) {
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new Error(`Studio Sign in credential store has an invalid ${field} field.`);
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    trimmed.length > options.maximum ||
    /[\u0000-\u001f\u007f]/.test(trimmed) ||
    (!options.allowWhitespace && /\s/.test(trimmed))
  ) {
    throw new Error(`Studio Sign in credential store has an invalid ${field} field.`);
  }
  return trimmed;
}

function parseProvider(value: unknown): StoredSubscriptionTokens {
  if (!isRecord(value)) {
    throw new Error('Studio Sign in credential store has an invalid provider record.');
  }
  if (
    value.status !== 'logged_in' &&
    value.status !== 'refresh_failed' &&
    value.status !== 'logged_out'
  ) {
    throw new Error('Studio Sign in credential store has an invalid status field.');
  }
  const accessToken = parseNullableString(value.accessToken, 'accessToken', { maximum: 64 * 1024 });
  const refreshToken = parseNullableString(value.refreshToken, 'refreshToken', {
    maximum: 64 * 1024,
  });
  const expiresAt = parseNullableString(value.expiresAt, 'expiresAt', {
    maximum: 64,
  });
  const accountLabel = parseNullableString(value.accountLabel, 'accountLabel', {
    maximum: 200,
    allowWhitespace: true,
  });
  const chatgptAccountId = parseNullableString(value.chatgptAccountId, 'chatgptAccountId', {
    maximum: 128,
  });
  const lastError = parseNullableString(value.lastError, 'lastError', {
    maximum: 300,
    allowWhitespace: true,
  });
  const updatedAt = parseNullableString(value.updatedAt, 'updatedAt', { maximum: 64 });
  if (chatgptAccountId && !/^[A-Za-z0-9._:-]+$/.test(chatgptAccountId)) {
    throw new Error('Studio Sign in credential store has an invalid chatgptAccountId field.');
  }
  if (
    (expiresAt && !Number.isFinite(Date.parse(expiresAt))) ||
    !updatedAt ||
    !Number.isFinite(Date.parse(updatedAt))
  ) {
    throw new Error('Studio Sign in credential store has an invalid timestamp field.');
  }
  return {
    status: value.status,
    accessToken,
    refreshToken,
    expiresAt,
    accountLabel,
    chatgptAccountId,
    lastError,
    updatedAt,
  };
}

function parseFile(raw: string, now: Date): SubscriptionAuthFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('Studio Sign in credential store is corrupted. Sign in data was not changed.');
  }
  if (
    !isRecord(parsed) ||
    (parsed.version !== 1 && parsed.version !== STUDIO_OAUTH_STORE_VERSION) ||
    !isRecord(parsed.providers)
  ) {
    throw new Error('Studio Sign in credential store has an unsupported format.');
  }
  return {
    version: STUDIO_OAUTH_STORE_VERSION,
    providers: {
      codex: parseProvider(parsed.providers.codex),
      xai: parseProvider(parsed.providers.xai),
      google:
        parsed.version === 1 || parsed.providers.google === undefined
          ? emptyRecord(now)
          : parseProvider(parsed.providers.google),
    },
  };
}

function absoluteEnvPath(
  value: string | undefined,
  pathApi: Pick<typeof path, 'isAbsolute' | 'join'>,
) {
  const trimmed = value?.trim();
  return trimmed && pathApi.isAbsolute(trimmed) ? trimmed : null;
}

export function resolveSubscriptionAuthFilePath({
  env = process.env,
  platform = process.platform,
  homeDir = resolveUserHome({ env: env as NodeJS.ProcessEnv, platform }),
}: SubscriptionAuthStorePathOptions = {}) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  let privateStateRoot: string;
  if (platform === 'win32') {
    privateStateRoot =
      absoluteEnvPath(env.LOCALAPPDATA, pathApi) ?? pathApi.join(homeDir, 'AppData', 'Local');
    return pathApi.join(privateStateRoot, 'Codex Studio', 'auth', STUDIO_OAUTH_FILE_NAME);
  }
  if (platform === 'darwin') {
    return pathApi.join(
      homeDir,
      'Library',
      'Application Support',
      'Codex Studio',
      'auth',
      STUDIO_OAUTH_FILE_NAME,
    );
  }
  privateStateRoot =
    absoluteEnvPath(env.XDG_STATE_HOME, pathApi) ?? pathApi.join(homeDir, '.local', 'state');
  return pathApi.join(privateStateRoot, 'codex-studio', 'auth', STUDIO_OAUTH_FILE_NAME);
}

function defaultFilePath() {
  if (process.env.VITEST === 'true') {
    return path.join(
      process.cwd(),
      'tmp',
      'vitest-auth',
      String(process.pid),
      STUDIO_OAUTH_FILE_NAME,
    );
  }
  return resolveSubscriptionAuthFilePath();
}

function ensurePrivateDirectory(directoryPath: string) {
  mkdirSync(directoryPath, { recursive: true, mode: 0o700 });
  try {
    chmodSync(directoryPath, 0o700);
  } catch {
    // Windows protects LocalAppData through inherited user ACLs instead of POSIX modes.
  }
}

function atomicWrite(filePath: string, contents: string) {
  ensurePrivateDirectory(path.dirname(filePath));
  const tempPath = `${filePath}.${process.pid}.${Date.now().toString(36)}.${Math.random()
    .toString(16)
    .slice(2)}.tmp`;
  const backupPath = `${tempPath}.backup`;
  writeFileSync(tempPath, contents, { encoding: 'utf8', mode: 0o600 });
  try {
    try {
      renameSync(tempPath, filePath);
    } catch (initialError) {
      if (!existsSync(filePath)) throw initialError;
      renameSync(filePath, backupPath);
      try {
        renameSync(tempPath, filePath);
      } catch (replaceError) {
        if (!existsSync(filePath) && existsSync(backupPath)) {
          renameSync(backupPath, filePath);
        }
        throw replaceError;
      }
      try {
        unlinkSync(backupPath);
      } catch {
        // The finalizer makes one more best-effort cleanup pass.
      }
    }
  } finally {
    if (existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch {
        // Keep the original write failure if cleanup is blocked.
      }
    }
    if (existsSync(backupPath) && existsSync(filePath)) {
      try {
        unlinkSync(backupPath);
      } catch {
        // Keep the original write failure if cleanup is blocked.
      }
    }
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

  const generations: Record<SubscriptionProviderId, number> = { codex: 0, xai: 0, google: 0 };

  return {
    filePath: resolveFilePath,
    assertWritable() {
      const filePath = resolveFilePath();
      const directoryPath = path.dirname(filePath);
      ensurePrivateDirectory(directoryPath);
      accessSync(directoryPath, constants.W_OK);
      if (existsSync(filePath)) accessSync(filePath, constants.R_OK | constants.W_OK);
    },
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
      generations[providerId] += 1;
      this.writeProvider(providerId, emptyRecord(now()));
    },
    generation(providerId) {
      return generations[providerId];
    },
    bumpGeneration(providerId) {
      generations[providerId] += 1;
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
