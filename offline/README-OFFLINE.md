# Web Markdown Editor - 离线版

一个基于 Web 的 Markdown 编辑器，支持实时预览、语法高亮、数学公式和图表渲染。
这是一个离线版本，相关资源全部本地化，无需互联网连接即可使用。

## 📋 功能特性

- ✅ 实时 Markdown 预览
- ✅ 语法高亮（支持多种编程语言）
- ✅ 数学公式渲染（KaTeX）
- ✅ 图表绘制（Mermaid）
- ✅ 导出为 PDF
- ✅ 导出为图片（PNG）
- ✅ 导出为 HTML
- ✅ 多主题支持（亮色/暗色模式）
- ✅ 目录导航
- ✅ 完全离线运行

## 🚀 快速开始

### 使用方法

1. 用浏览器打开 `markdown-editor-offline.html`
2. 开始使用！

## 📁 目录结构

```
offline/
├── markdown-editor-offline.html    # 离线版编辑器（主文件）
└── assets/                         # 静态资源（必需）
    ├── css/                        # 样式文件
    └── js/                         # JavaScript库
```

**注意**: `assets/` 文件夹必须与 `markdown-editor-offline.html` 在同一目录下，否则无法正常使用。

## 🔒 隐私说明

- ✅ 完全本地运行，不上传任何数据
- ✅ 无需网络连接
- ✅ 无需用户注册
- ✅ 文件保存在本地，不会被收集

## 🌐 浏览器兼容性

推荐使用现代浏览器：
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+


## ⚠️ 注意事项

1. **文件位置**: 确保整个 `offline/` 文件夹保持完整
2. **文件保存**: 需要浏览器支持 File System Access API
3. **导出功能**: 部分导出功能可能需要浏览器权限

## 🛠️ 故障排除

### 导出功能异常

- 确认浏览器支持相关 API
- 检查浏览器安全策略限制
- 尝试更换浏览器

## 📦 依赖版本

| 库名 | 版本 | 用途 |
|------|------|------|
| Marked.js | 12.0.0 | Markdown 解析 |
| Highlight.js | 9.15.1 | 代码语法高亮 |
| KaTeX | 0.16.10 | 数学公式渲染 |
| Mermaid | 10.9.0 | 图表绘制 |
| html2pdf.js | 0.10.1 | PDF 导出 |
| html2canvas | 1.4.1 | 图片导出 |
| Bootstrap | 5.3.0 | UI 框架 |
| Bootstrap Icons | 1.11.0 | 图标字体 |
| GitHub Markdown CSS | 5.6.0 | Markdown 样式 |


