import { describe, expect, it, vi } from 'vite-plus/test';
import { createEventStreamRoutes } from './eventStreamRoutes';

describe('eventStreamRoutes', () => {
  it('returns SSE handshake payload and no-buffering header', async () => {
    const subscribeEvents = vi.fn(() => () => true);
    const routes = createEventStreamRoutes({
      subscribeEvents,
    });

    const response = await routes.request('/events');

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Accel-Buffering')).toBe('no');
    expect(response.headers.get('content-type')?.toLowerCase()).toContain('text/event-stream');

    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    const firstChunk = await reader!.read();
    const text = new TextDecoder().decode(firstChunk.value);

    expect(text).toContain('server.connected');
    expect(subscribeEvents).toHaveBeenCalledTimes(1);

    await reader!.cancel();
  });
});
