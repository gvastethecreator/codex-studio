import React from 'react';

interface BottomToolbarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ children, className = '', ...props }) => {
  return (
    <footer 
      className={`vt-bottom-toolbar ${className}`}
      {...props}
    >
      {children}
    </footer>
  );
};
