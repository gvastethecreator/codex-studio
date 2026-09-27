import { CozyMascot } from '../CozyMascot';
import React from 'react';

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
      <CozyMascot size={112} state="working" />
      <span>{label}</span>
    </div>
  </output>
);
