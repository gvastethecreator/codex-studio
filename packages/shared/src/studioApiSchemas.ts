import { Schema } from 'effect';

const StudioWorkspaceSortOrderSchema = Schema.Union(
  Schema.Literal('newest'),
  Schema.Literal('oldest'),
  Schema.Literal('favorite'),
);

export const StudioWorkspaceSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  libraryId: Schema.Union(Schema.String, Schema.Null),
  filter: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  sortOrder: StudioWorkspaceSortOrderSchema,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const CreateStudioWorkspaceRequestSchema = Schema.Struct({
  id: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  libraryId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  filter: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  sortOrder: Schema.optional(StudioWorkspaceSortOrderSchema),
});

export const UpdateStudioWorkspaceRequestSchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  libraryId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  filter: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  sortOrder: Schema.optional(StudioWorkspaceSortOrderSchema),
});

export const CreateJobRequestBoundarySchema = Schema.Struct({
  workspaceId: Schema.optional(Schema.String),
  kind: Schema.Union(
    Schema.Literal('dry_run'),
    Schema.Literal('codex_imagegen'),
    Schema.Literal('image_generate'),
    Schema.Literal('image_edit'),
    Schema.Literal('style_preset_card'),
    Schema.Literal('sprite_sheet'),
    Schema.Literal('texture_generate'),
  ),
  providerId: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  sourceSpec: Schema.optional(Schema.Union(Schema.Unknown, Schema.Null)),
  prompt: Schema.optional(Schema.String),
  execution: Schema.optional(Schema.Union(Schema.Unknown, Schema.Null)),
  references: Schema.optional(
    Schema.Array(
      Schema.Struct({
        name: Schema.String,
        dataUrl: Schema.String,
        strength: Schema.Number,
      }),
    ),
  ),
});

export type CreateJobRequestBoundary = Schema.Schema.Type<typeof CreateJobRequestBoundarySchema>;
export type CreateStudioWorkspaceRequest = Schema.Schema.Type<
  typeof CreateStudioWorkspaceRequestSchema
>;
export type UpdateStudioWorkspaceRequest = Schema.Schema.Type<
  typeof UpdateStudioWorkspaceRequestSchema
>;
