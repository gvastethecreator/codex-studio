import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { subscribeEvents } from './events';

interface EventStreamRoutesDependencies {
  subscribeEvents: typeof subscribeEvents;
}

export function createEventStreamRoutes({ subscribeEvents }: EventStreamRoutesDependencies) {
  const routes = new Hono();

  routes.get('/events', (c) => {
    c.header('X-Accel-Buffering', 'no');

    return streamSSE(c, async (stream) => {
      let cleanedUp = false;

      const send = (event: unknown) => {
        void stream.writeSSE({
          data: JSON.stringify(event),
        });
      };

      const unsubscribe = subscribeEvents(send);

      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        unsubscribe();
      };

      const abort = () => {
        cleanup();
        if (!stream.aborted) {
          stream.abort();
        }
      };

      c.req.raw.signal.addEventListener('abort', abort, { once: true });

      try {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'server.connected',
            payload: { ok: true },
            createdAt: new Date().toISOString(),
          }),
        });

        while (!stream.aborted) {
          if (stream.aborted) {
            break;
          }

          await stream.sleep(10_000);
          await stream.write(`: keep-alive ${Date.now()}\n\n`);
        }
      } finally {
        cleanup();
        c.req.raw.signal.removeEventListener('abort', abort);
      }
    });
  });

  return routes;
}
