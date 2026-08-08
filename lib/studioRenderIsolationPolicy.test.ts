import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { shouldInvalidateSurface, surfacesInvalidatedBy } from './studioRenderIsolationPolicy';

describe('studioRenderIsolationPolicy', () => {
  it('keeps prompt draft typing off workspace/runtime/catalog surfaces', () => {
    expect(shouldInvalidateSurface('generation-draft', 'workspace')).toBe(false);
    expect(shouldInvalidateSurface('generation-draft', 'runtime-log')).toBe(false);
    expect(shouldInvalidateSurface('generation-draft', 'catalog')).toBe(false);
    expect(shouldInvalidateSurface('generation-draft', 'generation-draft')).toBe(true);
  });

  it('keeps closed runtime logs from invalidating generation draft', () => {
    expect(surfacesInvalidatedBy('runtime-log')).toEqual(['runtime-log']);
    expect(shouldInvalidateSurface('runtime-log', 'generation-draft')).toBe(false);
  });

  it('is enforced by shell, provider, and overlay seams in shipped code', () => {
    const shell = readFileSync(path.resolve(process.cwd(), 'hooks/useStudioShell.ts'), 'utf8');
    const runtimeLogContext = readFileSync(
      path.resolve(process.cwd(), 'contexts/RuntimeLogContext.tsx'),
      'utf8',
    );
    const systemOverlays = readFileSync(
      path.resolve(process.cwd(), 'components/overlays/StudioSystemOverlays.tsx'),
      'utf8',
    );
    // Shell must not subscribe to the log list (would re-render workspace chrome).
    expect(shell).toContain('EMPTY_RUNTIME_LOGS');
    expect(shell).toMatch(/\buseRuntimeLogActions\s*\(/);
    expect(shell).not.toMatch(/\buseRuntimeLogs\s*\(/);

    // Provider body must not subscribe; leaf hook must.
    const providerStart = runtimeLogContext.indexOf('export const RuntimeLogProvider');
    const leafStart = runtimeLogContext.indexOf('export function useRuntimeLogs');
    const providerBody = runtimeLogContext.slice(providerStart, leafStart);
    const leafBody = runtimeLogContext.slice(leafStart);
    expect(providerBody).not.toMatch(/useSyncExternalStore\s*\(/);
    expect(leafBody).toMatch(/useSyncExternalStore\s*\(/);

    // Log list subscription lives on the overlay surface that displays logs.
    expect(systemOverlays).toMatch(/\buseRuntimeLogs\s*\(/);
    expect(systemOverlays).toContain('clientSessionLogs');
  });
});
