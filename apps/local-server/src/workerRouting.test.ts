import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from '../../../packages/shared/src';
import { resolveWorkerRuntimeTarget } from './workerRouting';

describe('resolveWorkerRuntimeTarget', () => {
  it('routes Grok provider-independent image tasks through the external adapter boundary', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-1',
      task: 'image_generate',
      providerId: 'grok',
      prompt: 'A paper boat.',
    });
    expect(
      resolveWorkerRuntimeTarget({
        kind: 'image_generate',
        providerId: 'grok',
        sourceSpec,
      }),
    ).toBe('external');
  });
});
