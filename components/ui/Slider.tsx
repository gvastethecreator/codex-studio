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
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between items-center text-xs text-[color:var(--wb-muted)] font-medium tracking-wide">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="wb-mono studio-field px-2 py-1">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="studio-range"
      />
    </div>
  );
};

export default Slider;
