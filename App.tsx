
import React from 'react';
import { GlobalProvider } from './contexts/GlobalContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { AppContent } from './components/AppContent';

const App: React.FC = () => {
  return (
    <GlobalProvider>
        <GenerationProvider>
            <AppContent />
        </GenerationProvider>
    </GlobalProvider>
  );
};

export default App;
