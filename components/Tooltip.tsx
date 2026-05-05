import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
  contentClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '', contentClassName = '' }) => {
  return (
    <div className={`tooltip relative inline-flex ${className}`}>
      {children}
      <div className={`tooltip-content ${position} ${contentClassName}`}>
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
