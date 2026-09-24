import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// The helper uses only standard Node APIs and is also invocable through Bun.
describe('style curation agent kit', () => {
  it('covers the live catalogue and rejects invalid execution reports', () => {
    const result = JSON.parse(
      execFileSync(process.execPath, ['scripts/style-curation/agent-kit.mjs', 'self-test'], {
        encoding: 'utf8',
        timeout: 30000,
      }),
    );
    expect(result.status).toBe('passed');
    expect(result.categories).toBeGreaterThanOrEqual(121);
    expect(result.sampledPlaybooks).toBe(result.playbooks);
    expect(result.checks).toBeGreaterThan(result.playbooks);
    expect(result.examples).toBeGreaterThanOrEqual(12);
  });
});
