import React from 'react';
import { GlobalProvider } from './contexts/GlobalContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { ThemeProvider } from './hooks/useTheme';
import { AppContent } from './components/AppContent';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <GenerationProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </GenerationProvider>
    </GlobalProvider>
  );
};

export default App;
