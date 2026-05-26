import React, { useMemo } from 'react';
import { MotionDiv, AnimatePresence } from 'motion/react';
import { AspectRatio } from '../types';
import { getImageGenSizeForRatio } from '../utils/imageGenSizing';

interface FormatPreviewProps {
  ratio: AspectRatio | null;
  isVisible: boolean;
  isWorkspaceEmpty?: boolean;
}

export const FormatPreview: React.FC<FormatPreviewProps> = ({
  ratio,
  isVisible,
  isWorkspaceEmpty = false,
}) => {
  const data = useMemo(() => (ratio ? getImageGenSizeForRatio(ratio) : null), [ratio]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && data && (
        <MotionDiv
          key="format-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[25] flex items-center backdrop-blur-[2px] justify-center p-8 md:p-12 lg:p-20 pointer-events-none"
        >
          <MotionDiv
            key={ratio}
            initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.05, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative size-full max-w-full max-h-full border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden
              ${
                isWorkspaceEmpty
                  ? 'border-white/10 bg-white/[0.01]'
                  : 'border-accent-500/40 bg-black/40 shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_60px_rgba(0,0,0,0.5)]'
              }
            `}
            style={{
              aspectRatio: `${data.width} / ${data.height}`,
              width: 'auto',
              height: '100%',
              viewTransitionName: 'master-canvas',
            }}
          >
            {/* Visual Guide Elements */}
            <div
              className={`flex flex-col items-center gap-2 transition-all duration-700 ${isWorkspaceEmpty ? 'opacity-20' : 'opacity-60'}`}
            >
              <span className="text-4xl md:text-8xl font-black text-white font-sans tracking-tighter drop-shadow-2xl select-none mix-blend-overlay">
                {ratio}
              </span>
              <div className="flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] font-mono font-black text-accent-400 uppercase tracking-widest">
                  {data.width}px
                </span>
                <div className="size-1 bg-white/20 rounded-full" />
                <span className="text-[10px] font-mono font-black text-accent-400 uppercase tracking-widest">
                  {data.height}px
                </span>
              </div>
            </div>

            {/* Technical Corner Accents */}
            <div
              className={`absolute top-6 left-6 size-6 border-t border-l rounded-tl-sm ${isWorkspaceEmpty ? 'border-white/20' : 'border-accent-400'}`}
            />
            <div
              className={`absolute top-6 right-6 size-6 border-t border-r rounded-tr-sm ${isWorkspaceEmpty ? 'border-white/20' : 'border-accent-400'}`}
            />
            <div
              className={`absolute bottom-6 left-6 size-6 border-b border-l rounded-bl-sm ${isWorkspaceEmpty ? 'border-white/20' : 'border-accent-400'}`}
            />
            <div
              className={`absolute bottom-6 right-6 size-6 border-b border-r rounded-br-sm ${isWorkspaceEmpty ? 'border-white/20' : 'border-accent-400'}`}
            />

            {/* Technical Grid (Rule of Thirds) */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 h-[0.5px] bg-white" />
              <div className="absolute top-2/3 left-0 right-0 h-[0.5px] bg-white" />
              <div className="absolute left-1/3 top-0 bottom-0 w-[0.5px] bg-white" />
              <div className="absolute left-2/3 top-0 bottom-0 w-[0.5px] bg-white" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[0.5px] bg-accent-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-[0.5px] bg-accent-500" />
            </div>

            {/* Floating Calibration Tag */}
            {!isWorkspaceEmpty && (
              <div className="absolute bottom-10 left-10 flex flex-col items-start gap-1">
                <span className="text-[7px] font-black text-accent-500 uppercase tracking-[0.3em]">
                  Calibration Active
                </span>
                <div className="w-24 h-0.5 bg-accent-950/40 rounded-full overflow-hidden">
                  <div className="size-full bg-accent-500/30 animate-scan-line" />
                </div>
              </div>
            )}
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};
