import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileDryRunInput } from './dryRunProvider';

describe('dryRunProvider', () => {
  it('compiles a provider input fixture without Codex or hosted API payloads', () => {
    const compiled = compileDryRunInput({
      id: 'job-1',
      projectId: 'project-1',
      providerId: 'dry_run',
      prompt: 'A local pipeline placeholder image',
      execution: null,
    });

    expect(compiled.providerId).toBe('dry_run');
    expect(compiled.payloadKind).toBe('dry_run');
    expect(compiled.contractId).toBe('dry-run-v1');
    expect(compiled.task).toBe('image_generate');
    expect(compiled.audit.omittedStableInstructions).toBe(true);
    expect(compiled.payload).toEqual({
      assetKind: 'svg_placeholder',
      promptPreview: 'A local pipeline placeholder image',
    });
  });

  it('preserves durable Generation Task Spec identity for adapter conformance tests', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'texture_generate',
      providerId: 'dry_run',
      prompt: 'seamless hammered brass material',
      output: {
        aspectRatio: '1:1',
        imageSize: '1024x1024',
      },
      metadata: {
        recipeId: 'materials',
      },
    });

    const compiled = compileDryRunInput({
      id: 'job-1',
      projectId: 'project-1',
      providerId: 'dry_run',
      prompt: 'fallback prompt',
      execution: null,
      sourceSpec,
    });

    expect(compiled.sourceSpecId).toBe('spec-1');
    expect(compiled.task).toBe('texture_generate');
    expect(compiled.payload.promptPreview).toBe('seamless hammered brass material');
  });
});
