import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type { registerLibrary, listLibraries, removeLibrary, setDefaultLibrary } from './libraries';
import type { publishEvent } from './events';

export interface LibrariesRoutesDependencies {
  listLibraries: typeof listLibraries;
  registerLibrary: typeof registerLibrary;
  setDefaultLibrary: typeof setDefaultLibrary;
  removeLibrary: typeof removeLibrary;
  publishEvent: typeof publishEvent;
}

const CreateLibraryBoundarySchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  path: Schema.String,
  isDefault: Schema.optional(Schema.Boolean),
});

export function createLibrariesRoutes({
  listLibraries,
  registerLibrary,
  setDefaultLibrary,
  removeLibrary,
  publishEvent,
}: LibrariesRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(listLibraries()));

  routes.post('/', async (c) => {
    const rawBody = await c.req
      .json()
      .catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
    if ('__invalidJson' in rawBody) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_json',
          reason: 'Request body must be valid JSON.',
        },
        400,
      );
    }

    const decodedBody = Schema.decodeUnknownEither(CreateLibraryBoundarySchema)(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Library payload is invalid.',
        },
        400,
      );
    }

    const body = decodedBody.right;
    const library = registerLibrary({
      name: body.name || 'Untitled Library',
      path: body.path,
      isDefault: Boolean(body.isDefault),
    });
    publishEvent('library.created', library);
    return c.json(library, 201);
  });

  routes.put('/:id/default', (c) => {
    const library = setDefaultLibrary(c.req.param('id'));
    if (!library) return c.json({ error: 'Library not found' }, 404);
    publishEvent('library.default', library);
    return c.json(library);
  });

  routes.delete('/:id', (c) => {
    if (!removeLibrary(c.req.param('id'))) {
      return c.json({ error: 'Library not found or default library cannot be removed' }, 400);
    }
    return c.json({ ok: true });
  });

  return routes;
}
