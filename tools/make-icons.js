// Renders the PNG app icons from assets/logo.svg. Usage: node tools/make-icons.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, '..', 'assets');
  const svg = fs.readFileSync(path.join(dir, 'logo.svg'), 'utf8');
  const b = await chromium.launch(), p = await b.newPage();
  const shot = async (size, file, maskable) => {
    // Home-screen icons are full-bleed squares; the OS rounds the corners itself.
    const inner = svg.replace('rx="12"', 'rx="0"');
    const html = maskable
      ? `<body style="margin:0;background:#23307A"><div style="width:${size}px;height:${size}px;display:grid;place-items:center">${inner.replace('<svg ', `<svg width="${size * 0.8}" height="${size * 0.8}" `)}</div></body>`
      : `<body style="margin:0">${inner.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`;
    await p.setViewportSize({ width: size, height: size }); await p.setContent(html);
    await p.screenshot({ path: path.join(dir, file), omitBackground: false });
  };
  await shot(180, 'apple-touch-icon.png'); await shot(192, 'icon-192.png'); await shot(512, 'icon-512.png'); await shot(512, 'icon-512-maskable.png', true);
  await b.close(); console.log('icons written');
})();
