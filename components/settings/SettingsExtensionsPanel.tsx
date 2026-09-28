import { CozyLoader as LoaderCircle } from '../CozyMascot';
import { IconRefresh as RefreshCw } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { WORKFLOW_MODULES, type WorkflowModuleId } from '../../packages/shared/src/workflowModules';
import {
  getEditableStudioSettings,
  updateEditableStudioSettings,
} from '../../services/studio-api/settings';
import {
  installExtension,
  listAvailableExtensions,
  removeExtension,
  type AvailableExtension,
  type AvailableExtensionSource,
} from '../../services/studio-api/extensions';

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(extension: AvailableExtension) {
  if (!extension.installedVersion) return 'Not installed';
  if (extension.updateAvailable)
    return `Update available: ${extension.installedVersion} → ${extension.version}`;
  return extension.installedFrom === 'builtin'
    ? `Built in, version ${extension.installedVersion}`
    : `Installed, version ${extension.installedVersion}`;
}

/** Turns optional workflow modules on or off; the change applies after a reload (ADR 0011). */
function WorkflowModulesSection({ onChanged }: { onChanged: () => void }) {
  const [disabled, setDisabled] = useState<WorkflowModuleId[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEditableStudioSettings()
      .then((settings) => setDisabled(settings.disabledWorkflowModules))
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : String(reason)),
      );
  }, []);

  const toggle = async (id: WorkflowModuleId, enabled: boolean) => {
    if (!disabled) return;
    const next = enabled ? disabled.filter((item) => item !== id) : [...disabled, id];
    setSaving(true);
    setError(null);
    try {
      const saved = await updateEditableStudioSettings({ disabledWorkflowModules: next });
      setDisabled(saved.disabledWorkflowModules);
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-2" aria-label="Workflow modules">
      <div>
        <h3 className="text-sm font-semibold">Workflow modules</h3>
        <p className="mt-1 text-xs studio-muted">
          Create and Styles are always on. A module you turn off disappears from navigation, loads
          no code and accepts no new jobs. Its jobs and images stay in your library.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-[color:var(--wb-danger)]">
          {error}
        </p>
      ) : null}
      {WORKFLOW_MODULES.map((workflowModule) => (
        <label
          key={workflowModule.id}
          className="studio-list-row flex items-start justify-between gap-3 p-3"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{workflowModule.title}</span>
            <span className="block text-xs studio-muted">{workflowModule.description}</span>
          </span>
          <input
            type="checkbox"
            className="mt-1"
            aria-label={`${workflowModule.title} on`}
            checked={disabled ? !disabled.includes(workflowModule.id) : true}
            disabled={!disabled || saving}
            onChange={(event) => void toggle(workflowModule.id, event.target.checked)}
          />
        </label>
      ))}
    </section>
  );
}

