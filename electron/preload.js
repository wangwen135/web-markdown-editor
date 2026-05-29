const { contextBridge, ipcRenderer } = require('electron');

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
    // 移除旧的监听器防止重复注册
    ipcRenderer.removeAllListeners('menu-action');
    ipcRenderer.on('menu-action', (_event, data) => callback(data));
  },

  platform: process.platform,
  isElectron: true
});
