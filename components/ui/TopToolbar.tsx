import React from 'react';

interface TopToolbarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ children, className = '', ...props }) => {
  return (
    <header className={`vt-top-toolbar ${className}`} {...props}>
      {children}
    </header>
  );
};
