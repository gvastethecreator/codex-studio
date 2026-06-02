import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_REACT_SCAN === 'true') {
  void import('react-scan').then(({ scan }) => {
    scan({ enabled: true });
  });
}

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
