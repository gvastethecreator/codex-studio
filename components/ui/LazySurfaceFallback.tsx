import React from 'react';
import { IconLoader2 as Loader2 } from '@tabler/icons-react';

import { cn } from '../../lib/utils';

interface LazySurfaceFallbackProps {
  label: string;
  className?: string;
}

export const LazySurfaceFallback: React.FC<LazySurfaceFallbackProps> = ({
  label,
  className = 'absolute inset-0 grid place-items-center studio-scrim studio-muted',
}) => (
  <output aria-live="polite" className={cn('studio-muted', className)}>
    <div className="flex flex-col items-center gap-2 text-[10px] font-medium tracking-wide">
      <Loader2
        aria-hidden="true"
        size={30}
        strokeWidth={1.8}
        className="block animate-spin text-[color:var(--wb-ink)]"
      />
      <span>{label}</span>
    </div>
  </output>
);
