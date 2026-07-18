# Web Markdown Editor - Offline Edition

English | [简体中文](README-OFFLINE.zh-CN.md)

The offline edition bundles all required resources locally and works without an internet connection.

## 📋 Features

- Live Markdown preview and syntax highlighting
- KaTeX math and Mermaid diagrams
- PDF, PNG, and HTML export
- English and Simplified Chinese interface
- Multiple themes, table of contents, and synchronized scrolling
- Fully local operation

## 🚀 Usage

1. Keep `markdown-editor-offline.html` and the `assets/` directory together.
2. Open `markdown-editor-offline.html` in a modern browser.
3. Start editing.

```text
offline/
├── markdown-editor-offline.html
└── assets/
    ├── css/
    └── js/
```

## 🔒 Privacy

- Runs locally and does not upload documents
- Requires no registration or network connection
- Stores documents and preferences locally

## 🌐 Browser support

Recommended versions:

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

The File System Access API is required for direct local-file saving. Browser permission may be required for some export operations.

## 📦 Bundled libraries

| Library | Version | Purpose |
| --- | --- | --- |
| Marked.js | 12.0.0 | Markdown parsing |
| Highlight.js | 11.9.0 / 11.11.1 (themes) | Syntax highlighting |
| KaTeX | 0.16.43 | Math rendering |
| Mermaid | 11.13.0 | Diagrams |
| html2pdf.js | 0.14.0 | PDF export |
| DOMPurify | 3.2.6 | XSS protection |
| html2canvas | 1.4.1 | Image export |
| Bootstrap | 5.3.8 | UI framework |
| Bootstrap Icons | 1.13.1 | Icons |
| GitHub Markdown CSS | 5.9.0 | Markdown styles |
