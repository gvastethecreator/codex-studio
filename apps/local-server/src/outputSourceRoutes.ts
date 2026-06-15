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
import { ensureThumbnailVariant as ensureThumbnailVariantDefault } from './libraryAssetVariants';
import type { EditableStudioSettings } from '../../../packages/shared/src';

interface OutputSourceRoutesDependencies {
  settingsStorage: StudioSettingsStorage;
  readSettings: () => EditableStudioSettings;
  readConfig: typeof getSettings;
  registerCatalogImage: typeof registerCatalogImage;
  publishEvent: typeof publishEvent;
  ensureThumbnailVariant?: typeof ensureThumbnailVariantDefault;
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

function decodeImportOutputSourceBody(rawBody: unknown) {
  const strict = Schema.decodeUnknownEither(ImportOutputSourceBoundarySchema)(rawBody);
  if (Either.isRight(strict)) return strict.right;

  if (typeof rawBody !== 'object' || rawBody === null || Array.isArray(rawBody)) {
    return null;
  }

  const raw = rawBody as {
    files?: unknown;
    limit?: unknown;
    workspaceId?: unknown;
  };

  if (!Array.isArray(raw.files) || raw.files.some((item) => typeof item !== 'string')) {
    return null;
  }

  let limit: number | undefined;
  if (typeof raw.limit === 'number') {
    limit = raw.limit;
  } else if (typeof raw.limit === 'string') {
    const parsed = Number.parseInt(raw.limit, 10);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    limit = parsed;
  } else if (raw.limit !== undefined) {
    return null;
  }

  let workspaceId: string | null | undefined;
  if (raw.workspaceId === undefined) {
    workspaceId = undefined;
  } else if (raw.workspaceId === null || typeof raw.workspaceId === 'string') {
    workspaceId = raw.workspaceId;
  } else {
    return null;
  }

  return {
    files: raw.files,
    limit,
    workspaceId,
  };
}

export function createOutputSourceRoutes({
  settingsStorage,
  readSettings,
  readConfig,
  registerCatalogImage,
  publishEvent,
  ensureThumbnailVariant = ensureThumbnailVariantDefault,
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

    const decodedBody = decodeImportOutputSourceBody(rawBody);
    if (!decodedBody) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Output source import payload is invalid.',
        },
        400,
      );
    }

    const result = await importExternalOutputSourceFiles({
      storage: settingsStorage,
      sourceId: c.req.param('id'),
      libraryDir: readConfig().libraryDir,
      input: decodedBody as {
        files: string[];
        limit?: number;
        workspaceId?: string | null;
      },
      registerCatalogImage,
      ensureThumbnailVariant,
    });
    if (!result.ok) return c.json({ error: result.reason }, 400);
    publishEvent('output-source.imported', result.result);
    return c.json(result.result, 201);
  });

  return routes;
}
