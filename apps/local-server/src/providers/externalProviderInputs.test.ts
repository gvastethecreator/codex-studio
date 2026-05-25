import { describe, expect, it } from 'vite-plus/test';

import {
  createGenerationTaskSpec,
  createRecipeProviderDirectives,
} from '../../../../packages/shared/src';
import {
  compileComfyWorkflowInput,
  compileFalImageApiInput,
  compileGoogleImageApiInput,
} from './externalProviderInputs';

describe('external provider input compilers', () => {
  it('compiles Google hosted API input from the durable Generation Task Spec', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-google-1',
      task: 'image_edit',
      providerId: 'google',
      prompt: 'replace the background with brushed steel',
      negativePrompt: 'text, watermark',
      recipeId: 'image_to_image',
      stylePresetId: 'SP03-010',
      assets: [
        {
          role: 'input',
          name: 'source.png',
          dataUrl: 'data:image/png;base64,SECRET_INLINE_IMAGE',
          localPath: 'D:/images/source.png',
          strength: 0.65,
        },
      ],
      output: {
        aspectRatio: '1:1',
        imageSize: '1024x1024',
      },
    });

    const compiled = compileGoogleImageApiInput({
      id: 'job-1',
      projectId: 'project-1',
      providerId: 'google',
      prompt: 'fallback prompt that should not be compiled',
      execution: { model: 'nano-banana-image', reasoningEffort: 'minimal' },
      sourceSpec,
    });

    expect(compiled.providerId).toBe('google');
    expect(compiled.contractId).toBe('google-image-api-v1');
    expect(compiled.payloadKind).toBe('api_request');
    expect(compiled.sourceSpecId).toBe('spec-google-1');
    expect(compiled.task).toBe('image_edit');
    expect(compiled.audit.omittedStableInstructions).toBe(true);
    expect(compiled.payload).toMatchObject({
      apiFamily: 'google_image',
      model: 'nano-banana-image',
      prompt: 'replace the background with brushed steel',
      negativePrompt: 'text, watermark',
      metadata: {
        recipeId: 'image_to_image',
        stylePresetId: 'SP03-010',
        sourceProviderId: 'google',
        hasRecipeProviderDirectives: false,
      },
    });
    expect(compiled.payload.prompt).not.toContain('fallback prompt');
    expect(compiled.payload.assets).toEqual([
      {
        role: 'input',
        name: 'source.png',
        catalogId: null,
        localPath: 'D:/images/source.png',
        sourceUrl: null,
        strength: 0.65,
        hasInlineData: true,
      },
    ]);
    expect(JSON.stringify(compiled.payload)).not.toContain('SECRET_INLINE_IMAGE');
  });

  it('compiles fal hosted API input without Provider Secrets', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-fal-1',
      task: 'sprite_sheet',
      providerId: 'fal',
      prompt: 'eight-frame idle animation for a brass automaton',
      metadata: {
        providerSecret: 'FAL_API_KEY_SHOULD_NOT_LEAK',
      },
    });

    const compiled = compileFalImageApiInput({
      id: 'job-2',
      projectId: 'project-1',
      providerId: 'fal',
      prompt: 'fallback',
      execution: { model: 'fal-ai/fast-sdxl', reasoningEffort: 'minimal' },
      sourceSpec,
    });

    expect(compiled.providerId).toBe('fal');
    expect(compiled.contractId).toBe('fal-image-api-v1');
    expect(compiled.payloadKind).toBe('api_request');
    expect(compiled.task).toBe('sprite_sheet');
    expect(compiled.payload.apiFamily).toBe('fal_image');
    expect(compiled.payload.prompt).toBe('eight-frame idle animation for a brass automaton');
    expect(compiled.audit.estimatedPromptChars).toBe(compiled.payload.prompt.length);
    expect(JSON.stringify(compiled)).not.toContain('FAL_API_KEY_SHOULD_NOT_LEAK');
  });

  it('passes compact recipe provider directives into hosted API prompts when available', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-google-style',
      task: 'style_preset_card',
      providerId: 'google',
      prompt: 'glass owl on a plinth',
      recipeId: 'styles',
      stylePresetId: 'SP09-006',
      metadata: {
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

    const compiled = compileGoogleImageApiInput({
      id: 'job-style',
      projectId: 'project-1',
      providerId: 'google',
      prompt: 'fallback',
      execution: null,
      sourceSpec,
    });

    expect(compiled.payload.prompt).toContain('glass owl on a plinth');
    expect(compiled.payload.prompt).toContain('Recipe directives:');
    expect(compiled.payload.prompt).toContain('- Core Aesthetic: polished glass');
    expect(compiled.payload.metadata.hasRecipeProviderDirectives).toBe(true);
    expect(compiled.audit.estimatedPromptChars).toBe(compiled.payload.prompt.length);
  });

  it('compiles Comfy local workflow input for adapter conformance fixtures', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-comfy-1',
      task: 'texture_generate',
      providerId: 'comfy',
      prompt: 'seamless ceramic glaze normal-map-ready texture',
      negativePrompt: 'visible border',
      recipeId: 'materials',
      output: {
        aspectRatio: '1:1',
        imageSize: '2048x2048',
        requiresLocalAsset: true,
      },
      assets: [
        {
          role: 'reference',
          name: 'glaze-ref.jpg',
          catalogId: 'asset-1',
          sourceUrl: 'https://example.test/glaze-ref.jpg',
        },
      ],
    });

    const compiled = compileComfyWorkflowInput({
      id: 'job-3',
      projectId: 'project-1',
      providerId: 'comfy',
      prompt: 'fallback',
      execution: null,
      sourceSpec,
    });

    expect(compiled.providerId).toBe('comfy');
    expect(compiled.contractId).toBe('comfy-workflow-v1');
    expect(compiled.payloadKind).toBe('comfy_workflow');
    expect(compiled.task).toBe('texture_generate');
    expect(compiled.payload.workflowPreset).toBe('texture_generate');
    expect(compiled.payload.output.imageSize).toBe('2048x2048');
    expect(compiled.payload.assets).toEqual([
      {
        role: 'reference',
        name: 'glaze-ref.jpg',
        catalogId: 'asset-1',
        localPath: null,
        sourceUrl: 'https://example.test/glaze-ref.jpg',
        strength: null,
        hasInlineData: false,
      },
    ]);
  });
});
