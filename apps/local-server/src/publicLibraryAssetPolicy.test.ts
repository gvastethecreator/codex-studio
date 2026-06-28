import { describe, expect, it } from 'vite-plus/test';
import { isPublicLibraryAssetPath } from './publicLibraryAssetPolicy';

describe('publicLibraryAssetPolicy', () => {
  it('allows generated outputs and intended reference assets', () => {
    expect(isPublicLibraryAssetPath('outputs/final.png')).toBe(true);
    expect(isPublicLibraryAssetPath('outputs/thumbnails/final.webp')).toBe(true);
    expect(isPublicLibraryAssetPath('.studio/references/job-1/ref.png')).toBe(true);
    expect(isPublicLibraryAssetPath('.studio/masks/job-1/mask.png')).toBe(true);
  });

  it('denies private Studio Library internals', () => {
    expect(isPublicLibraryAssetPath('.studio/studio.sqlite')).toBe(false);
    expect(isPublicLibraryAssetPath('.studio/transcripts/job.jsonl')).toBe(false);
    expect(isPublicLibraryAssetPath('.studio/logs/app-server.log')).toBe(false);
    expect(isPublicLibraryAssetPath('outputs/../.studio/studio.sqlite')).toBe(false);
  });
});
