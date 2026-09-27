import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import { loadInstalledStylePacks } from './lib/installedStylePacks';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Style surfaces read installed pack summaries synchronously, so list them before mounting.
// If the backend is unreachable the catalogue starts empty and the app still mounts.
void loadInstalledStylePacks().finally(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
