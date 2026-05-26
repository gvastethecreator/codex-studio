import React from 'react';

interface SliderProps {
  label: string;
  icon?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  onChange,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between items-center text-xs text-zinc-400 font-medium tracking-wide">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-accent-300 bg-accent-950/40 px-1.5 py-0.5 rounded border border-accent-500/20 transition-all">
          {value}
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full input-groove flex items-center transition-all bg-zinc-800">
        <div
          className="absolute h-full rounded-full bg-accent-600 shadow-[0_0_10px_rgb(var(--accent-600)/0.5)] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute size-full opacity-0 cursor-pointer z-10"
        />

        <div
          className="absolute size-4 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none transform -translate-x-1/2 transition-transform duration-100 ease-out border border-zinc-200"
          style={{ left: `${percentage}%` }}
        >
          <div className="absolute inset-0.5 bg-zinc-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Slider;
