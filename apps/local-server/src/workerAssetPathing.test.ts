import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createDefaultEditableStudioSettings, type Job } from '../../../packages/shared/src';
import { createWorkerAssetPathing, inferGeneratedAssetMimeType } from './workerAssetPathing';

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: overrides.id ?? 'job-asset-pathing',
    workspaceId: overrides.workspaceId ?? 'default',
    kind: overrides.kind ?? 'image_generate',
    providerId: overrides.providerId ?? 'codex',
    sourceSpec: overrides.sourceSpec ?? null,
    status: overrides.status ?? 'queued',
    execution: overrides.execution ?? null,
    libraryContext: overrides.libraryContext ?? null,
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
      expect(organizedPath).toContain(`${path.sep}outputs${path.sep}default${path.sep}`);
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

  it('keeps an in-flight job on its captured Library root', () => {
    const bootstrapRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-bootstrap-library-'));
    const selectedRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-selected-library-'));

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
        resolveLibraryPath: (...segments: string[]) => path.join(bootstrapRoot, ...segments),
      });

      const target = pathing.resolveGeneratedAssetTargetPath(
        createJob({
          libraryContext: { libraryId: 'library-selected', rootPath: selectedRoot },
        }),
        'codex',
        '.png',
      );

      expect(path.relative(selectedRoot, target)).not.toMatch(/^\.\./);
      expect(path.relative(bootstrapRoot, target)).toMatch(/^\.\./);
    } finally {
      rmSync(bootstrapRoot, { recursive: true, force: true });
      rmSync(selectedRoot, { recursive: true, force: true });
    }
  });

  it('places a named Workspace job under outputs/<workspace-slug>/', () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-workspace-'));

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
        getWorkspace: (id) =>
          id === 'ws-pixel'
            ? { id: 'ws-pixel', name: 'Pixel Art' }
            : { id: 'default', name: 'Default' },
        listWorkspaces: () => [
          { id: 'default', name: 'Default' },
          { id: 'ws-pixel', name: 'Pixel Art' },
        ],
      });

      const target = pathing.resolveGeneratedAssetTargetPath(
        createJob({ workspaceId: 'ws-pixel' }),
        'codex',
        '.png',
      );

      expect(target).toContain(`${path.sep}outputs${path.sep}Pixel-Art${path.sep}`);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('does not use preferredOutputPath as the generate library root', () => {
    const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'worker-asset-library-root-'));
    const scanPath = path.join(tempRoot, 'external-scan');

    try {
      const settings = createDefaultEditableStudioSettings();
      settings.preferredOutputPath = scanPath;

      const pathing = createWorkerAssetPathing({
        resolveExecutionOptions: () => ({
          model: 'gpt-5.4-mini',
          reasoningEffort: 'medium',
          serviceTier: null,
        }),
        readEditableStudioSettings: () => settings,
        getSetting: () => null,
        setSetting: () => {},
        resolveLibraryPath: (...segments: string[]) => path.join(tempRoot, ...segments),
      });

      const job = createJob({
        libraryContext: { libraryId: 'library-selected', rootPath: tempRoot },
      });
      const target = pathing.resolveGeneratedAssetTargetPath(job, 'codex', '.png');

      expect(job.libraryContext?.rootPath).toBe(tempRoot);
      expect(job.libraryContext?.rootPath).not.toBe(scanPath);
      expect(path.relative(path.join(tempRoot, 'outputs'), target)).not.toMatch(/^\.\./);
      expect(target.includes('external-scan')).toBe(false);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('does not capture preferredOutputPath when creating a generate job library context', () => {
    const intake = readFileSync(
      fileURLToPath(new URL('./persistentJobIntake.ts', import.meta.url)),
      'utf8',
    );
    const factory = readFileSync(
      fileURLToPath(new URL('./appFactory.ts', import.meta.url)),
      'utf8',
    );
    expect(intake).not.toMatch(/preferredOutputPath/);
    expect(factory).not.toMatch(/preferredOutputPath/);
  });
});
