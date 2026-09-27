/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildGeneratedImageContextAttachment,
  normalizeGenerationConfigForCodexModels,
  prepareGenerationConfigForPersist,
  useGenerationConfig,
} from './useGenerationConfig';
import { createReferenceHandoff } from '../services/studio-api/jobs';
import { prepareStudioGenerationRequest } from '../lib/studioGenerationRequest';
import { activateCharacterLabView, updateCharacterLabView } from '../lib/characterLabDraft';
import type { ImageGenerationConfig } from '../types';
import { get, set } from '../utils/idb';

vi.mock('../utils/idb', () => ({
  get: vi.fn(async () => undefined),
  set: vi.fn(async () => undefined),
}));
vi.mock('../services/studio-api/codex', () => ({
  getCodexModelCatalog: vi.fn(async () => ({ models: [] })),
}));
vi.mock('../services/studio-api/jobs', () => ({ createReferenceHandoff: vi.fn() }));
vi.mock('../utils/imageUtils', () => ({
  createContextImageDataUrl: vi.fn(async () => ({
    dataUrl: 'data:image/webp;base64,AAAA',
    width: 1,
    height: 1,
    fileSizeBytes: 3,
  })),
}));

afterEach(() => vi.unstubAllGlobals());

describe('reference upload lifecycle', () => {
  it('replaces an uploading source in place, preserves detail references and blocks pending generation', async () => {
    const revoke = vi.fn();
    vi.stubGlobal(
      'URL',
      class extends URL {
        static override createObjectURL(file: File) {
          return `blob:${file.name}`;
        }
        static override revokeObjectURL = revoke;
      },
    );
    const first = Promise.withResolvers<Awaited<ReturnType<typeof createReferenceHandoff>>>();
    const replacement = Promise.withResolvers<Awaited<ReturnType<typeof createReferenceHandoff>>>();
    vi.mocked(createReferenceHandoff)
      .mockReset()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(replacement.promise);
    const { result, unmount } = renderHook(() => useGenerationConfig({ log: vi.fn() }));
    await act(async () => {});

    act(() =>
      result.current.handlePastedFiles([new File(['first'], 'first.png', { type: 'image/png' })]),
    );
    expect(result.current.generationConfig.attachments[0]).toMatchObject({
      name: 'first.png',
      isProcessing: true,
    });
    await waitFor(() => expect(createReferenceHandoff).toHaveBeenCalledTimes(1));
    const firstId = result.current.generationConfig.attachments[0]!.id;
    const detail = { id: 'detail', name: 'detail.webp', dataUrl: '/detail.webp', strength: 0.3 };
    act(() =>
      result.current.updateGenerationConfig('attachments', [
        { ...result.current.generationConfig.attachments[0]!, strength: 0.8 },
        detail,
      ]),
    );
    act(() =>
      result.current.handlePastedFiles(
        [new File(['replacement'], 'replacement.png', { type: 'image/png' })],
        firstId,
      ),
    );
    await waitFor(() => expect(createReferenceHandoff).toHaveBeenCalledTimes(2));
    expect(result.current.generationConfig.attachments).toHaveLength(2);
    expect(prepareGenerationConfigForPersist(result.current.generationConfig).attachments).toEqual([
      detail,
    ]);
    expect(
      prepareStudioGenerationRequest({ generationConfig: result.current.generationConfig }),
    ).toEqual({
      ok: false,
      message: 'Wait for reference images to finish loading before generating.',
    });

    const handoff = (name: string) => ({
      handoffId: name,
      references: [
        {
          name: `${name}.webp`,
          localPath: `D:/library/${name}.webp`,
          publicUrl: `/library/${name}.webp`,
          strength: 0.5,
          mimeType: 'image/webp' as const,
          fileSizeBytes: 3,
          width: 1,
          height: 1,
        },
      ],
    });
    await act(async () => {
      replacement.resolve(handoff('replacement'));
    });
    await act(async () => {
      first.resolve(handoff('first'));
    });
    expect(result.current.generationConfig.attachments).toEqual([
      expect.objectContaining({
        name: 'replacement.webp',
        strength: 0.8,
        localPath: 'D:/library/replacement.webp',
        sourceUrl: expect.stringContaining('/library/replacement.webp'),
      }),
      detail,
    ]);
    expect(result.current.generationConfig.attachments[0]).not.toHaveProperty('isProcessing');
    expect(
      prepareStudioGenerationRequest({ generationConfig: result.current.generationConfig }).ok,
    ).toBe(true);
    expect(
      revoke.mock.calls.map(([url]) => url).sort((a, b) => String(a).localeCompare(String(b))),
    ).toEqual(['blob:first.png', 'blob:replacement.png']);
    const deleted = Promise.withResolvers<Awaited<ReturnType<typeof createReferenceHandoff>>>();
    vi.mocked(createReferenceHandoff).mockReturnValueOnce(deleted.promise);
    act(() =>
      result.current.handlePastedFiles([
        new File(['deleted'], 'deleted.png', { type: 'image/png' }),
      ]),
    );
    await waitFor(() => expect(createReferenceHandoff).toHaveBeenCalledTimes(3));
    const deletedId = result.current.generationConfig.attachments.at(-1)!.id;
    act(() => result.current.handleRemoveAttachment(deletedId));
    await act(async () => {
      deleted.resolve(handoff('deleted'));
    });
    expect(
      result.current.generationConfig.attachments.map((attachment) => attachment.name),
    ).toEqual(['replacement.webp', 'detail.webp']);
    unmount();
  });
});

