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
      aria-label={`Cozy Studio — change accent color (current: ${currentTheme})`}
    >
      <span className="relative flex h-8 w-7 items-center justify-center" aria-hidden="true">
        <span
          ref={ringRef}
          className="pointer-events-none absolute inset-0 rounded-full border border-[var(--wb-accent)] opacity-0"
        />
        <span
          ref={markRef}
          className={`relative flex h-8 w-7 items-center justify-center ${isGenerating ? 'motion-safe:animate-pulse' : ''}`}
        >
          <span
            aria-hidden="true"
            className="block h-8 w-7"
            // react-doctor-disable-next-line react-doctor/no-danger
            dangerouslySetInnerHTML={{ __html: logoSvg }}
          />
        </span>
      </span>

      {/* Text Label */}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-black tracking-tight text-[color:var(--wb-ink)] group-hover:opacity-90 transition-colors font-sans uppercase">
          COZY
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
