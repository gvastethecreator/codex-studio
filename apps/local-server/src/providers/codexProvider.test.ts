import { describe, expect, it } from 'vite-plus/test';

import {
  createGenerationTaskSpec,
  createRecipeProviderDirectives,
} from '../../../../packages/shared/src';
import { compileCodexImagegenInput, createCodexGenerationProvider } from './codexProvider';
import type { CodexTurn, TurnParams, TurnResult } from '../codex/turn';

function createTurnResult(overrides: Partial<TurnResult> = {}): TurnResult {
  return {
    assets: [],
    transcript: 'transcripts/job-1/events.jsonl',
    turnId: 'turn-1',
    threadId: 'thread-1',
    durationMs: 25,
    ...overrides,
  };
}

describe('codexProvider', () => {
  it('compiles a compact Codex provider input from the job delta', () => {
    const compiled = compileCodexImagegenInput({
      id: 'job-1',
      projectId: 'project-1',
      prompt: 'Prompt:\nsmall brass key\n\nAspect ratio: 2:3',
      execution: null,
    });

    expect(compiled.providerId).toBe('codex');
    expect(compiled.payloadKind).toBe('codex_prompt');
    expect(compiled.task).toBe('image_generate');
    expect(compiled.audit.omittedStableInstructions).toBe(true);
    expect(compiled.payload.text).toContain('Task: image_generate');
    expect(compiled.payload.text).toContain('small brass key');
    expect(compiled.payload.text).not.toContain('Generate exactly one portrait image');
  });

  it('compiles from the durable source Generation Task Spec when present', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'style_preset_card',
      providerId: 'codex',
      prompt: 'glass owl on a plinth',
      negativePrompt: 'text, watermark',
      recipeId: 'styles',
      recipeParams: { presetId: 'SP09-006' },
      stylePresetId: 'SP09-006',
      output: {
        aspectRatio: '2:3',
        imageSize: '1024x1536',
      },
    });

    const compiled = compileCodexImagegenInput({
      id: 'job-1',
      projectId: 'project-1',
      prompt: 'Prompt text after reference processing',
      execution: null,
      providerId: 'codex',
      sourceSpec,
    });

    expect(compiled.sourceSpecId).toBe('spec-1');
    expect(compiled.task).toBe('style_preset_card');
    expect(compiled.payload.text).toContain('Task: style_preset_card');
    expect(compiled.payload.text).toContain('glass owl on a plinth');
    expect(compiled.payload.text).toContain('Avoid:');
    expect(compiled.payload.text).toContain('text, watermark');
    expect(compiled.payload.text).toContain('Style preset: SP09-006');
    expect(compiled.payload.text).not.toContain('Prompt text after reference processing');
  });

  it('prefers compact recipe provider directives over legacy Recipe Context text', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-style',
      task: 'style_preset_card',
      providerId: 'codex',
      prompt: 'glass owl on a plinth',
      recipeId: 'styles',
      recipeParams: { presetId: 'SP09-006' },
      metadata: {
        recipeContext: 'legacy context should stay out of compiled text',
        recipeProviderDirectives: createRecipeProviderDirectives({
          recipeId: 'styles',
          title: 'Styles',
          sections: [
            {
              title: 'Visual DNA',
              directives: [{ label: 'Core Aesthetic', value: 'polished glass' }],
            },
          ],
        }),
      },
    });

    const compiled = compileCodexImagegenInput({
      id: 'job-style',
      projectId: 'project-1',
      prompt: 'unused fallback prompt',
      execution: null,
      sourceSpec,
    });

    expect(compiled.payload.text).toContain('Recipe directives:');
    expect(compiled.payload.text).toContain('- Core Aesthetic: polished glass');
    expect(compiled.payload.text).not.toContain('legacy context should stay out');
  });

  it('includes persisted local asset paths from the durable Generation Task Spec', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-refs',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'Create a dramatic cinematic frame.',
      assets: [
        {
          role: 'input',
          name: 'source.png',
          localPath: 'D:/AI-Studio-Library/references/job-1/source.png',
          strength: 1,
        },
        {
          role: 'reference',
          name: 'moodboard.png',
          localPath: 'D:/AI-Studio-Library/references/job-1/moodboard.png',
          strength: 0.4,
        },
      ],
    });

    const compiled = compileCodexImagegenInput({
      id: 'job-refs',
      projectId: 'project-1',
      prompt: 'Prompt text after backend reference persistence',
      execution: null,
      sourceSpec,
    });

    expect(compiled.payload.text).toContain('Local assets:');
    expect(compiled.payload.text).toContain('Input image file: D:/AI-Studio-Library/references/job-1/source.png');
    expect(compiled.payload.text).toContain(
      'Reference image file: D:/AI-Studio-Library/references/job-1/moodboard.png (moodboard.png, strength 0.40)',
    );
  });

  it('delegates execution to the Codex Product Runtime with compiled input text', async () => {
    const calls: TurnParams[] = [];
    const turn: CodexTurn = {
      async runTurn(params) {
        calls.push(params);
        return createTurnResult({
          assets: [{ type: 'file', sourcePath: 'out.png', mimeType: 'image/png' }],
        });
      },
    };
    const provider = createCodexGenerationProvider({ turn });

    const result = await provider.run({
      id: 'job-2',
      projectId: 'project-1',
      prompt: 'Prompt:\nsmall brass key',
      execution: null,
    });

    expect(result.assets).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      jobId: 'job-2',
      projectId: 'project-1',
      prompt: 'Prompt:\nsmall brass key',
    });
    expect(calls[0].compiledInput?.payload.text).toContain('Task: image_generate');
  });
});
