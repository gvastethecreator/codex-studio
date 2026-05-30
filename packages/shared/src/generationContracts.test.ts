import { describe, expect, it } from 'vite-plus/test';

import {
  createCompiledProviderInput,
  createProviderInputMetrics,
  createGenerationTaskSpec,
  createProviderSessionContract,
  isBuiltInGenerationProvider,
  isGenerationTaskKind,
  validateGenerationTaskSpec,
} from './generationContracts';

describe('generationContracts', () => {
  it('creates a provider-independent Generation Task Spec with durable output defaults', () => {
    const spec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'style_preset_card',
      prompt: 'museum pedestal with carved glass object',
      negativePrompt: 'text, watermark',
      recipeId: 'styles',
      recipeParams: { presetId: 'SP09-006' },
      stylePresetId: 'SP09-006',
      output: {
        aspectRatio: '2:3',
        imageSize: '1024x1536',
      },
    });

    expect(spec).toMatchObject({
      id: 'spec-1',
      version: 'generation-task-spec/v1',
      task: 'style_preset_card',
      prompt: 'museum pedestal with carved glass object',
      negativePrompt: 'text, watermark',
      recipeId: 'styles',
      recipeParams: { presetId: 'SP09-006' },
      stylePresetId: 'SP09-006',
      output: {
        count: 1,
        aspectRatio: '2:3',
        imageSize: '1024x1536',
        requiresLocalAsset: true,
        requiresCatalogEntry: true,
        requiresExactPath: true,
      },
    });
  });

  it('keeps stable provider rules in Provider Session Contract and job delta in Compiled Provider Input', () => {
    const spec = createGenerationTaskSpec({
      id: 'spec-2',
      task: 'image_generate',
      prompt: 'small brass key on velvet cloth',
    });
    const contract = createProviderSessionContract({
      id: 'codex-imagegen-v1',
      providerId: 'codex',
      stableInstructions: [
        'Generate exactly one image.',
        'Expose exact local file path for import.',
      ],
      outputRules: ['No text, labels, logos, or watermark.'],
    });

    const input = createCompiledProviderInput({
      providerId: 'codex',
      contract,
      sourceSpec: spec,
      payloadKind: 'codex_prompt',
      payload: {
        text: 'Task: image_generate\nPrompt: small brass key on velvet cloth',
      },
      estimatedPromptChars: 62,
    });

    expect(input).toMatchObject({
      providerId: 'codex',
      contractId: 'codex-imagegen-v1',
      sourceSpecId: 'spec-2',
      task: 'image_generate',
      payloadKind: 'codex_prompt',
      audit: {
        compact: true,
        omittedStableInstructions: true,
        estimatedPromptChars: 62,
      },
    });
    expect(input.payload).toEqual({
      text: 'Task: image_generate\nPrompt: small brass key on velvet cloth',
    });
  });

  it('recognizes built-in providers while allowing future provider ids', () => {
    expect(isBuiltInGenerationProvider('codex')).toBe(true);
    expect(isBuiltInGenerationProvider('fal')).toBe(true);
    expect(isBuiltInGenerationProvider('local-experiment')).toBe(false);
  });

  it('recognizes supported Generation Task kinds for worker routing', () => {
    expect(isGenerationTaskKind('image_generate')).toBe(true);
    expect(isGenerationTaskKind('image_edit')).toBe(true);
    expect(isGenerationTaskKind('style_preset_card')).toBe(true);
    expect(isGenerationTaskKind('sprite_sheet')).toBe(true);
    expect(isGenerationTaskKind('texture_generate')).toBe(true);
    expect(isGenerationTaskKind('codex_imagegen')).toBe(false);
    expect(isGenerationTaskKind('future_vendor_task')).toBe(false);
  });

  it('validates local queued Generation Task Spec ids and hydrated assets', () => {
    const validSpec = createGenerationTaskSpec({
      id: 'spec-batch-1234-abcd-0-5678',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'small brass key on velvet cloth',
      assets: [
        {
          role: 'reference',
          name: 'reference.png',
          localPath: 'D:/AI-Studio-Library/.studio/references/job-1/reference.png',
        },
      ],
      metadata: {
        batchId: 'batch-1234-abcd',
      },
    });

    expect(
      validateGenerationTaskSpec(validSpec, {
        requireLocalRunIds: true,
        requireHydratedAssets: true,
      }),
    ).toEqual([]);

    const invalidSpec = {
      ...validSpec,
      id: '1234-abcd',
      metadata: { batchId: '1234-abcd' },
      assets: [
        {
          role: 'reference' as const,
          name: 'inline.png',
          dataUrl: 'data:image/png;base64,AAAA',
        },
      ],
    };

    expect(
      validateGenerationTaskSpec(invalidSpec, {
        requireLocalRunIds: true,
        requireHydratedAssets: true,
      }).map((issue) => issue.code),
    ).toEqual(['invalid_spec_id', 'invalid_batch_id', 'inline_asset_not_hydrated']);
  });

  it('rejects source specs routed through a different provider id', () => {
    const spec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'small brass key on velvet cloth',
    });

    expect(
      validateGenerationTaskSpec(spec, { expectedProviderId: 'google' }).map((issue) => issue.code),
    ).toEqual(['invalid_provider']);
  });

  it('summarizes safe provider input metrics without reading payload internals', () => {
    const spec = createGenerationTaskSpec({
      id: 'spec-metrics',
      task: 'image_generate',
      prompt: 'small brass key on velvet cloth',
      assets: [{ role: 'reference', name: 'ref.png', localPath: 'D:/ref.png' }],
    });
    const contract = createProviderSessionContract({
      id: 'codex-imagegen-v1',
      providerId: 'codex',
    });
    const compiled = createCompiledProviderInput({
      providerId: 'codex',
      contract,
      sourceSpec: spec,
      payloadKind: 'codex_prompt',
      payload: { text: 'Prompt: small brass key on velvet cloth' },
      estimatedPromptChars: 39,
    });

    expect(createProviderInputMetrics(spec, compiled)).toMatchObject({
      sourceSpecChars: expect.any(Number),
      compiledInputChars: expect.any(Number),
      compiledPayloadChars: expect.any(Number),
      estimatedPromptChars: 39,
      assetRefCount: 1,
      inlineAssetBytesPresent: false,
      providerSessionContractId: 'codex-imagegen-v1',
    });
  });
});
