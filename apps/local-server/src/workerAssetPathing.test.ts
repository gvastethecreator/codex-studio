import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { createDefaultEditableStudioSettings, type Job } from '../../../packages/shared/src';
import { createWorkerAssetPathing, inferGeneratedAssetMimeType } from './workerAssetPathing';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-asset-pathing',
    projectId: overrides.projectId ?? 'project-1',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    originalPrompt: overrides.originalPrompt ?? 'prompt',
    expandedPrompt: overrides.expandedPrompt ?? null,
    finalPromptUsed: overrides.finalPromptUsed ?? 'prompt',
    error: overrides.error ?? null,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    completedAt: overrides.completedAt ?? null,
  };
}

describe('workerAssetPathing', () => {
  it('infers generated asset mime type from extension', () => {
    expect(inferGeneratedAssetMimeType('x.png')).toBe('image/png');
    expect(inferGeneratedAssetMimeType('x.jpg')).toBe('image/jpeg');
    expect(inferGeneratedAssetMimeType('x.jpeg')).toBe('image/jpeg');
    expect(inferGeneratedAssetMimeType('x.webp')).toBe('image/webp');
    expect(inferGeneratedAssetMimeType('x.svg')).toBe('image/svg+xml');
  });

  it('organizes discovered files into output paths and keeps bytes intact', () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-pathing-'));

    try {
      const pathing = createWorkerAssetPathing({
        resolveExecutionOptions: () => ({
          model: 'gpt-5.4-mini',
          reasoningEffort: 'medium',
          serviceTier: null,
        }),
        readEditableStudioSettings: () => createDefaultEditableStudioSettings(),
        getSetting: () => null,
        setSetting: () => {},
        resolveLibraryPath: (...segments: string[]) => path.join(tempRoot, ...segments),
      });

      const sourcePath = path.join(tempRoot, 'incoming', 'image.png');
      mkdirSync(path.dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, 'pixel-data', 'utf8');

      const job = createJob();
      const organizedPath = pathing.organizeGeneratedAssetPath(job, sourcePath, 'codex');

      expect(organizedPath).not.toBe(sourcePath);
      expect(organizedPath).toContain(`${path.sep}outputs${path.sep}`);
      expect(existsSync(organizedPath)).toBe(true);
      expect(existsSync(sourcePath)).toBe(false);
      expect(readFileSync(organizedPath, 'utf8')).toBe('pixel-data');
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('resolves unique target paths when the generated path is already taken', () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-pathing-unique-'));
    const fixedTarget = path.join(tempRoot, 'outputs', 'fixed-file.png');

    try {
      const pathing = createWorkerAssetPathing({
        resolveExecutionOptions: () => ({
          model: 'gpt-5.4-mini',
          reasoningEffort: 'medium',
          serviceTier: null,
        }),
        readEditableStudioSettings: () => createDefaultEditableStudioSettings(),
        getSetting: () => null,
        setSetting: () => {},
        resolveLibraryPath: () => fixedTarget,
      });

      mkdirSync(path.dirname(fixedTarget), { recursive: true });
      writeFileSync(fixedTarget, 'occupied', 'utf8');

      const resolved = pathing.resolveGeneratedAssetTargetPath(createJob(), 'codex', '.png');
      expect(resolved).not.toBe(fixedTarget);
      expect(path.basename(resolved)).toBe('fixed-file-2.png');
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
