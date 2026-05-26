import React from 'react';
import Tooltip from '../Tooltip';

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger' | 'primary';
  isActive?: boolean;
  disabled?: boolean;
  tooltipPosition?: 'top' | 'bottom';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  variant = 'default',
  isActive = false,
  disabled = false,
  tooltipPosition = 'top',
}) => {
  let baseClasses =
    'relative flex items-center justify-center p-2 rounded-xl transition-all duration-200 outline-none group active:scale-90 ghost-btn';

  if (disabled) {
    baseClasses += ' opacity-20 cursor-not-allowed';
  } else {
    baseClasses += ' cursor-pointer';
  }

  // Pure Ghost Logic based on variant
  if (variant === 'danger') {
    baseClasses += disabled ? '' : ' text-red-500/60 hover:text-red-400 hover:bg-red-500/10';
  } else if (variant === 'primary' || isActive) {
    baseClasses += disabled
      ? ''
      : ' bg-gradient-to-b from-accent-950 to-accent-800 border border-accent-700/30 text-accent-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:text-white hover:border-accent-500/50';
  } else {
    baseClasses += disabled ? '' : ' text-zinc-500 hover:text-white hover:bg-white/5';
  }

  return (
    <Tooltip content={label} position={tooltipPosition}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick(e);
        }}
        aria-label={label}
        aria-pressed={isActive}
        disabled={disabled}
        className={baseClasses}
      >
        {icon}
        {isActive && variant !== 'primary' && (
          <span className="absolute -top-0.5 -right-0.5 size-1.5 bg-accent-500 rounded-2xl shadow-[0_0_10px_rgb(var(--accent-500)/0.8)]" />
        )}
      </button>
    </Tooltip>
  );
};

export default ActionButton;
