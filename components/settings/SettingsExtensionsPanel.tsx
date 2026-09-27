import { CozyLoader as LoaderCircle } from '../CozyMascot';
import { IconRefresh as RefreshCw } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
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

/** Lists style packs published by remote Extension Sources and installs them (ADR 0011). */
export function SettingsExtensionsPanel() {
  const [sources, setSources] = useState<AvailableExtensionSource[] | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);

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
          <span className="text-xs">Reload Studio to use the changed style packs.</span>
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

      <p className="text-xs studio-muted">
        Private sources:{' '}
        {tokenConfigured
          ? 'a GitHub token is configured.'
          : 'no GitHub token. Set COZY_STYLES_GITHUB_TOKEN in .env.local to read private repositories.'}
      </p>

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
              return (
                <div
                  key={extension.id}
                  className="studio-list-row flex flex-wrap items-center justify-between gap-3 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{extension.title}</div>
                    <div className="text-xs studio-muted">
                      {extension.id} · {extension.version} · {formatBytes(extension.bytes)}
                    </div>
                    <div className="text-xs">{statusLabel(extension)}</div>
                  </div>
                  <div className="flex gap-2">
                    {canInstall ? (
                      <button
                        type="button"
                        className="studio-ghost-control px-3"
                        disabled={busyId !== null}
                        onClick={() =>
                          void run(extension.id, () => installExtension(source.id, extension.id))
                        }
                      >
                        {busy ? 'Installing…' : extension.installedVersion ? 'Update' : 'Install'}
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
