const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { registerIpcHandlers } = require('./ipc-handlers');
const { buildMenu, updateRecentFilesMenu } = require('./menu');

const store = new Store({
  name: 'config',
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    windowMaximized: false,
    recentFiles: []
  }
});

let mainWindow = null;
let pendingFilePaths = [];
let rendererReady = false;
let saveStateTimer = null;

// IPC handlers 只注册一次
registerIpcHandlers(store, () => mainWindow);

function createWindow() {
  const bounds = store.get('windowBounds');
  rendererReady = false;

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    title: 'Markdown Editor'
  });

  if (store.get('windowMaximized')) {
    mainWindow.maximize();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('resize', debounceSaveWindowState);
  mainWindow.on('move', debounceSaveWindowState);
  mainWindow.on('close', (e) => {
    // 保存窗口状态
    store.set('windowBounds', mainWindow.getBounds());
    store.set('windowMaximized', mainWindow.isMaximized());
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 构建菜单
  rebuildMenu();

  mainWindow.webContents.on('did-start-loading', () => {
    rendererReady = false;
  });

  // 注入 bridge.js，通过 DOM <script> 标签确保与页面脚本在同一作用域
  mainWindow.webContents.on('did-finish-load', () => {
    const bridgeCode = fs.readFileSync(path.join(__dirname, 'bridge.js'), 'utf-8');
    mainWindow.webContents.executeJavaScript(
      `const _s = document.createElement('script');` +
      `_s.textContent = ${JSON.stringify(bridgeCode)};` +
      `document.body.appendChild(_s);`
    ).catch((err) => {
      console.error('Failed to inject Electron bridge:', err);
    });
  });

  const offlineHtml = path.join(__dirname, '..', 'offline', 'markdown-editor-offline.html');
  mainWindow.loadFile(offlineHtml);
}

function queueFileToOpen(filePath) {
  if (!filePath) return;

  pendingFilePaths = pendingFilePaths.filter(pendingPath => pendingPath !== filePath);
  pendingFilePaths.push(filePath);
  flushPendingFiles();
}

function flushPendingFiles() {
  if (!rendererReady || !mainWindow || mainWindow.isDestroyed()) return;

  const filePaths = pendingFilePaths;
  pendingFilePaths = [];

  for (const filePath of filePaths) {
    mainWindow.webContents.send('menu-action', {
      action: 'file:open-from-os',
      data: { filePath }
    });
  }
}

ipcMain.on('renderer:ready', (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return;
  rendererReady = true;
  flushPendingFiles();
});

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMaximized()) return;
  store.set('windowBounds', mainWindow.getBounds());
}

function debounceSaveWindowState() {
  clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(saveWindowState, 500);
}

function rebuildMenu() {
  const { Menu } = require('electron');
  const menu = buildMenu(() => mainWindow, store);
  updateRecentFilesMenu(menu, store, () => mainWindow, rebuildMenu);
  Menu.setApplicationMenu(menu);
}

function getFileFromArgv(argv) {
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('-')) continue;
    if (fs.existsSync(arg)) {
      const ext = path.extname(arg).toLowerCase();
      if (['.md', '.markdown', '.txt'].includes(ext)) {
        return path.resolve(arg);
      }
    }
  }
  return null;
}

// macOS 文件关联
app.on('open-file', (_event, filePath) => {
  _event.preventDefault();
  queueFileToOpen(filePath);
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const filePath = getFileFromArgv(argv);
    if (filePath) queueFileToOpen(filePath);

    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    const filePath = getFileFromArgv(process.argv);
    if (filePath) queueFileToOpen(filePath);
    createWindow();
  });
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
