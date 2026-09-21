import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, docsDir, { recursive: true, force: true });
  console.log('✓ Synced build output from dist/ to docs/ for GitHub Pages');
}
