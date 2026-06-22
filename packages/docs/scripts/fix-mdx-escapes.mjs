import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dirs = ['backend-api', 'frontend-api'];

for (const subdir of dirs) {
  const dir = join(import.meta.dirname, '..', 'docs', subdir);
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.md'));
  } catch {
    continue;
  }
  for (const file of files) {
    const path = join(dir, file);
    let content = readFileSync(path, 'utf-8');
    const original = content;
    content = content.replace(/\\</g, '&lt;');
    content = content.replace(/\\>/g, '&gt;');
    content = content.replace(/\\{/g, '&#123;');
    content = content.replace(/\\}/g, '&#125;');
    content = content.replace(/\\\|/g, '&#124;');
    if (content !== original) writeFileSync(path, content);
  }
}
