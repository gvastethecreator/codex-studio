import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { compileAntigravityImageInput } from './antigravityImageInput';

describe('compileAntigravityImageInput', () => {
  it('compiles one text-only image generation turn', () => {
    const compiled = compileAntigravityImageInput({
      id: 'job-antigravity-generate',
      workspaceId: 'workspace-1',
      providerId: 'antigravity',
      prompt: 'A glass fox on a black table.',
      execution: { model: 'gemini-3.8-flash-low', reasoningEffort: 'low' },
    });

    expect(compiled).toMatchObject({
      providerId: 'antigravity',
      contractId: 'antigravity-image-cli-v1',
      task: 'image_generate',
      payloadKind: 'agent_cli_prompt',
      payload: {
        operation: 'image_generate',
        model: 'gemini-3.8-flash-low',
        reasoningEffort: 'low',
        assets: [],
      },
    });
  });

  it('uses image editing for a managed source and keeps inline bytes out', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-antigravity-edit',
      task: 'image_edit',
      providerId: 'antigravity',
      prompt: 'Change the fox from glass to polished brass.',
      assets: [
        {
          role: 'input',
          name: 'fox.png',
          localPath: 'D:/Studio Library/references/fox.png',
        },
      ],
    });
    const compiled = compileAntigravityImageInput({
      id: 'job-antigravity-edit',
      workspaceId: 'workspace-1',
      providerId: 'antigravity',
      prompt: sourceSpec.prompt,
      sourceSpec,
    });

    expect(compiled.payload.operation).toBe('image_edit');
    expect(compiled.payload.assets[0]).toMatchObject({
      role: 'input',
      localPath: 'D:/Studio Library/references/fox.png',
      hasInlineData: false,
    });
    expect(JSON.stringify(compiled)).not.toContain('data:image');
  });
});
