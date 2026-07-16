# Mermaid Diagram Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为每个已渲染的 Mermaid 图表提供可缩放、平移、多图切换、minimap、源码复制，以及完整 PNG/SVG 导出的全屏查看器。

**Architecture:** 保持 `markdown-editor.html` 为唯一在线源文件，在其中增加 `MermaidViewerMath` 纯函数集合和 `MermaidViewer` 单例模块。查看器克隆预览区原始 SVG 进行显示，所有视图变换只作用于克隆；导出重新克隆原始 SVG，确保不受当前缩放和平移影响。离线 Web 版继续由 `build-offline.js` 自动生成，本次不修改或验收 Electron。

**Tech Stack:** 原生 JavaScript、SVG、Pointer Events、Canvas 2D、Bootstrap Icons、Node.js 内置 `assert`、现有 html2canvas、现有 Storage。

## Global Constraints

- 不增加运行时或测试第三方依赖。
- 在线源文件只修改 `markdown-editor.html`；不得手工编辑 `offline/markdown-editor-offline.html`。
- 缩放范围固定为 10% 至 500%。
- minimap 在 100% 图表尺寸任一方向超过画布对应尺寸 1.5 倍时显示。
- minimap 不提供关闭按钮，达到显示阈值时始终保留。
- 复制按钮复制纯 Mermaid 源码，不包含 Markdown 三反引号代码围栏。
- PNG 默认 2 倍导出，最长边不超过 16384px，总像素不超过 64,000,000px。
- PNG 与 SVG 都支持透明、白色和自定义颜色背景。
- 在线和离线 Web 版行为一致；不得修改 `electron/` 目录。
- 查看器不得修改 Markdown 内容、预览区原始 SVG或现有文档导出结果。

## File Structure

- Modify: `markdown-editor.html` — 查看器 CSS、HTML、纯函数、生命周期、手势、minimap 和导出实现。
- Create: `tests/mermaid-viewer-math.test.js` — 从 HTML 标记区提取纯函数，并用 Node 内置 `assert` 验证数学和尺寸边界。
- Generated: `offline/markdown-editor-offline.html` — 最终通过 `npm run build:offline` 更新并提交。
- Modify: `README.md` — 在功能列表中说明 Mermaid 大图查看和单图导出能力。

---

### Task 1: 变换与导出尺寸纯函数

**Files:**
- Create: `tests/mermaid-viewer-math.test.js`
- Modify: `markdown-editor.html`，主脚本中 `Storage` 定义之后、查看器模块之前

**Interfaces:**
- Produces: `window.MermaidViewerMath`
- Produces: `clamp(value, min, max): number`
- Produces: `calculateFitScale(svgWidth, svgHeight, viewportWidth, viewportHeight, padding, minScale, maxScale): number`
- Produces: `calculateAnchoredTranslation(anchor, translation, oldScale, newScale): {x, y}`
- Produces: `shouldShowMinimap(svgWidth, svgHeight, viewportWidth, viewportHeight, threshold): boolean`
- Produces: `calculateRasterSize(width, height, multiplier, maxEdge, maxPixels): {width, height, scale, reduced}`

- [ ] **Step 1: 写入会失败的零依赖 Node 测试**

测试文件读取 `markdown-editor.html` 中两个标记之间的代码并执行：

```js
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

test('anchored zoom keeps the anchor stationary', () => {
  assert.deepEqual(
    math.calculateAnchoredTranslation({x: 200, y: 150}, {x: 50, y: 25}, 1, 2),
    {x: -100, y: -100}
  );
});

test('minimap threshold uses either overflowing dimension', () => {
  assert.equal(math.shouldShowMinimap(1500, 500, 1000, 600, 1.5), false);
  assert.equal(math.shouldShowMinimap(1501, 500, 1000, 600, 1.5), true);
  assert.equal(math.shouldShowMinimap(800, 901, 1000, 600, 1.5), true);
});

test('raster size applies multiplier and both safety caps', () => {
  assert.deepEqual(math.calculateRasterSize(1000, 500, 2, 16384, 64000000), {
    width: 2000, height: 1000, scale: 2, reduced: false
  });
  const capped = math.calculateRasterSize(20000, 10000, 2, 16384, 64000000);
  assert.ok(capped.width <= 16384);
  assert.ok(capped.width * capped.height <= 64000000);
  assert.equal(capped.width / capped.height, 2);
  assert.equal(capped.reduced, true);
});
```

