import { CozyLoader as LoaderCircle } from '../CozyMascot';
import { Refresh as RefreshCw } from 'iconoir-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExtensionManifest } from '../../packages/shared/src/extensions';
import { WORKFLOW_MODULES, type WorkflowModuleId } from '../../packages/shared/src/workflowModules';
import {
  getEditableStudioSettings,
  updateEditableStudioSettings,
} from '../../services/studio-api/settings';
import { PackCoverGrid, PackDetail, type BrowsablePack } from './StylePackBrowser';
import {
  getInstalledPackPreview,
  getRemotePackPreview,
  installExtension,
  listAvailableExtensions,
  listInstalledExtensions,
  removeExtension,
  type AvailableExtension,
  type AvailableExtensionSource,
  type ExtensionOrigin,
  type InvalidExtensionFolder,
} from '../../services/studio-api/extensions';

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value.toLocaleString('en-US')} ${value === 1 ? singular : plural}`;
}

function statusLabel(extension: AvailableExtension) {
  if (!extension.installedVersion) return 'Not installed';
  if (extension.updateAvailable)
    return `Update available: ${extension.installedVersion} → ${extension.version}`;
  return extension.installedFrom === 'local'
    ? `In a local folder, version ${extension.installedVersion}`
    : `Installed, version ${extension.installedVersion}`;
}

function errorText(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

interface InstalledListing {
  extensions: ExtensionManifest[];
  installedLayers: Record<string, string[]>;
  origins: Record<string, ExtensionOrigin>;
  invalid: InvalidExtensionFolder[];
}

/** Style packs Studio reads now, from downloads and local folders (ADR 0011). */
function InstalledPacksSection({
  listing,
  packs,
  onOpen,
}: {
  listing: InstalledListing | null;
  packs: readonly BrowsablePack[];
  onOpen: (pack: BrowsablePack) => void;
}) {
  if (!listing) {
    return <p className="text-xs studio-muted">Reading installed packs…</p>;
  }
  const { extensions, origins, invalid } = listing;
  const styleCount = extensions.reduce((total, item) => total + item.stylePack.presetCount, 0);
  const localFolders = [
    ...new Set(
      extensions
        .map((item) => origins[item.id])
        .filter((origin): origin is ExtensionOrigin => origin?.from === 'local')
        .map((origin) => origin.folder),
    ),
  ];

  return (
    <section className="grid gap-2" aria-label="Installed style packs">
      {extensions.length === 0 ? (
        <p className="studio-list-row p-3 text-xs">
          No style packs yet. Styles stays empty until you install a pack from a source below.
        </p>
      ) : (
        <>
          <p className="text-xs">
            {formatCount(extensions.length, 'pack', 'packs')} ·{' '}
            {formatCount(styleCount, 'style', 'styles')}
          </p>
          {localFolders.map((folder) => (
            <p key={folder} className="text-xs studio-muted">
              Read in place from <span className="font-mono break-all">{folder}</span>. Change or
              remove these packs in that folder.
            </p>
          ))}
          <PackCoverGrid packs={packs} onOpen={onOpen} />
        </>
      )}
      {invalid.length > 0 ? (
        <details className="text-xs">
          <summary className="cursor-pointer text-[color:var(--wb-warning)]">
            {formatCount(invalid.length, 'folder', 'folders')} could not be read as a pack
          </summary>
          <ul className="mt-1 grid gap-1">
            {invalid.map((item) => (
              <li key={item.folder}>
                <span className="font-mono">{item.folder}</span>: {item.issues.join('; ')}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/** Turns optional workflow modules on or off; the change applies after a reload (ADR 0011). */
function WorkflowModulesSection({ onChanged }: { onChanged: () => void }) {
  const [disabled, setDisabled] = useState<WorkflowModuleId[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEditableStudioSettings()
      .then((settings) => setDisabled(settings.disabledWorkflowModules))
      .catch((reason: unknown) => setError(errorText(reason)));
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
      setError(errorText(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="grid gap-2 border-t border-[color:var(--wb-line)] pt-4"
      aria-label="Workflow modules"
    >
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

/**
 * Shows the style packs Studio reads as a browsable cover grid, installs more from remote
 * Extension Sources and turns workflow modules on or off (ADR 0011).
 */
export function SettingsExtensionsPanel() {
  const [installed, setInstalled] = useState<InstalledListing | null>(null);
  const [sources, setSources] = useState<AvailableExtensionSource[] | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);
  // Extensions whose full-quality cards the user wants with the next install or update.
  const [withCards, setWithCards] = useState<Record<string, boolean>>({});
  const [bulkWithCards, setBulkWithCards] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [installedResult, availableResult] = await Promise.allSettled([
        listInstalledExtensions({ refresh: true }),
        listAvailableExtensions(),
      ]);
      if (installedResult.status === 'fulfilled') setInstalled(installedResult.value);
      if (availableResult.status === 'fulfilled') {
        setSources(availableResult.value.sources);
        setTokenConfigured(availableResult.value.tokenConfigured);
      }
      const failure = [installedResult, availableResult].find((item) => item.status === 'rejected');
      if (failure?.status === 'rejected') setError(errorText(failure.reason));
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
      setError(errorText(reason));
    } finally {
      setBusyId(null);
    }
  };

  // Browsable packs keep a stable identity so their previews load once.
  const installedPacks = useMemo<BrowsablePack[]>(
    () =>
      (installed?.extensions ?? []).map((extension) => {
        const origin = installed?.origins[extension.id];
        const hasCards = installed?.installedLayers[extension.id]?.includes('cards') ?? false;
        // Copies whose source pack is installed stay hidden in Styles (see installedStylePacks).
        const installedPackIds = new Set(
          installed?.extensions.map((item) => item.stylePack.id) ?? [],
        );
        const hidden = Object.values(extension.stylePack.copiedFrom ?? {}).filter((source) =>
          installedPackIds.has(source.packId),
        ).length;
        const count = extension.stylePack.presetCount;
        return {
          key: `installed:${extension.id}`,
          title: extension.title,
          subtitle: `${
            hidden > 0
              ? `${count - hidden} of ${formatCount(count, 'style', 'styles')} shown`
              : formatCount(count, 'style', 'styles')
          } · ${
            origin?.from === 'download' ? 'Installed' : 'Local'
          }${hasCards ? ' · full cards' : ''}`,
          loadPreview: () => getInstalledPackPreview(extension.id),
        };
      }),
    [installed],
  );
  const remotePacks = useMemo(
    () =>
      new Map<string, BrowsablePack[]>(
        (sources ?? []).map((source) => [
          source.id,
          source.extensions.map((extension) => ({
            key: `remote:${source.id}:${extension.id}`,
            title: extension.title,
            subtitle: `${statusLabel(extension)} · ${formatBytes(extension.bytes)}`,
            loadPreview: () => getRemotePackPreview(source.id, extension.id),
          })),
        ]),
      ),
    [sources],
  );

  const installable = (sources ?? []).flatMap((source) =>
    source.extensions
      .filter((extension) => !extension.installedVersion || extension.updateAvailable)
      .map((extension) => ({ source, extension })),
  );
  const bulkBytes = installable.reduce(
    (total, { extension }) =>
      total +
      extension.bytes +
      (bulkWithCards ? (extension.layers?.find((layer) => layer.name === 'cards')?.bytes ?? 0) : 0),
    0,
  );

  // Installs one pack at a time; a failure is reported and the rest continue.
  const installAll = async () => {
    const failures: string[] = [];
    setBusyId('bulk');
    setError(null);
    for (const [index, { source, extension }] of installable.entries()) {
      setBulkProgress(`Installing ${index + 1} of ${installable.length}: ${extension.title}`);
      try {
        await installExtension(source.id, extension.id, bulkWithCards ? ['cards'] : []);
      } catch (reason) {
        failures.push(`${extension.title}: ${errorText(reason)}`);
      }
    }
    setBulkProgress(null);
    setBusyId(null);
    if (failures.length < installable.length) setNeedsReload(true);
    if (failures.length > 0) setError(`Some packs failed: ${failures.join(' · ')}`);
    await refresh();
  };

  const installedActions = (extension: ExtensionManifest) =>
    installed?.origins[extension.id]?.from === 'download' ? (
      <button
        type="button"
        className="studio-ghost-control px-3"
        disabled={busyId !== null}
        onClick={() => void run(extension.id, () => removeExtension(extension.id))}
      >
        {busyId === extension.id ? 'Removing…' : 'Remove'}
      </button>
    ) : null;

  const remoteActions = (source: AvailableExtensionSource, extension: AvailableExtension) => {
    const busy = busyId === extension.id;
    const canInstall = !extension.installedVersion || extension.updateAvailable;
    const cardsLayer = extension.layers?.find((layer) => layer.name === 'cards');
    const hasCards = extension.installedLayers.includes('cards');
    const wantsCards = withCards[extension.id] ?? hasCards;
    const layers: 'cards'[] = cardsLayer && wantsCards ? ['cards'] : [];
    const canAddCards =
      Boolean(cardsLayer) &&
      extension.installedFrom === 'download' &&
      !extension.updateAvailable &&
      !hasCards;
    return (
      <>
        {cardsLayer && canInstall ? (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={wantsCards}
              disabled={busyId !== null}
              onChange={(event) =>
                setWithCards((current) => ({ ...current, [extension.id]: event.target.checked }))
              }
            />
            Full-quality cards ({formatBytes(cardsLayer.bytes)})
          </label>
        ) : null}
        {canInstall ? (
          <button
            type="button"
            className="studio-primary-control px-3"
            disabled={busyId !== null}
            onClick={() =>
              void run(extension.id, () => installExtension(source.id, extension.id, layers))
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
              void run(extension.id, () => installExtension(source.id, extension.id, ['cards']))
            }
          >
            {busy ? 'Downloading…' : `Add full cards (${formatBytes(cardsLayer.bytes)})`}
          </button>
        ) : null}
      </>
    );
  };

  const openInstalled = installed?.extensions.find(
    (extension) => `installed:${extension.id}` === openKey,
  );
  const openRemote = (sources ?? [])
    .flatMap((source) => source.extensions.map((extension) => ({ source, extension })))
    .find(({ source, extension }) => `remote:${source.id}:${extension.id}` === openKey);
  const openPack =
    installedPacks.find((pack) => pack.key === openKey) ??
    [...remotePacks.values()].flat().find((pack) => pack.key === openKey);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Style packs</h3>
          <p className="mt-1 text-xs studio-muted">
            Packs add the styles you pick in Styles and Create. Open a pack to see its styles.
          </p>
        </div>
        <button
          type="button"
          className="studio-ghost-control flex items-center gap-2 px-3"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle size={13} className="animate-spin" />
          ) : (
            <RefreshCw width={13} height={13} />
          )}
          Check again
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

      {openPack ? (
        <PackDetail
          pack={openPack}
          onBack={() => setOpenKey(null)}
          actions={
            openInstalled
              ? installedActions(openInstalled)
              : openRemote
                ? remoteActions(openRemote.source, openRemote.extension)
                : null
          }
        />
      ) : (
        <>
          <InstalledPacksSection
            listing={installed}
            packs={installedPacks}
            onOpen={(pack) => setOpenKey(pack.key)}
          />

          <section
            className="grid gap-2 border-t border-[color:var(--wb-line)] pt-4"
            aria-label="Get more packs"
          >
            <div>
              <h3 className="text-sm font-semibold">Get more packs</h3>
              <p className="mt-1 text-xs studio-muted">
                Install packs published on GitHub. Studio checks each download before it replaces
                the installed version.{' '}
                {tokenConfigured
                  ? 'A GitHub token is set for private sources.'
                  : 'Private sources need COZY_STYLES_GITHUB_TOKEN in .env.local.'}
              </p>
            </div>

            {installable.length > 1 ? (
              <div className="studio-list-row flex flex-wrap items-center gap-3 p-3 text-xs">
                <button
                  type="button"
                  className="studio-ghost-control px-3"
                  disabled={busyId !== null}
                  onClick={() => void installAll()}
                >
                  Install all {installable.length} ({formatBytes(bulkBytes)})
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
                {bulkProgress ? <span role="status">{bulkProgress}</span> : null}
              </div>
            ) : null}

            {sources === null && !error ? (
              <p className="text-xs studio-muted">Checking sources…</p>
            ) : null}

            {sources?.map((source) => (
              <section key={source.id} className="grid gap-2" aria-label={`Source ${source.repo}`}>
                <h4 className="text-xs font-semibold">{source.repo}</h4>
                {source.error ? (
                  <p className="text-xs text-[color:var(--wb-danger)]">{source.error}</p>
                ) : source.extensions.length === 0 ? (
                  <p className="text-xs studio-muted">
                    This source has not published any packs yet.
                  </p>
                ) : (
                  <PackCoverGrid
                    packs={remotePacks.get(source.id) ?? []}
                    onOpen={(pack) => setOpenKey(pack.key)}
                  />
                )}
              </section>
            ))}
          </section>

          <WorkflowModulesSection onChanged={() => setNeedsReload(true)} />
        </>
      )}
    </div>
  );
}
