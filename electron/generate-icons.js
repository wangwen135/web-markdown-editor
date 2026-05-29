#!/usr/bin/env node
// Generates placeholder icons from the SVG source.
// For production, replace with a proper icon design tool output.
// CI can use 'electron-icon-builder' npm package instead.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const iconsDir = path.join(__dirname, 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

// Check for available tools
const hasConvert = (() => { try { execSync('which convert', { stdio: 'ignore' }); return true; } catch { return false; } })();
const hasRsvg = (() => { try { execSync('which rsvg-convert', { stdio: 'ignore' }); return true; } catch { return false; } })();
const hasMagick = (() => { try { execSync('which magick', { stdio: 'ignore' }); return true; } catch { return false; } })();

if (hasRsvg) {
  // rsvg-convert is the best option
  execSync(`rsvg-convert -w 256 -h 256 "${svgPath}" -o "${path.join(iconsDir, 'icon.png')}"`);
  execSync(`rsvg-convert -w 256 -h 256 "${svgPath}" -o "${path.join(iconsDir, 'icon.ico')}"`);
  console.log('Icons generated with rsvg-convert');
} else if (hasConvert) {
  execSync(`convert -background none -resize 256x256 "${svgPath}" "${path.join(iconsDir, 'icon.png')}"`);
  execSync(`convert -background none -resize 256x256 "${svgPath}" "${path.join(iconsDir, 'icon.ico')}"`);
  console.log('Icons generated with ImageMagick convert');
} else if (hasMagick) {
  execSync(`magick -background none -resize 256x256 "${svgPath}" "${path.join(iconsDir, 'icon.png')}"`);
  execSync(`magick -background none -resize 256x256 "${svgPath}" "${path.join(iconsDir, 'icon.ico')}"`);
  console.log('Icons generated with ImageMagick magick');
} else {
  // Fallback: create a minimal 1x1 PNG so electron-builder doesn't fail
  // (will use default Electron icon)
  console.log('No SVG conversion tool found. Using default Electron icon.');
  console.log('Install librsvg2-bin (rsvg-convert) or imagemagick for custom icons.');
}
