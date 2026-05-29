// Electron bridge - injected into the offline editor via executeJavaScript
// Runs in the same scope as the editor, can access its global variables

(async function electronBridge() {
  if (!window.electronAPI) return;

  // 覆盖打开文件
  // 用 openFile = ... 而不是 window.openFile = ...
  // 因为 async function openFile() 创建的是作用域绑定，不是 window 属性
  openFile = async function () {
    try {
      const result = await window.electronAPI.showOpenDialog();
      if (!result) return;
      editor.value = result.content;
      currentFileHandle = result.filePath;
      draggedFileName = null;
      updateFileName(result.name);
      render();
      showToast('打开文件成功！');
    } catch (err) {
      console.error('打开文件失败:', err);
      showToast('打开文件失败', 'error');
    }
  };

  // 覆盖保存文件
  saveFile = async function () {
    try {
      if (currentFileHandle && typeof currentFileHandle === 'string') {
        await window.electronAPI.writeFile(currentFileHandle, editor.value);
        const name = currentFileHandle.replace(/\\/g, '/').split('/').pop();
        updateFileName(name);
        showToast('保存成功！');
      } else if (draggedFileName) {
        saveAsWithSuggestedName(draggedFileName);
      } else {
        saveAs();
      }
    } catch (e) {
      console.error('保存失败:', e);
      showToast('保存失败：' + e.message, 'danger');
    }
  };

  // 覆盖另存为
  saveAs = async function () {
    try {
      const filePath = await window.electronAPI.showSaveDialog('document.md');
      if (!filePath) return;
      const result = await window.electronAPI.writeFile(filePath, editor.value);
      currentFileHandle = filePath;
      draggedFileName = null;
      updateFileName(result.name);
      showToast('保存成功！');
    } catch (err) {
      console.error('保存失败:', err);
      showToast('保存失败', 'error');
    }
  };

  // 覆盖另存为（带建议文件名）
  saveAsWithSuggestedName = async function (suggestedName) {
    try {
      const filePath = await window.electronAPI.showSaveDialog(suggestedName);
      if (!filePath) return;
      const result = await window.electronAPI.writeFile(filePath, editor.value);
      currentFileHandle = filePath;
      draggedFileName = null;
      updateFileName(result.name);
      showToast('保存成功！\n后续保存将直接写入此文件', 'success', 3000);
    } catch (err) {
      console.error('保存失败:', err);
      showToast('保存失败', 'error');
    }
  };

  // 覆盖新建文件
  newFile = function () {
    if (confirm('新建文件将清空当前内容，确定继续吗？')) {
      editor.value = '';
      currentFileHandle = null;
      draggedFileName = null;
      localStorage.removeItem(Storage.PREFIX + 'content');
      updateFileName('未命名文件');
      render();
    }
  };

  // 从文件路径打开文件（OS 文件关联 / 最近文件）
  async function openFileFromPath(filePath) {
    try {
      const result = await window.electronAPI.readFile(filePath);
      editor.value = result.content;
      currentFileHandle = filePath;
      draggedFileName = null;
      updateFileName(result.name);
      render();
      await window.electronAPI.addRecentFile(filePath);
      showToast('打开文件成功！');
    } catch (err) {
      console.error('打开文件失败:', err);
      showToast('打开文件失败', 'error');
    }
  }

  // 监听菜单操作
  window.electronAPI.onMenuAction(({ action, data }) => {
    switch (action) {
      case 'file:new':
        newFile();
        break;
      case 'file:open':
        openFile();
        break;
      case 'file:save':
        saveFile();
        break;
      case 'file:save-as':
        saveAs();
        break;
      case 'file:open-path':
        if (data && data.filePath) openFileFromPath(data.filePath);
        break;
      case 'file:open-from-os':
        if (data && data.filePath) openFileFromPath(data.filePath);
        break;
      case 'export:pdf':
        if (typeof exportPDF === 'function') exportPDF();
        break;
      case 'export:image':
        if (typeof exportImage === 'function') exportImage();
        break;
      case 'export:html':
        if (typeof exportHTML === 'function') exportHTML();
        break;
      case 'view:toggle-dark':
        if (typeof toggleDarkMode === 'function') toggleDarkMode();
        break;
      case 'view:toggle-toc':
        if (typeof toggleTOC === 'function') toggleTOC();
        break;
    }
  });
})();
