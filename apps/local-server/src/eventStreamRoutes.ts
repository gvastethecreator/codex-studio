import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { StudioEvent, UnknownStudioEvent } from '../../../packages/shared/src';
import type { subscribeEvents } from './events';

export const EVENT_STREAM_KEEPALIVE_MS = 10_000;
export const EVENT_STREAM_MAX_PENDING_WRITES = 100;

export function createServerConnectedEvent(
  revision = 0,
  clientRevision: number | null = null,
): Extract<StudioEvent, { type: 'server.connected' }> {
  return {
    type: 'server.connected',
    payload: {
      ok: true,
      revision,
      reconciled: clientRevision === null || clientRevision === revision,
    },
    createdAt: new Date().toISOString(),
    revision,
  };
}

interface EventStreamRoutesDependencies {
  subscribeEvents: typeof subscribeEvents;
  readEventRevision?: () => number;
}

export function createEventStreamRoutes({
  subscribeEvents,
  readEventRevision = () => 0,
}: EventStreamRoutesDependencies) {
  const routes = new Hono();

  routes.get('/events', (c) => {
    c.header('X-Accel-Buffering', 'no');

    return streamSSE(c, async (stream) => {
      let cleanedUp = false;
      let pendingWrites = 0;
      let writeChain = Promise.resolve();

      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        unsubscribe();
      };

      const abort = () => {
        cleanup();
        if (!stream.aborted) stream.abort();
      };

      const send = (event: StudioEvent | UnknownStudioEvent) => {
        if (stream.aborted) return;
        if (pendingWrites >= EVENT_STREAM_MAX_PENDING_WRITES) {
          abort();
          return;
        }
        pendingWrites += 1;
        writeChain = writeChain
          .then(() =>
            stream.writeSSE({
              data: JSON.stringify(event),
              id: event.revision === undefined ? undefined : String(event.revision),
            }),
          )
          .catch(() => abort())
          .finally(() => {
            pendingWrites -= 1;
          });
      };

      const unsubscribe = subscribeEvents(send);

      c.req.raw.signal.addEventListener('abort', abort, { once: true });

      try {
        const sinceValue = new URL(c.req.url).searchParams.get('since');
        const since = sinceValue && /^\d+$/.test(sinceValue) ? Number(sinceValue) : null;
        const connectedEvent = createServerConnectedEvent(readEventRevision(), since);
        await stream.writeSSE({
          data: JSON.stringify(connectedEvent),
          id: String(connectedEvent.revision ?? 0),
        });

        while (!stream.aborted) {
          if (stream.aborted) {
            break;
          }

          await stream.sleep(EVENT_STREAM_KEEPALIVE_MS);
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
