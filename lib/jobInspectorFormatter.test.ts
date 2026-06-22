import { describe, expect, it } from 'vite-plus/test';

import type { JobDetailResponse } from '../packages/shared/src';
import { buildJobInspectorDetailModel } from './jobInspectorFormatter';

function createDetail(overrides: Partial<JobDetailResponse> = {}): JobDetailResponse {
  const base: JobDetailResponse = {
    job: {
      id: 'job-1',
      projectId: 'project-1',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: null,
      status: 'completed',
      execution: {
        model: 'gpt-image-1',
        reasoningEffort: 'medium',
        serviceTier: 'fast',
      },
      originalPrompt: 'Moody alley at night',
      expandedPrompt: null,
      finalPromptUsed: 'Moody alley at night with neon reflections',
      error: null,
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:20.000Z',
      completedAt: '2026-05-26T10:00:20.000Z',
    },
    events: [],
    turn: null,
    transcriptEntries: [],
    catalogImages: [],
    metrics: {
      timings: [
        { id: 'total', label: 'Total', durationMs: 20_000 },
        { id: 'queued', label: 'Queued', durationMs: 1_000 },
        { id: 'provider', label: 'Provider', durationMs: 18_000 },
        { id: 'asset_import', label: 'Asset import', durationMs: 1_000 },
      ],
      tokenUsage: null,
      estimatedPromptTokens: 42,
    },
    traceSummary: {
      providerId: 'codex',
      model: 'gpt-image-1',
      task: 'image_generate',
      status: 'completed',
      durationMs: 20_000,
      assetCount: 0,
      tokenUsage: null,
      transcriptPath: null,
      completedAt: '2026-05-26T10:00:20.000Z',
    },
  };
  return { ...base, ...overrides, traceSummary: overrides.traceSummary ?? base.traceSummary };
}

