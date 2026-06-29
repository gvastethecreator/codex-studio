import React from 'react';

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
      <span
        aria-hidden="true"
        className="block size-8 animate-spin rounded-full border-[3px] border-white/15 border-t-white shadow-[0_0_12px_rgba(255,255,255,0.12)]"
      />
      <span>{label}</span>
    </div>
  </output>
);
