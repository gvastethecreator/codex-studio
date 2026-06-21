import React from 'react';

interface LazySurfaceFallbackProps {
  label: string;
  className?: string;
}

export const LazySurfaceFallback: React.FC<LazySurfaceFallbackProps> = ({
  label,
  className = 'absolute inset-0 grid place-items-center bg-black/30 text-zinc-400',
}) => (
  <div role="status" aria-live="polite" className={className}>
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950/90 px-3 py-2 text-[10px] font-black uppercase tracking-widest">
      <span className="size-2 animate-pulse rounded-full bg-accent-400" />
      <span>{label}</span>
    </div>
  </div>
);
