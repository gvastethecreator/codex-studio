import React from 'react';
import { RecipeControls, RecipeEditor } from './RecipeWorkbenchContext';

interface RecipeLayoutProps {
  isGenerating: boolean;
  editorLabel?: string;
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
  className = 'flex min-h-0 flex-col',
  editorLabel,
}) => {
  return (
    <div
      className={`recipe-layout-enter w-full h-full flex flex-col relative ${isGenerating ? 'data-[generating=true]:opacity-100' : ''}`}
      data-generating={isGenerating ? 'true' : 'false'}
    >
      {/* Main Content Area */}
      <div
        className={`recipe-layout-content studio-well flex-1 w-full overflow-hidden relative ${className}`}
      >
        {editorLabel ? <RecipeEditor label={editorLabel}>{children}</RecipeEditor> : children}
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
