import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from './generationContracts';
import { collectGrokImagineJobIssues } from './grokImagineContract';

describe('collectGrokImagineJobIssues', () => {
  it('rejects a Grok job that has no Generation Task Spec', () => {
    expect(collectGrokImagineJobIssues({ sourceSpec: null })).toEqual([
      expect.objectContaining({
        code: 'missing_source_spec',
        field: 'sourceSpec',
      }),
    ]);
  });

  it('accepts a Home image job with a listed model and a supported ratio', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-home',
      task: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
      output: { count: 1, aspectRatio: '1:1' },
    });

    expect(
      collectGrokImagineJobIssues({
        sourceSpec,
        execution: { model: 'grok-4.6' },
        availableModels: ['grok-4.6', 'grok-4.5'],
      }),
    ).toEqual([]);
  });

  it('rejects an unsupported ratio before enqueue', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-ratio',
      task: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
      output: { count: 1, aspectRatio: '2:3' },
    });

    expect(
      collectGrokImagineJobIssues({
        sourceSpec,
        execution: { model: 'grok-4.6' },
        availableModels: ['grok-4.6'],
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'invalid_grok_aspect_ratio',
        field: 'sourceSpec.output.aspectRatio',
      }),
    ]);
  });

  it('rejects a missing model id instead of a listed grok-4.5 default', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-model',
      task: 'image_generate',
      providerId: 'grok',
      prompt: 'A red paper boat.',
    });

    expect(
      collectGrokImagineJobIssues({
        sourceSpec,
        execution: { model: 'grok-next-missing' },
        availableModels: ['grok-4.6', 'grok-4.5'],
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'unavailable_grok_model',
        field: 'execution.model',
      }),
    ]);
  });

  it('rejects a recipe that does not list Grok', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-camera',
      task: 'image_generate',
      providerId: 'grok',
      prompt: 'Orbit the subject.',
      recipeId: 'camera',
    });

    expect(collectGrokImagineJobIssues({ sourceSpec })).toEqual([
      expect.objectContaining({
        code: 'unsupported_grok_recipe',
        field: 'sourceSpec.recipeId',
      }),
    ]);
  });
});
