import React from 'react';
import { Paperclip } from 'lucide-react';

interface DropZoneOverlayProps {
  isVisible: boolean;
}

const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-200 rounded-xl border-2 border-dashed border-accent-400">
      <div className="text-center text-white">
        <Paperclip className="size-8 mx-auto text-accent-200" />
        <h2 className="mt-2 text-lg font-bold text-white uppercase tracking-tighter">
          Drop images to synthesize
        </h2>
      </div>
    </div>
  );
};

export default DropZoneOverlay;
