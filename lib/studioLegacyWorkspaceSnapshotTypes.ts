import type { GeneratedImage, ImageGenerationConfig } from '../types';

export interface LegacyWorkspaceSnapshotImage extends Pick<
  GeneratedImage,
  'id' | 'src' | 'thumbnail' | 'preview' | 'batchId' | 'createdAt'
> {
  isFavorite?: boolean;
}

export interface LegacyWorkspaceSnapshotBatch {
  id: string;
  workspaceId: string;
  config: ImageGenerationConfig;
  images: LegacyWorkspaceSnapshotImage[];
  createdAt: number;
}

export type LegacyWorkspaceSnapshot = LegacyWorkspaceSnapshotBatch[];
