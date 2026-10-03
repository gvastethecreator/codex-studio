/** @vitest-environment jsdom */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import {
  createSpriteAtlasContract,
  type SpriteAtlasRun,
  type WorkflowRunUpdatedEventPayload,
} from '../../packages/shared/src';
import * as atlasApi from '../../services/studio-api/spriteAtlas';
import { SpriteAtlasRecipe } from './SpriteAtlasRecipe';
import { RecipeWorkbenchContext } from './RecipeWorkbenchContext';

const workflowRunListeners = new Set<(payload: WorkflowRunUpdatedEventPayload) => void>();

vi.mock('../../services/studioEventSource', () => ({
  createStudioEventStream: () => ({
    onWorkflowRunUpdated: (listener: (payload: WorkflowRunUpdatedEventPayload) => void) => {
      workflowRunListeners.add(listener);
      return () => workflowRunListeners.delete(listener);
    },
    onConnectionChange: () => () => undefined,
    onRevisionGap: () => () => undefined,
    close: () => undefined,
  }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SpriteAtlasRecipe', () => {
  it('explains why a preset without rows cannot prepare a run', async () => {
    vi.spyOn(atlasApi, 'listSpriteAtlasPresets').mockResolvedValue({ presets: [] });
    vi.spyOn(atlasApi, 'listSpriteAtlasRuns').mockResolvedValue({ runs: [] });
    const createRun = vi
      .spyOn(atlasApi, 'createSpriteAtlasRun')
      .mockRejectedValue(new Error('An empty run must not be created'));
    const renderRecipe = (presetId: string) => (
      <SpriteAtlasRecipe
        config={{ ...DEFAULT_GENERATION_CONFIG, prompt: '', recipeParams: { presetId } }}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />
    );
    const { rerender } = render(renderRecipe('custom-atlas'));
    const prepare = screen.getByRole('button', { name: 'Prepare Run' });
    const requirement = () =>
      document.getElementById(prepare.getAttribute('aria-describedby')!)?.textContent;
    expect(prepare.hasAttribute('disabled')).toBe(true);
    expect(requirement()).toContain('This preset has no rows.');
    fireEvent.click(prepare);
    expect(createRun).not.toHaveBeenCalled();
    await screen.findByText('No runs yet');

    rerender(renderRecipe('platformer-character'));
    expect(prepare.hasAttribute('disabled')).toBe(true);
    expect(requirement()).toBe('Add a prompt or a reference image to prepare a run.');
  });

  it('queues a row with the stored contract and the idle anchor image', async () => {
    const contract = createSpriteAtlasContract({ presetId: 'platformer-character' });
    const row = (id: string, catalogImageId: string | null) => ({
      id,
      status: catalogImageId ? ('raw_imported' as const) : ('planned' as const),
      frames: 4,
      promptPath: `/run/prompts/${id}.txt`,
      layoutGuidePath: `/run/guides/${id}.png`,
      rawPath: catalogImageId ? `/run/raw/${id}.png` : null,
      sourceSha256: catalogImageId ? 'hash' : null,
      catalogImageId,
      normalization: null,
      jobId: null,
      dispatch: null,
      blocked: null,
      updatedAt: '2026-10-02T12:00:00Z',
    });
    const run = {
      id: 'atlas-run',
      title: 'Courier',
      status: 'waiting_for_rows',
      createdAt: '2026-10-02T12:00:00Z',
      updatedAt: '2026-10-02T12:00:00Z',
      contract,
      paths: {} as SpriteAtlasRun['paths'],
      rows: [row('idle', 'idle-image'), row('run', null)],
      qa: null,
      visualReview: { status: 'pending', acceptedAt: null },
      anchor: { rowId: 'idle', sha256: 'hash' },
    } satisfies SpriteAtlasRun;
    vi.spyOn(atlasApi, 'listSpriteAtlasPresets').mockResolvedValue({ presets: [] });
    vi.spyOn(atlasApi, 'listSpriteAtlasRuns').mockResolvedValue({ runs: [run] });
    let resolveRunPrompt: (value: {
      rowId: string;
      prompt: string;
      promptPath: string;
    }) => void = () => {};
    vi.spyOn(atlasApi, 'getSpriteAtlasRowPrompt').mockImplementation(async (_runId, rowId) =>
      rowId === 'run'
        ? new Promise((resolve) => {
            resolveRunPrompt = resolve;
          })
        : { rowId, prompt: 'Row: idle', promptPath: '/run/prompts/idle.txt' },
    );
    const onGenerate = vi.fn();
    const sidePanel = document.body.appendChild(document.createElement('div'));
    render(
      <SpriteAtlasRecipe
        images={[
          {
            id: 'idle-image',
            src: '/api/images/idle-image',
            batchId: 'batch',
            createdAt: Date.parse('2026-10-02T12:00:00Z'),
            config: {
              ...DEFAULT_GENERATION_CONFIG,
              recipeParams: { runId: 'atlas-run', rowId: 'idle' },
            },
          },
        ]}
        config={{
          ...DEFAULT_GENERATION_CONFIG,
          recipeParams: { presetId: 'tileset-topdown', stylePreset: 'anime' },
        }}
        updateConfig={() => {}}
        onGenerate={onGenerate}
        activeProviderId="chatgpt"
        isGenerating={false}
      />,
      {
        wrapper: ({ children }) => (
          <RecipeWorkbenchContext.Provider
            value={{
              controls: null,
              action: null,
              overlay: null,
              sidePanel,
              compare: null,
              setCompare: () => {},
            }}
          >
            {children}
          </RecipeWorkbenchContext.Provider>
        ),
      },
    );

    await screen.findByRole('heading', { name: 'Courier' });
    fireEvent.click(screen.getByRole('button', { name: 'Row details' }));
    expect((await screen.findByRole('option', { name: /^idle · / })).textContent).not.toContain(
      'Row:',
    );
    fireEvent.click((await screen.findByText('run')).closest('button')!);
    const queue = screen.getByRole('button', { name: 'Queue with chatgpt' });
    // The previous row's prompt must not be sent while this row's prompt loads.
    expect(queue.hasAttribute('disabled')).toBe(true);
    resolveRunPrompt({ rowId: 'run', prompt: 'Row: run', promptPath: '/run/prompts/run.txt' });
    await waitFor(() => expect(queue.hasAttribute('disabled')).toBe(false));
    fireEvent.click(queue);

    const [prompt, overrides, options] = onGenerate.mock.calls[0]!;
    expect(prompt).toBe('Row: run');
    expect(overrides.recipeParams).toMatchObject({
      runId: 'atlas-run',
      rowId: 'run',
      presetId: 'platformer-character',
      stylePreset: contract.stylePreset,
    });
    expect(overrides.attachments[0]).toMatchObject({ name: 'idle identity anchor' });
    expect(overrides.attachments[0].dataUrl).toContain('/api/images/idle-image');
    expect(options).toMatchObject({ useCurrentAttachments: false });
    sidePanel.remove();
  });

  it('requires a composed atlas before accepting its visual check', async () => {
    const run: SpriteAtlasRun = {
      id: 'atlas-review',
      title: 'Atlas to review',
      status: 'prepared',
      createdAt: '2026-10-02T12:00:00Z',
      updatedAt: '2026-10-02T12:00:00Z',
      contract: createSpriteAtlasContract({}),
      paths: {
        runDir: '/atlas-review',
        requestPath: '/atlas-review/request.json',
        statusPath: '/atlas-review/status.json',
        promptsDir: '/atlas-review/prompts',
        layoutGuidesDir: '/atlas-review/layout-guides',
        rawDir: '/atlas-review/raw',
        framesDir: '/atlas-review/frames',
        handoffInboxDir: '/atlas-review/handoff/inbox',
        handoffOutboxDir: '/atlas-review/handoff/outbox',
        handoffStatusDir: '/atlas-review/handoff/status',
        handoffLogsDir: '/atlas-review/handoff/logs',
        atlasPath: '/atlas-review/atlas.png',
        manifestPath: '/atlas-review/manifest.json',
        qaReportPath: '/atlas-review/qa/report.json',
      },
      rows: [],
      qa: null,
      visualReview: { status: 'pending', acceptedAt: null },
      anchor: null,
    };
    vi.spyOn(atlasApi, 'listSpriteAtlasPresets').mockResolvedValue({ presets: [] });
    const listRuns = vi.spyOn(atlasApi, 'listSpriteAtlasRuns').mockResolvedValue({ runs: [run] });
    const acceptReview = vi.spyOn(atlasApi, 'acceptSpriteAtlasVisualReview').mockResolvedValue(run);
    render(
      <SpriteAtlasRecipe
        config={DEFAULT_GENERATION_CONFIG}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );

    await screen.findByRole('heading', { name: 'Atlas to review' });
    const review = screen.getByRole('button', { name: 'Accept visual check' });
    expect(review.hasAttribute('disabled')).toBe(true);
    fireEvent.click(review);
    expect(acceptReview).not.toHaveBeenCalled();

    listRuns.mockResolvedValue({ runs: [{ ...run, status: 'composed' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(review.hasAttribute('disabled')).toBe(false));
  });

  it('refetches the run when the backend reconciles it and syncs on request', async () => {
    const contract = createSpriteAtlasContract({ presetId: 'platformer-character' });
    const run: SpriteAtlasRun = {
      id: 'atlas-live',
      title: 'Live atlas',
      status: 'waiting_for_rows',
      createdAt: '2026-10-02T12:00:00Z',
      updatedAt: '2026-10-02T12:00:00Z',
      contract,
      paths: {} as SpriteAtlasRun['paths'],
      rows: [],
      qa: null,
      visualReview: { status: 'pending', acceptedAt: null },
      anchor: null,
    };
    vi.spyOn(atlasApi, 'listSpriteAtlasPresets').mockResolvedValue({ presets: [] });
    vi.spyOn(atlasApi, 'listSpriteAtlasRuns').mockResolvedValue({ runs: [run] });
    const getRun = vi
      .spyOn(atlasApi, 'getSpriteAtlasRun')
      .mockResolvedValue({ ...run, title: 'Reconciled atlas' });
    const reconcile = vi.spyOn(atlasApi, 'reconcileSpriteAtlasRun').mockResolvedValue(run);
    render(
      <SpriteAtlasRecipe
        config={DEFAULT_GENERATION_CONFIG}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );
    await screen.findByRole('heading', { name: 'Live atlas' });
    // The heading can commit before the selected run's event subscription effect runs.
    await waitFor(() => expect(workflowRunListeners.size).toBe(1));

    const emit = (payload: WorkflowRunUpdatedEventPayload) =>
      workflowRunListeners.forEach((listener) => listener(payload));
    act(() => {
      emit({ recipeId: 'sprite-atlas', runId: 'another-run' });
      emit({ recipeId: 'animation-sequence', runId: 'atlas-live' });
    });
    expect(getRun).not.toHaveBeenCalled();
    await act(async () => emit({ recipeId: 'sprite-atlas', runId: 'atlas-live' }));
    await screen.findByRole('heading', { name: 'Reconciled atlas' });
    expect(getRun).toHaveBeenCalledWith('atlas-live');

    fireEvent.click(screen.getByRole('button', { name: 'Sync' }));
    await waitFor(() => expect(reconcile).toHaveBeenCalledWith('atlas-live'));
  });
});
