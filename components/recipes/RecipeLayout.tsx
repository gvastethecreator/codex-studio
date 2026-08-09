import React from 'react';

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
  className = 'p-6 pb-32 flex items-center justify-center',
}) => {
  return (
    <div
      className={`recipe-layout-enter w-full h-full flex flex-col relative ${isGenerating ? 'data-[generating=true]:opacity-100' : ''}`}
      data-generating={isGenerating ? 'true' : 'false'}
    >
      {/* Main Content Area */}
      <div className={`recipe-layout-content flex-1 w-full overflow-hidden relative ${className}`}>
        {children}
      </div>

      {/* Universal Bottom Dock */}
      {bottomDock && (
        <div className="recipe-layout-dock-enter recipe-module-bottom-dock absolute bottom-0 left-0 w-full z-40 transition-[opacity,transform] duration-200 ease-out">
          <div className="custom-scrollbar w-full max-w-[1920px] mx-auto px-3 py-2 sm:px-4 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-4">
            {bottomDock}
          </div>
        </div>
      )}
    </div>
  );
};
