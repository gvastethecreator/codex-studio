export interface StudioAssetUrlOptions {
  variant?: 'thumb';
  maxEdge?: number;
}

export function toStudioAssetUrl(publicUrl: string, _options: StudioAssetUrlOptions = {}) {
  return publicUrl;
}
