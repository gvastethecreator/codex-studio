import { IconPalette as Palette } from '@tabler/icons-react';
import { useDefaultStylePack } from '../../hooks/useDefaultStylePack';
import { openStudioSettings } from '../../lib/studioSettingsDomains';

/** Shown where styles would be listed while Studio has no style pack installed (ADR 0011). */
export function NoStylePacksNotice({ compact = false }: { compact?: boolean }) {
  const defaultPack = useDefaultStylePack(true);
  const installing = defaultPack?.state === 'installing';
  const installed = defaultPack?.state === 'installed';
  const message = installing
    ? 'Studio is installing Essentials, a starter set of about a hundred styles.'
    : installed
      ? 'Essentials is installed. Reload Studio to see its styles.'
      : 'Styles come from style packs. Install a pack to fill this catalog.';
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] ${compact ? 'p-2.5' : 'p-4'}`}
    >
      <Palette size={compact ? 16 : 20} aria-hidden="true" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <strong className="block text-sm">No style packs yet</strong>
        <p className="text-xs text-[color:var(--wb-muted)]">{message}</p>
      </div>
      <button
        type="button"
        disabled={installing}
        onClick={() => (installed ? window.location.reload() : openStudioSettings('extensions'))}
        className="studio-primary-control px-3"
      >
        {installing ? 'Installing…' : installed ? 'Reload' : 'Get style packs'}
      </button>
    </div>
  );
}
