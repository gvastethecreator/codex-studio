import { useEffect, useRef } from 'react';

interface UseGenerationQueueControllerProps {
  isGenerating: boolean;
  isQueueOpen: boolean;
  setIsQueueOpen: (isOpen: boolean) => void;
}

/** Open Queue once when a generation transitions from idle to active. */
export function useGenerationQueueController({
  isGenerating,
  isQueueOpen,
  setIsQueueOpen,
}: UseGenerationQueueControllerProps) {
  const wasGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    const justStartedGenerating = isGenerating && !wasGeneratingRef.current;
    wasGeneratingRef.current = isGenerating;

    if (justStartedGenerating && !isQueueOpen) {
      setIsQueueOpen(true);
    }
  }, [isGenerating, isQueueOpen, setIsQueueOpen]);
}
