# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **single-file web-based Markdown editor** (`markdown-editor.html`) that provides real-time preview, syntax highlighting, and export capabilities. The entire application is self-contained in one HTML file with embedded CSS and JavaScript, using CDN-hosted libraries for functionality.

## Key Technologies (CDN-based)

- **Marked.js** - Markdown parsing
- **highlight.js** - Code syntax highlighting
- **KaTeX** - Mathematical formula rendering
- **Mermaid.js** - Diagram rendering
- **html2pdf.js** - PDF export
- **html2canvas** - Image export
- **Bootstrap 5** - UI framework and icons

## Architecture

### Single-File Structure
The entire application (~3500 lines) is contained in `markdown-editor.html`:
- HTML structure with toolbar, editor pane, preview pane, and TOC sidebar
- Embedded CSS for theming (light/dark mode) and responsive layout
- Inline JavaScript handling all functionality

### State Management
Application state is persisted in `localStorage` with the `mdEditor_` prefix:
- `mdEditor_tocVisible` - Table of contents visibility (default: true)
- `mdEditor_syncScroll` - Synchronized scrolling (default: true)
- `mdEditor_theme` - Current theme (default: "github")
- `mdEditor_darkMode` - Dark mode enabled (default: false)
- `mdEditor_toolbarVisible` - Toolbar visibility (default: true)
- `mdEditor_footBarVisible` - Status bar visibility (default: true)
- `mdEditor_previewBgColor_light/dark` - Custom background colors
- `mdEditor_editorBgColor_light/dark` - Editor background colors

### Core Components

**Editor Area** (markdown-editor.html:1767-1869)
- Textarea with line numbers
- Synchronized scrolling with preview
- Cursor position tracking and statistics

**Preview Area** (markdown-editor.html:2406-2707)
- Real-time Markdown rendering via `render()` function
- Math formula rendering with KaTeX
- Mermaid diagram rendering with `renderMermaid()`
- Table of contents generation with `generateTOC()`

**Toolbar Actions** (markdown-editor.html:2131-2230)
- Text formatting: bold, italic, underline, strikethrough
- Block elements: headings, lists, quotes, tables, code blocks
- Insertions: links, images, horizontal rules

**File Operations** (markdown-editor.html:3284-3497)
- New file creation
- Open/save using File System Access API (`currentFileHandle`)
- Export to PDF, PNG, HTML
- Drag-and-drop file handling

### Theme System (markdown-editor.html:1783-2854)

Themes are configured in the `themes` object with CDN URLs for:
- Markdown CSS (light/dark variants)
- Code highlighting CSS (light/dark variants)

Available themes: GitHub, Solarized, Atom One Dark, VS Code, Nord, Monokai

The `applyTheme()` function dynamically swaps CDN stylesheet links and applies dark mode by toggling the `.dark` class on `document.body`.

### Critical Functions

**Rendering Pipeline**
- `debouncedRender()` - Debounced render trigger (markdown-editor.html:2338)
- `render()` - Main render function: parses Markdown → updates preview → highlights code → renders math → renders diagrams (markdown-editor.html:2406)

**Navigation**
- `generateTOC()` - Extracts headings from preview and builds sidebar (markdown-editor.html:2615)
- `headingMap` array - Maps preview heading elements to editor line numbers for bidirectional navigation

**Synchronized Scrolling**
- Editor scroll event calculates proportional preview position
- Based on `headingMap` for precise heading-to-heading alignment

**Export Functions**
- `exportPDF()` - Uses html2pdf.js (markdown-editor.html:3296)
- `exportImage()` - Uses html2canvas with full content expansion (markdown-editor.html:3342)
- `exportHTML()` - Generates self-contained HTML file (markdown-editor.html:3381)

## Development

### Running the Editor
Simply open `markdown-editor.html` in a modern web browser. No build process or server required.

### Testing Changes
1. Edit the HTML file
2. Refresh the browser
3. Check browser console for errors (F12)

### Adding New Features
- Follow the existing pattern: event listeners → handler functions → state updates → localStorage persistence
- For new buttons, add to the appropriate toolbar section with matching Bootstrap classes
- Use the existing theme color arrays (`lightThemeColors`, `darkThemeColors`) as templates for UI additions

### Code Organization
- **CSS**: Lines 40-1344 (in `<style>` tag)
- **HTML Structure**: Lines 1345-1763
- **JavaScript**: Lines 1764-3557 (in `<script>` tag)
- **Helper Functions**: Lines 1326-1328 (debounce utility)

### Browser Compatibility
Requires modern browser with ES6+ support and File System Access API for save functionality. Uses `window.showOpenFilePicker()` and `window.showSaveFilePicker()` for file operations.
