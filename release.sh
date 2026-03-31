#!/bin/bash
# 打包并发布 GitHub Release

set -e

VERSION="${1:-v$(date +%Y.%m.%d)}"
REPO="wangwen135/web-markdown-editor"
ZIP_NAME="web-markdown-editor-offline.zip"
RELEASE_DIR="release"

echo "====================================="
echo "  版本: $VERSION"
echo "  文件: $ZIP_NAME"
echo "====================================="

# 清理并创建临时目录
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# 复制离线版本文件
cp -r offline/* "$RELEASE_DIR/"

# 使用 Python 创建 zip 文件
echo "正在打包..."
python3 - << EOF
import zipfile
import os
import glob

zip_path = "$ZIP_NAME"
release_dir = "$RELEASE_DIR"

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(release_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, release_dir)
            zipf.write(file_path, arcname)
            print(f"  添加: {arcname}")
EOF

# 清理临时目录
rm -rf "$RELEASE_DIR"

SIZE=$(ls -lh "$ZIP_NAME" | awk '{print $5}')
echo "✅ 打包完成: $ZIP_NAME ($SIZE)"

# 检查是否安装了 GitHub CLI
if command -v gh &> /dev/null; then
    echo ""
    echo "正在创建 GitHub Release..."

    # 检查是否已认证
    if gh auth status &> /dev/null; then
        # 创建 Release
        gh release create "$VERSION" \
            "$ZIP_NAME" \
            --title "Web Markdown Editor $VERSION" \
            --notes "## 离线版本

- 所有资源本地化，完全离线运行
- 无需网络连接，双击即用
- 支持实时预览、语法高亮、数学公式、图表渲染

## 使用方法

1. 下载 \`$ZIP_NAME\`
2. 解压到任意目录
3. 用浏览器打开 \`markdown-editor-offline.html\`
4. 开始使用！

## 版本信息

详见 \`offline/README-OFFLINE.md\`
"

        echo "✅ Release 已发布: $VERSION"
        echo "   下载地址: https://github.com/$REPO/releases/download/$VERSION/$ZIP_NAME"
    else
        echo "⚠️  未登录 GitHub，请先运行: gh auth login"
        echo "   然后手动创建 Release 并上传 $ZIP_NAME"
    fi
else
    echo ""
    echo "⚠️  未安装 GitHub CLI"
    echo "   请安装后自动发布，或手动上传到:"
    echo "   https://github.com/$REPO/releases/new"
    echo ""
    echo "   安装命令: sudo apt install gh (Ubuntu/Debian)"
fi
