import React from 'react';
import { motion } from 'motion/react';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isGenerating ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-full flex flex-col relative ${isGenerating ? 'pointer-events-none' : ''}`}
    >
      {/* Main Content Area */}
      <div className={`flex-1 w-full overflow-hidden relative ${className}`}>{children}</div>

      {/* Universal Bottom Dock */}
      {bottomDock && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="absolute bottom-0 left-0 w-full z-40"
        >
          <div className="w-full max-w-[1920px] mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-4">
            {bottomDock}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
