import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CodexRpcClient } from './rpcClient';
import { resolveJobExecutionOptions } from './executionOptions';
import { buildCodexImagegenDeveloperInstructions } from './imagegenContract';
import { resolveLibraryPath } from '../library';
import { log } from '../logger';
import type { JobExecutionOptions } from '../../../../packages/shared/src';

export interface SessionHandle {
  client: CodexRpcClient;
  codexHome: string | null;
  threadId: string | null;
  sessionKey: string;
  queue: Promise<void>;
}

export interface SessionPool {
  getOrCreateSession(
    sessionKey: string,
    execution?: JobExecutionOptions | null,
  ): Promise<SessionHandle>;
  releaseSession(handle: SessionHandle): void;
  destroySession(threadIdOrSessionKey: string): Promise<void>;
  createSession(sessionKey: string, execution?: JobExecutionOptions | null): Promise<SessionHandle>;
  closeSession(sessionKey: string, options?: { invalidatePersistedThread?: boolean }): void;
  getSessionKey(prompt: string): string;
}

export interface CreateSessionPoolDependencies {
  createClient?: () => CodexRpcClient;
  logger?: typeof log;
  resolveExecutionOptions?: typeof resolveJobExecutionOptions;
  resolveLibraryPath?: typeof resolveLibraryPath;
  resolveProcessCwd?: () => string;
}

interface PersistedImagegenSession {
  sessionKey: string;
  threadId: string | null;
  updatedAt: string;
}

function normalizeSessionToken(value: string | null) {
  return (value ?? 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function extractPromptField(prompt: string, field: 'PACK' | 'CATEGORY') {
  const match = prompt.match(new RegExp(`^${field}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim() ?? null;
}

export function createSessionPool({
  createClient = () => new CodexRpcClient(),
  logger = log,
  resolveExecutionOptions = resolveJobExecutionOptions,
  resolveLibraryPath: resolveLibrary = resolveLibraryPath,
  resolveProcessCwd = () => process.cwd(),
}: CreateSessionPoolDependencies = {}): SessionPool {
  const imagegenSessions = new Map<string, SessionHandle>();

  function getImagegenSessionRegistryPath() {
    return resolveLibrary('state', 'imagegen-session-registry.json');
  }

  function loadPersistedImagegenSessions() {
    const imagegenSessionRegistryPath = getImagegenSessionRegistryPath();
    if (!existsSync(imagegenSessionRegistryPath))
      return new Map<string, PersistedImagegenSession>();
    try {
      const parsed = JSON.parse(
        readFileSync(imagegenSessionRegistryPath, 'utf8'),
      ) as PersistedImagegenSession[];
      return new Map(parsed.map((entry) => [entry.sessionKey, entry]));
    } catch {
      return new Map<string, PersistedImagegenSession>();
    }
  }

  function savePersistedImagegenSessions(sessions: Map<string, PersistedImagegenSession>) {
    const imagegenSessionRegistryPath = getImagegenSessionRegistryPath();
    mkdirSync(path.dirname(imagegenSessionRegistryPath), { recursive: true });
    const entries = Array.from(sessions.values()).toSorted((a, b) => a.sessionKey.localeCompare(b.sessionKey));
    writeFileSync(imagegenSessionRegistryPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  }

  function rememberImagegenSession(sessionKey: string, threadId: string | null) {
    const sessions = loadPersistedImagegenSessions();
    sessions.set(sessionKey, {
      sessionKey,
      threadId,
      updatedAt: new Date().toISOString(),
    });
    savePersistedImagegenSessions(sessions);
  }

  function forgetImagegenSession(sessionKey: string) {
    const sessions = loadPersistedImagegenSessions();
    if (!sessions.delete(sessionKey)) return;
    savePersistedImagegenSessions(sessions);
  }

  function getPersistedImagegenThreadId(sessionKey: string) {
    return loadPersistedImagegenSessions().get(sessionKey)?.threadId ?? null;
  }

  function getSessionKey(prompt: string) {
    const pack = normalizeSessionToken(extractPromptField(prompt, 'PACK'));
    return pack || 'unknown_pack';
  }

  async function createSession(
    sessionKey: string,
    execution?: JobExecutionOptions | null,
  ): Promise<SessionHandle> {
    const client = createClient();
    await client.connect();

    const init = await client.request('initialize', {
      clientInfo: {
        name: 'codex-studio',
        title: 'Codex Studio',
        version: '0.1.0',
      },
      capabilities: null,
    });
    const codexHome = init?.codexHome ?? null;
    client.notify('initialized');

    const persistedThreadId = getPersistedImagegenThreadId(sessionKey);
    let threadId = persistedThreadId;

    if (!threadId) {
      const executionOptions = resolveExecutionOptions(execution);
      const thread = await client.request('thread/start', {
        model: executionOptions.model,
        serviceTier: executionOptions.serviceTier ?? undefined,
        cwd: resolveProcessCwd(),
        approvalPolicy: 'never',
        sandbox: 'danger-full-access',
        sessionStartSource: 'startup',
        developerInstructions: buildCodexImagegenDeveloperInstructions(sessionKey),
      });
      threadId = thread?.thread?.id ?? null;
    }

    const session: SessionHandle = {
      client,
      codexHome,
      threadId,
      sessionKey,
      queue: Promise.resolve(),
    };
    imagegenSessions.set(sessionKey, session);
    rememberImagegenSession(sessionKey, session.threadId);
    logger(
      'info',
      'codex-session',
      `${persistedThreadId ? 'Reused' : 'Started'} persistent imagegen thread ${session.threadId ?? 'unknown'} for ${sessionKey}`,
    );
    return session;
  }

  function closeSession(sessionKey: string, options?: { invalidatePersistedThread?: boolean }) {
    const session = imagegenSessions.get(sessionKey);
    if (!session) return;
    session.client.close();
    imagegenSessions.delete(sessionKey);
    if (options?.invalidatePersistedThread) {
      forgetImagegenSession(sessionKey);
    }
  }

  async function getOrCreateSession(sessionKey: string, execution?: JobExecutionOptions | null) {
    const existing = imagegenSessions.get(sessionKey);
    if (existing) return existing;
    return createSession(sessionKey, execution);
  }

  return {
    getOrCreateSession,
    releaseSession() {},
    async destroySession(threadIdOrSessionKey) {
      const sessionKey = imagegenSessions.has(threadIdOrSessionKey)
        ? threadIdOrSessionKey
        : [...imagegenSessions.values()].find(
            (session) => session.threadId === threadIdOrSessionKey,
          )?.sessionKey;
      if (sessionKey) closeSession(sessionKey, { invalidatePersistedThread: true });
    },
    createSession,
    closeSession,
    getSessionKey,
  };
}

const defaultSessionPool = createSessionPool();

export function getDefaultSessionPool() {
  return defaultSessionPool;
}

export function getImagegenSessionKey(prompt: string) {
  return defaultSessionPool.getSessionKey(prompt);
}

export async function createImagegenSession(
  sessionKey: string,
  execution?: JobExecutionOptions | null,
): Promise<SessionHandle> {
  return defaultSessionPool.createSession(sessionKey, execution);
}

export function closeImagegenSession(
  sessionKey: string,
  options?: { invalidatePersistedThread?: boolean },
) {
  defaultSessionPool.closeSession(sessionKey, options);
}

export async function getImagegenSession(
  sessionKey: string,
  execution?: JobExecutionOptions | null,
) {
  return defaultSessionPool.getOrCreateSession(sessionKey, execution);
}
