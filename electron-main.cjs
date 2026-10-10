// Final Impact - Electron Desktop Shell (Steam PC Release)
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

// Prevent multiple instances running simultaneously
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow;

  // GPU & rasterizer stability switches for broad Windows graphics driver compatibility
  app.commandLine.appendSwitch('disable-gpu-process-crash-limit');

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 960,
      minHeight: 540,
      useContentSize: true,
      show: false, // Prevents blank/black flash on launch
      backgroundColor: '#0a0a0f',
      title: 'FINAL IMPACT - 16-Bit Arcade Tournament',
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableWebSQL: false,
        spellcheck: false
      }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Reveal window smoothly once DOM and canvas are ready to render
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Global toggle for F11 Fullscreen
    globalShortcut.register('F11', () => {
      if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      }
    });

    // Developer & Creator shortcuts: F12 for DevTools, F5 to Reload
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
      if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
        mainWindow.reload();
        event.preventDefault();
      }
    });

    // Resilient recovery if renderer encounters a GPU hitch
    mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('Renderer process gone:', details);
      if (details.reason !== 'clean-exit' && mainWindow) {
        mainWindow.reload();
      }
    });
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
