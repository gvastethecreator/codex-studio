import React from 'react';
import {
  IconAlertTriangle as AlertTriangle,
  IconCheck as Check,
  IconDownload as Download,
  IconGif as Gif,
  IconLoader2 as Loader2,
  IconPlayerPlay as Play,
  IconRefresh as RefreshCw,
  IconSparkles as Sparkles,
} from '@tabler/icons-react';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
  type AnimationSequenceFramePlanItem,
  type AnimationSequenceFrameState,
  type AnimationSequenceRunView as AnimationSequenceRun,
} from '../../packages/shared/src/animationSequenceContracts';
import type { Job as StudioJob } from '../../packages/shared/src/types';
import type { GeneratedImageWithConfig, ImageGenerationConfig } from '../../types';
import { createAnimationFrameHandoff } from '../../lib/animationFrameHandoff';
import { animationSequenceRunCoordinator } from '../../services/animationSequenceRunCoordinator';
import { hasRecipeIdentity } from '../../lib/recipeIdentity';
import {
  isAnimationSequenceFramePromptCurrent,
  resolveAnimationSequenceFrameSelection,
  type LoadedAnimationSequenceFramePrompt,
} from '../../lib/animationSequenceFrameSelection';
import { getRecipeModuleUiModel } from './recipeModuleUi';
import {
  attachAnimationSequenceFrame,
  createAnimationSequenceRun,
  exportAnimationSequenceGif,
  getAnimationSequenceFramePrompt,
  getAnimationSequenceGifUrl,
  listAnimationSequenceRuns,
  runAnimationSequenceQa,
} from '../../services/localStudioService';

interface AnimationSequenceRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  onGenerate: (
    promptOverride?: string,
    configOverrides?: Partial<ImageGenerationConfig>,
    options?: {
      force?: boolean;
      preventModal?: boolean;
      useCurrentAttachments?: boolean;
      onJobCreated?: (job: StudioJob) => void;
    },
  ) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
  onSelectImage?: (image: GeneratedImageWithConfig) => void;
}

const { defaults: ANIMATION_DEFAULTS } = getRecipeModuleUiModel('animation-sequence');
const EMPTY_IMAGES: GeneratedImageWithConfig[] = [];

const STATUS_LABELS: Record<AnimationSequenceRun['status'], string> = {
  draft: 'Draft',
  planned: 'Planned',
  generating: 'Generating',
  waiting_for_frame: 'Waiting',
  ready_for_review: 'Ready',
  correcting: 'Correcting',
  exported: 'Exported',
  qa_passed: 'QA Passed',
  blocked: 'Blocked',
};

const FRAME_STATUS_LABELS: Record<AnimationSequenceFrameState['status'], string> = {
  planned: 'Planned',
  prompt_ready: 'Prompt ready',
  generating: 'Generating',
  generated: 'Generated',
  correcting: 'Correcting',
  blocked: 'Blocked',
};

const FRAME_STRATEGY_LABELS: Record<AnimationSequenceFramePlanItem['strategy'], string> = {
  anchor: 'Keyframe',
  recursive_inbetween: 'In-between',
  sequential_followup: 'Follow-up',
};

function getParams(recipeParams: ImageGenerationConfig['recipeParams']) {
  return {
    ...ANIMATION_DEFAULTS,
    ...(recipeParams ?? {}),
  };
}

function getFrameTone(frame: Pick<AnimationSequenceFrameState, 'status'> | null | undefined) {
  if (!frame) return 'border-white/10 bg-white/[0.035] text-zinc-400';
  if (frame.status === 'blocked') return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  if (frame.status === 'generated') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (frame.status === 'generating' || frame.status === 'correcting') {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
  }
  return 'border-white/10 bg-white/[0.035] text-zinc-300';
}

function getRunTone(status: AnimationSequenceRun['status'] | null | undefined) {
  if (status === 'blocked') return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  if (status === 'qa_passed') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'exported' || status === 'ready_for_review') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  }
  return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
}

function frameMatchesRun(image: GeneratedImageWithConfig, runId: string, frameId: string) {
  if (!hasRecipeIdentity(image.config, 'animation-sequence')) return false;
  const params = image.config.recipeParams ?? {};
  return params.runId === runId && params.frameId === frameId;
}

