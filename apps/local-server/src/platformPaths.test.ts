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
});
