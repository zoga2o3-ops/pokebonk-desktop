const { app, BrowserWindow, globalShortcut, ipcMain, Menu } = require('electron');
const path = require('path');

const fs = require('fs');

const GAME_URL = 'https://pokebonk.com/';

// The game is laid out for roughly a 1920px-wide page. On a high-resolution
// screen at 100% Windows scaling Chromium reports a much wider page, so the UI
// shrinks and switches layout. Scale the page so it behaves like a ~1920px one.
const DESIGN_WIDTH = 1920;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
let settings = { zoom: null }; // null = automatic
try {
  settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')) };
} catch {}

function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
  } catch {}
}

function autoZoom() {
  const [w] = win.getContentSize();
  return Math.max(1, Math.round((w / DESIGN_WIDTH) * 20) / 20);
}

function applyZoom() {
  if (win) win.webContents.setZoomFactor(settings.zoom ?? autoZoom());
}

function changeZoom(delta) {
  if (!win) return;
  const current = win.webContents.getZoomFactor();  settings.zoom = Math.min(4, Math.max(0.5, Math.round((current + delta) * 20) / 20));
  saveSettings();
  applyZoom();
}

function resetZoom() {
  settings.zoom = null;
  saveSettings();
  applyZoom();
}

// Let the game play audio without waiting for a click (controller-only play).
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;

function createWindow() {
  Menu.setApplicationMenu(null);

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    title: 'Pokebonk',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      // Separate persistent profile so the in-game login survives restarts.
      partition: 'persist:pokebonk',
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(GAME_URL);

  // Keep the game's own popups (e.g. sign-in) inside the app.
  win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    } else if (input.key === 'F5') {
      win.webContents.reload();
      event.preventDefault();
    } else if (input.control && input.key.toLowerCase() === 'q') {
      app.quit();
    } else if (input.control && (input.key === '=' || input.key === '+')) {
      changeZoom(0.1);
      event.preventDefault();
    } else if (input.control && input.key === '-') {
      changeZoom(-0.1);
      event.preventDefault();
    } else if (input.control && input.key === '0') {
      resetZoom();
      event.preventDefault();
    }
  });

  win.webContents.on('did-finish-load', applyZoom);
  win.on('resize', () => {
    if (settings.zoom == null) applyZoom();
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

ipcMain.on('app:toggle-fullscreen', () => {
  if (win) win.setFullScreen(!win.isFullScreen());
});
ipcMain.on('app:reload', () => {
  if (win) win.webContents.reload();
});
ipcMain.on('app:quit', () => app.quit());
ipcMain.on('app:zoom', (_e, action) => {
  if (action === 'in') changeZoom(0.1);
  else if (action === 'out') changeZoom(-0.1);
  else resetZoom();
});

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('Alt+F4', () => app.quit());
});

app.on('window-all-closed', () => app.quit());
