import React from 'react';
import {
  IconAlertTriangle as AlertTriangle,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconClipboardList as ClipboardList,
  IconFileImport as FileImport,
  IconFileText as FileText,
  IconFolder as Folder,
  IconLoader2 as Loader2,
  IconPackage as Package,
  IconPlus as Plus,
  IconRefresh as RefreshCw,
  IconSearch as Search,
} from '@tabler/icons-react';
import {
  createSpriteAtlasContract,
  SPRITE_ATLAS_ASSET_KINDS,
  type SpriteAtlasAssetKind,
  type SpriteAtlasPresetSummary,
  type SpriteAtlasRowState,
  type SpriteAtlasRowStatus,
  type SpriteAtlasRun,
} from '../../packages/shared/src';
import type { ImageGenerationConfig } from '../../types';
import {
  composeSpriteAtlasFixture,
  createSpriteAtlasRowJob,
  createSpriteAtlasRowJobs,
  createSpriteAtlasRun,
  getSpriteAtlasAtlasUrl,
  getSpriteAtlasLayoutGuideUrl,
  getSpriteAtlasRowPrompt,
  importSpriteAtlasRow,
  listSpriteAtlasPresets,
  listSpriteAtlasRuns,
  runSpriteAtlasQa,
} from '../../services/localStudioService';
import { GsapDropdown } from '../ui/GsapDropdown';

interface SpriteAtlasRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  isGenerating: boolean;
}

const STAGE_LABELS: Record<SpriteAtlasRun['status'], string> = {
  draft: 'Draft',
  prepared: 'Prepared',
  waiting_for_rows: 'Waiting',
  ready_to_extract: 'Ready',
  composed: 'Composed',
  qa_passed: 'QA Passed',
  blocked: 'Blocked',
};

const ROW_STATUS_LABELS: Record<SpriteAtlasRowStatus, string> = {
  planned: 'Planned',
  handoff_ready: 'Handoff',
  generating: 'Generating',
  raw_imported: 'Imported',
  blocked: 'Blocked',
  extracted: 'Extracted',
};

const ROW_STATUS_FILTERS = [
  'all',
  'planned',
  'handoff_ready',
  'raw_imported',
  'blocked',
  'extracted',
] as const satisfies ReadonlyArray<'all' | SpriteAtlasRowStatus>;

type AssetKindFilter = 'all' | SpriteAtlasAssetKind;
type InspectorTab = 'guide' | 'prompt' | 'artifacts';

function getParams(config: ImageGenerationConfig) {
  return config.recipeParams ?? {};
}

function getRowTone(row: SpriteAtlasRowState) {
  if (row.status === 'blocked') return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  if (row.status === 'raw_imported' || row.status === 'extracted') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (row.status === 'handoff_ready' || row.status === 'generating') {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
  }
  return 'border-white/10 bg-white/[0.035] text-zinc-300';
}

function getRunTone(status: SpriteAtlasRun['status'] | null | undefined) {
  if (status === 'blocked') return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  if (status === 'qa_passed') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (status === 'ready_to_extract' || status === 'composed') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  }
  return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
}