describe('buildGeneratedImageContextAttachment', () => {
  it('keeps a catalog library path so Grok can use the image as a reference', () => {
    expect(
      buildGeneratedImageContextAttachment(
        {
          id: 'img-1',
          src: 'http://127.0.0.1:17223/library/outputs/boat.png',
          localPath: 'D:/AI-Studio-Library/outputs/boat.png',
          sourceUrl: 'http://127.0.0.1:17223/library/outputs/boat.png',
        },
        () => 100,
      ),
    ).toEqual({
      id: 'gen-img-1-100',
      name: 'Generated Image',
      dataUrl: 'http://127.0.0.1:17223/library/outputs/boat.png',
      localPath: 'D:/AI-Studio-Library/outputs/boat.png',
      sourceUrl: 'http://127.0.0.1:17223/library/outputs/boat.png',
      strength: 0.5,
    });
  });
});

describe('prepareGenerationConfigForPersist', () => {
  it('drops oversized inline attachments from composer recovery', () => {
    const prepared = prepareGenerationConfigForPersist({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [
        {
          id: 'large-ref',
          name: 'large.png',
          dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
          strength: 1,
        },
      ],
    });

    expect(prepared.attachments).toEqual([]);
  });

  it('keeps handoff-backed attachments without persisting oversized inline bytes', () => {
    const prepared = prepareGenerationConfigForPersist({
      ...DEFAULT_GENERATION_CONFIG,
      attachments: [
        {
          id: 'large-ref',
          name: 'large.png',
          dataUrl: `data:image/png;base64,${'A'.repeat(600 * 1024)}`,
          localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
          sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
          strength: 1,
        },
      ],
    });

    expect(prepared.attachments).toEqual([
      {
        id: 'large-ref',
        name: 'large.png',
        dataUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        localPath: 'D:/AI-Studio-Library/.studio/references/handoff-1/large.png',
        sourceUrl: 'http://127.0.0.1:4317/library/.studio/references/handoff-1/large.png',
        strength: 1,
      },
    ]);
  });
});