- [ ] **Step 2: 运行测试并确认因缺少标记失败**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: FAIL，包含 `missing Mermaid viewer math start marker`。

- [ ] **Step 3: 在 HTML 主脚本中实现纯函数**

```js
/* MERMAID_VIEWER_MATH_START */
const MermaidViewerMath = (() => {
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function calculateFitScale(svgWidth, svgHeight, viewportWidth, viewportHeight,
                               padding = 40, minScale = 0.1, maxScale = 5) {
        if (svgWidth <= 0 || svgHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
            return 1;
        }
        const availableWidth = Math.max(1, viewportWidth - padding * 2);
        const availableHeight = Math.max(1, viewportHeight - padding * 2);
        return clamp(Math.min(availableWidth / svgWidth, availableHeight / svgHeight), minScale, maxScale);
    }

    function calculateAnchoredTranslation(anchor, translation, oldScale, newScale) {
        const ratio = newScale / oldScale;
        return {
            x: anchor.x - (anchor.x - translation.x) * ratio,
            y: anchor.y - (anchor.y - translation.y) * ratio
        };
    }

    function shouldShowMinimap(svgWidth, svgHeight, viewportWidth, viewportHeight, threshold = 1.5) {
        return svgWidth > viewportWidth * threshold || svgHeight > viewportHeight * threshold;
    }

    function calculateRasterSize(width, height, multiplier = 2,
                                 maxEdge = 16384, maxPixels = 64000000) {
        const requestedScale = multiplier;
        const edgeScale = Math.min(1, maxEdge / (Math.max(width, height) * requestedScale));
        const pixelScale = Math.min(1, Math.sqrt(maxPixels / (width * height * requestedScale * requestedScale)));
        const scale = requestedScale * Math.min(edgeScale, pixelScale);
        const outputWidth = Math.max(1, Math.floor(width * scale));
        const outputHeight = Math.max(1, Math.floor(height * scale));
        return {width: outputWidth, height: outputHeight, scale, reduced: scale < requestedScale};
    }

    return {clamp, calculateFitScale, calculateAnchoredTranslation, shouldShowMinimap, calculateRasterSize};
})();
window.MermaidViewerMath = MermaidViewerMath;
/* MERMAID_VIEWER_MATH_END */
```

- [ ] **Step 4: 运行测试并确认五项通过**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: `tests 5`, `pass 5`, `fail 0`。

- [ ] **Step 5: 提交纯函数与测试**

```powershell
git add markdown-editor.html tests/mermaid-viewer-math.test.js
git commit -m "test: add Mermaid viewer transform math"
```

### Task 2: 查看器外壳、入口与生命周期

**Files:**
- Modify: `markdown-editor.html`，内联 CSS、`loadingOverlay` 之后的 HTML、`renderMermaid()` 和主脚本末尾

**Interfaces:**
- Consumes: `window.MermaidViewerMath`
- Produces: `window.MermaidViewer`
- Produces: `MermaidViewer.enhance(): void`
- Produces: `MermaidViewer.open(index, trigger): void`
- Produces: `MermaidViewer.close(): void`
- Produces: `MermaidViewer.refreshDiagrams(): SVGElement[]`

- [ ] **Step 1: 添加全屏查看器 DOM 与可访问属性**

