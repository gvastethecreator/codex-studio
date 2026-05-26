import React from 'react';
import { GlobalProvider } from './contexts/GlobalContext';
import { LegacyVisualBatchProvider } from './contexts/LegacyVisualBatchContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { AppContent } from './components/AppContent';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <LegacyVisualBatchProvider>
        <GenerationProvider>
          <AppContent />
        </GenerationProvider>
      </LegacyVisualBatchProvider>
    </GlobalProvider>
  );
};

export default App;
