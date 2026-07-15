import { getCodexWsUrl } from '../config';
import { ensureAppServer } from './processSupervisor';
import type { AppServerEnsureReason } from '../../../../packages/shared/src';

export interface JsonRpcMessage {
  jsonrpc?: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export interface RpcClientDependencies {
  ensureAppServer?: (reason?: AppServerEnsureReason) => void;
  wsUrl?: string;
  ensureReason?: AppServerEnsureReason;
  retryDelayMs?: number;
  maxConnectAttempts?: number;
  requestTimeoutMs?: number;
}

export interface RpcSession {
  request(method: string, params?: unknown): Promise<unknown>;
  disconnect(): void;
}

export interface RpcClient {
  connect(
    wsUrl: string,
    retryConfig?: { maxRetries?: number; retryDelayMs?: number },
  ): Promise<RpcSession>;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export class CodexRpcClient {
  static readonly DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

  private socket: WebSocket | null = null;
  private nextId = 1;
  private readonly ensureAppServerFn: (reason?: AppServerEnsureReason) => void;
  private readonly wsUrl: string;
  private readonly ensureReason: AppServerEnsureReason;
  private readonly retryDelayMs: number;
  private readonly maxConnectAttempts: number;
  private readonly requestTimeoutMs: number;
  private pending = new Map<number | string, PendingRequest>();
  private notifications: JsonRpcMessage[] = [];
  private notificationListeners = new Set<{
    predicate: (message: JsonRpcMessage) => boolean;
    resolve: (message: JsonRpcMessage) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();

  constructor({
    ensureAppServer: ensureAppServerFn = ensureAppServer,
    wsUrl = getCodexWsUrl(),
    ensureReason = 'rpc',
    retryDelayMs = 200,
    maxConnectAttempts = 25,
    requestTimeoutMs = CodexRpcClient.DEFAULT_REQUEST_TIMEOUT_MS,
  }: RpcClientDependencies = {}) {
    this.ensureAppServerFn = ensureAppServerFn;
    this.wsUrl = wsUrl;
    this.ensureReason = ensureReason;
    this.retryDelayMs = retryDelayMs;
    this.maxConnectAttempts = maxConnectAttempts;
    this.requestTimeoutMs =
      Number.isFinite(requestTimeoutMs) && requestTimeoutMs >= 0
        ? requestTimeoutMs
        : CodexRpcClient.DEFAULT_REQUEST_TIMEOUT_MS;
  }

  async connect() {
    this.ensureAppServerFn(this.ensureReason);

    for (let attempt = 0; attempt < this.maxConnectAttempts; attempt += 1) {
      try {
        await this.tryConnect();
        return;
      } catch {
        await Bun.sleep(this.retryDelayMs);
      }
    }

    throw new Error(`Unable to connect to ${this.wsUrl}`);
  }

  private tryConnect() {
    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.wsUrl);
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('Timed out connecting to codex app-server'));
      }, 1000);

      socket.addEventListener('open', () => {
        clearTimeout(timeout);
        this.socket = socket;
        socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
        socket.addEventListener('close', () => this.handleSocketClose(socket));
        resolve();
      });
      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      });
    });
  }

  request(method: string, params?: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Codex app-server socket is not open');
    }
    const id = this.nextId++;
    const socket = this.socket;

    return new Promise<any>((resolve, reject) => {
      const pending: PendingRequest = {
        resolve,
        reject,
        timeout: undefined as unknown as ReturnType<typeof setTimeout>,
      };
      this.pending.set(id, pending);
      pending.timeout = setTimeout(() => {
        if (this.pending.get(id) !== pending) return;
        this.pending.delete(id);
        clearTimeout(pending.timeout);
        reject(
          new Error(
            `Timed out waiting for Codex app-server response to ${method} after ${this.requestTimeoutMs}ms`,
          ),
        );
      }, this.requestTimeoutMs);

      try {
        socket.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
      } catch (error) {
        this.clearPending(id, pending);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  notify(method: string, params?: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ jsonrpc: '2.0', method, params }));
  }

  waitForNotification(predicate: (message: JsonRpcMessage) => boolean, timeoutMs: number) {
    const existing = this.notifications.find(predicate);
    if (existing) return Promise.resolve(existing);

    return new Promise<JsonRpcMessage>((resolve, reject) => {
      const listener = {
        predicate,
        resolve: (message: JsonRpcMessage) => {
          clearTimeout(listener.timeout);
          this.notificationListeners.delete(listener);
          resolve(message);
        },
        reject: (error: Error) => {
          clearTimeout(listener.timeout);
          this.notificationListeners.delete(listener);
          reject(error);
        },
        timeout: setTimeout(() => {
          listener.reject(new Error('Timed out waiting for Codex notification'));
        }, timeoutMs),
      };

      this.notificationListeners.add(listener);
    });
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  getNotificationsSince(index: number) {
    return this.notifications.slice(index);
  }

  close() {
    const error = new Error('Codex app-server socket closed');
    const socket = this.socket;
    this.socket = null;
    this.rejectPendingRequests(error);
    this.rejectNotificationListeners(error);
    socket?.close();
  }

  private handleSocketClose(socket: WebSocket) {
    if (this.socket && this.socket !== socket) return;
    this.socket = null;
    const error = new Error('Codex app-server socket closed');
    this.rejectPendingRequests(error);
    this.rejectNotificationListeners(error);
  }

  private clearPending(id: number | string, pending: PendingRequest) {
    if (this.pending.get(id) !== pending) return false;
    clearTimeout(pending.timeout);
    this.pending.delete(id);
    return true;
  }

  private rejectPendingRequests(error: Error) {
    for (const [id, pending] of this.pending) {
      this.clearPending(id, pending);
      pending.reject(error);
    }
  }

  private rejectNotificationListeners(error: Error) {
    for (const listener of this.notificationListeners) {
      listener.reject(error);
    }
    this.notificationListeners.clear();
  }

  private handleMessage(raw: string) {
    let message: JsonRpcMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.id !== undefined) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.clearPending(message.id, pending);
      if (message.error) {
        pending.reject(new Error(JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    this.notifications.push(message);
    for (const listener of [...this.notificationListeners]) {
      if (listener.predicate(message)) {
        listener.resolve(message);
      }
    }
  }
}

export function createRpcClient(): RpcClient {
  return {
    async connect() {
      const client = new CodexRpcClient();
      await client.connect();
      return {
        request(method, params) {
          return client.request(method, params);
        },
        disconnect() {
          client.close();
        },
      };
    },
  };
}
