import React, { useState, useRef } from 'react';
import { MotionDiv, AnimatePresence } from 'motion/react';
import { Pipette } from 'lucide-react';

interface ControlDropdownProps {
  title?: string;
  icon: React.ReactNode;
  label: string;
  options: string[];
  onSelect: (v: string) => void;
  activeColor?: string;
}

// Static color mapping for Tailwind classes
const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  accent: { text: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

export const ControlDropdown: React.FC<ControlDropdownProps> = ({
  title,
  icon,
  label,
  options,
  onSelect,
  activeColor = 'accent',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeStyle = colorMap[activeColor] || colorMap['accent'];

  return (
    <div className="flex flex-col gap-1.5">
      {title && (
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
          {title}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-4 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 min-w-[140px] shadow-lg group"
        >
          <span className="text-zinc-500 shrink-0 group-hover:text-zinc-400 transition-colors">
            {icon}
          </span>
          <span className="text-[10px] font-bold text-zinc-200 uppercase truncate flex-1 text-left">
            {label}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <MotionDiv
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full mb-3 left-0 bg-zinc-950 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-y-auto max-h-60 min-w-[180px] z-50 custom-scrollbar p-1"
            >
              {options.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase rounded-lg border border-transparent transition-all
                                        ${
                                          label === opt
                                            ? `${activeStyle.text} ${activeStyle.bg} ${activeStyle.border}`
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                                        }`}
                >
                  {opt}
                </button>
              ))}
            </MotionDiv>
          )}
        </AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsOpen(false);
            }}
            role="button"
            tabIndex={0}
          />
        )}
      </div>
    </div>
  );
};

export const MinimalColorPicker: React.FC<{ color: string; onChange: (c: string) => void }> = ({
  color,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const nativePickerRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-12 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all flex items-center justify-center relative overflow-hidden group"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <Pipette
          size={14}
          className="text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 rounded-2xl p-3 shadow-2xl z-50 min-w-[200px]"
          >
            <button
              type="button"
              onClick={() => nativePickerRef.current?.click()}
              className="w-full h-8 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wide"
            >
              <Pipette size={12} /> Custom Color
            </button>
            <input
              ref={nativePickerRef}
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              aria-label="Pick custom color"
              className="absolute opacity-0 pointer-events-none"
            />
          </MotionDiv>
        )}
      </AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />}
    </div>
  );
};
