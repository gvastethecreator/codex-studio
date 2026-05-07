const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, shell } = require('electron');

const rendererUrl = process.env.STUDIO_ELECTRON_RENDERER_URL;
const apiBase = process.env.STUDIO_ELECTRON_API_BASE || 'http://localhost:4317';

function getRendererEntryUrl() {
  if (rendererUrl) return rendererUrl;

  const distEntry = path.join(__dirname, '..', 'dist', 'index.html');
  if (!fs.existsSync(distEntry)) {
    throw new Error(
      `Renderer build not found at ${distEntry}. Run \`bun run build:ui\` or \`bun run preview:electron\`.`,
    );
  }

  return pathToFileURL(distEntry).toString();
}

function isInternalNavigation(url) {
  if (rendererUrl) {
    return url.startsWith(rendererUrl);
  }

  const distEntryUrl = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).toString();
  return url === distEntryUrl || url.startsWith(`${distEntryUrl}#`);
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    title: 'Codex Image Studio',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const entryUrl = getRendererEntryUrl();
  void mainWindow.loadURL(entryUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isInternalNavigation(url)) return;
    event.preventDefault();
    void shell.openExternal(url);
  });

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedUrl) => {
      console.error(
        `[electron] renderer failed to load (${errorCode}) ${errorDescription}: ${validatedUrl}`,
      );
    },
  );

  mainWindow.webContents.on('did-finish-load', () => {
    console.log(`[electron] renderer ready at ${entryUrl} (api: ${apiBase})`);
  });

  return mainWindow;
}

void app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
