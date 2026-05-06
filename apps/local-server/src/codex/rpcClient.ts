export interface RpcSession {
  request(method: string, params?: unknown): Promise<unknown>;
  disconnect(): void;
}

export interface RpcClient {
  connect(wsUrl: string, retryConfig?: { maxRetries?: number; retryDelayMs?: number }): Promise<RpcSession>;
}

export function createRpcClient(): RpcClient {
  return {
    async connect(wsUrl, retryConfig = {}) {
      const maxRetries = retryConfig.maxRetries ?? 25;
      const retryDelayMs = retryConfig.retryDelayMs ?? 200;
      let socket: WebSocket | null = null;
      for (let attempt = 0; attempt < maxRetries; attempt += 1) {
        try {
          socket = await new Promise<WebSocket>((resolve, reject) => {
            const ws = new WebSocket(wsUrl);
            const timeout = setTimeout(() => reject(new Error('Timed out connecting to Codex RPC')), 1000);
            ws.addEventListener('open', () => {
              clearTimeout(timeout);
              resolve(ws);
            });
            ws.addEventListener('error', () => {
              clearTimeout(timeout);
              reject(new Error('Codex RPC WebSocket failed'));
            });
          });
          break;
        } catch {
          await Bun.sleep(retryDelayMs);
        }
      }
      if (!socket) throw new Error(`Unable to connect to ${wsUrl}`);
      let nextId = 1;
      return {
        request(method, params) {
          const id = nextId++;
          socket!.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
          return Promise.resolve({ id, accepted: true });
        },
        disconnect() {
          socket?.close();
        },
      };
    },
  };
}
