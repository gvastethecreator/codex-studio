import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

import { resolveLibraryPathFromRoot } from './library';

describe('studio library layout', () => {
  const root = path.join('D:', 'StudioWorkspace');

  it('keeps internal state under .studio', () => {
    expect(resolveLibraryPathFromRoot(root, 'library.sqlite')).toBe(
      path.join(root, '.studio', 'studio.sqlite'),
    );
    expect(resolveLibraryPathFromRoot(root, 'logs', 'app-server.log')).toBe(
      path.join(root, '.studio', 'logs', 'app-server.log'),
    );
    expect(resolveLibraryPathFromRoot(root, 'references', 'job-1', 'input.png')).toBe(
      path.join(root, '.studio', 'references', 'job-1', 'input.png'),
    );
    expect(resolveLibraryPathFromRoot(root, 'transcripts', 'job-1', 'events.jsonl')).toBe(
      path.join(root, '.studio', 'transcripts', 'job-1', 'events.jsonl'),
    );
    expect(resolveLibraryPathFromRoot(root, 'state', 'imagegen-session-registry.json')).toBe(
      path.join(root, '.studio', 'state', 'imagegen-session-registry.json'),
    );
  });

  it('keeps generated images and exports under outputs', () => {
    expect(resolveLibraryPathFromRoot(root, 'assets', 'job-1.png')).toBe(
      path.join(root, 'outputs', 'job-1.png'),
    );
    expect(resolveLibraryPathFromRoot(root, 'thumbnails', 'job-1.webp')).toBe(
      path.join(root, 'outputs', 'thumbnails', 'job-1.webp'),
    );
    expect(resolveLibraryPathFromRoot(root, 'exports', 'batch.zip')).toBe(
      path.join(root, 'outputs', 'exports', 'batch.zip'),
    );
    expect(resolveLibraryPathFromRoot(root, 'outputs', 'external', 'source-1', 'hero.webp')).toBe(
      path.join(root, 'outputs', 'external', 'source-1', 'hero.webp'),
    );
    expect(resolveLibraryPathFromRoot(root, '.trash', 'assets', 'job-1.png')).toBe(
      path.join(root, 'outputs', '.trash', 'assets', 'job-1.png'),
    );
  });
});
