import React from 'react';
import { IconLoader2 as Loader2 } from '@tabler/icons-react';

interface LazySurfaceFallbackProps {
  label: string;
  className?: string;
}

export const LazySurfaceFallback: React.FC<LazySurfaceFallbackProps> = ({
  label,
  className = 'absolute inset-0 grid place-items-center bg-black/30 text-zinc-400',
}) => (
  <output aria-live="polite" className={className}>
    <div className="flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest">
      <Loader2
        aria-hidden="true"
        size={30}
        strokeWidth={1.8}
        className="block animate-spin text-zinc-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]"
      />
      <span>{label}</span>
    </div>
  </output>
);