function findGeneratedFrameImage(
  images: GeneratedImageWithConfig[],
  runId: string,
  frameId: string,
) {
  return images.find((image) => frameMatchesRun(image, runId, frameId)) ?? null;
}

function getFrameDisplayLabel(ordinal: number) {
  return `Frame ${String(ordinal).padStart(2, '0')}`;
}

function getFrameDisplayStatus(
  frame: AnimationSequenceFramePlanItem,
  state: Pick<AnimationSequenceFrameState, 'status'> | null,
) {
  return state ? FRAME_STATUS_LABELS[state.status] : FRAME_STRATEGY_LABELS[frame.strategy];
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-md border border-white/10 bg-black/35 px-2 text-sm font-bold text-white outline-none transition-colors focus:border-amber-400/50"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-white/10 bg-black/35 px-2 text-xs font-bold uppercase tracking-wide text-white outline-none transition-colors focus:border-amber-400/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`flex h-9 items-center justify-between rounded-md border px-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
        value
          ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
          : 'border-white/10 bg-black/30 text-zinc-500'
      }`}
    >
      {label}
      <span className={`size-2 rounded-full ${value ? 'bg-amber-300' : 'bg-zinc-700'}`} />
    </button>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'primary';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-[10px] font-black uppercase tracking-widest transition-[background-color,border-color,color,opacity] disabled:cursor-not-allowed disabled:opacity-45 ${
        tone === 'primary'
          ? 'border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.07]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export const AnimationSequenceRecipe: React.FC<AnimationSequenceRecipeProps> = ({
  config,
  updateConfig,
  onGenerate,
  isGenerating,
  images = EMPTY_IMAGES,
  onSelectImage,
}) => {
  const params = React.useMemo(() => getParams(config.recipeParams), [config.recipeParams]);
  const prompt = config.prompt ?? '';
  const [runs, setRuns] = React.useState<AnimationSequenceRun[]>([]);
  const [isRunsLoading, setIsRunsLoading] = React.useState(true);
  const [runsLoadError, setRunsLoadError] = React.useState<string | null>(null);
  const [activeRun, setActiveRun] = React.useState<AnimationSequenceRun | null>(null);
  const [selectedFrameId, setSelectedFrameId] = React.useState<string | null>(null);
  const [promptLoadState, setPromptLoadState] = React.useState<{
    loadedPrompt: LoadedAnimationSequenceFramePrompt | null;
    isLoading: boolean;
    error: string | null;
  }>({ loadedPrompt: null, isLoading: false, error: null });
  const { loadedPrompt, isLoading: isPromptLoading, error: promptLoadError } = promptLoadState;
  const [promptReloadVersion, setPromptReloadVersion] = React.useState(0);
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const contract = React.useMemo(
    () => createAnimationSequenceContract({ ...params, prompt }),
    [params, prompt],
  );
  const draftFramePlan = React.useMemo(
    () => createAnimationSequenceFramePlan(contract),
    [contract],
  );
  const framePlan = activeRun?.framePlan ?? draftFramePlan;
  const selectedFrameKey = resolveAnimationSequenceFrameSelection(
    selectedFrameId,
    framePlan.frames.map((frame) => frame.id),
  );
  const selectedFrame =
    activeRun?.frames.find((frame) => frame.id === selectedFrameKey) ??
    activeRun?.frames[0] ??
    null;
  const selectedPlanFrame =
    framePlan.frames.find((frame) => frame.id === selectedFrameKey) ?? framePlan.frames[0] ?? null;
  const hasCurrentLoadedPrompt = isAnimationSequenceFramePromptCurrent({
    loadedPrompt,
    runId: activeRun?.id ?? null,
    frameId: selectedFrame?.id ?? null,
  });
  const selectedPrompt = activeRun
    ? hasCurrentLoadedPrompt
      ? (loadedPrompt?.prompt ?? '')
      : ''
    : (selectedPlanFrame?.prompt ?? '');
  const isSelectedPromptReady = Boolean(
    selectedPlanFrame && (!activeRun || hasCurrentLoadedPrompt),
  );
  const generatedCount =
    activeRun?.frames.filter((frame) => frame.status === 'generated').length ?? 0;
  const gifExport = activeRun?.exports.find((item) => item.format === 'gif') ?? null;
  const busy = isBusy || isGenerating;

  const refreshRuns = React.useCallback(async () => {
    setIsRunsLoading(true);
    setRunsLoadError(null);
    try {
      const payload = await listAnimationSequenceRuns();
      setRuns(payload.runs);
      setActiveRun((current) => {
        if (!current) return payload.runs[0] ?? null;
        return payload.runs.find((run) => run.id === current.id) ?? payload.runs[0] ?? null;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setRunsLoadError(message);
      throw err;
    } finally {
      setIsRunsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    updateConfig('recipeId', 'animation-sequence');
    if (config.recipeContext) updateConfig('recipeContext', '');
  }, [config.recipeContext, updateConfig]);

  React.useEffect(() => {
    let cancelled = false;
    setIsRunsLoading(true);
    setRunsLoadError(null);
    void listAnimationSequenceRuns()
      .then((payload) => {
        if (cancelled) return;
        setRuns(payload.runs);
        setActiveRun(payload.runs[0] ?? null);
      })
      .catch((err) => {
        if (!cancelled) setRunsLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setIsRunsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRunId = activeRun?.id ?? null;
  const resolvedSelectedFrameId = selectedFrame?.id ?? null;

  React.useEffect(() => {
    if (!activeRunId || !resolvedSelectedFrameId) {
      setPromptLoadState({ loadedPrompt: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    const runId = activeRunId;
    const frameId = resolvedSelectedFrameId;
    setPromptLoadState({ loadedPrompt: null, isLoading: true, error: null });
    void getAnimationSequenceFramePrompt(runId, frameId)
      .then((payload) => {
        if (!cancelled) {
          setPromptLoadState({
            loadedPrompt: { runId, frameId, prompt: payload.prompt },
            isLoading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPromptLoadState({
            loadedPrompt: null,
            isLoading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeRunId, promptReloadVersion, resolvedSelectedFrameId]);

  const setParam = React.useCallback(
    (key: string, value: unknown) => {
      updateConfig('recipeId', 'animation-sequence');
      updateConfig('recipeParams', {
        ...params,
        [key]: value,
      });
    },
    [params, updateConfig],
  );

  const runAction = React.useCallback(
    async (action: () => Promise<AnimationSequenceRun | null | void>, success: string) => {
      setIsBusy(true);
      setError(null);
      setMessage(null);
      try {
        const result = await action();
        if (result) setActiveRun(result);
        await refreshRuns();
        setMessage(success);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsBusy(false);
      }
    },
    [refreshRuns],
  );

  const handleCreateRun = () =>
    void runAction(
      () =>
        createAnimationSequenceRun({
          title: prompt ? `${contract.frameCount}-frame ${contract.method} sequence` : undefined,
          prompt,
          frameCount: contract.frameCount,
          fps: contract.fps,
          aspectRatio: contract.aspectRatio,
          method: contract.method,
          cyclic: contract.cyclic,
          pinEdges: contract.pinEdges,
          continuity: contract.continuity,
          styleLock: contract.styleLock,
          background: contract.background,
          matteColor: contract.matteColor,
          variantsPerFrame: contract.variantsPerFrame,
          outputFormats: ['gif'],
        }),
      'Run prepared.',
    );

  const generateFrame = (correctionMode: boolean) => {
    if (!activeRun || !selectedPlanFrame || !isSelectedPromptReady) return;
    const handoff = createAnimationFrameHandoff({
      runId: activeRun.id,
      contract: activeRun.contract,
      frame: selectedPlanFrame,
      correctionMode,
      availableFrames: images.flatMap((image) => {
        const params = image.config.recipeParams ?? {};
        if (params.runId !== activeRun.id || typeof params.frameId !== 'string') return [];
        return [
          {
            frameId: params.frameId,
            catalogId: image.id,
            sourceUrl: image.src,
          },
        ];
      }),
    });
    if (!handoff.ready) {
      setError(handoff.blockingReason);
      return;
    }
    onGenerate(
      selectedPrompt || selectedPlanFrame.prompt,
      {
        recipeId: 'animation-sequence',
        recipeParams: handoff.recipeParams,
        aspectRatio: activeRun.contract.aspectRatio,
        batchCount: handoff.outputCount,
        attachments: handoff.assets.map((asset) => ({
          id: `${activeRun.id}-${asset.frameId}-${asset.role}`,
          name: asset.name,
          dataUrl: asset.sourceUrl,
          sourceUrl: asset.sourceUrl,
          strength: 1,
        })),
      },
      {
        preventModal: true,
        onJobCreated: (job) => {
          void animationSequenceRunCoordinator
            .recordDispatch(activeRun.id, selectedPlanFrame.id, job.id)
            .then((run) => setActiveRun(run))
            .catch((dispatchError) =>
              setError(
                dispatchError instanceof Error ? dispatchError.message : String(dispatchError),
              ),
            );
        },
      },
    );
    setMessage(`${selectedPlanFrame.id} queued.`);
  };

  const syncGeneratedFrames = () => {
    if (!activeRun) return;
    void runAction(async () => {
      let updated: AnimationSequenceRun | null =
        await animationSequenceRunCoordinator.reconcile(activeRun);
      // Legacy Visual Batch attachments target one run record and must serialize.
      for (const frame of updated.frames) {
        if (frame.catalogImageId) continue;
        const image = findGeneratedFrameImage(images, activeRun.id, frame.id);
        if (!image) continue;
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        updated = await attachAnimationSequenceFrame(activeRun.id, {
          frameId: frame.id,
          jobId: frame.jobId,
          catalogImageId: image.id,
        });
      }
      return updated;
    }, 'Generated frames synced.');
  };

  const attachSelectedGeneratedFrame = () => {
    if (!activeRun || !selectedFrame) return;
    const image = findGeneratedFrameImage(images, activeRun.id, selectedFrame.id);
    if (!image) {
      setError('No matching generated catalog image found for the selected frame.');
      return;
    }
    void runAction(
      () =>
        attachAnimationSequenceFrame(activeRun.id, {
          frameId: selectedFrame.id,
          catalogImageId: image.id,
        }),
      'Frame attached.',
    );
  };

  const exportGif = () => {
    if (!activeRun) return;
    void runAction(async () => {
      const result = await exportAnimationSequenceGif(activeRun.id, {
        fps: activeRun.contract.fps,
        loop: activeRun.contract.cyclic,
      });
      return result.run;
    }, 'GIF exported.');
  };

  const runQa = () => {
    if (!activeRun) return;
    void runAction(() => runAnimationSequenceQa(activeRun.id), 'QA written.');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div
        data-animation-workbench="true"
        className="custom-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto p-3 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_24rem] xl:overflow-hidden"
      >
        <aside className="flex min-h-[34rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40 xl:min-h-0">
          <div className="border-b border-white/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  Animation Recipe
                </div>
                <h2 className="mt-1 truncate text-base font-black text-white">Frame Sequence</h2>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {contract.frameCount} frames / {contract.fps} fps / GIF
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-amber-400/25 bg-amber-500/10 text-amber-200">
                <Gif size={20} />
              </span>
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <label className="grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Motion Prompt
              </span>
              <textarea
                value={prompt}
                onChange={(event) => updateConfig('prompt', event.target.value)}
                rows={5}
                placeholder="Describe motion, timing, camera, and the visual anchor to preserve."
                aria-describedby={!prompt.trim() ? 'animation-prompt-requirement' : undefined}
                className="resize-none rounded-md border border-white/10 bg-black/35 p-2 text-sm text-zinc-100 outline-none transition-colors focus:border-amber-400/50"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <NumberField
                label="Frames"
                value={contract.frameCount}
                min={2}
                max={48}
                onChange={(value) => setParam('frameCount', value)}
              />
              <NumberField
                label="FPS"
                value={contract.fps}
                min={1}
                max={30}
                onChange={(value) => setParam('fps', value)}
              />
              <SelectField
                label="Ratio"
                value={contract.aspectRatio}
                options={['1:1', '16:9', '9:16', '4:3', '3:4']}
                onChange={(value) => {
                  setParam('aspectRatio', value);
                  updateConfig('aspectRatio', value as ImageGenerationConfig['aspectRatio']);
                }}
              />
              <SelectField
                label="Method"
                value={contract.method}
                options={['recursive', 'sequential']}
                onChange={(value) => setParam('method', value)}
              />
              <SelectField
                label="Continuity"
                value={contract.continuity}
                options={['loose', 'balanced', 'strict']}
                onChange={(value) => setParam('continuity', value)}
              />
              <label className="grid gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Matte
                </span>
                <input
                  type="color"
                  value={contract.matteColor}
                  onChange={(event) => setParam('matteColor', event.target.value)}
                  className="h-9 w-full rounded-md border border-white/10 bg-black/35"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <ToggleField
                label="Loop"
                value={contract.cyclic}
                onChange={(v) => setParam('cyclic', v)}
              />
              <ToggleField
                label="Style"
                value={contract.styleLock}
                onChange={(v) => setParam('styleLock', v)}
              />
            </div>

            <ActionButton
              tone="primary"
              onClick={handleCreateRun}
              disabled={busy || !prompt.trim()}
              className="mt-3 w-full"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Prepare
            </ActionButton>

            {!prompt.trim() ? (
              <p id="animation-prompt-requirement" className="mt-2 text-[11px] text-zinc-500">
                A motion prompt is required to prepare a run.
              </p>
            ) : null}

            <div className="mt-4">
              <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Recent runs
              </div>
              <div className="grid gap-2">
                {isRunsLoading ? (
                  <div
                    role="status"
                    className="rounded-md border border-white/10 px-3 py-4 text-xs text-zinc-500"
                  >
                    Loading runs...
                  </div>
                ) : null}
                {!isRunsLoading && runsLoadError ? (
                  <div
                    role="alert"
                    className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
                  >
                    <div>{runsLoadError}</div>
                    <button
                      type="button"
                      onClick={() => void refreshRuns().catch(() => {})}
                      className="mt-2 h-8 rounded-md border border-rose-400/25 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-100"
                    >
                      Retry runs
                    </button>
                  </div>
                ) : null}
                {!isRunsLoading && !runsLoadError && runs.length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/10 px-3 py-4 text-xs leading-relaxed text-zinc-600">
                    Prepared runs will appear here and remain available after refresh.
                  </div>
                ) : null}
                {runs.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => setActiveRun(run)}
                    aria-pressed={activeRun?.id === run.id}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      activeRun?.id === run.id
                        ? 'border-amber-400/45 bg-amber-500/10'
                        : 'border-white/10 bg-white/[0.035] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-white">{run.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${getRunTone(run.status)}`}
                      >
                        {STATUS_LABELS[run.status]}
                      </span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-zinc-600">
                      {run.id}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-[40rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-black/35 xl:min-h-0">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Active Run
              </div>
              <h3 className="truncate text-sm font-black text-white">
                {activeRun?.title ?? 'Draft plan'}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ActionButton onClick={syncGeneratedFrames} disabled={!activeRun || busy}>
                <RefreshCw size={13} />
                Sync
              </ActionButton>
              <ActionButton
                onClick={exportGif}
                disabled={!activeRun || generatedCount < (activeRun?.frames.length ?? 1) || busy}
              >
                <Download size={13} />
                GIF
              </ActionButton>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
            <div className="custom-scrollbar overflow-y-auto p-3">
              {activeRun && gifExport ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-emerald-500/25 bg-emerald-500/10">
                  <img
                    src={`${getAnimationSequenceGifUrl(activeRun.id)}?t=${encodeURIComponent(activeRun.updatedAt)}`}
                    alt="Exported animation preview"
                    className="mx-auto max-h-[340px] w-auto max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="mb-3 grid min-h-[220px] place-items-center rounded-lg border border-white/10 bg-white/[0.025] text-center">
                  <div>
                    <Gif size={44} className="mx-auto text-white/15" />
                    <p className="mt-3 text-xs font-bold text-zinc-500">
                      The playable preview appears after every frame is attached and exported.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
                {framePlan.frames.map((planFrame) => {
                  const state =
                    activeRun?.frames.find((frame) => frame.id === planFrame.id) ?? null;
                  const generatedImage = activeRun
                    ? findGeneratedFrameImage(images, activeRun.id, planFrame.id)
                    : null;
                  const selected = selectedFrameKey === planFrame.id;
                  const frameLabel = getFrameDisplayLabel(planFrame.ordinal);
                  const frameStatus = getFrameDisplayStatus(planFrame, state);
                  return (
                    <button
                      key={planFrame.id}
                      type="button"
                      onClick={() => setSelectedFrameId(planFrame.id)}
                      aria-label={`Select ${frameLabel}, ${frameStatus}`}
                      aria-pressed={selected}
                      className={`group min-h-28 overflow-hidden rounded-lg border text-left transition-colors ${
                        selected ? 'border-amber-400/60 bg-amber-500/10' : getFrameTone(state)
                      }`}
                    >
                      <div className="aspect-video bg-black/45">
                        {generatedImage ? (
                          <img
                            src={generatedImage.thumbnail ?? generatedImage.src}
                            alt={`${frameLabel} generated preview`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-white/15">
                            {state?.status === 'generated' ? (
                              <Check size={20} />
                            ) : (
                              <Play size={20} />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="font-mono text-[10px] font-black">{frameLabel}</div>
                        <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-widest opacity-70">
                          {frameStatus}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>
                    {generatedCount}/{activeRun?.frames.length ?? contract.frameCount} frames
                  </span>
                  <span>{activeRun ? STATUS_LABELS[activeRun.status] : 'Draft'}</span>
                  {activeRun?.qa ? (
                    <span className={activeRun.qa.ok ? 'text-emerald-300' : 'text-rose-300'}>
                      QA {activeRun.qa.ok ? 'OK' : 'Issues'}
                    </span>
                  ) : null}
                </div>
                <ActionButton onClick={runQa} disabled={!activeRun || busy}>
                  <Check size={13} />
                  QA
                </ActionButton>
              </div>
              {(message || error) && (
                <div
                  role={error ? 'alert' : 'status'}
                  aria-live={error ? 'assertive' : 'polite'}
                  className={`mt-2 flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${
                    error
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  {error ? <AlertTriangle size={14} /> : <Check size={14} />}
                  <span className="min-w-0 truncate">{error ?? message}</span>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="flex min-h-[30rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40 lg:col-span-2 xl:col-span-1 xl:min-h-0">
          <div className="border-b border-white/10 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Frame Inspector
            </div>
            <h3 className="mt-1 truncate text-sm font-black text-white">
              {selectedFrame?.id ?? selectedPlanFrame?.id ?? 'No frame'}
            </h3>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <textarea
              aria-label="Animation frame prompt"
              value={
                isPromptLoading
                  ? 'Loading prompt...'
                  : promptLoadError
                    ? ''
                    : !activeRun && !prompt.trim()
                      ? 'Enter a motion prompt to preview frame instructions.'
                      : selectedPrompt
              }
              readOnly
              rows={12}
              aria-describedby={promptLoadError ? 'animation-frame-prompt-error' : undefined}
              className="w-full resize-none rounded-md border border-white/10 bg-black/35 p-2 font-mono text-[11px] leading-relaxed text-zinc-300 outline-none"
            />

            {promptLoadError ? (
              <div
                id="animation-frame-prompt-error"
                role="alert"
                className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200"
              >
                <div>{promptLoadError}</div>
                <button
                  type="button"
                  onClick={() => setPromptReloadVersion((version) => version + 1)}
                  className="mt-2 h-8 rounded-md border border-rose-400/25 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-100"
                >
                  Retry prompt
                </button>
              </div>
            ) : null}

            <div className="mt-3 grid gap-2">
              <ActionButton
                tone="primary"
                onClick={() => generateFrame(false)}
                disabled={!activeRun || !selectedPlanFrame || !isSelectedPromptReady || busy}
              >
                <Play size={13} />
                Generate
              </ActionButton>
              <ActionButton
                onClick={() => generateFrame(true)}
                disabled={!activeRun || !selectedPlanFrame || !isSelectedPromptReady || busy}
              >
                <Sparkles size={13} />
                Correct
              </ActionButton>
              <ActionButton onClick={attachSelectedGeneratedFrame} disabled={!activeRun || busy}>
                <RefreshCw size={13} />
                Attach
              </ActionButton>
            </div>

            {activeRun && selectedFrame ? (
              <div className="mt-3 rounded-md border border-white/10 bg-white/[0.03] p-2 text-[10px] text-zinc-500">
                <div className="flex justify-between gap-2">
                  <span>Status</span>
                  <span className="font-black uppercase text-zinc-300">{selectedFrame.status}</span>
                </div>
                <div className="mt-1 flex justify-between gap-2">
                  <span>Catalog</span>
                  <span className="truncate font-mono text-zinc-300">
                    {selectedFrame.catalogImageId ?? 'none'}
                  </span>
                </div>
                {selectedFrame.catalogImageId && onSelectImage ? (
                  <button
                    type="button"
                    onClick={() => {
                      const image = images.find((item) => item.id === selectedFrame.catalogImageId);
                      if (image) onSelectImage(image);
                    }}
                    className="mt-2 h-8 w-full rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-zinc-300"
                  >
                    Preview
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
};
