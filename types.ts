import React from 'react';
import type { CodexReasoningEffort, CodexServiceTier, JobStatus } from './packages/shared/src';
import { MODELS } from './constants';

export interface Attachment {
  id: string;
  name: string;
  dataUrl: string; // Base64
  strength: number; // Value from 0 to 1
}

export type GenerationModel = (typeof MODELS)[keyof typeof MODELS];

export type AspectRatio = '1:1' | '3:2' | '2:3';

export type ImageSize = '512px' | '1K' | '2K' | '4K';

export type RecipeId =
  | 'remaster'
  | 'spritesheet'
  | 'cinematic'
  | 'character-lab'
  | 'character'
  | 'styles'
  | 'camera'
  | 'timeline'
  | null;

export interface ImageGenerationConfig {
  prompt?: string;
  recipeContext?: string; // Hidden technical instructions injected by recipes
  recipeId?: Exclude<RecipeId, null> | null;
  recipeParams?: Record<string, unknown> | null;
  attachments: Attachment[];
  aspectRatio: AspectRatio;
  imageSize?: ImageSize;
  negativePrompt?: string;
  temperature?: number;
  model: GenerationModel;
  executionModel: string;
  executionReasoningEffort: CodexReasoningEffort;
  executionSpeed: CodexServiceTier;
  batchCount: number;
  useThinkingAndSearch?: boolean;
}

export interface GeneratedImage {
  id: string;
  src: string;
  thumbnail?: string;
  preview?: string;
  batchId: string;
  createdAt: number;
  isFavorite?: boolean; // Added for pinning
}

export interface GeneratedImageWithConfig extends GeneratedImage {
  config: ImageGenerationConfig;
}

export type GenerationExecutionOutcome =
  | { status: 'completed' }
  | { status: 'cancelled'; message?: string }
  | { status: 'failed'; message: string };

export interface GenerationBatch {
  id: string;
  workspaceId: string; // Added link to workspace
  config: ImageGenerationConfig;
  images: GeneratedImage[];
  createdAt: number;
}

export interface Workspace {
  id: string;
  name?: string; // Optional custom name
  createdAt: number;
  lastImage?: string; // Cache for the thumbnail
}

export type QueueJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueueJob {
  id: string;
  prompt: string;
  workspaceId: string;
  config: ImageGenerationConfig;
  status: QueueJobStatus;
  serverJobId?: string | null;
  error?: string;
  createdAt: number;
  completedAt?: number;
  isForced?: boolean;
}

export interface StudioGenerationPlaceholder {
  id: string;
  status: QueueJobStatus | JobStatus;
  aspectRatio: string;
  prompt: string;
  createdAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