describe('normalizeGenerationConfigForCodexModels', () => {
  it('uses the preferred available model and clamps unsupported execution options', () => {
    const normalized = normalizeGenerationConfigForCodexModels(
      {
        ...DEFAULT_GENERATION_CONFIG,
        executionModel: 'missing-model',
        executionReasoningEffort: 'xhigh',
        executionSpeed: 'fast',
      },
      [
        {
          id: 'gpt-5.4-mini',
          model: 'gpt-5.4-mini',
          displayName: 'GPT-5.4 mini',
          description: 'Mini',
          hidden: false,
          defaultReasoningEffort: 'medium',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: true,
        },
      ],
    );

    expect(normalized.executionModel).toBe('gpt-5.4-mini');
    expect(normalized.executionReasoningEffort).toBe('medium');
    expect(normalized.executionSpeed).toBe('standard');
  });

  it('upgrades the old image defaults to GPT-5.4 medium when the catalog supports it', () => {
    const normalized = normalizeGenerationConfigForCodexModels(
      {
        ...DEFAULT_GENERATION_CONFIG,
        executionModel: 'gpt-5.4-mini',
        executionReasoningEffort: 'low',
        executionSpeed: 'standard',
      },
      [
        {
          id: 'gpt-5.4',
          model: 'gpt-5.4',
          displayName: 'GPT-5.4',
          description: 'Default image task model',
          hidden: false,
          defaultReasoningEffort: 'medium',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
            { reasoningEffort: 'high', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: true,
        },
        {
          id: 'gpt-5.4-mini',
          model: 'gpt-5.4-mini',
          displayName: 'GPT-5.4 mini',
          description: 'Old default',
          hidden: false,
          defaultReasoningEffort: 'low',
          supportedReasoningEfforts: [
            { reasoningEffort: 'low', description: null },
            { reasoningEffort: 'medium', description: null },
          ],
          additionalSpeedTiers: [],
          inputModalities: ['text', 'image'],
          supportsPersonality: false,
          isDefault: false,
        },
      ],
    );

    expect(normalized.executionModel).toBe('gpt-5.4');
    expect(normalized.executionReasoningEffort).toBe('medium');
    expect(normalized.executionSpeed).toBe('standard');
  });
});

describe('workspace recipe drafts', () => {
  it('hydrates, restores and persists Character views without mixing workspaces or losing identity', async () => {
    const oldDraft: ImageGenerationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      recipeId: 'character-lab',
      prompt: 'Rain outside',
      recipeParams: {
        mode: 'scenes',
        actionId: 'scenes:char_workplace',
        subject: 'A traveler',
        style: 'Watercolor',
        labAspectRatio: '16:9',
      },
      attachments: [
        {
          id: 'source',
          name: 'character.webp',
          dataUrl: 'data:image/webp;base64,AAAA',
          strength: 0.5,
        },
      ],
    };
    const stored = new Map<IDBValidKey, unknown>([
      ['generation-drafts', { 'workspace:character-lab': oldDraft }],
    ]);
    vi.mocked(get).mockImplementation(async (key) => structuredClone(stored.get(key)) as never);
    vi.mocked(set).mockImplementation(async (key, value) => {
      stored.set(key, structuredClone(value));
    });
    const { result, rerender, unmount } = renderHook(
      ({ scopeKey }) => useGenerationConfig({ log: vi.fn(), scopeKey }),
      { initialProps: { scopeKey: 'workspace:character-lab' } },
    );
    expect(result.current.isDraftReady).toBe(false);
    act(() =>
      result.current.setGenerationConfig((current) => activateCharacterLabView(current, 'poses')),
    );
    await waitFor(() => expect(result.current.isDraftReady).toBe(true));
    expect(result.current.generationConfig.recipeParams?.actionId).toBe('scenes:char_workplace');
    act(() =>
      result.current.setGenerationConfig((current) => activateCharacterLabView(current, 'poses')),
    );
    expect(result.current.generationConfig.aspectRatio).toBe('2:3');
    act(() =>
      result.current.setGenerationConfig((current) =>
        updateCharacterLabView(
          current,
          'poses',
          { expression: 'Happy' },
          'A traveler with a red scarf',
        ),
      ),
    );
    act(() => result.current.updateGenerationConfig('prompt', 'Warm colors'));
    act(() =>
      result.current.setGenerationConfig((current) => activateCharacterLabView(current, 'scenes')),
    );
    expect(result.current.generationConfig).toMatchObject({
      prompt: 'Rain outside',
      recipeParams: { style: 'Watercolor', subject: 'A traveler with a red scarf' },
    });
    act(() =>
      result.current.setRecipeDraft('character-lab', {
        ...oldDraft,
        prompt: 'Compiled image prompt',
        recipeParams: {
          ...oldDraft.recipeParams,
          actionId: 'scenes:char_home',
          additionalPrompt: 'Evening light',
        },
      }),
    );
    expect(result.current.generationConfig.prompt).toBe('Evening light');
    act(() =>
      result.current.setGenerationConfig((current) => activateCharacterLabView(current, 'poses')),
    );
    expect(result.current.generationConfig).toMatchObject({
      prompt: 'Warm colors',
      recipeParams: { expression: 'Happy' },
    });
    expect(result.current.generationConfig.attachments[0]?.id).toBe('source');
    rerender({ scopeKey: 'another:character-lab' });
    expect(result.current.generationConfig.characterLabDraft).toBeUndefined();
    expect(result.current.generationConfig.attachments).toEqual([]);
    act(() =>
      result.current.setGenerationConfig((current) => activateCharacterLabView(current, 'effects')),
    );
    expect(result.current.generationConfig.recipeParams?.subject).toBe('');
    rerender({ scopeKey: 'workspace:character-lab' });
    await waitFor(() => {
      const drafts = stored.get('generation-drafts') as Record<string, ImageGenerationConfig>;
      expect(drafts['workspace:character-lab'].characterLabDraft?.views.poses?.prompt).toBe(
        'Warm colors',
      );
    });
    unmount();
    const reloaded = renderHook(() =>
      useGenerationConfig({ log: vi.fn(), scopeKey: 'workspace:character-lab' }),
    );
    await waitFor(() => expect(reloaded.result.current.isDraftReady).toBe(true));
    expect(reloaded.result.current.generationConfig).toMatchObject({
      prompt: 'Warm colors',
      recipeParams: { expression: 'Happy' },
    });
    expect(reloaded.result.current.generationConfig.characterLabDraft?.views.scenes?.prompt).toBe(
      'Evening light',
    );
    reloaded.unmount();
    vi.mocked(get).mockImplementation(async () => undefined);
    vi.mocked(set).mockImplementation(async () => undefined);
  });

  it('restores each prompt while sharing references across workspace recipes', async () => {
    const { result, rerender } = renderHook(
      ({ scopeKey }) => useGenerationConfig({ log: vi.fn(), scopeKey }),
      { initialProps: { scopeKey: 'workspace:styles' } },
    );
    await act(async () => {});
    act(() => result.current.updateGenerationConfig('prompt', 'Watercolor scene'));
    act(() =>
      result.current.updateGenerationConfig('attachments', [
        {
          id: 'reference',
          name: 'source.webp',
          dataUrl: 'data:image/webp;base64,AAAA',
          strength: 0.5,
        },
      ]),
    );
    rerender({ scopeKey: 'workspace:camera' });
    expect(result.current.generationConfig.prompt).toBe('');
    expect(result.current.generationConfig.attachments[0]?.id).toBe('reference');
    act(() => result.current.updateGenerationConfig('prompt', 'Overhead view'));
    act(() => result.current.updateAttachment('reference', { strength: 0.75 }));
    rerender({ scopeKey: 'workspace:styles' });
    expect(result.current.generationConfig.prompt).toBe('Watercolor scene');
    expect(result.current.generationConfig.attachments[0]?.id).toBe('reference');
    expect(result.current.generationConfig.attachments[0]?.strength).toBe(0.75);
    act(() => result.current.handleRemoveAttachment('reference'));
    rerender({ scopeKey: 'workspace:camera' });
    expect(result.current.generationConfig.attachments).toEqual([]);
  });
});
