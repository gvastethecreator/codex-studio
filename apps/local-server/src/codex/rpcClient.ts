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

export class CodexRpcClient {
  private socket: WebSocket | null = null;
  private nextId = 1;
  private readonly ensureAppServerFn: (reason?: AppServerEnsureReason) => void;
  private readonly wsUrl: string;
  private readonly ensureReason: AppServerEnsureReason;
  private readonly retryDelayMs: number;
  private readonly maxConnectAttempts: number;
  private pending = new Map<
    number,
    { resolve: (value: any) => void; reject: (error: Error) => void }
  >();
  private notifications: JsonRpcMessage[] = [];

  constructor({
    ensureAppServer: ensureAppServerFn = ensureAppServer,
    wsUrl = getCodexWsUrl(),
    ensureReason = 'rpc',
    retryDelayMs = 200,
    maxConnectAttempts = 25,
  }: RpcClientDependencies = {}) {
    this.ensureAppServerFn = ensureAppServerFn;
    this.wsUrl = wsUrl;
    this.ensureReason = ensureReason;
    this.retryDelayMs = retryDelayMs;
    this.maxConnectAttempts = maxConnectAttempts;
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
        socket.addEventListener('close', () => {
          this.socket = null;
        });
        resolve();
      });
      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      });
    });
  }

  request(method: string, params: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Codex app-server socket is not open');
    }
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    return new Promise<any>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
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
      const started = Date.now();
      const interval = setInterval(() => {
        const match = this.notifications.find(predicate);
        if (match) {
          clearInterval(interval);
          resolve(match);
          return;
        }
        if (Date.now() - started > timeoutMs) {
          clearInterval(interval);
          reject(new Error('Timed out waiting for Codex notification'));
        }
      }, 250);
    });
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  getNotificationsSince(index: number) {
    return this.notifications.slice(index);
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }

  private handleMessage(raw: string) {
    let message: JsonRpcMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.id !== undefined && this.pending.has(Number(message.id))) {
      const pending = this.pending.get(Number(message.id))!;
      this.pending.delete(Number(message.id));
      if (message.error) {
        pending.reject(new Error(JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    this.notifications.push(message);
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
