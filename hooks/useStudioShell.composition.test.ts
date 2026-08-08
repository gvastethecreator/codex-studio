import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

describe('useStudioShell composition', () => {
  it('composes feature controllers instead of owning project/generate policy', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'hooks/useStudioShell.ts'), 'utf8');
    expect(source).toContain('useStudioNavigation');
    expect(source).toContain('useWorkspaceStrip');
    expect(source).toContain('useStudioCatalogController');
    expect(source).toContain('useStudioGenerationActions');
    expect(source).toContain('buildStudioShellOverlayController');
    expect(source).not.toContain('listProjects');
    expect(source).not.toContain('createStudioJob');
    expect(source).toContain('useWorkspaceState');
    expect(source).toContain('useRuntimeLogActions');
    expect(source).not.toMatch(/\buseRuntimeLogs\s*\(/);
    expect(source).not.toMatch(/\buseGlobal\s*\(/);
  });
});
