import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

/**
 * Honest regression for §12.7: parent RuntimeLogProvider must not re-render the
 * tree on log append. Subscription must live only in the leaf useRuntimeLogs.
 */
describe('RuntimeLogContext subscription placement', () => {
  const providerSource = readFileSync(
    path.resolve(process.cwd(), 'contexts/RuntimeLogContext.tsx'),
    'utf8',
  );

  it('keeps RuntimeLogProvider free of log-list React subscription', () => {
    // Extract the provider function body only (not useRuntimeLogs).
    const providerStart = providerSource.indexOf('export const RuntimeLogProvider');
    const leafStart = providerSource.indexOf('export function useRuntimeLogs');
    expect(providerStart).toBeGreaterThanOrEqual(0);
    expect(leafStart).toBeGreaterThan(providerStart);
    const providerBody = providerSource.slice(providerStart, leafStart);

    expect(providerBody).not.toMatch(/useSyncExternalStore\s*\(/);
    expect(providerBody).not.toMatch(/subscribeRuntimeLogs/);
    expect(providerBody).not.toMatch(/getRuntimeLogsSnapshot/);
    // Provider may hydrate the external store once, but must not put logs into React state.
    expect(providerBody).not.toMatch(/\blogs\b\s*=\s*use/);
    expect(providerBody).not.toMatch(/useState\s*[<(]/);
    expect(providerBody).not.toMatch(/useReducer\s*[<(]/);
    expect(providerBody).toContain('RuntimeLogActionsContext.Provider');
  });

  it('places useSyncExternalStore only on the leaf useRuntimeLogs consumer', () => {
    const leafStart = providerSource.indexOf('export function useRuntimeLogs');
    const leafBody = providerSource.slice(leafStart);
    expect(leafBody).toMatch(/useSyncExternalStore\s*\(/);
    expect(leafBody).toContain('subscribeRuntimeLogs');
    expect(leafBody).toContain('getRuntimeLogsSnapshot');
  });

  it('useStudioShell does not call the leaf log-list hook', () => {
    const shell = readFileSync(path.resolve(process.cwd(), 'hooks/useStudioShell.ts'), 'utf8');
    expect(shell).toMatch(/\buseRuntimeLogActions\s*\(/);
    expect(shell).not.toMatch(/\buseRuntimeLogs\s*\(/);
    expect(shell).toContain('EMPTY_RUNTIME_LOGS');
  });

  it('StudioSystemOverlays is a leaf consumer of the log list', () => {
    const overlays = readFileSync(
      path.resolve(process.cwd(), 'components/overlays/StudioSystemOverlays.tsx'),
      'utf8',
    );
    expect(overlays).toMatch(/\buseRuntimeLogs\s*\(/);
  });
});
