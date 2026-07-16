const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}

const html = fs.readFileSync(path.join(__dirname, '..', 'markdown-editor.html'), 'utf8');
const startMarker = '/* MERMAID_VIEWER_MATH_START */';
const endMarker = '/* MERMAID_VIEWER_MATH_END */';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);

assert.notEqual(start, -1, 'missing Mermaid viewer math start marker');
assert.notEqual(end, -1, 'missing Mermaid viewer math end marker');

const context = {window: {}};
vm.runInNewContext(html.slice(start + startMarker.length, end), context);
const math = context.window.MermaidViewerMath;

test('clamp limits zoom to configured range', () => {
    assert.equal(math.clamp(0.05, 0.1, 5), 0.1);
    assert.equal(math.clamp(6, 0.1, 5), 5);
    assert.equal(math.clamp(1.25, 0.1, 5), 1.25);
});

test('fit scale preserves the whole diagram with padding', () => {
    assert.equal(math.calculateFitScale(1000, 500, 800, 600, 40, 0.1, 5), 0.72);
    assert.equal(math.calculateFitScale(100, 100, 1000, 1000, 40, 0.1, 5), 5);
});

test('fit scale falls back safely for invalid dimensions', () => {
    assert.equal(math.calculateFitScale(0, 500, 800, 600, 40, 0.1, 5), 1);
    assert.equal(math.calculateFitScale(1000, 500, 0, 600, 40, 0.1, 5), 1);
});

test('anchored zoom keeps the anchor stationary', () => {
    const translation = math.calculateAnchoredTranslation({x: 200, y: 150}, {x: 50, y: 25}, 1, 2);
    assert.equal(translation.x, -100);
    assert.equal(translation.y, -100);
});

test('minimap threshold uses either overflowing dimension', () => {
    assert.equal(math.shouldShowMinimap(1500, 500, 1000, 600, 1.5), false);
    assert.equal(math.shouldShowMinimap(1501, 500, 1000, 600, 1.5), true);
    assert.equal(math.shouldShowMinimap(800, 901, 1000, 600, 1.5), true);
});

test('viewport rectangle maps canvas coordinates into diagram coordinates', () => {
    const rect = math.calculateViewportRect(
        1000,
        800,
        800,
        600,
        2,
        {x: -100, y: -50}
    );
    assert.equal(rect.x, 50);
    assert.equal(rect.y, 25);
    assert.equal(rect.width, 400);
    assert.equal(rect.height, 300);
});

test('viewport rectangle is clipped to diagram bounds', () => {
    const rect = math.calculateViewportRect(
        300,
        200,
        800,
        600,
        1,
        {x: 100, y: 50}
    );
    assert.equal(rect.x, 0);
    assert.equal(rect.y, 0);
    assert.equal(rect.width, 300);
    assert.equal(rect.height, 200);
});

test('raster size applies multiplier without exceeding safety caps', () => {
    const regular = math.calculateRasterSize(1000, 500, 2, 16384, 64000000);
    assert.equal(regular.width, 2000);
    assert.equal(regular.height, 1000);
    assert.equal(regular.scale, 2);
    assert.equal(regular.reduced, false);

    const capped = math.calculateRasterSize(20000, 10000, 2, 16384, 64000000);
    assert.ok(capped.width <= 16384);
    assert.ok(capped.width * capped.height <= 64000000);
    assert.ok(Math.abs(capped.width / capped.height - 2) < 0.001);
    assert.equal(capped.reduced, true);
});

console.log(`Passed ${passed} Mermaid viewer math tests`);
