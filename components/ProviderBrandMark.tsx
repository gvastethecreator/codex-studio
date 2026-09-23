import { IconApi, IconFlask } from '@tabler/icons-react';
import codexMark from '../assets/providers/codex.svg';
import grokMark from '../assets/providers/grok.svg';
import googleMark from '../assets/providers/google.svg';
import antigravityMark from '../assets/providers/antigravity.svg';
import falMark from '../assets/providers/fal.svg';
import comfyMark from '../assets/providers/comfy.svg';
import { providerBrandWellClass, providerRuntimeStatusDotClass } from '../lib/providerBrand';

const SIZE = {
  xs: { well: 'size-6', icon: 18 },
  sm: { well: 'size-8', icon: 22 },
  md: { well: 'size-9', icon: 24 },
} as const;

const PROVIDER_MARKS: Record<string, string> = {
  codex: codexMark,
  chatgpt: codexMark,
  grok: grokMark,
  google: googleMark,
  antigravity: antigravityMark,
  fal: falMark,
  comfy: comfyMark,
};

function ProviderGlyph({ providerId, size }: { providerId: string; size: number }) {
  const src = PROVIDER_MARKS[providerId];
  if (src && ['codex', 'chatgpt', 'grok', 'fal'].includes(providerId))
    return (
      <span
        className={`provider-mark provider-mark-${providerId} provider-mark-monochrome`}
        style={{
          width: providerId === 'fal' ? size * 2 : size,
          height: size,
          maskImage: `url("${src}")`,
        }}
      />
    );
  if (src)
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        className={`provider-mark provider-mark-${providerId}`}
      />
    );
  return providerId === 'dry_run' ? <IconFlask size={size} /> : <IconApi size={size} />;
}

export function ProviderBrandMark({
  providerId,
  size = 'md',
  status,
  canExecute,
  className = '',
}: {
  providerId: string;
  size?: keyof typeof SIZE;
  status?: string;
  canExecute?: boolean;
  className?: string;
}) {
  const metric = SIZE[size];
  const showStatus = typeof canExecute === 'boolean';

  return (
    <span className={`relative shrink-0 ${className}`}>
      <span
        aria-hidden="true"
        className={`grid place-items-center ${metric.well} ${providerBrandWellClass(providerId)}`}
      >
        <ProviderGlyph providerId={providerId} size={metric.icon} />
      </span>
      {showStatus ? (
        <span
          aria-hidden="true"
          className={`absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full ring-2 ring-zinc-950 ${providerRuntimeStatusDotClass(
            {
              canExecute: Boolean(canExecute),
              status: status ?? 'unknown',
            },
          )}`}
        />
      ) : null}
    </span>
  );
}
