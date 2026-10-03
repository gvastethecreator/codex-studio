import React from 'react';
import { GlobalProvider } from './contexts/GlobalContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { ThemeProvider } from './hooks/useTheme';
import { AppContent } from './components/AppContent';
import { ImageConversionProvider } from './contexts/ImageConversionContext';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <GenerationProvider>
        <ThemeProvider>
          <ImageConversionProvider>
            <AppContent />
          </ImageConversionProvider>
        </ThemeProvider>
      </GenerationProvider>
    </GlobalProvider>
  );
};

export default App;
