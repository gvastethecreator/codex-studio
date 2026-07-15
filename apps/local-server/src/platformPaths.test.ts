import { describe, expect, it } from 'vite-plus/test';
import { listPlatformPathCandidates } from './platformPaths';

describe('platformPaths', () => {
  it('prefers the OpenAI Codex desktop binary before npm shims on Windows', () => {
    if (process.platform !== 'win32') {
      expect(listPlatformPathCandidates('codex-binary').length).toBeGreaterThan(0);
      return;
    }

    const candidates = listPlatformPathCandidates('codex-binary');
    const openAiIndex = candidates.findIndex((candidate) =>
      candidate.path.includes('Programs\\OpenAI\\Codex\\bin\\codex.exe'),
    );
    const npmShimIndex = candidates.findIndex((candidate) =>
      candidate.path.includes('AppData\\Roaming\\npm\\codex.cmd'),
    );

    expect(openAiIndex).toBeGreaterThanOrEqual(0);
    expect(npmShimIndex).toBeGreaterThanOrEqual(0);
    expect(openAiIndex).toBeLessThan(npmShimIndex);
  });

  it('prefers stable launchers before npm package internals on Windows', () => {
    if (process.platform !== 'win32') return;

    const candidates = listPlatformPathCandidates('codex-binary');
    const stableLauncherIndexes = candidates
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) =>
        ['npm command shim', 'Bun global executable shim', 'PATH executable'].includes(
          candidate.source,
        ),
      )
      .map(({ index }) => index);
    const vendorIndexes = candidates
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) => candidate.source.includes('vendor binary'))
      .map(({ index }) => index);

    expect(stableLauncherIndexes.length).toBeGreaterThan(0);
    expect(vendorIndexes.length).toBeGreaterThan(0);
    expect(Math.max(...stableLauncherIndexes)).toBeLessThan(Math.min(...vendorIndexes));
  });
});
