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
  const baseClasses = `studio-icon-action studio-ghost-control ${
    variant === 'danger' ? 'is-danger' : variant === 'primary' || isActive ? 'is-active' : ''
  }`;

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
          <span className="absolute -top-0.5 -right-0.5 size-1.5 bg-[color:var(--wb-accent)] rounded-full" />
        )}
      </button>
    </Tooltip>
  );
};

export default ActionButton;