/** Lists style packs published by remote Extension Sources and installs them (ADR 0011). */
export function SettingsExtensionsPanel() {
  const [sources, setSources] = useState<AvailableExtensionSource[] | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);
  // Extensions whose full-quality cards the user wants with the next install or update.
  const [withCards, setWithCards] = useState<Record<string, boolean>>({});
  // Packs picked for a group install, keyed by `sourceId::extensionId`.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWithCards, setBulkWithCards] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAvailableExtensions();
      setSources(result.sources);
      setTokenConfigured(result.tokenConfigured);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      setNeedsReload(true);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusyId(null);
    }
  };

  const installable = (sources ?? []).flatMap((source) =>
    source.extensions
      .filter((extension) => !extension.installedVersion || extension.updateAvailable)
      .map((extension) => ({ source, extension, key: `${source.id}::${extension.id}` })),
  );
  const selectedItems = installable.filter((item) => selected.has(item.key));
  const bulkBytes = (items: typeof installable) =>
    items.reduce(
      (total, { extension }) =>
        total +
        extension.bytes +
        (bulkWithCards
          ? (extension.layers?.find((layer) => layer.name === 'cards')?.bytes ?? 0)
          : 0),
      0,
    );

  // Installs one pack at a time; a failure is reported and the rest continue.
  const installMany = async (items: typeof installable) => {
    const failures: string[] = [];
    setBusyId('bulk');
    setError(null);
    for (const [index, { source, extension }] of items.entries()) {
      setBulkProgress(`Installing ${index + 1} of ${items.length}: ${extension.title}`);
      try {
        await installExtension(source.id, extension.id, bulkWithCards ? ['cards'] : []);
      } catch (reason) {
        failures.push(
          `${extension.title}: ${reason instanceof Error ? reason.message : String(reason)}`,
        );
      }
    }
    setBulkProgress(null);
    setBusyId(null);
    setSelected(new Set());
    if (failures.length < items.length) setNeedsReload(true);
    if (failures.length > 0) setError(`Some packs failed: ${failures.join(' · ')}`);
    await refresh();
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Style extensions</h3>
          <p className="mt-1 text-xs studio-muted">
            Install style packs published on GitHub. Studio checks each download before it replaces
            the installed version.
          </p>
        </div>
        <button
          type="button"
          className="studio-ghost-control flex items-center gap-2 px-3"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? <LoaderCircle size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Check sources
        </button>
      </div>

      {needsReload ? (
        <div role="status" className="studio-list-row flex items-center justify-between gap-3 p-3">
          <span className="text-xs">Reload Studio to apply your changes.</span>
          <button
            type="button"
            className="studio-ghost-control px-3"
            onClick={() => window.location.reload()}
          >
            Reload now
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-[color:var(--wb-danger)]">
          {error}
        </p>
      ) : null}

      <WorkflowModulesSection onChanged={() => setNeedsReload(true)} />

      <p className="text-xs studio-muted">
        Private sources:{' '}
        {tokenConfigured
          ? 'a GitHub token is configured.'
          : 'no GitHub token. Set COZY_STYLES_GITHUB_TOKEN in .env.local to read private repositories.'}
      </p>

      {installable.length > 0 ? (
        <div className="studio-list-row grid gap-2 p-3" aria-label="Install several packs">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span>
              {selectedItems.length} of {installable.length} packs selected
            </span>
            <button
              type="button"
              className="studio-ghost-control px-3"
              disabled={busyId !== null}
              onClick={() =>
                setSelected(
                  selectedItems.length === installable.length
                    ? new Set()
                    : new Set(installable.map((item) => item.key)),
                )
              }
            >
              {selectedItems.length === installable.length ? 'Clear selection' : 'Select all'}
            </button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkWithCards}
                disabled={busyId !== null}
                onChange={(event) => setBulkWithCards(event.target.checked)}
              />
              Include full-quality cards
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="studio-ghost-control px-3"
              disabled={busyId !== null || selectedItems.length === 0}
              onClick={() => void installMany(selectedItems)}
            >
              Install selected
              {selectedItems.length > 0 ? ` (${formatBytes(bulkBytes(selectedItems))})` : ''}
            </button>
            <button
              type="button"
              className="studio-ghost-control px-3"
              disabled={busyId !== null}
              onClick={() => void installMany(installable)}
            >
              Install all {installable.length} ({formatBytes(bulkBytes(installable))})
            </button>
          </div>
          {bulkProgress ? (
            <p role="status" className="text-xs">
              {bulkProgress}
            </p>
          ) : null}
        </div>
      ) : null}

      {sources?.map((source) => (
        <section key={source.id} className="grid gap-2" aria-label={`Source ${source.repo}`}>
          <h4 className="text-xs font-semibold">{source.repo}</h4>
          {source.error ? (
            <p className="text-xs text-[color:var(--wb-danger)]">{source.error}</p>
          ) : source.extensions.length === 0 ? (
            <p className="text-xs studio-muted">This source has not published any packs yet.</p>
          ) : (
            source.extensions.map((extension) => {
              const busy = busyId === extension.id;
              const canInstall = !extension.installedVersion || extension.updateAvailable;
              const cardsLayer = extension.layers?.find((layer) => layer.name === 'cards');
              const hasCards = extension.installedLayers.includes('cards');
              const wantsCards = withCards[extension.id] ?? hasCards;
              const layers: 'cards'[] = cardsLayer && wantsCards ? ['cards'] : [];
              const selectKey = `${source.id}::${extension.id}`;
              const canAddCards =
                Boolean(cardsLayer) &&
                extension.installedFrom === 'download' &&
                !extension.updateAvailable &&
                !hasCards;
              return (
                <div
                  key={extension.id}
                  className="studio-list-row flex flex-wrap items-center justify-between gap-3 p-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {canInstall ? (
                      <input
                        type="checkbox"
                        className="mt-1"
                        aria-label={`Select ${extension.title}`}
                        checked={selected.has(selectKey)}
                        disabled={busyId !== null}
                        onChange={(event) =>
                          setSelected((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(selectKey);
                            else next.delete(selectKey);
                            return next;
                          })
                        }
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{extension.title}</div>
                      <div className="text-xs studio-muted">
                        {extension.id} · {extension.version} · {formatBytes(extension.bytes)}
                      </div>
                      <div className="text-xs">
                        {statusLabel(extension)}
                        {hasCards ? ' · full-quality cards installed' : ''}
                      </div>
                      {cardsLayer && canInstall ? (
                        <label className="mt-2 flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={wantsCards}
                            disabled={busyId !== null}
                            onChange={(event) =>
                              setWithCards((current) => ({
                                ...current,
                                [extension.id]: event.target.checked,
                              }))
                            }
                          />
                          Include full-quality cards ({formatBytes(cardsLayer.bytes)})
                        </label>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canInstall ? (
                      <button
                        type="button"
                        className="studio-ghost-control px-3"
                        disabled={busyId !== null}
                        onClick={() =>
                          void run(extension.id, () =>
                            installExtension(source.id, extension.id, layers),
                          )
                        }
                      >
                        {busy ? 'Installing…' : extension.installedVersion ? 'Update' : 'Install'}
                      </button>
                    ) : null}
                    {canAddCards && cardsLayer ? (
                      <button
                        type="button"
                        className="studio-ghost-control px-3"
                        disabled={busyId !== null}
                        onClick={() =>
                          void run(extension.id, () =>
                            installExtension(source.id, extension.id, ['cards']),
                          )
                        }
                      >
                        {busy
                          ? 'Downloading…'
                          : `Add full cards (${formatBytes(cardsLayer.bytes)})`}
                      </button>
                    ) : null}
                    {extension.installedFrom === 'download' ? (
                      <button
                        type="button"
                        className="studio-ghost-control px-3"
                        disabled={busyId !== null}
                        onClick={() => void run(extension.id, () => removeExtension(extension.id))}
                      >
                        {busy ? 'Removing…' : 'Remove'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </section>
      ))}
    </div>
  );
}
