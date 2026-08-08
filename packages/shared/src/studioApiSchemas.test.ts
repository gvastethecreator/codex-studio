import { describe, expect, it } from 'vitest';
import { Either, Schema } from 'effect';

import {
  CreateJobRequestBoundarySchema,
  CreateStudioWorkspaceRequestSchema,
  StudioWorkspaceSchema,
} from './studioApiSchemas';

describe('shared Studio API schemas', () => {
  it('accepts the durable workspace shape and rejects unsupported sort values', () => {
    const workspace = {
      id: 'default',
      name: 'Default',
      libraryId: null,
      filter: {},
      sortOrder: 'newest',
      createdAt: '2026-08-08T00:00:00.000Z',
      updatedAt: '2026-08-08T00:00:00.000Z',
    };

    expect(Either.isRight(Schema.decodeUnknownEither(StudioWorkspaceSchema)(workspace))).toBe(true);
    expect(
      Either.isLeft(
        Schema.decodeUnknownEither(CreateStudioWorkspaceRequestSchema)({
          name: 'Invalid',
          sortOrder: 'manual',
        }),
      ),
    ).toBe(true);
  });

  it('rejects unsupported job kinds at the shared transport boundary', () => {
    expect(
      Either.isRight(
        Schema.decodeUnknownEither(CreateJobRequestBoundarySchema)({
          workspaceId: 'default',
          kind: 'image_generate',
          prompt: 'A moonlit harbor',
        }),
      ),
    ).toBe(true);
    expect(
      Either.isLeft(
        Schema.decodeUnknownEither(CreateJobRequestBoundarySchema)({
          kind: 'project_generate',
        }),
      ),
    ).toBe(true);
  });
});
