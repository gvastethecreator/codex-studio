import { Effect, Schedule } from 'effect';
import {
  providerFailure,
  providerOperation,
  type ProviderFailure,
} from '../providers/providerEffect';
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

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
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

  connect() {
    return Effect.suspend(() => {
      this.ensureAppServerFn(this.ensureReason);
      if (this.maxConnectAttempts <= 0)
        return Effect.fail(providerFailure(new Error(`Unable to connect to ${this.wsUrl}`)));
      return this.tryConnect().pipe(
        Effect.retry({
          times: this.maxConnectAttempts - 1,
          schedule: Schedule.spaced(this.retryDelayMs),
        }),
        Effect.mapError(() => providerFailure(new Error(`Unable to connect to ${this.wsUrl}`))),
      );
    }).pipe(providerOperation);
  }

  private tryConnect() {
    return Effect.callback<void, ProviderFailure>((resume) => {
      const socket = new WebSocket(this.wsUrl);
      const onOpen = () => {
        socket.removeEventListener('error', onError);
        this.socket = socket;
        socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
        socket.addEventListener('close', () => this.handleSocketClose(socket));
        resume(Effect.void);
      };
      const onError = () => {
        socket.removeEventListener('open', onOpen);
        socket.close();
        resume(Effect.fail(providerFailure(new Error('WebSocket connection failed'))));
      };
      socket.addEventListener('open', onOpen, { once: true });
      socket.addEventListener('error', onError, { once: true });
      return Effect.sync(() => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
        socket.close();
      });
    }).pipe(
      Effect.timeoutOrElse({
        duration: 1000,
        orElse: () =>
          Effect.fail(providerFailure(new Error('Timed out connecting to codex app-server'))),
      }),
    );
  }

  request(method: string, params?: unknown) {
    return providerOperation(
      Effect.suspend(() => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          return Effect.fail(providerFailure(new Error('Codex app-server socket is not open')));
        }
        const id = this.nextId++;
        const socket = this.socket;
        return Effect.callback<any, ProviderFailure>((resume) => {
          const pending: PendingRequest = {
            resolve: (value) => resume(Effect.succeed(value)),
            reject: (error) => resume(Effect.fail(providerFailure(error))),
          };
          this.pending.set(id, pending);
          try {
            socket.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
          } catch (error) {
            this.clearPending(id, pending);
            resume(Effect.fail(providerFailure(error)));
          }
          return Effect.sync(() => {
            this.clearPending(id, pending);
          });
        }).pipe(
          Effect.timeoutOrElse({
            duration: this.requestTimeoutMs,
            orElse: () =>
              Effect.fail(
                providerFailure(
                  new Error(
                    `Timed out waiting for Codex app-server response to ${method} after ${this.requestTimeoutMs}ms`,
                  ),
                ),
              ),
          }),
        );
      }),
    );
  }

  notify(method: string, params?: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ jsonrpc: '2.0', method, params }));
  }

  waitForNotification(predicate: (message: JsonRpcMessage) => boolean, timeoutMs: number) {
    return Effect.suspend(() => {
      const existing = this.notifications.find(predicate);
      if (existing) return Effect.succeed(existing);
      return Effect.callback<JsonRpcMessage, ProviderFailure>((resume) => {
        const listener = {
          predicate,
          resolve: (message: JsonRpcMessage) => {
            this.notificationListeners.delete(listener);
            resume(Effect.succeed(message));
          },
          reject: (error: Error) => {
            this.notificationListeners.delete(listener);
            resume(Effect.fail(providerFailure(error)));
          },
        };
        this.notificationListeners.add(listener);
        return Effect.sync(() => {
          this.notificationListeners.delete(listener);
        });
      }).pipe(
        Effect.timeoutOrElse({
          duration: timeoutMs,
          orElse: () =>
            Effect.fail(providerFailure(new Error('Timed out waiting for Codex notification'))),
        }),
      );
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
