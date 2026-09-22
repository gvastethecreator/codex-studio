import React from 'react';
import Tooltip from '../Tooltip';

export function FloatingTooltip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Tooltip content={content} className="h-full w-full">
      {children}
    </Tooltip>
  );
}
