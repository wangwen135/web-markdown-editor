const { ipcMain, dialog, app } = require('electron');
const fs = require('fs/promises');
const path = require('path');

let getMainWindow = null;
let store = null;
let registered = false;

function registerIpcHandlers(storeRef, getMainWindowFn) {
  if (registered) return;
  registered = true;

  getMainWindow = getMainWindowFn;
  store = storeRef;

  // 打开文件对话框
  ipcMain.handle('file:open-dialog', async () => {
    const win = getMainWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });
    if (result.canceled) return null;

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    addRecentFile(filePath);
    return { filePath, content, name: path.basename(filePath) };
  });

  // 保存文件对话框
  ipcMain.handle('file:save-dialog', async (_event, suggestedName) => {
    const win = getMainWindow();
    if (!win) return null;
    const result = await dialog.showSaveDialog(win, {
      defaultPath: suggestedName || 'document.md',
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });
    if (result.canceled) return null;
    return result.filePath;
  });

  // 写入文件
  ipcMain.handle('file:write', async (_event, filePath, content) => {
    await fs.writeFile(filePath, content, 'utf-8');
    addRecentFile(filePath);
    return { name: path.basename(filePath) };
  });

  // 读取指定文件
  ipcMain.handle('file:read', async (_event, filePath) => {
    const content = await fs.readFile(filePath, 'utf-8');
    return { content, name: path.basename(filePath) };
  });

  // 获取最近文件
  ipcMain.handle('file:get-recent', () => {
    return store.get('recentFiles', []);
  });

  // 添加最近文件
  ipcMain.handle('file:add-recent', (_event, filePath) => {
    addRecentFile(filePath);
  });

  // 清除最近文件
  ipcMain.handle('file:clear-recent', () => {
    store.set('recentFiles', []);
  });

  // 获取版本号
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });
}

function addRecentFile(filePath) {
  let files = store.get('recentFiles', []);
  files = files.filter(f => f.filePath !== filePath);
  files.unshift({ name: path.basename(filePath), filePath, lastOpened: Date.now() });
  files = files.slice(0, 10);
  store.set('recentFiles', files);
}

module.exports = { registerIpcHandlers };
