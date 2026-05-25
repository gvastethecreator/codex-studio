import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileProviderInputForJob, hasProviderInputCompiler } from './providerInputCompiler';

describe('providerInputCompiler', () => {
  it('compiles built-in providers through one registry seam', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'texture_generate',
      providerId: 'comfy',
      prompt: 'procedural marble tile texture',
    });

    const compiled = compileProviderInputForJob('comfy', {
      id: 'job-1',
      projectId: 'project-1',
      providerId: 'comfy',
      prompt: 'fallback',
      execution: null,
      sourceSpec,
    });

    expect(compiled.providerId).toBe('comfy');
    expect(compiled.sourceSpecId).toBe('spec-1');
    expect(compiled.payloadKind).toBe('comfy_workflow');
  });

  it('reports missing compilers for custom providers', () => {
    expect(hasProviderInputCompiler('custom-provider')).toBe(false);
    expect(() =>
      compileProviderInputForJob('custom-provider', {
        id: 'job-1',
        projectId: 'project-1',
        providerId: 'custom-provider',
        prompt: 'custom provider prompt',
        execution: null,
      }),
    ).toThrow('No provider input compiler registered for "custom-provider".');
  });
});
