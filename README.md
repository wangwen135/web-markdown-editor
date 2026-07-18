# Web Markdown Editor

English | [简体中文](README.zh-CN.md)

A lightweight, single-file Markdown editor with live preview, syntax highlighting, math formulas, and diagram rendering. It runs directly in a modern browser—no installation, dependencies, or server required.

**[Try the online editor](https://wangwen135.github.io/web-markdown-editor/markdown-editor.html)**

## ✨ Features

- ✅ English and Simplified Chinese interface with automatic browser-language detection
- ✅ Live Markdown preview
- ✅ Syntax highlighting for multiple programming languages
- ✅ KaTeX math rendering
- ✅ Mermaid diagrams with a dedicated viewer, zoom, pan, and PNG/SVG downloads
- ✅ PDF, PNG, and HTML export
- ✅ Multiple themes and independent light/dark mode
- ✅ Table of contents and synchronized scrolling
- ✅ Local file open/save through the File System Access API
- ✅ Drag-and-drop Markdown files
- ✅ Fully offline edition

## 📸 Screenshot

![Web Markdown Editor interface](screenshot/main.png)

## 🚀 Quick start

### Online edition

Open `markdown-editor.html` in a browser or use the hosted demo above.

**[📥 Download markdown-editor.html](https://github.com/wangwen135/web-markdown-editor/raw/main/markdown-editor.html)**

### Offline edition

Use this edition on an intranet or without an internet connection.

1. **[📥 Download web-markdown-editor-offline.zip](https://github.com/wangwen135/web-markdown-editor/releases/download/v1.2.1/web-markdown-editor-offline.zip)**
2. Extract the archive anywhere.
3. Open `markdown-editor-offline.html` in a browser.
4. Start editing—no network connection is required.

See the [offline edition guide](offline/README-OFFLINE.md) for details.

### Desktop edition

The Electron desktop application now lives in [web-markdown-editor-desktop](https://github.com/wangwen135/web-markdown-editor-desktop). This repository remains focused on the lightweight web and offline HTML editions.

## 📦 Editions

| Edition | File | Description |
| --- | --- | --- |
| **Online** | `markdown-editor.html` | Uses CDN resources and requires a network connection |
| **Offline** | `offline/markdown-editor-offline.html` | Uses local assets and runs without a network connection |

## 🔨 Build the offline edition

Only the online source file needs to be maintained. Generate the offline edition with:

```bash
node build-offline.js
```

The build script:

1. Reads `markdown-editor.html`.
2. Replaces CDN URLs with local `assets/` paths.
3. Writes `offline/markdown-editor-offline.html`.

When adding a CDN dependency, add its mapping to `build-offline.js`:

1. Add `<link>` and `<script>` replacements to `replacementRules`.
2. Add JavaScript URL replacements to `themeUrlMappings`.

## 🛠️ Technology

- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Markdown:** Marked.js
- **Syntax highlighting:** Highlight.js
- **Math:** KaTeX
- **Diagrams:** Mermaid.js
- **UI:** Bootstrap 5
- **Export:** html2pdf.js and html2canvas

## 📄 License

[MIT License](LICENSE)
