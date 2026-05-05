
// FIX: Add type definitions for the View Transitions API to avoid TypeScript errors.
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

declare global {
  interface Document {
    startViewTransition(updateCallback: () => Promise<void> | void): ViewTransition;
  }
}

import React from 'react';
import { MODELS } from './constants';

export interface Attachment {
  id: string;
  name: string;
  dataUrl: string; // Base64
  strength: number; // Value from 0 to 1
}

export type GenerationModel = typeof MODELS[keyof typeof MODELS];

export type AspectRatio = 
  | '1:1' | '3:2' | '2:3';

export type ImageSize = '512px' | '1K' | '2K' | '4K';

export type RecipeId = 'remaster' | 'spritesheet' | 'cinematic' | 'character' | 'styles' | 'camera' | 'timeline' | null;

export interface ImageGenerationConfig {
  prompt?: string;
  recipeContext?: string; // Hidden technical instructions injected by recipes
  attachments: Attachment[];
  aspectRatio: AspectRatio;
  imageSize?: ImageSize;
  negativePrompt?: string;
  temperature?: number;
  model: GenerationModel;
  batchCount: number;
  useThinkingAndSearch?: boolean;
}

export interface GeneratedImage {
  id: string;
  src: string;
  thumbnail?: string; 
  batchId: string;
  createdAt: number;
  isFavorite?: boolean; // Added for pinning
}

export interface GeneratedImageWithConfig extends GeneratedImage {
  config: ImageGenerationConfig;
}

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
  config: ImageGenerationConfig;
  status: QueueJobStatus;
  error?: string;
  createdAt: number;
  completedAt?: number;
  isForced?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
}

export interface BackgroundConfig {
  density: number;
  speed: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
