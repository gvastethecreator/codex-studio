import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

describe('localGenerationRun workspace authority', () => {
  it('creates jobs with workspaceId and never lists projects', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'services/localGenerationRun.ts'),
      'utf8',
    );
    expect(source).not.toContain('listProjects');
    expect(source).toContain('workspaceId');
    expect(source).toMatch(/createStudioJob\(\{[\s\S]*workspaceId/);
    expect(source).not.toMatch(/createStudioJob\(\{[\s\S]*projectId/);
  });
});