function getPresetTone(assetKind: SpriteAtlasAssetKind) {
  if (assetKind === 'tileset') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200';
  if (assetKind === 'texture') return 'border-amber-500/25 bg-amber-500/10 text-amber-200';
  if (assetKind === 'asset') return 'border-pink-500/25 bg-pink-500/10 text-pink-200';
  if (assetKind === 'custom') return 'border-violet-500/25 bg-violet-500/10 text-violet-200';
  return 'border-sky-500/25 bg-sky-500/10 text-sky-200';
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getFrameTotal(rows: Array<{ frames: number }>) {
  return rows.reduce((total, row) => total + row.frames, 0);
}

function getRowCounts(rows: SpriteAtlasRowState[]) {
  return rows.reduce(
    (counts, row) => {
      counts[row.status] += 1;
      return counts;
    },
    {
      planned: 0,
      handoff_ready: 0,
      generating: 0,
      raw_imported: 0,
      blocked: 0,
      extracted: 0,
    } satisfies Record<SpriteAtlasRowStatus, number>,
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildPipeline(run: SpriteAtlasRun | null) {
  const rows = run?.rows ?? [];
  const total = rows.length;
  const jobs = rows.filter((row) => Boolean(row.jobId)).length;
  const imported = rows.filter(
    (row) => row.status === 'raw_imported' || row.status === 'extracted',
  ).length;

  return [
    {
      id: 'prepare',
      label: 'Prepare',
      detail: run ? `${total} rows` : 'No run',
      state: run ? 'complete' : 'idle',
    },
    {
      id: 'handoff',
      label: 'Handoff',
      detail: `${jobs}/${total || 0} jobs`,
      state: !run
        ? 'idle'
        : jobs === total && total > 0
          ? 'complete'
          : jobs > 0
            ? 'active'
            : 'idle',
    },
    {
      id: 'import',
      label: 'Import',
      detail: `${imported}/${total || 0} rows`,
      state:
        !run || total === 0
          ? 'idle'
          : imported === total
            ? 'complete'
            : imported > 0
              ? 'active'
              : 'idle',
    },
    {
      id: 'compose',
      label: 'Compose',
      detail: run?.status === 'composed' || run?.status === 'qa_passed' ? 'atlas.png' : 'pending',
      state:
        run?.status === 'composed' || run?.status === 'qa_passed'
          ? 'complete'
          : run
            ? 'idle'
            : 'idle',
    },
    {
      id: 'qa',
      label: 'QA',
      detail: run?.qa ? run.qa.mode : 'not run',
      state:
        run?.status === 'blocked' ? 'blocked' : run?.qa?.ok ? 'complete' : run ? 'idle' : 'idle',
    },
  ] as const;
}

export const SpriteAtlasRecipe: React.FC<SpriteAtlasRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const [presets, setPresets] = React.useState<SpriteAtlasPresetSummary[]>([]);
  const [runs, setRuns] = React.useState<SpriteAtlasRun[]>([]);
  const [activeRun, setActiveRun] = React.useState<SpriteAtlasRun | null>(null);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [rowSourcePath, setRowSourcePath] = React.useState('');
  const [assetKindFilter, setAssetKindFilter] = React.useState<AssetKindFilter>('all');
  const [rowQuery, setRowQuery] = React.useState('');
  const [rowStatusFilter, setRowStatusFilter] =
    React.useState<(typeof ROW_STATUS_FILTERS)[number]>('all');
  const [inspectorTab, setInspectorTab] = React.useState<InspectorTab>('guide');
  const [selectedPrompt, setSelectedPrompt] = React.useState('');
  const [isPromptLoading, setIsPromptLoading] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const params = getParams(config);
  const contract = React.useMemo(() => createSpriteAtlasContract(params), [params]);
  const selectedRow =
    activeRun?.rows.find((row) => row.id === selectedRowId) ?? activeRun?.rows[0] ?? null;
  const rowCounts = React.useMemo(() => getRowCounts(activeRun?.rows ?? []), [activeRun]);
  const pipeline = React.useMemo(() => buildPipeline(activeRun), [activeRun]);
  const currentPreset = presets.find((preset) => preset.id === contract.presetId);
  const busy = isBusy || isGenerating;

  const filteredPresets = React.useMemo(() => {
    return presets.filter(
      (preset) => assetKindFilter === 'all' || preset.assetKind === assetKindFilter,
    );
  }, [assetKindFilter, presets]);

  const visibleRows = React.useMemo(() => {
    const query = normalizeSearch(rowQuery);
    return (activeRun?.rows ?? []).filter((row) => {
      const matchesStatus = rowStatusFilter === 'all' || row.status === rowStatusFilter;
      const matchesQuery =
        !query ||
        [row.id, row.status, row.promptPath, row.rawPath ?? '', row.jobId ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [activeRun?.rows, rowQuery, rowStatusFilter]);

  const missingJobRows = React.useMemo(() => {
    return (activeRun?.rows ?? []).filter(
      (row) =>
        !row.jobId &&
        !row.rawPath &&
        row.status !== 'handoff_ready' &&
        row.status !== 'generating' &&
        row.status !== 'raw_imported' &&
        row.status !== 'extracted',
    );
  }, [activeRun?.rows]);

  const refreshRuns = React.useCallback(async () => {
    const payload = await listSpriteAtlasRuns();
    setRuns(payload.runs);
    setActiveRun((current) => {
      if (!current) return payload.runs[0] ?? null;
      return payload.runs.find((run) => run.id === current.id) ?? payload.runs[0] ?? null;
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [presetPayload, runPayload] = await Promise.all([
          listSpriteAtlasPresets(),
          listSpriteAtlasRuns(),
        ]);
        if (cancelled) return;
        setPresets(presetPayload.presets);
        setRuns(runPayload.runs);
        setActiveRun(runPayload.runs[0] ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!activeRun?.rows.length) {
      setSelectedRowId(null);
      return;
    }
    if (!selectedRowId || !activeRun.rows.some((row) => row.id === selectedRowId)) {
      setSelectedRowId(activeRun.rows[0]?.id ?? null);
    }
  }, [activeRun, selectedRowId]);

  React.useEffect(() => {
    if (!activeRun || !selectedRow) {
      setSelectedPrompt('');
      return;
    }

    let cancelled = false;
    setIsPromptLoading(true);
    void getSpriteAtlasRowPrompt(activeRun.id, selectedRow.id)
      .then((payload) => {
        if (!cancelled) setSelectedPrompt(payload.prompt);
      })
      .catch((err) => {
        if (!cancelled) {
          setSelectedPrompt(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setIsPromptLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeRun?.id, selectedRow?.id]);

  const setRecipeParam = React.useCallback(
    (key: string, value: unknown) => {
      updateConfig('recipeId', 'sprite-atlas');
      updateConfig('recipeParams', {
        ...getParams(config),
        [key]: value,
      });
    },
    [config, updateConfig],
  );

  const runAction = React.useCallback(
    async (
      action: () => Promise<SpriteAtlasRun | null | void>,
      success: string | (() => string),
    ) => {
      setIsBusy(true);
      setError(null);
      setMessage(null);
      try {
        const result = await action();
        if (result) setActiveRun(result);
        await refreshRuns();
        setMessage(typeof success === 'function' ? success() : success);
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
      async () =>
        createSpriteAtlasRun({
          title: `${contract.presetId} atlas`,
          prompt: config.prompt ?? '',
          ...params,
        }),
      'Run prepared.',
    );

  const handleCreateRowJob = () => {
    if (!activeRun || !selectedRow) return;
    void runAction(async () => {
      await createSpriteAtlasRowJob(activeRun.id, selectedRow.id);
      return null;
    }, 'Row handoff job created.');
  };

  const handleCreateMissingJobs = () => {
    if (!activeRun) return;
    let created = 0;
    void runAction(
      async () => {
        const result = await createSpriteAtlasRowJobs(
          activeRun.id,
          missingJobRows.map((row) => row.id),
        );
        created = result.jobs.length;
        return result.run;
      },
      () => `${created} handoff job${created === 1 ? '' : 's'} created.`,
    );
  };

  const handleImportRow = () => {
    if (!activeRun || !selectedRow) return;
    void runAction(
      () =>
        importSpriteAtlasRow(activeRun.id, { rowId: selectedRow.id, sourcePath: rowSourcePath }),
      'Row imported.',
    );
  };

  const handleBlockRow = () => {
    if (!activeRun || !selectedRow) return;
    void runAction(
      () =>
        importSpriteAtlasRow(activeRun.id, {
          rowId: selectedRow.id,
          blocked: {
            status: 'blocked',
            reasonKind: 'imagegen_unavailable',
            userMessage: 'Image generation is unavailable for this row.',
            suggestion: 'Reconnect Codex/imagegen or import a real generated row strip.',
          },
        }),
      'Blocked sidecar written.',
    );
  };

  const handleComposeFixture = () => {
    if (!activeRun) return;
    void runAction(() => composeSpriteAtlasFixture(activeRun.id), 'Fixture atlas composed.');
  };

  const handleRunQa = () => {
    if (!activeRun) return;
    void runAction(() => runSpriteAtlasQa(activeRun.id), 'QA report written.');
  };

  const selectPreset = (preset: SpriteAtlasPresetSummary) => {
    updateConfig('recipeId', 'sprite-atlas');
    updateConfig('recipeParams', {
      ...getParams(config),
      presetId: preset.id,
      stylePreset: createSpriteAtlasContract({ presetId: preset.id }).stylePreset,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-3 xl:grid-cols-[20rem_minmax(0,1fr)_24rem] xl:grid-rows-[minmax(0,1fr)_auto]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40 shadow-2xl">
          <div className="border-b border-white/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-300">
                  Atlas Recipe
                </div>
                <h2 className="mt-1 truncate text-base font-black text-white">Sprite Atlas</h2>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {contract.assetKind} / {contract.extractionMode}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-sky-400/25 bg-sky-500/10 text-sky-200">
                <Package size={20} />
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <Metric label="Rows" value={String(contract.rows.length)} />
              <Metric label="Frames" value={String(getFrameTotal(contract.rows))} />
              <Metric label="Cell" value={`${contract.cell.width}px`} />
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(['all', ...SPRITE_ATLAS_ASSET_KINDS] as const).map((kind) => (
                <FilterChip
                  key={kind}
                  active={assetKindFilter === kind}
                  onClick={() => setAssetKindFilter(kind)}
                >
                  {kind}
                </FilterChip>
              ))}
            </div>

            <div className="grid gap-2">
              {filteredPresets.map((preset) => {
                const active = preset.id === contract.presetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`group grid gap-2 rounded-lg border p-3 text-left transition-[background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-white/25 ${
                      active
                        ? 'border-sky-400/60 bg-sky-500/10'
                        : 'border-white/10 bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-white">{preset.label}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          {preset.rows} rows / {preset.frames} frames / {preset.cell.width}px
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-1 text-[8px] font-black uppercase tracking-widest ${getPresetTone(
                          preset.assetKind,
                        )}`}
                      >
                        {preset.assetKind}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <SelectField
                label="Style"
                value={contract.stylePreset}
                onChange={(value) => setRecipeParam('stylePreset', value)}
                options={[
                  'pixel-art',
                  'illustration',
                  'painterly',
                  'realistic',
                  'anime',
                  'vector',
                  'custom',
                ]}
              />
              <SelectField
                label="QA"
                value={contract.qaMode}
                onChange={(value) => setRecipeParam('qaMode', value)}
                options={['standard', 'strict']}
              />
              <SelectField
                label="Background"
                value={contract.backgroundRemoval}
                onChange={(value) => setRecipeParam('backgroundRemoval', value)}
                options={['chroma', 'auto', 'rembg', 'alpha']}
                className="col-span-2"
              />
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            {currentPreset && (
              <div className="mb-2 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-xs leading-relaxed text-zinc-400">
                {currentPreset.description}
              </div>
            )}
            <button
              type="button"
              onClick={handleCreateRun}
              disabled={busy}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-sky-300/30 bg-sky-400 px-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Prepare Run
            </button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/25 shadow-2xl xl:row-span-2">
          <div className="border-b border-white/10 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${getRunTone(
                      activeRun?.status,
                    )}`}
                  >
                    {activeRun ? STAGE_LABELS[activeRun.status] : 'No Run'}
                  </span>
                  <h3 className="truncate text-sm font-black uppercase tracking-widest text-white">
                    {activeRun?.title ?? 'Sprite Atlas Workbench'}
                  </h3>
                </div>
                {activeRun ? (
                  <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                    {activeRun.paths.runDir}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">Choose a preset and prepare a run.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <IconButton
                  label="Refresh"
                  onClick={() => void runAction(refreshRuns, 'Runs refreshed.')}
                  disabled={busy}
                >
                  <RefreshCw size={14} />
                </IconButton>
                <IconButton
                  label={`Jobs ${missingJobRows.length}`}
                  onClick={handleCreateMissingJobs}
                  disabled={busy || !activeRun || missingJobRows.length === 0}
                  tone="sky"
                >
                  <ClipboardList size={14} />
                </IconButton>
                <IconButton
                  label="Compose"
                  onClick={handleComposeFixture}
                  disabled={busy || !activeRun}
                  tone="amber"
                >
                  <Package size={14} />
                </IconButton>
                <IconButton
                  label="QA"
                  onClick={handleRunQa}
                  disabled={busy || !activeRun}
                  tone="emerald"
                >
                  <Check size={14} />
                </IconButton>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {pipeline.map((stage) => (
                <PipelineStep key={stage.id} stage={stage} />
              ))}
            </div>
          </div>

          {error && (
            <div className="m-3 flex items-start gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-100">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="m-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              {message}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeRun ? (
              <section className="flex h-full min-h-0 flex-col">
                <div className="grid gap-2 border-b border-white/10 p-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="relative min-w-0">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                      aria-hidden="true"
                    />
                    <input
                      value={rowQuery}
                      onChange={(event) => setRowQuery(event.target.value)}
                      placeholder="Search rows, jobs, paths"
                      className="h-9 w-full rounded-lg border border-white/10 bg-black/45 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 transition focus:border-sky-400/60"
                    />
                  </div>
                  <div className="custom-scrollbar flex gap-1.5 overflow-x-auto">
                    {ROW_STATUS_FILTERS.map((status) => (
                      <FilterChip
                        key={status}
                        active={rowStatusFilter === status}
                        onClick={() => setRowStatusFilter(status)}
                      >
                        {status === 'all' ? 'all' : ROW_STATUS_LABELS[status]}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-b border-white/10 p-3">
                  <Metric label="Handoff" value={String(rowCounts.handoff_ready)} />
                  <Metric label="Imported" value={String(rowCounts.raw_imported)} />
                  <Metric label="Blocked" value={String(rowCounts.blocked)} />
                  <Metric label="Open" value={String(missingJobRows.length)} />
                </div>

                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                  {visibleRows.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
                      {visibleRows.map((row) => (
                        <button
                          type="button"
                          key={row.id}
                          onClick={() => {
                            setSelectedRowId(row.id);
                            setInspectorTab('guide');
                          }}
                          className={`group flex min-h-[96px] flex-col justify-between rounded-lg border p-3 text-left transition-[background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-white/25 ${
                            selectedRow?.id === row.id
                              ? 'border-sky-400/60 bg-sky-500/10'
                              : 'border-white/10 bg-white/[0.035]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-white">{row.id}</div>
                              <div className="mt-1 font-mono text-[10px] text-zinc-600">
                                {row.frames} frames / {row.jobId ? 'job ready' : 'no job'}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${getRowTone(
                                row,
                              )}`}
                            >
                              {ROW_STATUS_LABELS[row.status]}
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className={`h-full rounded-full ${
                                row.status === 'blocked'
                                  ? 'bg-rose-400'
                                  : row.status === 'raw_imported' || row.status === 'extracted'
                                    ? 'bg-emerald-400'
                                    : row.jobId
                                      ? 'bg-sky-400'
                                      : 'bg-zinc-600'
                              }`}
                              style={{
                                width:
                                  row.status === 'raw_imported' || row.status === 'extracted'
                                    ? '100%'
                                    : row.jobId
                                      ? '52%'
                                      : '18%',
                              }}
                            />
                          </div>
                          {row.blocked && (
                            <p className="mt-2 line-clamp-2 text-xs text-rose-100/90">
                              {row.blocked.userMessage}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Search size={30} />}
                      title="No matching rows"
                      copy="Clear search or status filter."
                    />
                  )}
                </div>
              </section>
            ) : (
              <div className="grid h-full place-items-center p-3">
                <EmptyState
                  icon={<Folder size={34} />}
                  title="No Sprite Atlas run"
                  copy="Prepare Run creates prompts, guides, folders, and handoff inbox."
                />
              </div>
            )}
          </div>
        </main>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/35 shadow-2xl xl:row-span-2">
          {activeRun && selectedRow ? (
            <>
              <div className="border-b border-white/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Row Inspector
                    </div>
                    <h3 className="mt-1 truncate text-base font-black text-white">
                      {selectedRow.id}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${getRowTone(
                      selectedRow,
                    )}`}
                  >
                    {ROW_STATUS_LABELS[selectedRow.status]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-1.5">
                  {(['guide', 'prompt', 'artifacts'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setInspectorTab(tab)}
                      className={`min-h-8 rounded-md px-2 text-[9px] font-black uppercase tracking-widest transition ${
                        inspectorTab === tab
                          ? 'bg-white/12 text-white'
                          : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                {inspectorTab === 'guide' && (
                  <div className="grid gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Layout Guide
                        </span>
                        <FileText size={14} className="text-zinc-500" />
                      </div>
                      <img
                        src={getSpriteAtlasLayoutGuideUrl(activeRun.id, selectedRow.id)}
                        alt=""
                        className="h-auto w-full rounded-md border border-white/10 bg-black object-contain"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCreateRowJob}
                        disabled={busy}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-sky-400/20 bg-sky-500/10 px-3 text-xs font-black uppercase tracking-widest text-sky-100 hover:bg-sky-500/15 disabled:opacity-50"
                      >
                        <ClipboardList size={15} />
                        Row Job
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockRow}
                        disabled={busy}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-rose-400/20 bg-rose-500/10 px-3 text-xs font-bold uppercase tracking-widest text-rose-100 hover:bg-rose-500/15 disabled:opacity-50"
                      >
                        <AlertTriangle size={15} />
                        Block
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={rowSourcePath}
                        onChange={(event) => setRowSourcePath(event.target.value)}
                        placeholder="D:\\path\\row.png"
                        className="min-h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-zinc-900 px-2 font-mono text-xs text-white outline-none focus:border-sky-400/60"
                      />
                      <button
                        type="button"
                        onClick={handleImportRow}
                        disabled={busy || !rowSourcePath.trim()}
                        className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                        aria-label="Import selected row"
                      >
                        <FileImport size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {inspectorTab === 'prompt' && (
                  <div className="grid gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Prompt
                        </span>
                        {isPromptLoading && <Loader2 size={14} className="animate-spin" />}
                      </div>
                      <pre className="custom-scrollbar max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-md border border-white/10 bg-black/45 p-3 text-[11px] leading-relaxed text-zinc-300">
                        {selectedPrompt || 'Prompt unavailable.'}
                      </pre>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <dl className="grid gap-2 text-xs">
                        <PathRow label="Prompt" value={selectedRow.promptPath} />
                        <PathRow label="Request" value={activeRun.paths.requestPath} />
                        <PathRow label="Inbox" value={activeRun.paths.handoffInboxDir} />
                      </dl>
                    </div>
                  </div>
                )}

                {inspectorTab === 'artifacts' && (
                  <div className="grid gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                        Row Paths
                      </div>
                      <dl className="mt-2 grid gap-2 text-xs">
                        <PathRow label="Guide" value={selectedRow.layoutGuidePath} />
                        <PathRow label="Raw" value={selectedRow.rawPath ?? 'not imported'} />
                        <PathRow label="Frames" value={activeRun.paths.framesDir} />
                        <PathRow label="Outbox" value={activeRun.paths.handoffOutboxDir} />
                      </dl>
                    </div>

                    {activeRun.status === 'composed' || activeRun.status === 'qa_passed' ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                        <div className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                          Atlas
                        </div>
                        <img
                          src={getSpriteAtlasAtlasUrl(activeRun.id)}
                          alt=""
                          className="h-auto w-full rounded-md border border-white/10 bg-black object-contain"
                        />
                      </div>
                    ) : (
                      <EmptyState
                        icon={<Package size={28} />}
                        title="Atlas not composed"
                        copy="Compose writes atlas.png and manifest.json."
                      />
                    )}

                    {activeRun.qa && (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black uppercase tracking-widest text-zinc-500">
                            QA Report
                          </span>
                          <span className="font-mono text-zinc-500">{activeRun.qa.mode}</span>
                        </div>
                        <p className="mt-2 text-zinc-300">{activeRun.qa.summary}</p>
                        {activeRun.qa.issues.length > 0 && (
                          <ul className="mt-2 grid gap-1 text-amber-200">
                            {activeRun.qa.issues.map((issue) => (
                              <li key={issue}>{issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center p-3">
              <EmptyState
                icon={<FileText size={32} />}
                title="Select a row"
                copy="No row loaded."
              />
            </div>
          )}
        </aside>

        <aside className="min-h-0 overflow-hidden rounded-lg border border-white/10 bg-black/30 xl:col-start-1 xl:row-start-2">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3">
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Recent Runs
            </div>
            <span className="font-mono text-[10px] text-zinc-600">{runs.length}</span>
          </div>
          <div className="custom-scrollbar max-h-52 overflow-y-auto p-2 xl:max-h-64">
            {runs.length > 0 ? (
              <div className="grid gap-1.5">
                {runs.slice(0, 12).map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => {
                      setActiveRun(run);
                      setSelectedRowId(run.rows[0]?.id ?? null);
                    }}
                    className={`rounded-lg border p-2 text-left transition hover:border-white/25 ${
                      activeRun?.id === run.id
                        ? 'border-sky-400/50 bg-sky-500/10'
                        : 'border-white/10 bg-white/[0.025]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs font-bold text-zinc-200">
                        {run.title}
                      </span>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${getRunTone(
                          run.status,
                        )}`}
                      >
                        {STAGE_LABELS[run.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-zinc-600">
                      <span>{run.contract.presetId}</span>
                      <span>{formatUpdatedAt(run.updatedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center text-xs text-zinc-600">No runs yet</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 text-center">
    <div className="truncate text-sm font-black text-white">{value}</div>
    <div className="mt-0.5 truncate text-[9px] font-black uppercase tracking-widest text-zinc-500">
      {label}
    </div>
  </div>
);

const PathRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid gap-1">
    <dt className="font-black uppercase tracking-widest text-zinc-500">{label}</dt>
    <dd className="break-all font-mono text-[11px] text-zinc-300">{value}</dd>
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, value, options, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const labelId = React.useId();
  const listboxId = React.useId();

  return (
    <div
      className={`grid gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 ${className}`}
    >
      <span id={labelId}>{label}</span>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-md border px-2 text-left text-sm font-bold normal-case tracking-normal transition-[background-color,border-color,color,transform] ${
            isOpen
              ? 'border-sky-400/55 bg-sky-500/10 text-white'
              : 'border-white/10 bg-zinc-900 text-white hover:border-white/25 hover:bg-white/[0.04]'
          }`}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-zinc-500 transition-[color,transform] ${
              isOpen ? 'rotate-180 text-sky-100' : ''
            }`}
            aria-hidden="true"
          />
        </button>
        <GsapDropdown
          id={listboxId}
          open={isOpen}
          onOpenChange={setIsOpen}
          triggerRef={triggerRef}
          placement="bottom-left"
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 top-[calc(100%+0.4rem)] z-50 max-h-64 w-full min-w-40 overflow-y-auto rounded-md p-1"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                data-dropdown-item
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-[6px] px-2 py-1.5 text-left text-xs font-bold normal-case tracking-normal transition-[background-color,color] ${
                  selected
                    ? 'bg-sky-500/18 text-white'
                    : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-100'
                }`}
              >
                <span className="truncate">{option}</span>
                {selected ? <Check size={12} className="shrink-0 text-sky-100" /> : null}
              </button>
            );
          })}
        </GsapDropdown>
      </div>
    </div>
  );
};

const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-8 rounded-md border px-2 text-[9px] font-black uppercase tracking-widest transition ${
      active
        ? 'border-sky-400/60 bg-sky-500/15 text-white'
        : 'border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/25 hover:text-zinc-200'
    }`}
  >
    {children}
  </button>
);

const IconButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'neutral' | 'sky' | 'amber' | 'emerald';
  children: React.ReactNode;
}> = ({ label, onClick, disabled = false, tone = 'neutral', children }) => {
  const toneClass =
    tone === 'sky'
      ? 'border-sky-400/20 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15'
      : tone === 'amber'
        ? 'border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15'
        : tone === 'emerald'
          ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
      {label}
    </button>
  );
};

const PipelineStep: React.FC<{
  stage: ReturnType<typeof buildPipeline>[number];
}> = ({ stage }) => {
  const tone =
    stage.state === 'complete'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
      : stage.state === 'blocked'
        ? 'border-rose-500/25 bg-rose-500/10 text-rose-200'
        : stage.state === 'active'
          ? 'border-sky-500/25 bg-sky-500/10 text-sky-200'
          : 'border-white/10 bg-white/[0.025] text-zinc-500';
  return (
    <div className={`min-w-0 rounded-lg border p-2 ${tone}`}>
      <div className="truncate text-[9px] font-black uppercase tracking-widest">{stage.label}</div>
      <div className="mt-1 truncate font-mono text-[10px] opacity-75">{stage.detail}</div>
    </div>
  );
};

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  copy: string;
}> = ({ icon, title, copy }) => (
  <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
    <div>
      <div className="mx-auto grid size-12 place-items-center rounded-lg border border-white/10 bg-black/30 text-zinc-600">
        {icon}
      </div>
      <p className="mt-3 text-sm font-bold text-zinc-300">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{copy}</p>
    </div>
  </div>
);