describe('buildJobInspectorDetailModel', () => {
  it('extracts image artifacts from transcript text and event metadata', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-1',
          kind: 'message',
          label: 'Assistant',
          text: 'Saved preview to /library/outputs/final-image.webp and mirrored it to https://cdn.example.com/final-image.webp',
          source: 'turn/item',
          timestamp: '2026-05-26T10:00:15.000Z',
          raw: null,
        },
      ],
      events: [
        {
          id: 1,
          jobId: 'job-1',
          type: 'asset.created',
          message: 'Asset imported',
          metadata: {
            thumbnailUrl: '/library/thumbnails/final-image.webp',
            assetId: 'asset-1',
          },
          createdAt: '2026-05-26T10:00:16.000Z',
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail, {
      assetBaseUrl: 'http://localhost:17223',
    });

    expect(model.artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'image',
          href: 'http://localhost:17223/library/outputs/final-image.webp',
        }),
        expect.objectContaining({
          kind: 'image',
          href: 'https://cdn.example.com/final-image.webp',
        }),
        expect.objectContaining({
          kind: 'image',
          href: 'http://localhost:17223/library/thumbnails/final-image.webp',
        }),
      ]),
    );
    expect(model.stats.artifactCount).toBe(3);
  });

  it('promotes catalog-backed outputs into previewable returned images', () => {
    const detail = createDetail({
      catalogImages: [
        {
          id: 'catalog-1',
          libraryId: 'library-1',
          filePath: 'D:/AI-Studio-Library/outputs/final-image.webp',
          thumbnailPath: 'D:/AI-Studio-Library/outputs/thumbs/final-image.webp',
          publicUrl: '/library/outputs/final-image.webp',
          thumbnailUrl: '/library/outputs/thumbs/final-image.webp',
          prompt: 'Neon alley',
          negativePrompt: null,
          aspectRatio: '3:2',
          imageSize: '1K',
          width: 1536,
          height: 1024,
          mimeType: 'image/webp',
          fileSizeBytes: 123456,
          jobId: 'job-1',
          workspaceId: 'default',
          batchId: 'batch-1',
          recipeId: 'styles',
          isFavorite: false,
          isDeleted: false,
          deletedAt: null,
          tags: [],
          generationConfig: null,
          createdAt: '2026-05-26T10:00:19.000Z',
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail, {
      assetBaseUrl: 'http://localhost:17223',
    });

    expect(model.outputs).toEqual([
      expect.objectContaining({
        kind: 'image',
        href: 'http://localhost:17223/library/outputs/final-image.webp',
        previewSrc: 'http://localhost:17223/library/outputs/thumbs/final-image.webp',
        value: '1536×1024 · 3:2 · image/webp',
      }),
    ]);
    expect(model.stats.outputCount).toBe(1);
  });

  it('surfaces source spec reference images as previewable request artifacts', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        sourceSpec: {
          id: 'spec-2',
          version: 'generation-task-spec/v1',
          task: 'image_generate',
          providerId: 'codex',
          prompt: 'Use the reference',
          negativePrompt: null,
          recipeId: 'styles',
          recipeParams: null,
          stylePresetId: null,
          assets: [
            {
              role: 'reference',
              name: 'ref.png',
              localPath: 'D:/AI-Studio-Library/.studio/references/job-1/ref.png',
              strength: 0.35,
            },
          ],
          quality: null,
          output: {
            count: 1,
            aspectRatio: '1:1',
            imageSize: '1K',
            mimeType: 'image/png',
            requiresLocalAsset: true,
            requiresCatalogEntry: true,
            requiresExactPath: true,
          },
          metadata: {
            workspaceId: 'workspace-1',
            batchId: 'batch-old',
          },
        },
      },
    });

    const model = buildJobInspectorDetailModel(detail, {
      assetBaseUrl: 'http://localhost:17223',
    });

    expect(model.request.referenceArtifacts).toEqual([
      expect.objectContaining({
        kind: 'image',
        href: 'http://localhost:17223/library/.studio/references/job-1/ref.png',
        previewSrc: 'http://localhost:17223/library/.studio/references/job-1/ref.png',
        label: 'ref.png',
      }),
    ]);
  });

  it('prefers persisted localPath over inline dataUrl for reference previews', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        sourceSpec: {
          id: 'spec-3',
          version: 'generation-task-spec/v1',
          task: 'image_generate',
          providerId: 'codex',
          prompt: 'Use the persisted reference',
          negativePrompt: null,
          recipeId: null,
          recipeParams: null,
          stylePresetId: null,
          assets: [
            {
              role: 'reference',
              name: 'hero reference.png',
              localPath: 'D:/AI-Studio-Library/.studio/references/job-9/hero reference.png',
              dataUrl: `data:image/png;base64,${'A'.repeat(512)}`,
              strength: 0.5,
            },
          ],
          quality: null,
          output: {
            count: 1,
            aspectRatio: '1:1',
            imageSize: '1K',
            mimeType: 'image/png',
            requiresLocalAsset: true,
            requiresCatalogEntry: true,
            requiresExactPath: true,
          },
          metadata: {},
        },
      },
    });

    const model = buildJobInspectorDetailModel(detail, {
      assetBaseUrl: 'http://localhost:17223',
    });

    expect(model.request.referenceArtifacts).toEqual([
      expect.objectContaining({
        href: 'http://localhost:17223/library/.studio/references/job-9/hero%20reference.png',
        previewSrc: 'http://localhost:17223/library/.studio/references/job-9/hero%20reference.png',
      }),
    ]);
  });

  it('derives legacy reference previews from final prompt paths when source assets miss localPath', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        finalPromptUsed: [
          'Base prompt content.',
          '',
          'Use these local reference image files as visual context for the requested image. Respect the strength value as the visual influence for each reference:',
          '1. Reference image: D:/AI-Studio-Library/.studio/references/job-42/mood board.png (mood board.png, strength 0.55)',
        ].join('\n'),
        sourceSpec: {
          id: 'spec-legacy',
          version: 'generation-task-spec/v1',
          task: 'image_generate',
          providerId: 'codex',
          prompt: 'Base prompt content.',
          negativePrompt: null,
          recipeId: null,
          recipeParams: null,
          stylePresetId: null,
          assets: [
            {
              role: 'reference',
              name: 'mood board.png',
              dataUrl: `data:image/png;base64,${'A'.repeat(512)}`,
              strength: 0.55,
            },
          ],
          quality: null,
          output: {
            count: 1,
            aspectRatio: '1:1',
            imageSize: '1K',
            mimeType: 'image/png',
            requiresLocalAsset: true,
            requiresCatalogEntry: true,
            requiresExactPath: true,
          },
          metadata: {},
        },
      },
    });

    const model = buildJobInspectorDetailModel(detail, {
      assetBaseUrl: 'http://localhost:17223',
    });

    expect(model.request.referenceArtifacts[0]).toEqual(
      expect.objectContaining({
        href: 'http://localhost:17223/library/.studio/references/job-42/mood%20board.png',
        previewSrc: 'http://localhost:17223/library/.studio/references/job-42/mood%20board.png',
      }),
    );
  });

  it('compacts giant inline image payloads so they do not flood the timeline text', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-inline',
          kind: 'message',
          label: 'Assistant',
          text: `data:image/png;base64,${'A'.repeat(1024)}`,
          source: 'turn/item',
          timestamp: '2026-05-26T10:00:12.000Z',
          raw: null,
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.timeline[0]?.blocks[0]?.text).toContain('Embedded image payload');
    expect(model.timeline[0]?.blocks[0]?.text).not.toContain('AAAAAA');
  });

  it('compacts wrapped opaque payloads from raw transcript lines', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-raw',
          kind: 'event',
          label: 'Transcript',
          text: Array.from({ length: 6 }, () => 'A'.repeat(40_000)).join('\n'),
          source: 'raw',
          timestamp: null,
          raw: null,
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.timeline[0]?.blocks[0]?.text).toContain('Binary payload');
    expect(model.timeline[0]?.blocks[0]?.text).not.toContain('AAAAAA');
  });

  it('compacts oversized structured event payloads into readable timeline text', () => {
    const detail = createDetail({
      events: [
        {
          id: 9,
          jobId: 'job-1',
          type: 'provider.event',
          message: JSON.stringify({
            kind: 'image_generation',
            payload: `data:image/png;base64,${'A'.repeat(2048)}`,
            detail: 'Large opaque payload',
          }),
          metadata: null,
          createdAt: '2026-05-26T10:00:06.000Z',
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.timeline[0]?.rawJson).toContain('Embedded image payload');
    expect(model.timeline[0]?.rawJson).not.toContain('AAAAAA');
  });

  it('turns structured transcript payloads into readable facts instead of raw paragraphs', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-2',
          kind: 'tool',
          label: 'Tool',
          text: JSON.stringify({
            status: 'completed',
            output_count: 2,
            model: 'gpt-image-1',
          }),
          source: 'turn/item',
          timestamp: '2026-05-26T10:00:10.000Z',
          raw: null,
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);
    const [item] = model.timeline;

    expect(item.blocks).toEqual([]);
    expect(item.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Status', value: 'completed' }),
        expect.objectContaining({ label: 'Output count', value: '2' }),
        expect.objectContaining({ label: 'Model', value: 'gpt-image-1' }),
      ]),
    );
    expect(item.rawJson).toContain('"status": "completed"');
  });

  it('orders the unified timeline chronologically so the run is easier to follow', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-3',
          kind: 'reasoning',
          label: 'Thinking',
          text: 'Checking composition constraints.',
          source: 'turn/item',
          timestamp: '2026-05-26T10:00:05.000Z',
          raw: null,
        },
      ],
      events: [
        {
          id: 2,
          jobId: 'job-1',
          type: 'job.started',
          message: 'Job execution started.',
          metadata: null,
          createdAt: '2026-05-26T10:00:01.000Z',
        },
        {
          id: 3,
          jobId: 'job-1',
          type: 'asset.created',
          message: 'Asset imported.',
          metadata: null,
          createdAt: '2026-05-26T10:00:18.000Z',
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.timeline.map((item) => item.id)).toEqual([
      'event:2',
      'transcript:line-3',
      'event:3',
    ]);
  });

  it('exposes job request snapshot facts for prompt and attachment auditing', () => {
    const detail = createDetail({
      job: {
        ...createDetail().job,
        finalPromptUsed: 'Final prompt used by provider',
        sourceSpec: {
          id: 'spec-1',
          version: 'generation-task-spec/v1',
          task: 'image_edit',
          providerId: 'codex',
          prompt: 'Final prompt used by provider',
          negativePrompt: null,
          recipeId: null,
          recipeParams: null,
          stylePresetId: null,
          assets: [
            {
              role: 'input',
              name: 'base.png',
              dataUrl: 'data:image/png;base64,AAAA',
              strength: 1,
            },
            {
              role: 'mask',
              name: 'mask.png',
              dataUrl: 'data:image/png;base64,BBBB',
              strength: 1,
            },
          ],
          quality: null,
          output: {
            count: 1,
            aspectRatio: '1:1',
            imageSize: '1K',
            mimeType: 'image/png',
            requiresLocalAsset: true,
            requiresCatalogEntry: true,
            requiresExactPath: true,
          },
          metadata: {},
        },
      },
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.request.blocks[0]?.text).toContain('Final prompt used by provider');
    expect(model.request.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Prompt matches source spec', value: 'Yes' }),
        expect.objectContaining({ label: 'Assets sent', value: '2' }),
        expect.objectContaining({ label: 'Input assets', value: '1' }),
        expect.objectContaining({ label: 'Mask assets', value: '1' }),
        expect.objectContaining({ label: 'Reference assets', value: '0' }),
        expect.objectContaining({ label: 'Input names', value: 'base.png' }),
        expect.objectContaining({ label: 'Mask names', value: 'mask.png' }),
      ]),
    );
  });

  it('compacts streamed assistant delta fragments when a completed message is present', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-delta-1',
          kind: 'event',
          label: 'item/agentMessage/delta',
          text: '{"delta":"Hello "}',
          source: 'item/agentMessage/delta',
          timestamp: null,
          raw: {
            method: 'item/agentMessage/delta',
            params: {
              itemId: 'msg-1',
              delta: 'Hello ',
            },
          },
        },
        {
          id: 'line-delta-2',
          kind: 'event',
          label: 'item/agentMessage/delta',
          text: '{"delta":"world"}',
          source: 'item/agentMessage/delta',
          timestamp: null,
          raw: {
            method: 'item/agentMessage/delta',
            params: {
              itemId: 'msg-1',
              delta: 'world',
            },
          },
        },
        {
          id: 'line-complete',
          kind: 'message',
          label: 'Assistant',
          text: 'Hello world',
          source: 'item/completed',
          timestamp: null,
          raw: {
            method: 'item/completed',
            params: {
              item: {
                id: 'msg-1',
                type: 'agentMessage',
                text: 'Hello world',
              },
            },
          },
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.stats.rawTranscriptCount).toBe(3);
    expect(model.stats.transcriptCount).toBe(1);
    expect(model.stats.collapsedTranscriptCount).toBe(2);
    expect(model.timeline).toHaveLength(1);
    expect(model.timeline[0]).toEqual(
      expect.objectContaining({
        title: 'Assistant',
        sourceLabel: 'item/completed',
      }),
    );
  });

  it('merges orphaned streaming fragments into one readable transcript item', () => {
    const detail = createDetail({
      transcriptEntries: [
        {
          id: 'line-delta-1',
          kind: 'event',
          label: 'item/agentMessage/delta',
          text: '{"delta":"Hello "}',
          source: 'item/agentMessage/delta',
          timestamp: null,
          raw: {
            method: 'item/agentMessage/delta',
            params: {
              itemId: 'msg-2',
              delta: 'Hello ',
            },
          },
        },
        {
          id: 'line-delta-2',
          kind: 'event',
          label: 'item/agentMessage/delta',
          text: '{"delta":"world"}',
          source: 'item/agentMessage/delta',
          timestamp: null,
          raw: {
            method: 'item/agentMessage/delta',
            params: {
              itemId: 'msg-2',
              delta: 'world',
            },
          },
        },
      ],
    });

    const model = buildJobInspectorDetailModel(detail);

    expect(model.stats.transcriptCount).toBe(1);
    expect(model.stats.collapsedTranscriptCount).toBe(1);
    expect(model.timeline[0]).toEqual(
      expect.objectContaining({
        title: 'Assistant',
        badge: 'message',
        sourceLabel: 'item/agentMessage/stream',
      }),
    );
    expect(model.timeline[0]?.blocks[0]?.text).toBe('Hello world');
  });
});
