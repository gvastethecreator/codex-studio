import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import { loadInstalledStylePacks } from './lib/installedStylePacks';
import { registerDisabledWorkflowModules } from './lib/workflowModuleState';
import { getEditableStudioSettings } from './services/studio-api/settings';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Style surfaces read installed pack summaries, and navigation reads which workflow modules are
// on, synchronously, so load both before mounting. If the backend is unreachable the catalogue
// starts empty, every module stays on and the app still mounts.
const workflowModulesLoaded = getEditableStudioSettings().then((settings) =>
  registerDisabledWorkflowModules(settings.disabledWorkflowModules),
);
void Promise.allSettled([loadInstalledStylePacks(), workflowModulesLoaded]).finally(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
