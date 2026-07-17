const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'markdown-editor.html'), 'utf8');
const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
);

assert.match(
    html,
    /id="aboutModalLabel">\s*<i[^>]*><\/i> Web Markdown Editor/,
    'about dialog uses the Web Markdown Editor name'
);

assert.match(
    html,
    /<strong>Web Markdown Editor<\/strong>\s*v([0-9]+\.[0-9]+\.[0-9]+)/,
    'about dialog displays an application version'
);

const displayedVersion = html.match(
    /<strong>Web Markdown Editor<\/strong>\s*v([0-9]+\.[0-9]+\.[0-9]+)/
)[1];

assert.equal(
    displayedVersion,
    packageJson.version,
    'about dialog version matches package.json'
);

console.log('PASS application name and version metadata are consistent');
