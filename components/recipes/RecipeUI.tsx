import React, { useId, useRef, useState } from 'react';
import {
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconColorPicker as Pipette,
} from '@tabler/icons-react';

import { DemandMountedGsapDropdown } from '../ui/DemandMountedGsapDropdown';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const menuId = useId();

  const activeStyle = colorMap[activeColor] || colorMap['accent'];

  return (
    <div className="flex flex-col gap-1.5">
      {title && (
        <span
          id={labelId}
          className="pl-1 text-[8px] font-black uppercase tracking-widest text-zinc-500"
        >
          {title}
        </span>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={`group flex min-h-10 min-w-[140px] items-center gap-3 rounded-xl border px-4 shadow-lg transition-[background-color,border-color,color,transform] active:scale-95 ${
            isOpen
              ? 'border-white/25 bg-white/8 text-white'
              : 'border-white/10 bg-zinc-900 text-zinc-200 hover:border-white/20 hover:bg-white/[0.04]'
          }`}
          aria-labelledby={title ? labelId : undefined}
          aria-label={title ? undefined : label}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={menuId}
        >
          <span className="shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-400">
            {icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-[10px] font-bold uppercase">
            {label}
          </span>
          <ChevronDown
            size={13}
            className={`shrink-0 text-zinc-600 transition-[color,transform] ${
              isOpen ? 'rotate-180 text-zinc-200' : ''
            }`}
            aria-hidden="true"
          />
        </button>
        <DemandMountedGsapDropdown
          id={menuId}
          open={isOpen}
          onOpenChange={setIsOpen}
          triggerRef={triggerRef}
          placement="top-left"
          role="listbox"
          aria-labelledby={title ? labelId : undefined}
          aria-label={title ? undefined : `${label} options`}
          className="recipe-control-popover custom-scrollbar absolute bottom-full left-0 z-50 mb-3 max-h-60 min-w-[190px] overflow-y-auto p-1"
        >
          {options.map((opt) => {
            const selected = label === opt;
            return (
              <button
                type="button"
                key={opt}
                role="option"
                aria-selected={selected}
                data-dropdown-item
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-[10px] font-bold uppercase transition-[background-color,border-color,color,transform] ${
                  selected
                    ? `${activeStyle.text} ${activeStyle.bg} ${activeStyle.border}`
                    : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <span className="truncate">{opt}</span>
                {selected ? <Check size={12} className="shrink-0" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </DemandMountedGsapDropdown>
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group relative flex h-10 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 transition-[border-color,transform] hover:border-emerald-500/50 active:scale-95"
        style={{ backgroundColor: color }}
        aria-label="Open color picker"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverId}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <Pipette
          size={14}
          className="text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <DemandMountedGsapDropdown
        id={popoverId}
        open={isOpen}
        onOpenChange={setIsOpen}
        triggerRef={triggerRef}
        placement="top-left"
        role="dialog"
        aria-label="Color picker"
        className="recipe-control-popover absolute bottom-full left-1/2 z-50 mb-3 min-w-[200px] -translate-x-1/2 rounded-2xl p-3"
      >
        <button
          type="button"
          data-dropdown-item
          onClick={() => nativePickerRef.current?.click()}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pipette size={12} /> Custom Color
        </button>
        <input
          ref={nativePickerRef}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Pick custom color"
          className="pointer-events-none absolute opacity-0"
        />
      </DemandMountedGsapDropdown>
    </div>
  );
};
