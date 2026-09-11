import { describe, expect, it } from 'vitest';

import type { Job, JobEventRecord } from '../../../packages/shared/src';
import { buildJobMetrics, buildJobTraceSummary, parseJobTranscript } from './jobDetails';

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
      attempt: 1,
      attemptQueuedAt: '2026-05-26T10:00:00.000Z',
      workspaceId: 'default',
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
          metadata: { executionId: 'execution-one', attempt: 1, transport: 'subscription_http' },
          createdAt: '2026-05-26T10:00:01.000Z',
        },
        {
          id: 2,
          jobId: 'job-1',
          type: 'codex.started',
          message: 'Provider started',
          metadata: { executionId: 'execution-one' },
          createdAt: '2026-05-26T10:00:01.000Z',
        },
        {
          id: 3,
          jobId: 'job-1',
          type: 'codex.completed',
          message: 'Codex image generation completed.',
          metadata: { executionId: 'execution-one', durationMs: 3000 },
          createdAt: '2026-05-26T10:00:04.000Z',
        },
        {
          id: 4,
          jobId: 'job-1',
          type: 'asset.import.started',
          message: 'Import started',
          metadata: { executionId: 'execution-one' },
          createdAt: '2026-05-26T10:00:04.000Z',
        },
        {
          id: 5,
          jobId: 'job-1',
          type: 'asset.import.completed',
          message: 'Codex image asset imported.',
          metadata: { executionId: 'execution-one', assetId: 'asset-1' },
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
      { transcriptExecutionId: 'execution-one' },
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

  it('separates retry attempts and restarted worker spans, leaving missing evidence unavailable', () => {
    const timestamp = (seconds: number) => new Date(seconds * 1000).toISOString();
    const job: Job = {
      id: 'retried',
      workspaceId: 'default',
      kind: 'image_generate',
      providerId: 'comfy',
      sourceSpec: null,
      status: 'completed',
      execution: null,
      originalPrompt: 'draw',
      finalPromptUsed: 'draw',
      expandedPrompt: null,
      error: null,
      createdAt: timestamp(0),
      updatedAt: timestamp(22),
      completedAt: timestamp(22),
      attempt: 2,
      attemptQueuedAt: timestamp(10),
    };
    const event = (
      id: number,
      type: string,
      seconds: number,
      executionId: string,
      metadata = {},
    ): JobEventRecord => ({
      id,
      type,
      jobId: job.id,
      message: type,
      createdAt: timestamp(seconds),
      metadata: { executionId, transport: 'comfy', ...metadata },
    });
    const events = [
      event(1, 'job.started', 1, 'old-attempt'),
      event(2, 'external.completed', 7, 'old-attempt', { total_tokens: 999 }),
      event(4, 'job.started', 11, 'before-restart'),
      event(5, 'external.started', 11, 'before-restart'),
      event(6, 'job.interrupted', 12, 'before-restart'),
      event(7, 'job.started', 20, 'after-restart'),
      event(8, 'external.started', 20, 'after-restart'),
      event(9, 'external.completed', 21, 'after-restart', { durationMs: 99_000 }),
      event(10, 'asset.import.started', 21, 'after-restart'),
      event(11, 'asset.import.completed', 22, 'after-restart'),
    ];
    const metrics = buildJobMetrics(job, events, [], { afterEventId: 3 });
    expect(metrics).toMatchObject({
      attempt: 2,
      executionId: 'after-restart',
      transport: 'comfy',
      tokenUsage: null,
    });
    expect(metrics.timings.map(({ id, durationMs }) => [id, durationMs])).toEqual([
      ['total', 12_000],
      ['queued', 1000],
      ['provider', 1000],
      ['asset_import', 1000],
    ]);
    const missing = buildJobMetrics(
      { ...job, attemptQueuedAt: undefined },
      events.filter((item) => item.id !== 9),
      [],
      { afterEventId: 3 },
    );
    expect(missing.timings.find((segment) => segment.id === 'provider')?.durationMs).toBeNull();
    expect(missing.timings.find((segment) => segment.id === 'total')?.durationMs).toBeNull();
    expect(missing.timings.find((segment) => segment.id === 'queued')?.durationMs).toBeNull();
  });

  it('builds a provider-neutral trace summary from durable job facts', () => {
    const job: Job = {
      id: 'job-1',
      workspaceId: 'default',
      kind: 'image_generate',
      providerId: 'codex',
      sourceSpec: null,
      status: 'completed',
      execution: { model: 'gpt-image', reasoningEffort: 'medium' },
      originalPrompt: 'A small brass key',
      expandedPrompt: null,
      finalPromptUsed: 'A small brass key',
      error: null,
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:05.000Z',
      completedAt: '2026-05-26T10:00:05.000Z',
    };

    expect(
      buildJobTraceSummary(
        job,
        {
          id: 'turn-1',
          jobId: 'job-1',
          codexThreadId: null,
          codexTurnId: null,
          transcriptPath: 'D:/library/transcripts/job-1.jsonl',
          status: 'completed',
          createdAt: '2026-05-26T10:00:00.000Z',
          updatedAt: '2026-05-26T10:00:05.000Z',
        },
        [{ id: 'catalog-1' } as never],
        {
          timings: [{ id: 'total', label: 'Total process', durationMs: 5000 }],
          tokenUsage: null,
          estimatedPromptTokens: 4,
        },
      ),
    ).toMatchObject({
      providerId: 'codex',
      model: 'gpt-image',
      task: 'image_generate',
      status: 'completed',
      durationMs: 5000,
      assetCount: 1,
      transcriptPath: 'D:/library/transcripts/job-1.jsonl',
    });
  });
});
