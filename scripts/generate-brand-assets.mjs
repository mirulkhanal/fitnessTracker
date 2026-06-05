#!/usr/bin/env node
/**
 * Regenerate app icon + splash PNGs from assets/brand/*.svg
 * Run: pnpm generate:brand-assets
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'assets/brand');
const imagesDir = join(root, 'assets/images');

const renderSvg = async (svgPath, size) => {
  const svg = readFileSync(svgPath);
  return sharp(svg, { density: 300 }).resize(size, size).png();
};

const writePng = async (svgPath, size, outPath) => {
  await (await renderSvg(svgPath, size)).toFile(outPath);
  console.log(`wrote ${outPath} (${size}x${size})`);
};

const writeSolidBackground = async (color, size, outPath) => {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toFile(outPath);
  console.log(`wrote ${outPath} (${size}x${size}, solid)`);
};

await writePng(join(brandDir, 'icon-full.svg'), 1024, join(imagesDir, 'icon.png'));
await writePng(join(brandDir, 'icon-foreground.svg'), 1024, join(imagesDir, 'android-icon-foreground.png'));
await writePng(join(brandDir, 'icon-monochrome.svg'), 1024, join(imagesDir, 'android-icon-monochrome.png'));
await writeSolidBackground('#051424', 1024, join(imagesDir, 'android-icon-background.png'));
await writePng(join(brandDir, 'splash-icon.svg'), 1024, join(imagesDir, 'splash-icon.png'));
await writePng(join(brandDir, 'icon-full.svg'), 48, join(imagesDir, 'favicon.png'));

console.log('Brand assets generated.');
