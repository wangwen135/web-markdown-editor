const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'markdown-editor.html'), 'utf8');

const dictionaryMatch = html.match(
    /const EN_TRANSLATIONS = (\{[\s\S]*?\});\s*const SUPPORTED_LANGUAGES/
);
assert.ok(dictionaryMatch, 'English translation dictionary exists');

const englishTranslations = Function(`"use strict"; return (${dictionaryMatch[1]});`)();
assert.ok(Object.keys(englishTranslations).length >= 150, 'translation dictionary covers the application UI');
assert.equal(englishTranslations['保存'], 'Save', 'core toolbar labels are translated');
assert.equal(englishTranslations['界面语言'], 'Interface language', 'accessibility labels are translated');

assert.match(html, /const SUPPORTED_LANGUAGES = \['zh-CN', 'en'\]/, 'only supported languages are selectable');
assert.match(html, /id="language-select"[\s\S]*?<option value="zh-CN">中文<\/option>[\s\S]*?<option value="en">English<\/option>/,
    'language selector contains Chinese and English');
assert.match(html, /Storage\.get\('language'\)/, 'saved language is restored');
assert.match(html, /Storage\.set\('language', language\)/, 'manual language choice is persisted');
assert.match(html, /navigator\.language[\s\S]*?startsWith\('zh'\)/, 'browser language is detected on first use');
assert.match(html, /document\.documentElement\.lang = currentLanguage/, 'document language metadata follows the UI');

assert.match(html, /const DEFAULT_CONTENT_ZH = `/, 'Chinese starter document exists');
assert.match(html, /const DEFAULT_CONTENT_EN = `/, 'English starter document exists');
assert.match(html, /\\\\int_\{-\\\\infty\}\^\{\\\\infty\}/,
    'English starter document preserves KaTeX backslashes');
assert.match(html, /Mermaid diagrams can be opened in a dedicated viewer, zoomed, panned, and downloaded as PNG or SVG\./,
    'English starter document describes the Mermaid viewer and export features');
assert.match(html, /Storage\.get\('content', currentLanguage === 'zh-CN' \? DEFAULT_CONTENT_ZH : DEFAULT_CONTENT_EN\)/,
    'starter document follows the initial language only when no saved content exists');
assert.match(html, /closest\('#editor, #preview, #toc, script, style'\)/,
    'user-authored editor, preview, and table-of-contents content is excluded from UI translation');

const untranslatedRuntimeMessages = [
    ...html.matchAll(/(?:showToast|confirm)\(\s*(['"`])([^\n]*[\u3400-\u9fff][^\n]*)\1/g)
];
assert.equal(untranslatedRuntimeMessages.length, 0,
    'toast and confirmation messages use the translation helper');

const readmeEn = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');
const readmeZh = fs.readFileSync(path.join(projectRoot, 'README.zh-CN.md'), 'utf8');
assert.match(readmeEn, /\[简体中文\]\(README\.zh-CN\.md\)/, 'English README links to Chinese README');
assert.match(readmeZh, /\[English\]\(README\.md\)/, 'Chinese README links to English README');

console.log('PASS Chinese and English internationalization structure is complete');
