import React from 'react';
import logoSvg from '../assets/logo.svg?raw';

interface LogoProps {
  isGenerating?: boolean;
}

const Logo: React.FC<LogoProps> = ({ isGenerating = false }) => {
  return (
    <div
      className="studio-logo relative flex items-center gap-2 rounded-lg p-0.5 select-none"
      aria-label="Codex Studio"
    >
      <div className="relative flex size-7 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-accent-500/18 transition-[opacity,transform] duration-500 ease-out-expo group-hover:scale-110 group-hover:opacity-100" />
        <div className="absolute inset-[1.5px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-well)] backdrop-blur-sm transition-[background-color,border-color] duration-500 ease-out-expo group-hover:border-[color:var(--wb-accent)] group-hover:bg-[color:var(--wb-panel)]" />
        <div
          aria-hidden="true"
          className={`relative z-10 size-[18px] text-accent-300 transition-[color,transform] duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-white ${isGenerating ? 'animate-pulse text-accent-100' : ''}`}
          // react-doctor-disable-next-line react-doctor/no-danger
          dangerouslySetInnerHTML={{ __html: logoSvg }}
        />
        <div
          className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent-400 shadow-[0_0_10px_rgba(var(--accent-500),0.45)] transition-[opacity,transform] duration-300 ${isGenerating ? 'animate-pulse opacity-100' : 'opacity-75 group-hover:scale-110 group-hover:opacity-100'}`}
        />
        <div
          className={`absolute inset-0 bg-accent-500/20 blur-xl rounded-full transition-opacity duration-500 ${isGenerating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>

      {/* Text Label */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-black tracking-tight text-[color:var(--wb-ink)] group-hover:opacity-90 transition-colors font-sans uppercase">
          CODEX
        </span>
        <span className="text-[7px] font-black text-accent-500 uppercase tracking-widest transition-colors duration-300 group-hover:text-accent-400">
          STUDIO
        </span>
      </div>
    </div>
  );
};

export default Logo;
