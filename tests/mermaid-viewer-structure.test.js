const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'markdown-editor.html'), 'utf8');

function expectMatch(pattern, message) {
    assert.ok(pattern.test(html), message);
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
expectMatch(/action\.className = 'mermaid-view-action no-document-export'/, 'diagram action is excluded from document exports');
expectMatch(/const MermaidViewer = \(\(\) => \{/, 'viewer module is defined');
expectMatch(/window\.MermaidViewer = MermaidViewer;/, 'viewer module is exposed for verification');
expectMatch(/async function renderMermaid\(\)/, 'Mermaid rendering is asynchronous');
expectMatch(/await mermaid\.run\(\{nodes: mermaidElements\}\)/, 'enhancement waits for Mermaid rendering');
expectMatch(/elements\.canvas\.addEventListener\('wheel',[\s\S]*?passive: false/, 'canvas captures wheel zoom without page scrolling');
expectMatch(/elements\.canvas\.addEventListener\('pointerdown'/, 'canvas starts pointer panning and pinch gestures');
expectMatch(/elements\.canvas\.setPointerCapture\(event\.pointerId\)/, 'canvas captures active pointers');

console.log('Passed Mermaid viewer structure checks');