增加 `#mermaidViewer`，内部固定包含 `#mermaidViewerCanvas`、`#mermaidViewerStage`、上一张/下一张、缩放、适应、100%、导出、关闭、计数和标题控件。根节点使用 `role="dialog" aria-modal="true" aria-hidden="true"`，所有图标按钮提供 `title` 与 `aria-label`。

- [ ] **Step 2: 添加查看器、悬浮入口、深色模式、打印与 reduced-motion CSS**

关键规则必须为：根节点 `position: fixed; inset: 0; z-index: 10020;`；画布 `overflow: hidden; touch-action: none;`；舞台使用 `transform-origin: 0 0`；`.mermaid-view-action` 默认透明、hover/focus-within 显示；触控媒体查询中始终显示；`@media print` 隐藏入口和查看器。

- [ ] **Step 3: 实现幂等的图表增强**

`enhance()` 重新扫描 `#preview .mermaid`，只处理含 `svg` 且没有 `data-viewer-enhanced` 的元素。为其包裹或复用 `.mermaid-view-wrapper`，插入按钮，按钮点击调用 `open(index, button)`；容器双击时如果 `event.target.closest('a')` 为空则打开。

- [ ] **Step 4: 让 Mermaid 后处理等待异步渲染**

将 `renderMermaid()` 改为返回 Promise：Mermaid 11 使用 `await mermaid.run({nodes})`，旧 API 调用后使用 `Promise.resolve()`。在完成后调用 `MermaidViewer.enhance()`，随后再调用 `buildScrollMap()` 和 `updatePreviewFootBar()`。渲染序列必须捕获错误，不能产生未处理 Promise rejection。

- [ ] **Step 5: 实现打开、关闭、焦点与背景滚动锁定**

`open()` 读取最新图表列表、克隆目标 SVG、记录触发元素、显示模态、设置 `body.style.overflow = 'hidden'`、聚焦关闭按钮并调用 `fitToViewport()`。`close()` 恢复 overflow、清空 stage/minimap、释放指针、撤销 URL、隐藏导出面板并将焦点还给触发元素。

- [ ] **Step 6: 浏览器验证入口与生命周期**

Run: 在本地 HTTP 服务中打开 `markdown-editor.html`。

Expected: 每张有效图只有一个悬浮按钮；按钮和双击打开正确图；链接点击不打开；Esc、遮罩和关闭按钮均关闭；重复 render 不重复入口；焦点正确恢复。

- [ ] **Step 7: 提交查看器外壳**

```powershell
git add markdown-editor.html
git commit -m "feat: add Mermaid diagram viewer shell"
```

### Task 3: 多图导航、缩放手势与 Minimap

**Files:**
- Modify: `markdown-editor.html`
- Modify: `tests/mermaid-viewer-math.test.js`

**Interfaces:**
- Consumes: `calculateFitScale()`、`calculateAnchoredTranslation()`、`shouldShowMinimap()`
- Produces: `calculateViewportRect(svgWidth, svgHeight, viewportWidth, viewportHeight, scale, translation): {x, y, width, height}`
- Produces: `MermaidViewer.setScale(nextScale, anchor): void`
- Produces: `MermaidViewer.fitToViewport(): void`
- Produces: `MermaidViewer.resetToActualSize(): void`
- Produces: `MermaidViewer.navigate(delta): void`
- Produces: `MermaidViewer.updateMinimap(): void`

- [ ] **Step 1: 增加 minimap 视口矩形测试**

为测试文件增加 `calculateViewportRect()` 断言：在 scale=2、translation=(-100,-50)、viewport=800x600 时，图表坐标中的可视矩形应为 `{x: 50, y: 25, width: 400, height: 300}`，并裁剪到 SVG 真实边界。

- [ ] **Step 2: 运行新增测试并确认至少一项失败**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: FAIL，包含 `math.calculateViewportRect is not a function`。

- [ ] **Step 3: 实现视口矩形、尺寸读取和视图矩阵应用**

