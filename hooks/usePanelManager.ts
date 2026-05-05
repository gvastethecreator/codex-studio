import { useState, useCallback } from 'react';

export const usePanelManager = () => {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  const toggleDebugPanel = useCallback(() => setIsDebugPanelOpen(p => !p), []);

  return {
    isDebugPanelOpen,
    toggleDebugPanel,
  };
};