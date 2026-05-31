import { describe, expect, it, vi } from 'vite-plus/test';
import {
  EVENT_STREAM_KEEPALIVE_MS,
  createEventStreamRoutes,
  createServerConnectedEvent,
} from './eventStreamRoutes';

describe('eventStreamRoutes', () => {
  it('exports connected event helper and keepalive interval', () => {
    const event = createServerConnectedEvent();
    expect(event.type).toBe('server.connected');
    expect(event.payload).toEqual({ ok: true });
    expect(typeof event.createdAt).toBe('string');
    expect(EVENT_STREAM_KEEPALIVE_MS).toBe(10_000);
  });

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