在 `MermaidViewerMath` 增加 `calculateViewportRect()` 并导出；用逆变换把画布矩形映射到图表坐标，再裁剪到 `0..svgWidth/svgHeight`。查看器优先读取 SVG `viewBox.baseVal`，其次读取 `width`/`height`，最后使用 `getBBox()`。stage 变换统一为 `translate(xpx, ypx) scale(scale)`；比例文本使用四舍五入百分比。`setScale()` clamp 到 `0.1..5` 并使用锚点换算新平移量。

- [ ] **Step 4: 实现鼠标、键盘和触控**

滚轮调用 `preventDefault()` 并按 `Math.exp(-deltaY * 0.0015)` 连续缩放。Pointer Events 使用 `Map<pointerId, {x,y}>`：一个指针平移，两个指针根据中心点和距离变化捏合；结束时释放 pointer capture。键盘支持 `Escape`、`ArrowLeft/Right`、`+/-`、`0`、`f/F`，输入控件聚焦时跳过非 Escape 快捷键。

- [ ] **Step 5: 实现多图切换**

`navigate(delta)` 刷新图表数组，将索引限制在有效范围，重新克隆 SVG，更新标题、计数和首尾按钮 disabled，然后执行 fit。预览重渲染导致原图消失时选择最接近索引；列表为空则 Toast 后关闭。

- [ ] **Step 6: 实现自适应 minimap**

按 1.5 阈值决定显示；克隆 SVG 到 minimap，使用 SVG `viewBox` 保持全图；用主画布到图表坐标的逆变换计算视口框。点击 minimap 重定位中心，拖动视口框连续更新主平移。每次缩放、平移、resize、切图都更新 minimap。

- [ ] **Step 7: 运行数学测试和浏览器交互验证**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: 全部 PASS。

Browser expected: 鼠标、键盘、单指和双指操作可用；10%/500% 边界准确；切图计数与禁用态正确；小图无 minimap，大图有 minimap 且定位正确。

- [ ] **Step 8: 提交交互能力**

```powershell
git add markdown-editor.html tests/mermaid-viewer-math.test.js
git commit -m "feat: add Mermaid viewer navigation and gestures"
```

### Task 4: SVG/PNG 导出与背景设置

**Files:**
- Modify: `markdown-editor.html`
- Modify: `tests/mermaid-viewer-math.test.js`

**Interfaces:**
- Consumes: `calculateRasterSize()`、现有 `Storage`、`showToast()`、loading overlay
- Produces: `MermaidViewer.exportSvg(): void`
- Produces: `MermaidViewer.exportPng(): Promise<void>`
- Produces: `MermaidViewer.buildExportSvg(background): SVGElement`

- [ ] **Step 1: 补充零尺寸、最长边和总像素上限测试**

测试分别覆盖 2x 正常输出、16384px 最长边限制、64,000,000px 总像素限制和输入宽高为零时返回安全的 `1x1` 输出。

- [ ] **Step 2: 运行测试并确认零尺寸场景失败**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: 零尺寸测试 FAIL 或产生非有限数值。

- [ ] **Step 3: 修正纯函数并实现导出设置面板**

零尺寸返回 `{width: 1, height: 1, scale: 1, reduced: false}`。设置面板提供格式选择、透明/白色/自定义背景、自定义颜色输入和下载按钮；使用 `Storage.set('mermaidExportBackgroundMode', mode)` 与 `Storage.set('mermaidExportBackgroundColor', color)` 保存选择。

- [ ] **Step 4: 实现独立 SVG 构建**

克隆当前预览区原始 SVG；从 `viewBox` 确定宽高；设置 `xmlns`、`xmlns:xlink`、明确 `width/height/viewBox`；复制与 SVG 后代有关的 computed style 到内联 style；非透明背景在第一个子节点前插入 `<rect x="viewBox.x" y="viewBox.y" width="viewBox.width" height="viewBox.height" fill="...">`。

