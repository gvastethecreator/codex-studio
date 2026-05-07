import { useState, useCallback } from 'react';

export const usePanelManager = () => {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  const toggleDebugPanel = useCallback(() => setIsDebugPanelOpen((p) => !p), []);
  const openDebugPanel = useCallback(() => setIsDebugPanelOpen(true), []);
  const closeDebugPanel = useCallback(() => setIsDebugPanelOpen(false), []);

  return {
    isDebugPanelOpen,
    toggleDebugPanel,
    openDebugPanel,
    closeDebugPanel,
  };
};
