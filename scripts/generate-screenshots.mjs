import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/screenshots');

// Promotional screenshot: dark background with star icon, title, and tagline
function createScreenshotSvg(width, height) {
  const starScale = Math.min(width, height) * 0.25;
  const cx = width / 2;
  const starCy = height * 0.38;
  const titleY = height * 0.62;
  const taglineY = height * 0.70;
  const titleSize = Math.round(Math.min(width, height) * 0.08);
  const taglineSize = Math.round(Math.min(width, height) * 0.03);

  // 10-point star polygon
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 2) + (i * Math.PI / 5);
    const r = i % 2 === 0 ? starScale : starScale * 0.45;
    points.push(`${cx + r * Math.cos(angle)},${starCy - r * Math.sin(angle)}`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0f23"/>
      <stop offset="100%" stop-color="#1a1a3e"/>
    </linearGradient>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <polygon points="${points.join(' ')}" fill="url(#starGrad)" opacity="0.9"/>
  <polygon points="${points.join(' ')}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${titleSize}" fill="url(#titleGrad)">Halma</text>
  <text x="${cx}" y="${taglineY}" text-anchor="middle" font-family="sans-serif" font-size="${taglineSize}" fill="rgba(255,255,255,0.6)">Sternhalma gegen die KI</text>
</svg>`;
}

const screenshots = [
  { name: 'screenshot-wide.png', width: 1280, height: 720 },
  { name: 'screenshot-mobile.png', width: 390, height: 844 },
];

for (const { name, width, height } of screenshots) {
  const svg = createScreenshotSvg(width, height);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(resolve(outDir, name));
  console.log(`Generated ${name} (${width}x${height})`);
}

// OG-Image for social sharing
const ogWidth = 1200;
const ogHeight = 630;
const ogSvg = createScreenshotSvg(ogWidth, ogHeight);
await sharp(Buffer.from(ogSvg))
  .resize(ogWidth, ogHeight)
  .png()
  .toFile(resolve(__dirname, '../public/og-image.png'));
console.log(`Generated og-image.png (${ogWidth}x${ogHeight})`);
