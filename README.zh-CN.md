# Web Markdown Editor

[English](README.md) | 简体中文

一个轻量级的**单文件** Web Markdown 编辑器，支持实时预览、语法高亮、数学公式和图表渲染。只需一个 HTML 文件即可运行，无需安装、无需依赖、无需服务器，双击即用。

**[在线体验](https://wangwen135.github.io/web-markdown-editor/markdown-editor.html)**

## ✨ 功能特性

- ✅ 中文和英文界面，可根据浏览器语言自动选择
- ✅ 实时 Markdown 预览
- ✅ 多种编程语言的代码语法高亮
- ✅ KaTeX 数学公式渲染
- ✅ Mermaid 图表绘制，支持独立查看、缩放、平移及 PNG/SVG 下载
- ✅ 导出为 PDF、图片（PNG）和 HTML
- ✅ 多主题及独立的亮色/暗色模式
- ✅ 目录导航和同步滚动
- ✅ 通过 File System Access API 打开和保存本地文件
- ✅ 拖放打开 Markdown 文件
- ✅ 完全离线版本

## 📸 系统界面

![Web Markdown Editor 系统界面](screenshot/main.png)

## 🚀 快速开始

### 在线版本

直接使用浏览器打开 `markdown-editor.html`，也可以访问上面的在线体验地址。

**[📥 下载 markdown-editor.html](https://github.com/wangwen135/web-markdown-editor/raw/main/markdown-editor.html)**

### 离线版本

适用于内网环境或无网络连接的场景。

1. **[📥 下载 web-markdown-editor-offline.zip](https://github.com/wangwen135/web-markdown-editor/releases/download/v1.2.0/web-markdown-editor-offline.zip)**
2. 解压到任意目录。
3. 使用浏览器打开 `markdown-editor-offline.html`。
4. 开始编辑，无需网络连接。

详细说明请参阅[离线版本指南](offline/README-OFFLINE.zh-CN.md)。

### 桌面版本

Electron 桌面应用已独立到 [web-markdown-editor-desktop](https://github.com/wangwen135/web-markdown-editor-desktop)。本仓库继续专注于简洁的 Web 与离线 HTML 版本。

## 📦 版本说明

| 版本 | 文件 | 说明 |
| --- | --- | --- |
| **在线版** | `markdown-editor.html` | 使用 CDN 资源，需要网络连接 |
| **离线版** | `offline/markdown-editor-offline.html` | 使用本地资源，无需网络连接 |

## 🔨 构建离线版本

只需维护在线版本，使用以下命令生成离线版本：

```bash
node build-offline.js
```

构建脚本会：

1. 读取 `markdown-editor.html`。
2. 将 CDN 地址替换为本地 `assets/` 路径。
3. 输出 `offline/markdown-editor-offline.html`。

新增 CDN 依赖时，请在 `build-offline.js` 中添加映射：

1. 将 `<link>` 和 `<script>` 替换规则添加到 `replacementRules`。
2. 将 JavaScript URL 替换规则添加到 `themeUrlMappings`。

## 🛠️ 技术栈

- **前端：** 原生 HTML、CSS 和 JavaScript
- **Markdown 解析：** Marked.js
- **代码高亮：** Highlight.js
- **数学公式：** KaTeX
- **图表：** Mermaid.js
- **UI：** Bootstrap 5
- **导出：** html2pdf.js、html2canvas

## 📄 许可证

[MIT License](LICENSE)
