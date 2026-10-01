import { describe, expect, it } from 'vitest';
import { Exit, Schema } from 'effect';

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

    expect(Exit.isSuccess(Schema.decodeUnknownExit(StudioWorkspaceSchema)(workspace))).toBe(true);
    expect(
      Exit.isFailure(
        Schema.decodeUnknownExit(CreateStudioWorkspaceRequestSchema)({
          name: 'Invalid',
          sortOrder: 'manual',
        }),
      ),
    ).toBe(true);
  });

  it('rejects unsupported job kinds at the shared transport boundary', () => {
    expect(
      Exit.isSuccess(
        Schema.decodeUnknownExit(CreateJobRequestBoundarySchema)({
          kind: 'dry_run',
          providerId: null,
          sourceSpec: undefined,
          execution: undefined,
        }),
      ),
    ).toBe(true);
    expect(
      Exit.isSuccess(
        Schema.decodeUnknownExit(CreateJobRequestBoundarySchema)({
          workspaceId: 'default',
          kind: 'image_generate',
          prompt: 'A moonlit harbor',
        }),
      ),
    ).toBe(true);
    expect(
      Exit.isFailure(
        Schema.decodeUnknownExit(CreateJobRequestBoundarySchema)({
          kind: 'project_generate',
        }),
      ),
    ).toBe(true);
  });
});
