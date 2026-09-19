import React from 'react';
import { RecipeControls } from './RecipeWorkbenchContext';

interface RecipeLayoutProps {
  isGenerating: boolean;
  children: React.ReactNode;
  /* Optional footer dock content */
  bottomDock?: React.ReactNode;
  /* Override default padding/layout */
  className?: string;
}

export const RecipeLayout: React.FC<RecipeLayoutProps> = ({
  isGenerating,
  children,
  bottomDock,
  className = 'p-6 flex items-center justify-center',
}) => {
  return (
    <div
      className={`recipe-layout-enter w-full h-full flex flex-col relative ${isGenerating ? 'data-[generating=true]:opacity-100' : ''}`}
      data-generating={isGenerating ? 'true' : 'false'}
    >
      {/* Main Content Area */}
      <div className={`recipe-layout-content studio-well flex-1 w-full overflow-hidden relative ${className}`}>
        {children}
      </div>

      {/* Universal Bottom Dock */}
      {bottomDock && (
        <RecipeControls>
          <div className="recipe-parameters">{bottomDock}</div>
        </RecipeControls>
      )}
    </div>
  );
};
