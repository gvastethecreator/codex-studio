import { describe, expect, it } from 'vite-plus/test';

import { MODELS } from '../constants';

import { buildGenerationToolbarProps } from './useGenerationToolbarConfig';

describe('buildGenerationToolbarProps', () => {
  it('centralizes editor routing and key-selector transitions', async () => {
    const calls: string[] = [];

    const props = buildGenerationToolbarProps({
      config: {
        generationConfig: {
          prompt: 'Neon city',
          attachments: [],
          aspectRatio: '1:1',
          model: MODELS.CODEX_IMAGEGEN,
          executionModel: 'gpt-5.4-codex',
          executionReasoningEffort: 'medium',
          executionSpeed: 'standard',
          batchCount: 1,
        },
        updateConfig: (key, value) => calls.push(`update:${String(key)}:${JSON.stringify(value)}`),
        updateAttachment: (id) => calls.push(`updateAttachment:${id}`),
        onFileSelect: () => calls.push('fileSelect'),
        onFilesDrop: () => calls.push('filesDrop'),
        onRemoveAttachment: (id) => calls.push(`removeAttachment:${id}`),
        maxAttachments: 4,
      },
      actions: {
        onGenerate: () => calls.push('generate'),
        isGenerating: false,
        generationStartTime: null,
        isEnhancingPrompt: false,
        onEnhancePrompt: () => calls.push('enhancePrompt'),
      },
      ui: {
        setPreviewRatio: (ratio) => calls.push(`preview:${ratio ?? 'none'}`),
        setIsInteracting: (isInteracting) => calls.push(`interacting:${String(isInteracting)}`),
        isKeyPopoverOpen: false,
        setIsKeyPopoverOpen: (isOpen) => calls.push(`keyPopover:${String(isOpen)}`),
      },
      editor: {
        openEditor: (attachment, openEditorRoute) => {
          calls.push(`openEditor:${attachment.id}`);
          openEditorRoute();
        },
        openEditorRoute: () => calls.push('openEditorRoute'),
      },
      sync: {
        verifyCodexSession: async () => {
          calls.push('verifyCodexSession');
        },
      },
      startTransition: (callback) => {
        calls.push('transition');
        callback();
      },
    });

    props.onOpenEditor({
      id: 'attachment-1',
      name: 'input.png',
      dataUrl: 'data:image/png;base64,abc',
      strength: 0.8,
    });
    props.onOpenKeySelector();
    await props.onSelectKey();

    expect(props.maxAttachments).toBe(4);
    expect(props.generationConfig.prompt).toBe('Neon city');
    expect(calls).toEqual([
      'openEditor:attachment-1',
      'openEditorRoute',
      'transition',
      'keyPopover:true',
      'verifyCodexSession',
      'transition',
      'keyPopover:false',
    ]);
  });
});