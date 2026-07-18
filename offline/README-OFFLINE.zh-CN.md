# Web Markdown Editor - 离线版

[English](README-OFFLINE.md) | 简体中文

离线版将所需资源全部保存在本地，无需互联网连接即可使用。

## 📋 功能特性

- Markdown 实时预览和语法高亮
- KaTeX 数学公式和 Mermaid 图表
- 导出 PDF、PNG 和 HTML
- 中文和英文界面
- 多主题、目录导航和同步滚动
- 完全本地运行

## 🚀 使用方法

1. 保持 `markdown-editor-offline.html` 和 `assets/` 目录位于同一目录。
2. 使用现代浏览器打开 `markdown-editor-offline.html`。
3. 开始编辑。

```text
offline/
├── markdown-editor-offline.html
└── assets/
    ├── css/
    └── js/
```

## 🔒 隐私说明

- 完全本地运行，不上传文档
- 无需注册或网络连接
- 文档和设置保存在本地

## 🌐 浏览器兼容性

推荐版本：

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

直接保存本地文件需要浏览器支持 File System Access API，部分导出操作可能需要浏览器授权。

## 📦 内置依赖

| 库名 | 版本 | 用途 |
| --- | --- | --- |
| Marked.js | 12.0.0 | Markdown 解析 |
| Highlight.js | 11.9.0 / 11.11.1（主题） | 语法高亮 |
| KaTeX | 0.16.43 | 数学公式 |
| Mermaid | 11.13.0 | 图表 |
| html2pdf.js | 0.14.0 | PDF 导出 |
| DOMPurify | 3.2.6 | XSS 防护 |
| html2canvas | 1.4.1 | 图片导出 |
| Bootstrap | 5.3.8 | UI 框架 |
| Bootstrap Icons | 1.13.1 | 图标 |
| GitHub Markdown CSS | 5.9.0 | Markdown 样式 |
