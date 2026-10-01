import { Schema } from 'effect';

const StudioWorkspaceSortOrderSchema = Schema.Union([
  Schema.Literal('newest'),
  Schema.Literal('oldest'),
  Schema.Literal('favorite'),
]);

export const StudioWorkspaceSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  libraryId: Schema.NullOr(Schema.String),
  filter: Schema.Record(Schema.String, Schema.Unknown),
  sortOrder: StudioWorkspaceSortOrderSchema,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const CreateStudioWorkspaceRequestSchema = Schema.Struct({
  id: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  libraryId: Schema.optional(Schema.NullOr(Schema.String)),
  filter: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
  sortOrder: Schema.optional(StudioWorkspaceSortOrderSchema),
});

export const UpdateStudioWorkspaceRequestSchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  libraryId: Schema.optional(Schema.NullOr(Schema.String)),
  filter: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
  sortOrder: Schema.optional(StudioWorkspaceSortOrderSchema),
});

export const CreateJobRequestBoundarySchema = Schema.Struct({
  workspaceId: Schema.optional(Schema.String),
  kind: Schema.Union([
    Schema.Literal('dry_run'),
    Schema.Literal('codex_imagegen'),
    Schema.Literal('image_generate'),
    Schema.Literal('image_edit'),
    Schema.Literal('style_preset_card'),
    Schema.Literal('sprite_sheet'),
    Schema.Literal('texture_generate'),
  ]),
  providerId: Schema.optional(Schema.NullOr(Schema.String)),
  sourceSpec: Schema.optional(Schema.Unknown),
  prompt: Schema.optional(Schema.String),
  execution: Schema.optional(Schema.Unknown),
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

export type CreateJobRequestBoundary = typeof CreateJobRequestBoundarySchema.Type;
export type CreateStudioWorkspaceRequest = typeof CreateStudioWorkspaceRequestSchema.Type;
export type UpdateStudioWorkspaceRequest = typeof UpdateStudioWorkspaceRequestSchema.Type;