- [ ] **Step 5: 实现 SVG 下载**

用 `XMLSerializer` 加 XML 声明，生成 `image/svg+xml;charset=utf-8` Blob；文件名由当前 Markdown 名称去扩展名、替换 Windows 非法字符，再加 `-mermaid-N.svg`。点击临时链接后撤销 URL。

- [ ] **Step 6: 实现 PNG 下载与回退**

使用 `calculateRasterSize()` 得到 Canvas 尺寸。纯色背景先 `fillRect`；将序列化 SVG Blob 加载为 Image 后 `drawImage`。加载或绘制失败时，将导出 SVG 放入固定在屏幕外、尺寸完整的临时容器并调用现有 `html2canvas`，然后复制到目标 Canvas。透明模式使用 `canvas.toBlob(..., 'image/png')` 保留 Alpha。降采样时 Toast 显示最终宽高。

- [ ] **Step 7: 验证六类导出结果**

分别导出 PNG/SVG × 透明/白色/自定义色。检查完整边界、背景、文字和连线；把查看器缩放到 500% 并平移后再次导出，输出尺寸和内容必须不变；超大图不得创建越界 Canvas。

- [ ] **Step 8: 运行测试并提交导出能力**

Run: `node tests/mermaid-viewer-math.test.js`

Expected: 全部 PASS。

```powershell
git add markdown-editor.html tests/mermaid-viewer-math.test.js
git commit -m "feat: export Mermaid diagrams as PNG and SVG"
```

### Task 5: 集成、文档与 Web 回归

**Files:**
- Modify: `markdown-editor.html`
- Modify: `README.md`
- Generate: `offline/markdown-editor-offline.html`

**Interfaces:**
- Consumes: 完整 `MermaidViewer`
- Produces: 在线和离线 Web 可交付功能

- [ ] **Step 1: 隔离整篇文档导出与打印**

查看入口必须带 `.no-document-export`。现有 PDF/PNG 导出 clone 回调和 HTML 导出内容中移除 `.no-document-export`；打印 CSS 隐藏 `.no-document-export` 与 `#mermaidViewer`。查看器关闭时确认 body overflow 和焦点状态恢复。

- [ ] **Step 2: 更新 README 功能说明**

在功能列表增加“Mermaid 大图查看：缩放、平移、minimap、多图切换，以及 PNG/SVG 单图导出”。不改变现有安装和构建说明。

- [ ] **Step 3: 运行自动测试和离线构建**

Run: `node --test tests/mermaid-viewer-math.test.js`

Expected: 0 failures。

Run: `npm run build:offline`

Expected: exit 0，生成的 `offline/markdown-editor-offline.html` 包含 `MermaidViewer` 且 CDN 资源仍全部替换为本地路径。

- [ ] **Step 4: 在线版浏览器回归**

验证默认示例和一份超宽/超高/多图测试文档；覆盖打开、缩放、拖动、minimap、切图、关闭、三种背景与两种格式；再验证 Markdown 输入、KaTeX、代码高亮、TOC、滚动同步、整篇 PNG/HTML 导出。

- [ ] **Step 5: 离线 Web 冒烟验证**

断网打开离线 HTML，确认查看、缩放、平移和导出不依赖新增网络资源。确认 `electron/` 目录相对 `main` 没有差异。

- [ ] **Step 6: 检查差异与提交集成结果**

Run: `git diff --check`

Expected: 无输出，exit 0。

Run: `git status --short`

Expected: 只包含计划内文件。

```powershell
git add markdown-editor.html offline/markdown-editor-offline.html README.md tests/mermaid-viewer-math.test.js docs/superpowers/plans/2026-07-16-mermaid-diagram-viewer.md
git commit -m "docs: document Mermaid diagram viewer"
```

### Task 6: 最终审查与验收

