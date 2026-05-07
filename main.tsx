import { scan } from 'react-scan';
import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';

scan({
  enabled: import.meta.env.DEV,
  trackUnnecessaryRenders: import.meta.env.DEV,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
