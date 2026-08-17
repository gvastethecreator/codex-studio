import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
  contentClassName?: string;
  hidden?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  contentClassName = '',
  hidden = false,
}) => {
  return (
    <div className={`tooltip relative inline-flex ${className}`}>
      {children}
      {hidden ? null : (
        <div className={`tooltip-content ${position} ${contentClassName}`}>{content}</div>
      )}
    </div>
  );
};

export default Tooltip;
