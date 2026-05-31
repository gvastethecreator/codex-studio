import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type { EditableStudioSettings } from '../../../packages/shared/src';

interface SettingsRoutesDependencies {
  readSettings: () => EditableStudioSettings;
  updateSettings: (patch: unknown) => EditableStudioSettings;
}

const SettingsPatchBoundarySchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

export function createSettingsRoutes({ readSettings, updateSettings }: SettingsRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(readSettings()));

  routes.patch('/', async (c) => {
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

    const decodedBody = Schema.decodeUnknownEither(SettingsPatchBoundarySchema)(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Settings patch must be a JSON object.',
        },
        400,
      );
    }

    return c.json(updateSettings(decodedBody.right));
  });

  return routes;
}
