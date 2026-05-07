import React, { useState } from 'react';
import { Banana, Sparkles, Square } from 'lucide-react';
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
      onClick={handleClick}
      className={`group relative flex items-center gap-2 p-1 rounded-xl outline-none select-none transition-transform active:scale-95 ${isAnimating ? 'animate-logo-pop' : ''}`}
      aria-label="Change Theme"
      title="Click to cycle theme"
    >
      {/* Icon Container - Scaled down */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Layer 1: Back (Squircle/Square) */}
        <Square
          strokeWidth={1.5}
          className="absolute w-8 h-8 text-accent-500/20 fill-accent-500/10 rounded-lg transition-all duration-500 ease-out-expo group-hover:rotate-12 group-hover:scale-110"
        />

        {/* Layer 2: Mid (Sparkle) */}
        <Sparkles
          strokeWidth={2}
          className={`absolute w-3.5 h-3.5 -top-0.5 -right-0.5 text-accent-300 fill-accent-100/50 transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 group-hover:text-white ${isGenerating ? 'animate-spin' : 'animate-pulse'}`}
        />

        {/* Layer 3: Front (Banana) */}
        <div className="relative z-10 transition-transform duration-300 ease-out-expo group-hover:-rotate-12 group-hover:-translate-y-0.5">
          <Banana
            strokeWidth={2}
            className="w-5 h-5 text-accent-400 fill-accent-400/20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors duration-300 group-hover:text-accent-300 group-hover:fill-accent-400/40"
          />
        </div>

        {/* Center Glow */}
        <div
          className={`absolute inset-0 bg-accent-500/20 blur-xl rounded-full transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>

      {/* Text Label */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-xs font-black tracking-tight text-zinc-100 group-hover:text-white transition-colors font-sans uppercase">
          CHORITA
        </span>
        <span className="text-[7.5px] font-black text-accent-500 uppercase tracking-widest transition-colors duration-300 group-hover:text-accent-400">
          STUDIO
        </span>
      </div>
    </button>
  );
};

export default Logo;
