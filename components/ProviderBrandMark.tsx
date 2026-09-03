import {
  IconApi,
  IconBolt,
  IconBrandGoogle,
  IconBrandOpenai,
  IconBrandX,
  IconFlask,
  IconTopologyStar3,
} from '@tabler/icons-react';

import { providerBrandWellClass, providerRuntimeStatusDotClass } from '../lib/providerBrand';

const SIZE = {
  xs: { well: 'size-6 rounded-md', icon: 14 },
  sm: { well: 'size-8 rounded-lg', icon: 16 },
  md: { well: 'size-9 rounded-lg', icon: 18 },
} as const;

function ProviderGlyph({ providerId, size }: { providerId: string; size: number }) {
  if (providerId === 'codex') return <IconBrandOpenai size={size} stroke={1.7} />;
  if (providerId === 'grok') return <IconBrandX size={size} stroke={1.7} />;
  if (providerId === 'google') return <IconBrandGoogle size={size} stroke={1.7} />;
  if (providerId === 'antigravity') return <IconTopologyStar3 size={size} stroke={1.7} />;
  if (providerId === 'fal') return <IconBolt size={size} stroke={1.7} />;
  if (providerId === 'comfy') return <IconTopologyStar3 size={size} stroke={1.7} />;
  if (providerId === 'dry_run') return <IconFlask size={size} stroke={1.7} />;
  return <IconApi size={size} stroke={1.7} />;
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
        className={`grid place-items-center border ${metric.well} ${providerBrandWellClass(providerId)}`}
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
