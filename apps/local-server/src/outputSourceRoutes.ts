import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import {
  detectExternalOutputSourceCandidates,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  readExternalOutputSourceRegistry,
  registerExternalOutputSource,
} from './outputSources';
import type { StudioSettingsStorage } from './studioSettingsStore';
import type { registerCatalogImage } from './catalog';
import type { publishEvent } from './events';
import type { getSettings } from './config';
import type { EditableStudioSettings } from '../../../packages/shared/src';

interface OutputSourceRoutesDependencies {
  settingsStorage: StudioSettingsStorage;
  readSettings: () => EditableStudioSettings;
  readConfig: typeof getSettings;
  registerCatalogImage: typeof registerCatalogImage;
  publishEvent: typeof publishEvent;
}

const RegisterOutputSourceBoundarySchema = Schema.Struct({
  label: Schema.optional(Schema.String),
  path: Schema.String,
  providerId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
});

const ImportOutputSourceBoundarySchema = Schema.Struct({
  files: Schema.Array(Schema.String),
  limit: Schema.optional(Schema.Number),
  workspaceId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
});

export function createOutputSourceRoutes({
  settingsStorage,
  readSettings,
  readConfig,
  registerCatalogImage,
  publishEvent,
}: OutputSourceRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => {
    const settings = readSettings();
    return c.json({
      registry: readExternalOutputSourceRegistry(settingsStorage),
      candidates: detectExternalOutputSourceCandidates({
        libraryDir: readConfig().libraryDir,
        settings,
      }),
    });
  });

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

    const decodedBody = Schema.decodeUnknownEither(RegisterOutputSourceBoundarySchema)(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Output source payload is invalid.',
        },
        400,
      );
    }

    const result = registerExternalOutputSource({
      storage: settingsStorage,
      libraryDir: readConfig().libraryDir,
      input: decodedBody.right,
    });

    if (!result.ok) {
      return c.json({ error: result.reason }, 400);
    }

    publishEvent('output-source.registered', result.source);
    return c.json(result.source, 201);
  });

  routes.get('/:id/files', (c) => {
    const url = new URL(c.req.url);
    const result = listExternalOutputSourceFiles({
      storage: settingsStorage,
      sourceId: c.req.param('id'),
      limit: Number(url.searchParams.get('limit') || 100),
    });
    if (!result.ok) return c.json({ error: result.reason }, 404);
    return c.json({ source: result.source, files: result.files });
  });

  routes.post('/:id/import', async (c) => {
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

    const decodedBody = Schema.decodeUnknownEither(ImportOutputSourceBoundarySchema)(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Output source import payload is invalid.',
        },
        400,
      );
    }

    const result = importExternalOutputSourceFiles({
      storage: settingsStorage,
      sourceId: c.req.param('id'),
      libraryDir: readConfig().libraryDir,
      input: decodedBody.right as {
        files: string[];
        limit?: number;
        workspaceId?: string | null;
      },
      registerCatalogImage,
    });
    if (!result.ok) return c.json({ error: result.reason }, 400);
    publishEvent('output-source.imported', result.result);
    return c.json(result.result, 201);
  });

  return routes;
}
