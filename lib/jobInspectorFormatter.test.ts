import { describe, expect, it } from 'vite-plus/test';

import type { JobDetailResponse } from '../packages/shared/src';
import { buildJobInspectorDetailModel } from './jobInspectorFormatter';

function createDetail(overrides: Partial<JobDetailResponse> = {}): JobDetailResponse {
  return {
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
    ...overrides,
  };
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
      assetBaseUrl: 'http://localhost:4317',
    });

    expect(model.artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'image',
          href: 'http://localhost:4317/library/outputs/final-image.webp',
        }),
        expect.objectContaining({
          kind: 'image',
          href: 'https://cdn.example.com/final-image.webp',
        }),
        expect.objectContaining({
          kind: 'image',
          href: 'http://localhost:4317/library/thumbnails/final-image.webp',
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
      assetBaseUrl: 'http://localhost:4317',
    });

    expect(model.outputs).toEqual([
      expect.objectContaining({
        kind: 'image',
        href: 'http://localhost:4317/library/outputs/final-image.webp',
        previewSrc: 'http://localhost:4317/library/outputs/thumbs/final-image.webp',
        value: '1536×1024 · 3:2 · image/webp',
      }),
    ]);
    expect(model.stats.outputCount).toBe(1);
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
});
