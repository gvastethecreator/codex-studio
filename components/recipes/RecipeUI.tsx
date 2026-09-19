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
  accent: { text: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/2' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/2' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/2' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/2' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/2' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/2' },
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
          className="pl-1 text-[8px] font-black uppercase tracking-widest text-[color:var(--wb-muted)]"
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
              ? 'border-[color:var(--wb-line)] bg-white/8 text-[color:var(--wb-ink)]'
              : 'border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] text-[color:var(--wb-ink)] hover:border-[color:var(--wb-border)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_4%,transparent)]'
          }`}
          aria-labelledby={title ? labelId : undefined}
          aria-label={title ? undefined : label}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={menuId}
        >
          <span className="shrink-0 text-[color:var(--wb-muted)] transition-colors group-hover:text-[color:var(--wb-muted)]">
            {icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-[10px] font-bold uppercase">
            {label}
          </span>
          <ChevronDown
            size={13}
            className={`shrink-0 text-[color:var(--wb-dim)] transition-[color,transform] ${
              isOpen ? 'rotate-180 text-[color:var(--wb-ink)]' : ''
            }`}
            aria-hidden="true"
          />
        </button>
        <DemandMountedGsapDropdown
          portal
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
                    : 'border-transparent text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] hover:text-[color:var(--wb-ink)]'
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
        className="group relative flex h-10 w-12 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--wb-line)] transition-[border-color,transform] hover:border-emerald-500/2 active:scale-95"
        style={{ backgroundColor: color }}
        aria-label="Open color picker"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverId}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <Pipette
          size={14}
          className="text-[color:var(--wb-ink)] drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <DemandMountedGsapDropdown
        portal
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
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[10px] font-bold uppercase tracking-wide text-[color:var(--wb-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
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
