import {
  IconDatabase as Database,
  IconPhoto as FileImage,
  IconLoader as LoaderCircle,
  IconRefresh as RefreshCw,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import type {
  StorageMaintenanceAuditReport,
  StorageMaintenanceCompactResult,
  StorageMaintenanceThumbnailBackfillResult,
  ToolingLogsPruneResult,
} from '../../packages/shared/src/storageMaintenance';
import { createStorageRepairPlanFromAudit } from '../../packages/shared/src/storageMaintenance';
function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export interface SettingsMaintenancePanelProps {
  maintenance: {
    audit: StorageMaintenanceAuditReport | null;
    compactResult: StorageMaintenanceCompactResult | null;
    thumbnailBackfillResult: StorageMaintenanceThumbnailBackfillResult | null;
    toolingLogsPruneResult: ToolingLogsPruneResult | null;
    isLoadingAudit: boolean;
    runningAction: 'compact' | 'thumbnails' | 'tooling-logs' | null;
    refreshAudit: () => void | Promise<void>;
    compactStorage: (input?: {
      write?: boolean;
      vacuum?: boolean;
      confirm?: string | null;
    }) => void | Promise<void>;
    backfillThumbnails: (input?: {
      write?: boolean;
      confirm?: string | null;
      limit?: number;
    }) => void | Promise<void>;
    pruneToolingLogs: (input?: { retainPerTask?: number }) => void | Promise<void>;
  };
}

function getCompactOmittedBytes(result: StorageMaintenanceCompactResult | null) {
  return result?.results.reduce((total, item) => total + item.omittedBytes, 0) ?? 0;
}

function getCompactChangedRows(result: StorageMaintenanceCompactResult | null) {
  return result?.results.reduce((total, item) => total + item.changedRows, 0) ?? 0;
}

export function SettingsMaintenancePanel({ maintenance }: SettingsMaintenancePanelProps) {
  const {
    audit,
    compactResult,
    thumbnailBackfillResult,
    toolingLogsPruneResult,
    isLoadingAudit,
    runningAction,
    refreshAudit,
    compactStorage,
    backfillThumbnails,
    pruneToolingLogs,
  } = maintenance;
  const isCompactRunning = runningAction === 'compact';
  const isThumbnailRunning = runningAction === 'thumbnails';
  const isPruneRunning = runningAction === 'tooling-logs';
  const inlineBytes =
    audit?.payloadFields.reduce((total, field) => total + field.inlineBytes, 0) ?? 0;
  const compactRows = getCompactChangedRows(compactResult);
  const compactBytes = getCompactOmittedBytes(compactResult);
  const repairPlan = useMemo(
    () => (audit ? createStorageRepairPlanFromAudit(audit) : null),
    [audit],
  );

  const handleWriteCompact = () => {
    const confirmed = window.confirm(
      'Compact historical inline image payloads now? A local SQLite backup will be created first.',
    );
    if (!confirmed) return;
    void compactStorage({ write: true, confirm: 'compact-inline-payloads' });
  };

  const handleWriteThumbnails = () => {
    const confirmed = window.confirm(
      'Backfill thumbnails for source files that still exist? A local SQLite backup will be created first.',
    );
    if (!confirmed) return;
    void backfillThumbnails({ write: true, confirm: 'backfill-thumbnails', limit: 1000 });
  };

  return (
    <div className="mt-4 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            Storage Maintenance
          </h3>
          <p className="mt-1 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
            Audit, Compact, Backfill, Prune
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshAudit()}
          disabled={isLoadingAudit}
          className="flex h-9 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:opacity-40"
        >
          {isLoadingAudit ? (
            <LoaderCircle size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
          Audit
        </button>
      </div>

      {audit ? (
        <div className="grid gap-2 md:grid-cols-4">
          <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              SQLite
            </div>
            <div className="mt-1 font-mono text-xs font-bold text-[color:var(--wb-ink)]">
              {audit.database.formattedBytes}
            </div>
          </div>
          <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              Inline Payloads
            </div>
            <div className="mt-1 font-mono text-xs font-bold text-[color:var(--wb-ink)]">
              {formatBytes(inlineBytes)}
            </div>
          </div>
          <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              Missing Thumbs
            </div>
            <div className="mt-1 font-mono text-xs font-bold text-[color:var(--wb-ink)]">
              {audit.catalog.missingThumbnails}
            </div>
          </div>
          <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              Tooling Logs
            </div>
            <div className="mt-1 font-mono text-xs font-bold text-[color:var(--wb-ink)]">
              {audit.directories.toolingLogs?.formattedBytes ?? '0 B'}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
          Run audit to load current storage metrics.
        </div>
      )}

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
          <div className="mb-3 flex items-center gap-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            <Database size={14} className="text-[color:var(--wb-muted)]" />
            Payloads
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-label="Plan storage compaction"
              onClick={() => void compactStorage()}
              disabled={isCompactRunning}
              className="flex h-8 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:opacity-40"
            >
              {isCompactRunning ? <LoaderCircle size={13} className="animate-spin" /> : null}
              Plan
            </button>
            <button
              type="button"
              onClick={handleWriteCompact}
              disabled={isCompactRunning}
              className="h-8 rounded-[var(--wb-radius)] border border-amber-400/2 bg-amber-500/10 px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-warning)]  transition-colors hover:bg-amber-500/15 disabled:opacity-40"
            >
              Write
            </button>
          </div>
        </div>

        <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
          <div className="mb-3 flex items-center gap-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            <FileImage size={14} className="text-[color:var(--wb-muted)]" />
            Thumbnails
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void backfillThumbnails({ limit: 1000 })}
              disabled={isThumbnailRunning}
              className="flex h-8 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:opacity-40"
            >
              {isThumbnailRunning ? <LoaderCircle size={13} className="animate-spin" /> : null}
              Plan
            </button>
            <button
              type="button"
              onClick={handleWriteThumbnails}
              disabled={isThumbnailRunning}
              className="h-8 rounded-[var(--wb-radius)] border border-emerald-400/2 bg-emerald-500/10 px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-success)]  transition-colors hover:bg-emerald-500/15 disabled:opacity-40"
            >
              Write
            </button>
          </div>
        </div>

        <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
          <div className="mb-3 flex items-center gap-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
            <RefreshCw size={14} className="text-[color:var(--wb-muted)]" />
            Tooling Logs
          </div>
          <button
            type="button"
            onClick={() => void pruneToolingLogs({ retainPerTask: 20 })}
            disabled={isPruneRunning}
            className="flex h-8 items-center gap-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-3 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] disabled:opacity-40"
          >
            {isPruneRunning ? <LoaderCircle size={13} className="animate-spin" /> : null}
            Prune
          </button>
        </div>
      </div>

      {repairPlan ? (
        <div className="mt-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
              Repair Plan
            </div>
            <div className="font-mono text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-muted)]">
              {repairPlan.summary.itemCount} items / {formatBytes(repairPlan.summary.totalBytes)}
            </div>
          </div>
          {repairPlan.items.length > 0 ? (
            <div className="grid gap-2">
              {repairPlan.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_3%,transparent)] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-ink)]">
                      {item.title}
                    </span>
                    <span
                      className={`text-[length:var(--wbp-label)] font-semibold tracking-normal ${
                        item.severity === 'warning'
                          ? 'text-[color:var(--wb-warning)] '
                          : 'text-[color:var(--wb-muted)]'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[length:var(--wbp-label)] leading-relaxed text-[color:var(--wb-muted)]">
                    {item.detail}
                  </p>
                  <div className="mt-2 truncate font-mono text-[length:var(--wbp-label)] text-[color:var(--wb-dim)]">
                    {item.command}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-dim)]">
              No repair actions recommended by the current audit.
            </div>
          )}
        </div>
      ) : null}

      {(compactResult || thumbnailBackfillResult || toolingLogsPruneResult) && (
        <div className="mt-3 grid gap-2 text-[length:var(--wbp-label)] font-bold tracking-normal text-[color:var(--wb-muted)] md:grid-cols-3">
          {compactResult ? (
            <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
              <span className="text-[color:var(--wb-ink)]">Compact {compactResult.mode}</span>
              <div className="mt-1 font-mono text-[color:var(--wb-muted)]">
                {compactRows} rows / {formatBytes(compactBytes)}
              </div>
            </div>
          ) : null}
          {thumbnailBackfillResult ? (
            <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
              <span className="text-[color:var(--wb-ink)]">
                Thumbs {thumbnailBackfillResult.mode}
              </span>
              <div className="mt-1 font-mono text-[color:var(--wb-muted)]">
                {thumbnailBackfillResult.wroteRows} wrote / {thumbnailBackfillResult.plannedRows}{' '}
                planned / {thumbnailBackfillResult.missingSourceFiles} missing
              </div>
            </div>
          ) : null}
          {toolingLogsPruneResult ? (
            <div className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-3">
              <span className="text-[color:var(--wb-ink)]">Logs pruned</span>
              <div className="mt-1 font-mono text-[color:var(--wb-muted)]">
                {toolingLogsPruneResult.pruned} files / keep {toolingLogsPruneResult.retainPerTask}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-many-boolean-props -- settings dialog boundary intentionally receives explicit UI/loading flags
