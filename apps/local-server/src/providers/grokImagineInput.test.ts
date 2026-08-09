import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { DEFAULT_GENERATION_CONFIG } from '../../../../constants';
import { buildGenerationTaskSpecFromRecipe } from '../../../../lib/recipeModules';
import { compileGrokImagineInput } from './grokImagineInput';

describe('compileGrokImagineInput', () => {
  it('compiles text-only work into one bounded image generation prompt', () => {
    const compiled = compileGrokImagineInput({
      id: 'job-grok-generate',
      workspaceId: 'workspace-1',
      providerId: 'grok',
      prompt: 'A small red paper boat at sunrise.',
      execution: { model: 'grok-4.5', reasoningEffort: 'low' },
    });

    expect(compiled).toMatchObject({
      providerId: 'grok',
      contractId: 'grok-imagine-cli-v1',
      task: 'image_generate',
      payloadKind: 'agent_cli_prompt',
      payload: {
        operation: 'image_generate',
        model: 'grok-4.5',
        reasoningEffort: 'low',
        assets: [],
      },
    });
    expect(compiled.payload.prompt).toContain('A small red paper boat');
  });

  it('uses image editing when a managed source image is present', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-grok-edit',
      task: 'image_edit',
      providerId: 'grok',
      prompt: 'Keep the composition and change the boat to blue.',
      assets: [
        {
          role: 'input',
          name: 'boat.webp',
          localPath: 'X:\\Studio Library\\references\\boat.webp',
          strength: 1,
        },
      ],
      output: { aspectRatio: '16:9' },
    });
    const compiled = compileGrokImagineInput({
      id: 'job-grok-edit',
      workspaceId: 'workspace-1',
      providerId: 'grok',
      sourceSpec,
      prompt: sourceSpec.prompt,
    });

    expect(compiled.payload.operation).toBe('image_edit');
    expect(compiled.payload.assets).toEqual([
      expect.objectContaining({
        role: 'input',
        localPath: 'X:\\Studio Library\\references\\boat.webp',
        hasInlineData: false,
      }),
    ]);
    expect(JSON.stringify(compiled)).not.toContain('data:image');
  });

  it('compiles the complete Styles recipe for Grok without leaking Codex execution values', () => {
    const sourceSpec = buildGenerationTaskSpecFromRecipe({
      id: 'spec-grok-styles',
      providerId: 'grok',
      config: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'A ceramic bird in a quiet studio.',
        recipeId: 'styles',
        recipeParams: {
          presetId: 'SP01-001',
          presetName: 'Studio Headshot + Film Noir',
          mode: 'CREATIVE_REIMAGINING',
          negativePrompt: 'watermark, muddy shadows',
          selectedStyles: [
            {
              slot: 1,
              presetId: 'SP01-001',
              presetName: 'Studio Headshot',
              packName: 'Photography & Realism',
              strength: 0.7,
            },
            {
              slot: 2,
              presetId: 'SP02-010',
              presetName: 'Film Noir',
              packName: 'Cinematic & Media',
              strength: 0.4,
            },
          ],
        },
        attachments: [
          {
            id: 'ref-1',
            name: 'bird.webp',
            dataUrl: 'http://127.0.0.1:4317/library/references/bird.webp',
            localPath: 'D:/AI-Studio-Library/references/bird.webp',
            strength: 0.15,
          },
        ],
        aspectRatio: '1:1',
        batchCount: 1,
      },
    });
    const compiled = compileGrokImagineInput({
      id: 'job-grok-styles',
      workspaceId: 'workspace-1',
      providerId: 'grok',
      prompt: sourceSpec.prompt,
      sourceSpec,
      execution: { model: 'grok-4.5', reasoningEffort: 'low' },
    });

    expect(compiled).toMatchObject({
      providerId: 'grok',
      task: 'image_generate',
      payload: {
        operation: 'image_edit',
        model: 'grok-4.5',
        reasoningEffort: 'low',
        assets: [
          {
            role: 'reference',
            name: 'bird.webp',
            localPath: 'D:/AI-Studio-Library/references/bird.webp',
            hasInlineData: false,
          },
        ],
      },
    });
    expect(compiled.payload.prompt).toContain('Recipe directives:');
    expect(compiled.payload.prompt).toContain('Studio Headshot');
    expect(compiled.payload.prompt).toContain('Film Noir');
    expect(compiled.payload.prompt).toContain('watermark, muddy shadows');
    expect(JSON.stringify(compiled.payload)).not.toContain(
      DEFAULT_GENERATION_CONFIG.executionModel,
    );
  });
});
