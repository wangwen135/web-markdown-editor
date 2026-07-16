const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'markdown-editor.html'), 'utf8');

function expectMatch(pattern, message) {
    assert.ok(pattern.test(html), message);
    console.log(`PASS ${message}`);
}

function expectNoMatch(pattern, message) {
    assert.ok(!pattern.test(html), message);
    console.log(`PASS ${message}`);
}

expectMatch(/id="mermaidViewer"[^>]*role="dialog"[^>]*aria-modal="true"/, 'viewer has modal dialog semantics');
expectMatch(/id="mermaidViewerCanvas"/, 'viewer contains a canvas viewport');
expectMatch(/id="mermaidViewerStage"/, 'viewer contains a transform stage');
expectMatch(/id="mermaidViewerPrevious"/, 'viewer contains previous navigation');
expectMatch(/id="mermaidViewerNext"/, 'viewer contains next navigation');
expectMatch(/id="mermaidViewerExportPanel"/, 'viewer contains export controls');
expectMatch(/id="mermaidViewerMinimap"/, 'viewer contains an adaptive minimap');
expectMatch(/id="mermaidViewerMinimapViewport"/, 'minimap contains a draggable viewport indicator');
expectNoMatch(/mermaidViewerMinimapClose/, 'minimap has no close button or close-button binding');
expectNoMatch(/mermaid-viewer-minimap-close/, 'minimap has no close-button styles');
expectMatch(/id="mermaidViewerCopy"/, 'viewer contains a copy-source button');
expectMatch(/div\.dataset\.mermaidSource = el\.textContent/, 'Mermaid rendering preserves original source across Mermaid DOM replacement');
expectMatch(/block\.dataset\.mermaidSource\.trim\(\)/, 'copying reads the preserved source from the current diagram');
expectMatch(/copySource,\s*getCurrentMermaidSource/, 'current source is exposed for browser verification');
expectMatch(/async function copySource\(\)/, 'viewer provides asynchronous source copying');
expectMatch(/navigator\.clipboard\.writeText\(source\)/, 'copying prefers the Clipboard API');
expectMatch(/document\.execCommand\('copy'\)/, 'copying has a legacy fallback');
expectMatch(/action\.className = 'mermaid-view-action no-document-export'/, 'diagram action is excluded from document exports');
expectMatch(/const MermaidViewer = \(\(\) => \{/, 'viewer module is defined');
expectMatch(/window\.MermaidViewer = MermaidViewer;/, 'viewer module is exposed for verification');
expectMatch(/async function renderMermaid\(\)/, 'Mermaid rendering is asynchronous');
expectMatch(/await mermaid\.run\(\{nodes: mermaidElements\}\)/, 'enhancement waits for Mermaid rendering');
expectMatch(/elements\.canvas\.addEventListener\('wheel',[\s\S]*?passive: false/, 'canvas captures wheel zoom without page scrolling');
expectMatch(/elements\.canvas\.addEventListener\('pointerdown'/, 'canvas starts pointer panning and pinch gestures');
expectMatch(/elements\.canvas\.setPointerCapture\(event\.pointerId\)/, 'canvas captures active pointers');
expectMatch(/state\.pointerDownTarget === elements\.canvas && !state\.pointerMoved/, 'clicking empty canvas backdrop closes without breaking drag');
expectMatch(/function buildExportSvg\(background\)/, 'viewer builds an independent SVG export');
expectMatch(/function exportSvg\(\)/, 'viewer exports SVG files');
expectMatch(/async function exportPng\(\)/, 'viewer exports PNG files asynchronously');
expectMatch(/svg\.querySelector\('foreignObject'\)/, 'PNG export routes Mermaid HTML labels through the safe fallback');
expectMatch(/mermaidExportBackgroundMode/, 'viewer persists the background mode');
expectMatch(/mermaidExportBackgroundColor/, 'viewer persists the custom background color');
expectMatch(/backgroundColorText\.addEventListener\('input'/, 'typed custom colors persist without waiting for change');

const exportRemovalCount = (html.match(/clonedDoc\.querySelectorAll\('\.no-document-export'\)/g) || []).length;
assert.ok(exportRemovalCount >= 2, 'PDF and document PNG clones remove viewer controls');
console.log('PASS PDF and document PNG clones remove viewer controls');
expectMatch(/function getExportablePreviewHtml\(\)/, 'HTML export uses a sanitized preview clone');
expectMatch(/\$\{getExportablePreviewHtml\(\)\}/, 'HTML export excludes viewer controls');

console.log('Passed Mermaid viewer structure checks');
