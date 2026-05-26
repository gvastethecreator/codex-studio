import React, { useState } from 'react';
import logoSvg from '../assets/logo.svg?raw';
import { useTheme } from '../hooks/useTheme';

interface LogoProps {
  isGenerating?: boolean;
}

const Logo: React.FC<LogoProps> = ({ isGenerating = false }) => {
  const { cycleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    cycleTheme();

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex items-center gap-2.5 rounded-xl p-1 outline-none select-none transition-transform active:scale-95 ${isAnimating ? 'animate-logo-pop' : ''}`}
      aria-label="Change Theme"
      title="Click to cycle theme"
    >
      <div className="relative flex size-8 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-accent-500/18 transition-all duration-500 ease-out-expo group-hover:scale-110 group-hover:opacity-100" />
        <div className="absolute inset-[1.5px] rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-sm transition-all duration-500 ease-out-expo group-hover:border-white/15 group-hover:bg-zinc-900/85" />
        <div
          aria-hidden="true"
          className={`relative z-10 size-5 text-accent-300 transition-all duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-white ${isGenerating ? 'animate-pulse text-accent-100' : ''}`}
          dangerouslySetInnerHTML={{ __html: logoSvg }}
        />
        <div
          className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent-400 shadow-[0_0_10px_rgba(var(--accent-500),0.45)] transition-all duration-300 ${isGenerating ? 'animate-pulse opacity-100' : 'opacity-75 group-hover:scale-110 group-hover:opacity-100'}`}
        />
        <div
          className={`absolute inset-0 bg-accent-500/20 blur-xl rounded-full transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>

      {/* Text Label */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-xs font-black tracking-tight text-zinc-100 group-hover:text-white transition-colors font-sans uppercase">
          CODEX
        </span>
        <span className="text-[7.5px] font-black text-accent-500 uppercase tracking-widest transition-colors duration-300 group-hover:text-accent-400">
          STUDIO
        </span>
      </div>
    </button>
  );
};

export default Logo;
