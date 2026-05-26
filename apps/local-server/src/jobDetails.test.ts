import { describe, expect, it } from 'vite-plus/test';

import type { Job } from '../../../packages/shared/src';
import { buildJobMetrics, parseJobTranscript } from './jobDetails';

describe('parseJobTranscript', () => {
  it('extracts assistant messages and reasoning-like items from JSONL notifications', () => {
    const transcript = [
      JSON.stringify({
        method: 'turn/item',
        params: {
          item: {
            type: 'reasoning',
            text: 'Thinking through style transfer constraints.',
          },
        },
      }),
      JSON.stringify({
        method: 'turn/item',
        params: {
          item: {
            type: 'agentMessage',
            text: 'Generated image saved to D:/assets/out.png',
          },
        },
      }),
    ].join('\n');

    const entries = parseJobTranscript(transcript);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      kind: 'reasoning',
      label: 'Thinking',
      text: 'Thinking through style transfer constraints.',
    });
    expect(entries[1]).toMatchObject({
      kind: 'message',
      label: 'Assistant',
      text: 'Generated image saved to D:/assets/out.png',
    });
  });

  it('falls back to readable JSON when it cannot infer a text payload', () => {
    const transcript = JSON.stringify({
      method: 'turn/completed',
      params: { turn: { id: 'turn-1', status: 'completed' } },
    });

    const [entry] = parseJobTranscript(transcript);

    expect(entry.kind).toBe('event');
    expect(entry.text).toContain('Turn completed');
  });
});

describe('buildJobMetrics', () => {
  it('summarizes total timing, process segments, and reported token usage', () => {
    const job: Job = {
      id: 'job-1',
      projectId: 'project-1',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: null,
      status: 'completed',
      execution: null,
      originalPrompt: 'A small brass key',
      expandedPrompt: null,
      finalPromptUsed: 'A small brass key',
      error: null,
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:05.000Z',
      completedAt: '2026-05-26T10:00:05.000Z',
    };

    const metrics = buildJobMetrics(
      job,
      [
        {
          id: 1,
          jobId: 'job-1',
          type: 'job.started',
          message: 'Job execution started.',
          metadata: null,
          createdAt: '2026-05-26T10:00:01.000Z',
        },
        {
          id: 2,
          jobId: 'job-1',
          type: 'codex.completed',
          message: 'Codex image generation completed.',
          metadata: { durationMs: 3000 },
          createdAt: '2026-05-26T10:00:04.000Z',
        },
        {
          id: 3,
          jobId: 'job-1',
          type: 'asset.created',
          message: 'Codex image asset imported.',
          metadata: { assetId: 'asset-1' },
          createdAt: '2026-05-26T10:00:05.000Z',
        },
      ],
      [
        {
          id: 'line-1',
          kind: 'event',
          label: 'Turn',
          text: 'done',
          source: 'turn/completed',
          timestamp: null,
          raw: {
            params: {
              turn: {
                usage: {
                  input_tokens: 100,
                  output_tokens: 25,
                  total_tokens: 125,
                },
              },
            },
          },
        },
      ],
    );

    expect(metrics.timings.map((segment) => [segment.id, segment.durationMs])).toEqual([
      ['total', 5000],
      ['queued', 1000],
      ['provider', 3000],
      ['asset_import', 1000],
    ]);
    expect(metrics.tokenUsage).toMatchObject({
      inputTokens: 100,
      outputTokens: 25,
      totalTokens: 125,
    });
  });
});
