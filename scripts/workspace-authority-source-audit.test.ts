import { describe, expect, it } from 'vite-plus/test';

import { containsRetiredProjectContract } from './workspace-authority-source-audit-rules';

describe('workspace authority source audit', () => {
  it('detects retired Project contracts regardless of casing', () => {
    expect(containsRetiredProjectContract("type: 'project.created'")).toBe(true);
    expect(containsRetiredProjectContract('projectId?: string')).toBe(true);
    expect(containsRetiredProjectContract('PROJECT_ID TEXT')).toBe(true);
    expect(containsRetiredProjectContract('fetch("/API/PROJECTS")')).toBe(true);
  });

  it('allows unrelated projection terminology', () => {
    expect(containsRetiredProjectContract('buildWorkspaceProjection()')).toBe(false);
  });
});
