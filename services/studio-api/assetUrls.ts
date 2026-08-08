import { resolveStudioApiBase } from '../studioRuntime';

export interface StudioAssetUrlOptions {
  variant?: 'thumb';
  maxEdge?: number;
}

export function toStudioAssetUrl(publicUrl: string, options: StudioAssetUrlOptions = {}) {
  const url = new URL(`${resolveStudioApiBase()}${publicUrl}`);
  if (options.variant) url.searchParams.set('variant', options.variant);
  if (options.maxEdge) url.searchParams.set('max', String(options.maxEdge));
  return url.toString();
}
