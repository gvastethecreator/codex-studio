const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('codexStudio', {
  apiBase: process.env.STUDIO_ELECTRON_API_BASE || 'http://localhost:17223',
  desktop: true,
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
});
