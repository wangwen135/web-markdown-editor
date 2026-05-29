const { contextBridge, ipcRenderer } = require('electron');

let menuCallback = null;
ipcRenderer.on('menu-action', (_event, data) => {
  if (menuCallback) menuCallback(data);
});

contextBridge.exposeInMainWorld('electronAPI', {
  showOpenDialog: () => ipcRenderer.invoke('file:open-dialog'),
  showSaveDialog: (suggestedName) => ipcRenderer.invoke('file:save-dialog', suggestedName),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  getRecentFiles: () => ipcRenderer.invoke('file:get-recent'),
  addRecentFile: (filePath) => ipcRenderer.invoke('file:add-recent', filePath),
  clearRecentFiles: () => ipcRenderer.invoke('file:clear-recent'),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  onMenuAction: (callback) => {
    menuCallback = callback;
  },

  platform: process.platform,
  isElectron: true
});
