const fs = require('fs');
const path = require('path');

// CDN URL 到本地路径的映射规则
const replacementRules = [
    // HTML head 部分 - 样式和脚本
    {
        from: '<link id="markdownTheme" rel="stylesheet"\n          href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css">',
        to: '<link id="markdownTheme" rel="stylesheet"\n          href="assets/css/github-markdown-light.css">'
    },
    {
        from: '<link rel="stylesheet" id="codeTheme"\n          href="https://cdn.jsdelivr.net/npm/highlight.js/styles/github.min.css">',
        to: '<link rel="stylesheet" id="codeTheme"\n          href="assets/css/highlight/github-light.css">'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/highlight.js/highlight.min.js"></script>',
        to: '<script src="assets/js/highlight.min.js"></script>'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>',
        to: '<script src="assets/js/marked.min.js"></script>'
    },
    {
        from: '<link rel="stylesheet"\n          href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">',
        to: '<link rel="stylesheet"\n          href="assets/css/katex.min.css">'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js"></script>',
        to: '<script src="assets/js/katex.min.js"></script>'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/auto-render.min.js"></script>',
        to: '<script src="assets/js/katex-auto-render.min.js"></script>'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>',
        to: '<script src="assets/js/mermaid.min.js"></script>'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/html2pdf.js/dist/html2pdf.bundle.min.js"></script>',
        to: '<script src="assets/js/html2pdf.bundle.min.js"></script>'
    },
    {
        from: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">',
        to: '<link href="assets/css/bootstrap.min.css" rel="stylesheet">'
    },
    {
        from: '<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">',
        to: '<link href="assets/css/bootstrap-icons.css" rel="stylesheet">'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
        to: '<script src="assets/js/bootstrap.bundle.min.js"></script>'
    },
    {
        from: '<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>',
        to: '<script src="assets/js/html2canvas.min.js"></script>'
    },
];

// JavaScript themes 对象中的 CDN 路径映射（使用正则）
const themeUrlMappings = {
    // GitHub Markdown CSS
    'https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css': 'assets/css/github-markdown-light.css',
    'https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-dark.min.css': 'assets/css/github-markdown-dark.css',

    // Highlight.js 主题
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/github.min.css': 'assets/css/highlight/github-light.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/github-dark.min.css': 'assets/css/highlight/github-dark.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/solarized-light.min.css': 'assets/css/highlight/solarized-light.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/solarized-dark.min.css': 'assets/css/highlight/solarized-dark.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/atom-one-dark.min.css': 'assets/css/highlight/atom-one-dark.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/vs2015.min.css': 'assets/css/highlight/vs2015.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/nord.min.css': 'assets/css/highlight/nord.css',
    'https://cdn.jsdelivr.net/npm/highlight.js/styles/monokai.min.css': 'assets/css/highlight/monokai.css',
};

function buildOffline() {
    const inputFile = path.join(__dirname, 'markdown-editor.html');
    const outputFile = path.join(__dirname, 'offline', 'markdown-editor-offline.html');

    console.log('正在读取在线版本...');
    let content = fs.readFileSync(inputFile, 'utf8');

    console.log('正在替换 HTML head 部分的 CDN 链接...');
    for (const { from, to } of replacementRules) {
        content = content.replace(from, to);
    }

    console.log('正在替换 JavaScript themes 对象中的 CDN URL...');
    // 使用正则全局替换所有 CDN URL
    for (const [cdnUrl, localPath] of Object.entries(themeUrlMappings)) {
        // 转义正则特殊字符
        const escapedUrl = cdnUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedUrl, 'g');
        const count = (content.match(regex) || []).length;
        if (count > 0) {
            content = content.replace(regex, localPath);
            console.log(`  ✓ 替换 ${cdnUrl.split('/').pop()} → ${localPath} (${count}处)`);
        }
    }

    console.log('正在写入离线版本...');
    fs.writeFileSync(outputFile, content, 'utf8');

    console.log('✅ 构建完成！');
    console.log(`📄 输出文件: ${outputFile}`);
    console.log('\n提示: 确保 offline/assets/ 目录下有所需的本地资源文件');
}

// 运行构建
buildOffline();
