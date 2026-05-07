import { useCallback, useEffect, useState } from 'react';

interface UseImageInputSurfaceProps {
  onFiles: (files: File[]) => void;
}

function filterImageFiles(files: Iterable<File>) {
  return Array.from(files).filter((file) => file.type.startsWith('image/'));
}

/**
 * Centralize browser paste and drag/drop image ingestion so the shell can opt
 * into image input without owning low-level DOM event plumbing.
 */
export function useImageInputSurface({ onFiles }: UseImageInputSurfaceProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let index = 0; index < items.length; index += 1) {
        if (!items[index].type.includes('image')) continue;
        const file = items[index].getAsFile();
        if (file) files.push(file);
      }

      if (files.length > 0) {
        onFiles(files);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [onFiles]);

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = filterImageFiles(event.dataTransfer.files as Iterable<File>);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}