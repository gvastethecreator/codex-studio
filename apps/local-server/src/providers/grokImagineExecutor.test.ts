import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileGrokImagineInput } from './grokImagineInput';
import { createGrokImagineExecutor } from './grokImagineExecutor';
import type { ProviderRuntimePreflight } from './runtimeConfig';

const READY_PREFLIGHT: ProviderRuntimePreflight = {
  providerId: 'grok',
  runtimeKind: 'agent_cli',
  secretState: 'not_required',
  secretSource: null,
  localRuntimeState: 'configured',
  localRuntimeSource: 'grok',
  canAttemptExecution: true,
  diagnostics: [],
};

const READY_RUNTIME = {
  status: 'ready' as const,
  canRunJobs: true,
  checkedAt: '2026-08-08T00:00:00.000Z',
  selectedExecutable: 'grok',
  selectedVersion: 'grok 1.0.0',
  selectedVersionNumber: '1.0.0',
  defaultModel: 'grok-4.5',
  availableModels: ['grok-4.5'],
  headlessSupported: true,
  imagineAvailable: true,
  recommendedAction: 'Grok Imagine is ready.',
  issues: [],
  candidates: [],
};

describe('createGrokImagineExecutor', () => {
  it('runs one bounded local CLI session and copies exactly one image into the Job Library', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-executor-'));
    const libraryRoot = path.join(root, 'library');
    const grokHome = path.join(root, 'grok-home');
    mkdirSync(libraryRoot, { recursive: true });
    let observedPrompt = '';
    let observedArgs: string[] = [];

    try {
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-1',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: 'A clean geometric red paper boat on calm water.',
        execution: { model: 'grok-4.5', reasoningEffort: 'low' },
      });
      const executor = createGrokImagineExecutor({
        env: {},
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveExecutable: () => 'grok',
        resolveGrokHome: () => grokHome,
        resolveDefaultLibraryPath: (...segments) => path.join(libraryRoot, ...segments),
        createSessionId: () => '123e4567-e89b-42d3-a456-426614174000',
        now: () => 1_000,
        runCli: async ({ args, cwd }) => {
          observedArgs = args;
          const promptIndex = args.indexOf('--prompt-file');
          observedPrompt = readFileSync(args[promptIndex + 1]!, 'utf8');
          const sessionIndex = args.indexOf('--session-id');
          const sessionId = args[sessionIndex + 1]!;
          const imagesDirectory = path.join(
            grokHome,
            'sessions',
            encodeURIComponent(cwd),
            sessionId,
            'images',
          );
          mkdirSync(imagesDirectory, { recursive: true });
          writeFileSync(path.join(imagesDirectory, 'generated.webp'), 'fake-image');
          return {
            status: 0,
            stdout: JSON.stringify({ stopReason: 'end_turn', sessionId, text: 'Done.' }),
            stderr: '',
          };
        },
      });

      const result = await executor({
        providerId: 'grok',
        preflight: READY_PREFLIGHT,
        compiledInput,
        job: {
          id: 'job-grok-1',
          workspaceId: 'workspace-1',
          libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
          providerId: 'grok',
          prompt: 'A clean geometric red paper boat on calm water.',
          execution: { model: 'grok-4.5', reasoningEffort: 'low' },
        },
      });

      expect(observedArgs).toEqual(
        expect.arrayContaining([
          '--no-auto-update',
          '--tools',
          'image_gen',
          '--sandbox',
          'strict',
          '--no-memory',
          '--disable-web-search',
          '--no-subagents',
        ]),
      );
      expect(observedArgs.join(' ')).not.toContain('red paper boat');
      expect(observedPrompt).toContain('Use image_gen exactly once');
      expect(result.assets).toHaveLength(1);
      expect(existsSync(result.assets[0]!.sourcePath)).toBe(true);
      const transcript = readFileSync(result.transcript, 'utf8');
      expect(transcript).toContain('"runtimeKind": "agent_cli"');
      expect(transcript).not.toContain('red paper boat');
      expect(transcript).not.toContain('XAI_API_KEY');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects unresolved remote edit assets before invoking a billable media call', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-preflight-'));
    let runCount = 0;
    try {
      const sourceSpec = createGenerationTaskSpec({
        id: 'spec-grok-edit',
        task: 'image_edit',
        providerId: 'grok',
        prompt: 'Make the boat blue.',
        assets: [
          {
            role: 'input',
            name: 'remote.webp',
            sourceUrl: 'https://example.com/remote.webp',
          },
        ],
      });
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-edit',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: sourceSpec.prompt,
        sourceSpec,
        execution: { model: 'grok-4.5', reasoningEffort: 'low' },
      });
      const executor = createGrokImagineExecutor({
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveGrokHome: () => path.join(root, 'grok-home'),
        runCli: async () => {
          runCount += 1;
          return { status: 1, stdout: '', stderr: '' };
        },
      });

      await expect(
        executor({
          providerId: 'grok',
          preflight: READY_PREFLIGHT,
          compiledInput,
          job: {
            id: 'job-grok-edit',
            workspaceId: 'workspace-1',
            libraryContext: { libraryId: 'library-1', rootPath: root },
            providerId: 'grok',
            prompt: sourceSpec.prompt,
            sourceSpec,
          },
        }),
      ).rejects.toThrow('must be imported into the Studio Library');
      expect(runCount).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('runs managed Styles editing with all five supported reference images', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-edit-'));
    const libraryRoot = path.join(root, 'library');
    const grokHome = path.join(root, 'grok-home');
    mkdirSync(libraryRoot, { recursive: true });
    const sourcePaths = Array.from({ length: 5 }, (_, index) => {
      const sourcePath = path.join(libraryRoot, 'references', `style-${index + 1}.png`);
      mkdirSync(path.dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, `source-${index + 1}`);
      return sourcePath;
    });
    let observedPrompt = '';
    let observedArgs: string[] = [];
    let runCount = 0;

    try {
      const sourceSpec = createGenerationTaskSpec({
        id: 'spec-grok-managed-edit',
        task: 'image_generate',
        providerId: 'grok',
        prompt: 'Blend the selected visual styles while preserving the ceramic bird.',
        recipeId: 'styles',
        assets: sourcePaths.map((localPath, index) => ({
          role: 'reference' as const,
          name: `style-${index + 1}.png`,
          localPath,
          strength: 0.15,
        })),
        output: { count: 1, aspectRatio: '1:1' },
      });
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-managed-edit',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: sourceSpec.prompt,
        sourceSpec,
        execution: { model: 'grok-4.5', reasoningEffort: 'low' },
      });
      const executor = createGrokImagineExecutor({
        env: {},
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveExecutable: () => 'grok',
        resolveGrokHome: () => grokHome,
        resolveDefaultLibraryPath: (...segments) => path.join(libraryRoot, ...segments),
        createSessionId: () => '123e4567-e89b-42d3-a456-426614174001',
        now: () => 2_000,
        runCli: async ({ args, cwd }) => {
          runCount += 1;
          observedArgs = args;
          const promptIndex = args.indexOf('--prompt-file');
          observedPrompt = readFileSync(args[promptIndex + 1]!, 'utf8');
          const sessionIndex = args.indexOf('--session-id');
          const sessionId = args[sessionIndex + 1]!;
          const imagesDirectory = path.join(
            grokHome,
            'sessions',
            encodeURIComponent(cwd),
            sessionId,
            'images',
          );
          mkdirSync(imagesDirectory, { recursive: true });
          writeFileSync(path.join(imagesDirectory, 'edited.webp'), 'fake-edited-image');
          return {
            status: 0,
            stdout: JSON.stringify({ stopReason: 'end_turn', sessionId, text: 'Done.' }),
            stderr: '',
          };
        },
      });

      const result = await executor({
        providerId: 'grok',
        preflight: READY_PREFLIGHT,
        compiledInput,
        job: {
          id: 'job-grok-managed-edit',
          workspaceId: 'workspace-1',
          libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
          providerId: 'grok',
          prompt: sourceSpec.prompt,
          sourceSpec,
          execution: { model: 'grok-4.5', reasoningEffort: 'low' },
        },
      });

      expect(runCount).toBe(1);
      expect(observedArgs).toEqual(expect.arrayContaining(['--tools', 'image_edit']));
      expect(observedPrompt).toContain('Use image_edit exactly once');
      for (const sourcePath of sourcePaths) expect(observedPrompt).toContain(sourcePath);
      expect(result.assets).toHaveLength(1);
      expect(existsSync(result.assets[0]!.sourcePath)).toBe(true);
      expect(readFileSync(result.transcript, 'utf8')).toContain('"sourceAssetCount": 5');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects a sixth managed source image before invoking Grok Build', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-source-limit-'));
    const libraryRoot = path.join(root, 'library');
    mkdirSync(libraryRoot, { recursive: true });
    const assets = Array.from({ length: 6 }, (_, index) => {
      const localPath = path.join(libraryRoot, 'references', `source-${index + 1}.png`);
      mkdirSync(path.dirname(localPath), { recursive: true });
      writeFileSync(localPath, `source-${index + 1}`);
      return { role: 'reference' as const, name: path.basename(localPath), localPath };
    });
    let runCount = 0;

    try {
      const sourceSpec = createGenerationTaskSpec({
        id: 'spec-grok-source-limit',
        task: 'image_generate',
        providerId: 'grok',
        prompt: 'Blend these references.',
        assets,
      });
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-source-limit',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: sourceSpec.prompt,
        sourceSpec,
        execution: { model: 'grok-4.5', reasoningEffort: 'low' },
      });
      const executor = createGrokImagineExecutor({
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveGrokHome: () => path.join(root, 'grok-home'),
        runCli: async () => {
          runCount += 1;
          return { status: 1, stdout: '', stderr: '' };
        },
      });

      await expect(
        executor({
          providerId: 'grok',
          preflight: READY_PREFLIGHT,
          compiledInput,
          job: {
            id: 'job-grok-source-limit',
            workspaceId: 'workspace-1',
            libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
            providerId: 'grok',
            prompt: sourceSpec.prompt,
            sourceSpec,
          },
        }),
      ).rejects.toThrow('at most 5 managed source images');
      expect(runCount).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects an unsupported aspect ratio before invoking a billable media call', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-ratio-'));
    let runCount = 0;
    try {
      const sourceSpec = createGenerationTaskSpec({
        id: 'spec-grok-ratio',
        task: 'image_generate',
        providerId: 'grok',
        prompt: 'A ceramic bird.',
        output: { count: 1, aspectRatio: '2:3' },
      });
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-ratio',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: sourceSpec.prompt,
        sourceSpec,
        execution: { model: 'grok-4.5', reasoningEffort: 'low' },
      });
      const executor = createGrokImagineExecutor({
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveGrokHome: () => path.join(root, 'grok-home'),
        runCli: async () => {
          runCount += 1;
          return { status: 1, stdout: '', stderr: '' };
        },
      });

      await expect(
        executor({
          providerId: 'grok',
          preflight: READY_PREFLIGHT,
          compiledInput,
          job: {
            id: 'job-grok-ratio',
            workspaceId: 'workspace-1',
            libraryContext: { libraryId: 'library-1', rootPath: root },
            providerId: 'grok',
            prompt: sourceSpec.prompt,
            sourceSpec,
          },
        }),
      ).rejects.toThrow('does not support aspect ratio "2:3"');
      expect(runCount).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('omits --model when the compiled job has no explicit Grok model', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-grok-default-model-'));
    const libraryRoot = path.join(root, 'library');
    const grokHome = path.join(root, 'grok-home');
    mkdirSync(libraryRoot, { recursive: true });
    let observedArgs: string[] = [];

    try {
      const compiledInput = compileGrokImagineInput({
        id: 'job-grok-default-model',
        workspaceId: 'workspace-1',
        providerId: 'grok',
        prompt: 'A clean geometric red paper boat on calm water.',
      });
      const executor = createGrokImagineExecutor({
        env: {},
        readRuntimeDoctor: () => READY_RUNTIME,
        resolveExecutable: () => 'grok',
        resolveGrokHome: () => grokHome,
        resolveDefaultLibraryPath: (...segments) => path.join(libraryRoot, ...segments),
        createSessionId: () => '123e4567-e89b-42d3-a456-426614174002',
        now: () => 3_000,
        runCli: async ({ args, cwd }) => {
          observedArgs = args;
          const sessionIndex = args.indexOf('--session-id');
          const sessionId = args[sessionIndex + 1]!;
          const imagesDirectory = path.join(
            grokHome,
            'sessions',
            encodeURIComponent(cwd),
            sessionId,
            'images',
          );
          mkdirSync(imagesDirectory, { recursive: true });
          writeFileSync(path.join(imagesDirectory, 'generated.webp'), 'fake-image');
          return {
            status: 0,
            stdout: JSON.stringify({ stopReason: 'end_turn', sessionId, text: 'Done.' }),
            stderr: '',
          };
        },
      });

      await executor({
        providerId: 'grok',
        preflight: READY_PREFLIGHT,
        compiledInput,
        job: {
          id: 'job-grok-default-model',
          workspaceId: 'workspace-1',
          libraryContext: { libraryId: 'library-1', rootPath: libraryRoot },
          providerId: 'grok',
          prompt: 'A clean geometric red paper boat on calm water.',
        },
      });

      expect(observedArgs).not.toContain('--model');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
