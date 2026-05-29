const { Menu, app, dialog } = require('electron');

function buildMenu(getMainWindow, store) {
  const isMac = process.platform === 'darwin';

  const template = [
    {
      label: '文件(&F)',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'file:new' })
        },
        {
          label: '打开...',
          accelerator: 'CmdOrCtrl+O',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'file:open' })
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'file:save' })
        },
        {
          label: '另存为...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'file:save-as' })
        },
        { type: 'separator' },
        {
          label: '导出 PDF',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'export:pdf' })
        },
        {
          label: '导出图片',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'export:image' })
        },
        {
          label: '导出 HTML',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'export:html' })
        },
        { type: 'separator' },
        {
          label: '最近文件',
          submenu: buildRecentFilesSubmenu(getMainWindow, store, () => {})
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', label: '退出', accelerator: 'CmdOrCtrl+Q' }
      ]
    },
    {
      label: '编辑(&E)',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选', accelerator: 'CmdOrCtrl+A' }
      ]
    },
    {
      label: '视图(&V)',
      submenu: [
        {
          label: '切换暗色模式',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'view:toggle-dark' })
        },
        {
          label: '切换目录',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => getMainWindow()?.webContents.send('menu-action', { action: 'view:toggle-toc' })
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
        { type: 'separator' },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            const win = getMainWindow();
            if (win) win.webContents.setZoomLevel(Math.min(win.webContents.getZoomLevel() + 0.5, 5));
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const win = getMainWindow();
            if (win) win.webContents.setZoomLevel(Math.max(win.webContents.getZoomLevel() - 0.5, -5));
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => { getMainWindow()?.webContents.setZoomLevel(0); }
        },
        { type: 'separator' },
        { role: 'toggleDevTools', label: '开发者工具' }
      ]
    },
    {
      label: '帮助(&H)',
      submenu: [
        {
          label: '关于',
          click: () => {
            const win = getMainWindow();
            if (!win) return;
            dialog.showMessageBox(win, {
              type: 'info',
              title: '关于 Markdown Editor',
              message: 'Markdown Editor',
              detail: `版本: ${app.getVersion()}\n\n一个轻量级的 Markdown 编辑器\n实时预览 · 语法高亮 · 数学公式 · 图表渲染`
            });
          }
        }
      ]
    }
  ];

  // macOS 需要应用菜单
  if (isMac) {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about', label: '关于' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏' },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    });
  }

  return Menu.buildFromTemplate(template);
}

function buildRecentFilesSubmenu(getMainWindow, store, rebuildMenu) {
  const recentFiles = store.get('recentFiles', []);
  const items = recentFiles.map(f => ({
    label: f.name,
    click: () => {
      getMainWindow()?.webContents.send('menu-action', {
        action: 'file:open-path',
        data: { filePath: f.filePath }
      });
    }
  }));

  if (items.length > 0) items.push({ type: 'separator' });
  items.push({
    label: '清除最近文件',
    click: () => {
      store.set('recentFiles', []);
      rebuildMenu();
    }
  });

  return Menu.buildFromTemplate(items);
}

function updateRecentFilesMenu(menu, store, getMainWindow, rebuildMenu) {
  const recentMenuIndex = process.platform === 'darwin' ? 1 : 0;
  const fileMenu = menu.items[recentMenuIndex];

  for (const item of fileMenu.submenu.items) {
    if (item.label === '最近文件') {
      item.submenu = buildRecentFilesSubmenu(getMainWindow, store, rebuildMenu);
      break;
    }
  }
}

module.exports = { buildMenu, updateRecentFilesMenu };
