import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type { ReferenceHandoffResponse } from '../../../packages/shared/src';
import type {
  ProcessedReference,
  RawReference,
  ReferenceProcessingError,
} from './referenceManager';

interface ReferenceRoutesDependencies {
  createHandoffId: () => string;
  processReferences: (
    handoffId: string,
    prompt: string,
    references: RawReference[],
    libraryDir: string,
  ) => Promise<{ persistedRefs: ProcessedReference[] }>;
  readLibraryDir: () => string;
  toPublicAssetUrl: (filePath: string) => string;
  isReferenceProcessingError: (error: unknown) => error is ReferenceProcessingError;
}

const ReferenceHandoffRequestSchema = Schema.Struct({
  references: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      dataUrl: Schema.String,
      strength: Schema.Number,
    }),
  ),
});

function decodeReferenceHandoffRequest(body: unknown) {
  return Schema.decodeUnknownEither(ReferenceHandoffRequestSchema)(body);
}

export function createReferenceRoutes({
  createHandoffId,
  processReferences,
  readLibraryDir,
  toPublicAssetUrl,
  isReferenceProcessingError,
}: ReferenceRoutesDependencies) {
  const routes = new Hono();

  routes.post('/handoff', async (c) => {
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

    const decodedBody = decodeReferenceHandoffRequest(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Reference handoff payload does not match the boundary schema.',
        },
        400,
      );
    }

    const handoffId = createHandoffId();

    try {
      const processed = await processReferences(
        handoffId,
        'Reference handoff.',
        [...decodedBody.right.references],
        readLibraryDir(),
      );

      const response: ReferenceHandoffResponse = {
        handoffId,
        references: processed.persistedRefs.map((reference) => ({
          name: reference.name,
          localPath: reference.path,
          publicUrl: toPublicAssetUrl(reference.path),
          strength: reference.strength,
          mimeType: reference.mimeType,
          fileSizeBytes: reference.fileSizeBytes,
          width: reference.width,
          height: reference.height,
        })),
      };

      return c.json(response, 201);
    } catch (error) {
      if (isReferenceProcessingError(error)) {
        return c.json(
          { error: error.message, referenceName: error.referenceName, reason: error.reason },
          400,
        );
      }
      throw error;
    }
  });

  return routes;
}
