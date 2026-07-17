import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../config', () => ({
  getCodexWsUrl: () => 'ws://127.0.0.1:4317',
}));

vi.mock('./processSupervisor', () => ({
  ensureAppServer: () => {},
}));

let CodexRpcClient: typeof import('./rpcClient').CodexRpcClient;

beforeAll(async () => {
  if (typeof WebSocket === 'undefined') {
    vi.stubGlobal('WebSocket', { OPEN: 1 });
  }
  ({ CodexRpcClient } = await import('./rpcClient'));
});

function attachOpenSocket(client: InstanceType<typeof CodexRpcClient>) {
  const sent: string[] = [];
  const socket = {
    readyState: 1,
    send: vi.fn((payload: string) => sent.push(payload)),
    close: vi.fn(),
  };
  (client as any).socket = socket;
  return { socket, sent };
}

describe('CodexRpcClient', () => {
  it('resolves waitForNotification from buffered notifications', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {} });
    (client as any).handleMessage(
      JSON.stringify({ method: 'turn/completed', params: { turn: { id: 'turn-1' } } }),
    );

    const notification = await client.waitForNotification(
      (message) => message.method === 'turn/completed',
      100,
    );

    expect(notification.method).toBe('turn/completed');
  });

  it('resolves waitForNotification when a matching message arrives later', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {} });
    const waiting = client.waitForNotification((message) => message.method === 'job.progress', 500);

    setTimeout(() => {
      (client as any).handleMessage(
        JSON.stringify({ method: 'job.progress', params: { id: 'job-1' } }),
      );
    }, 10);

    await expect(waiting).resolves.toMatchObject({ method: 'job.progress' });
  });

  it('rejects waitForNotification on timeout', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {} });
    const waiting = client.waitForNotification((message) => message.method === 'never', 20);
    await expect(waiting).rejects.toThrow('Timed out waiting for Codex notification');
  });

  it('rejects waiters when client closes', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {} });
    const waiting = client.waitForNotification((message) => message.method === 'never', 2000);
    client.close();
    await expect(waiting).rejects.toThrow('Codex app-server socket closed');
  });

  it('cleans pending requests on response and ignores late responses', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {}, requestTimeoutMs: 50 });
    const { sent } = attachOpenSocket(client);

    const response = client.request('account/read', { refreshToken: false });
    const id = JSON.parse(sent[0]).id;
    (client as any).handleMessage(JSON.stringify({ id, result: { account: null } }));

    await expect(response).resolves.toEqual({ account: null });
    expect((client as any).pending.size).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 75));
    expect((client as any).pending.size).toBe(0);

    (client as any).handleMessage(JSON.stringify({ id, result: { late: true } }));
    expect(client.getNotificationCount()).toBe(0);
  });

  it('times out requests, cleans timers, and allows a subsequent request to recover', async () => {
    const client = new CodexRpcClient({ ensureAppServer: () => {}, requestTimeoutMs: 15 });
    const { sent } = attachOpenSocket(client);

    const timedOut = client.request('account/read', { refreshToken: false });
    await expect(timedOut).rejects.toThrow(
      'Timed out waiting for Codex app-server response to account/read after 15ms',
    );
    expect((client as any).pending.size).toBe(0);

    const lateId = JSON.parse(sent[0]).id;
    (client as any).handleMessage(JSON.stringify({ id: lateId, result: { late: true } }));
    expect(client.getNotificationCount()).toBe(0);

    const recovered = client.request('initialize', {});
    const recoveryId = JSON.parse(sent[1]).id;
    (client as any).handleMessage(JSON.stringify({ id: recoveryId, result: { ok: true } }));
    await expect(recovered).resolves.toEqual({ ok: true });
    expect((client as any).pending.size).toBe(0);
  });

  it('uses the 15 second request timeout by default without waiting in real time', async () => {
    vi.useFakeTimers();
    try {
      const client = new CodexRpcClient({ ensureAppServer: () => {} });
      const { sent } = attachOpenSocket(client);
      const request = client.request('account/read', { refreshToken: false });
      const rejection = expect(request).rejects.toThrow(
        `Timed out waiting for Codex app-server response to account/read after ${CodexRpcClient.DEFAULT_REQUEST_TIMEOUT_MS}ms`,
      );

      await vi.advanceTimersByTimeAsync(CodexRpcClient.DEFAULT_REQUEST_TIMEOUT_MS);

      await rejection;
      expect(sent).toHaveLength(1);
      expect((client as any).pending.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cleans pending requests and timeout timers when socket.send throws synchronously', async () => {
    vi.useFakeTimers();
    try {
      const client = new CodexRpcClient({ ensureAppServer: () => {} });
      const { socket } = attachOpenSocket(client);
      const sendError = new Error('socket send failed');
      socket.send.mockImplementation(() => {
        throw sendError;
      });

      const request = client.request('account/read', { refreshToken: false });

      await expect(request).rejects.toBe(sendError);
      expect((client as any).pending.size).toBe(0);
      await vi.advanceTimersByTimeAsync(CodexRpcClient.DEFAULT_REQUEST_TIMEOUT_MS);
      expect((client as any).pending.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cleans and rejects pending requests when the socket closes or client closes', async () => {
    const socketCloseClient = new CodexRpcClient({
      ensureAppServer: () => {},
      requestTimeoutMs: 2000,
    });
    const { socket: socketClosing } = attachOpenSocket(socketCloseClient);
    const socketCloseRequest = socketCloseClient.request('account/read', {});
    (socketCloseClient as any).handleSocketClose(socketClosing);
    await expect(socketCloseRequest).rejects.toThrow('Codex app-server socket closed');
    expect((socketCloseClient as any).pending.size).toBe(0);

    const closeClient = new CodexRpcClient({ ensureAppServer: () => {}, requestTimeoutMs: 2000 });
    const { socket } = attachOpenSocket(closeClient);
    const closeRequest = closeClient.request('account/read', {});
    closeClient.close();
    await expect(closeRequest).rejects.toThrow('Codex app-server socket closed');
    expect(socket.close).toHaveBeenCalledTimes(1);
    expect((closeClient as any).pending.size).toBe(0);
  });
});