**Files:**
- Review: `markdown-editor.html`
- Review: `tests/mermaid-viewer-math.test.js`
- Review: `offline/markdown-editor-offline.html`
- Review: `README.md`

- [ ] **Step 1: 对照设计规格逐条检查 13 项验收约束**

检查入口、缩放平移、适应窗口、minimap、多图、PNG/SVG 背景、完整导出、超大图保护、三类输入、在线/离线 Web 兼容和现有功能回归；任何缺口在声明完成前修复。

- [ ] **Step 2: 运行最终验证命令**

```powershell
node tests/mermaid-viewer-math.test.js
npm run build:offline
git diff --check HEAD
git status --short --branch
```

Expected: tests 0 failures；离线构建 exit 0；diff check 无输出；状态只显示预期提交后的干净分支。

- [ ] **Step 3: 检查提交历史**

Run: `git log --oneline main..HEAD`

Expected: 包含设计文档、数学测试、查看器外壳、交互、导出和集成文档等聚焦提交。

### Task 7: 移除 Minimap 关闭入口并复制 Mermaid 源码

**Files:**
- Modify: `markdown-editor.html`
- Modify: `tests/mermaid-viewer-structure.test.js`
- Generate: `offline/markdown-editor-offline.html`

**Interfaces:**
- Produces: `MermaidViewer.copySource(): Promise<void>`
- Produces: `.mermaid` 元素的 `data-mermaid-source` 持久源码

- [x] **Step 1: 写入失败的结构测试**

断言 HTML 不包含 `mermaidViewerMinimapClose` 或 `.mermaid-viewer-minimap-close`，包含 `#mermaidViewerCopy`，渲染阶段保存 `div.dataset.mermaidSource = el.textContent`，模块包含 `async function copySource()`、`navigator.clipboard.writeText(source)` 和 `document.execCommand('copy')`。

- [x] **Step 2: 运行测试并确认失败原因**

Run: `node tests/mermaid-viewer-structure.test.js`

Expected: FAIL，首先报告 minimap 关闭入口仍然存在。

- [x] **Step 3: 删除 Minimap 关闭入口**

从 CSS、HTML、elements 映射和事件绑定中删除 minimap 关闭按钮；删除 `minimapHidden` 状态与相关分支。`setupMinimap()` 只使用 `shouldShowMinimap()` 决定 `hidden`。

- [x] **Step 4: 保存源码并增加复制按钮**

`renderMermaid()` 在替换代码块前执行 `div.dataset.mermaidSource = el.textContent`，避免 Mermaid 处理 DOM 时丢失对象临时属性。查看器顶部在导出按钮左侧增加 `#mermaidViewerCopy`，使用 clipboard 图标，标题与可访问名称为“复制 Mermaid 代码”。

- [x] **Step 5: 实现主路径与回退复制**

`copySource()` 从当前 `state.sourceSvg.closest('.mermaid').dataset.mermaidSource` 读取源码并去除首尾空白。优先 `await navigator.clipboard.writeText(source)`；失败或 API 不存在时创建只读 textarea、选中并调用 `document.execCommand('copy')`，在 `finally` 中移除 textarea。成功 Toast 为“Mermaid 代码已复制”，两条路径都失败时为“复制失败，请手动复制”。

- [x] **Step 6: 验证并生成离线 Web 版**

Run: `node tests/mermaid-viewer-structure.test.js`

Expected: 全部 PASS。

Run: `node tests/mermaid-viewer-math.test.js`

Expected: 9 项全部 PASS。

Run: `npm run build:offline`

Expected: exit 0，在线和离线 HTML 都不包含 minimap 关闭入口并包含复制按钮。

- [x] **Step 7: 浏览器验收**

打开含两张 Mermaid 图的文档：复制第一张得到纯 Mermaid 源码；切到第二张后复制内容同步变化；复制结果不含代码围栏；大图 minimap 没有叉且继续按 1.5 倍阈值显示。
