import React from 'react';
import { useTheme } from '../hooks/useTheme';
import logoSvg from '../assets/logo.svg?raw';

interface LogoProps {
  isGenerating?: boolean;
}

const Logo: React.FC<LogoProps> = ({ isGenerating = false }) => {
  const { appearance, currentTheme, cycleTheme } = useTheme();
  const markRef = React.useRef<HTMLSpanElement>(null);
  const ringRef = React.useRef<HTMLSpanElement>(null);
  const animations = React.useRef<Animation[]>([]);

  React.useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const cancel = () => animations.current.forEach((animation) => animation.cancel());
    reducedMotion?.addEventListener('change', cancel);
    return () => {
      cancel();
      reducedMotion?.removeEventListener('change', cancel);
    };
  }, []);

  const handleClick = () => {
    cycleTheme();
    const mark = markRef.current;
    const ring = ringRef.current;
    const transform = mark ? getComputedStyle(mark).transform : 'none';
    animations.current.forEach((animation) => animation.cancel());
    if (!mark || !ring || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    animations.current = [
      mark.animate(
        [
          { transform },
          { transform: 'rotate(-12deg) scale(0.88)', offset: 0.2 },
          { transform: 'rotate(9deg) scale(1.12)', offset: 0.55 },
          { transform: 'rotate(0deg) scale(1)' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      ),
      ring.animate(
        [
          { transform: 'scale(0.85)', opacity: 0.6 },
          { transform: 'scale(1.45)', opacity: 0 },
        ],
        { duration: 420, easing: 'ease-out' },
      ),
    ];
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-tooltip={`Change accent color · ${currentTheme}`}
      className="studio-logo group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--wb-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--wb-bg)] relative flex items-center gap-2 rounded-lg p-0.5 select-none"
      aria-label={`Codex Studio — change accent color (current: ${currentTheme})`}
    >
      <span className="relative flex size-7 items-center justify-center" aria-hidden="true">
        <span
          ref={ringRef}
          className="pointer-events-none absolute inset-0 rounded-xl border border-[var(--wb-accent)] opacity-0"
        />
        <span ref={markRef} className="relative flex size-7 items-center justify-center">
          <span className="absolute inset-0 rounded-xl bg-accent-500/18 transition-[opacity,transform] duration-500 ease-out-expo group-hover:scale-110 group-hover:opacity-100" />
          <span className="absolute inset-[1.5px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-well)] backdrop-blur-sm transition-[background-color,border-color] duration-500 ease-out-expo group-hover:border-[color:var(--wb-accent)] group-hover:bg-[color:var(--wb-panel)]" />
          <span
            aria-hidden="true"
            className={`relative z-10 size-[18px] transition-[color,transform] duration-300 ease-out-expo ${appearance === 'light' ? 'text-accent-700 group-hover:text-accent-800' : 'text-accent-300 group-hover:text-accent-200'} ${isGenerating ? 'motion-safe:animate-pulse' : ''}`}
            // react-doctor-disable-next-line react-doctor/no-danger
            dangerouslySetInnerHTML={{ __html: logoSvg }}
          />
          <span
            className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent-400 shadow-[0_0_10px_rgb(var(--accent-500)/0.45)] transition-[opacity,transform] duration-300 ${isGenerating ? 'motion-safe:animate-pulse opacity-100' : 'opacity-75 group-hover:scale-110 group-hover:opacity-100'}`}
          />
          <span
            className={`absolute inset-0 bg-accent-500/20 blur-xl rounded-full transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          />
        </span>
      </span>

      {/* Text Label */}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-black tracking-tight text-[color:var(--wb-ink)] group-hover:opacity-90 transition-colors font-sans uppercase">
          CODEX
        </span>
        <span
          className={`text-[7px] font-black uppercase tracking-widest transition-colors duration-300 ${appearance === 'light' ? 'text-accent-700 group-hover:text-accent-800' : 'text-accent-500 group-hover:text-accent-400'}`}
        >
          STUDIO
        </span>
      </span>
    </button>
  );
};

export default Logo;
