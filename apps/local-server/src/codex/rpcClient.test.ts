import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('../config', () => ({
  getCodexWsUrl: () => 'ws://127.0.0.1:4317',
}));

vi.mock('./processSupervisor', () => ({
  ensureAppServer: () => {},
}));

let CodexRpcClient: typeof import('./rpcClient').CodexRpcClient;

beforeAll(async () => {
  ({ CodexRpcClient } = await import('./rpcClient'));
});

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
});
