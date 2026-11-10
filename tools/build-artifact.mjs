// Builds a single self-contained page (CSS and JS inlined) from index.html.
// Usage: node tools/build-artifact.mjs <output.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const body = html.split('<!--APP-->')[1].split('<!--/APP-->')[0];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const css = readFileSync(join(root, 'css/app.css'), 'utf8');
const js = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].filter(m => !m[1].startsWith('vendor/')).map(m => readFileSync(join(root, m[1]), 'utf8')).join('\n');
const out = `<title>Rasl Estate</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n<style>\n${css}</style>\n${body}\n<script>\n${js}\n</script>\n`;
writeFileSync(process.argv[2] || join(root, 'rasl-estate.single.html'), out);
console.log('wrote', out.length, 'bytes');
