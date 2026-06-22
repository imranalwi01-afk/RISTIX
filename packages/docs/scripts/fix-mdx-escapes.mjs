import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dirs = ['backend-api', 'frontend-api'];

for (const subdir of dirs) {
  const dir = join(import.meta.dirname, '..', 'docs', subdir);
  let files;
  try { files = readdirSync(dir).filter(f => f.endsWith('.md')); } catch { continue; }
  for (const file of files) {
    const path = join(dir, file);
    let content = readFileSync(path, 'utf-8');
    const original = content;

    // 1. Replace backslash escapes with HTML entities
    content = content.replace(/\\</g, '&lt;');
    content = content.replace(/\\>/g, '&gt;');
    content = content.replace(/\\{/g, '&#123;');
    content = content.replace(/\\}/g, '&#125;');
    content = content.replace(/\\\|/g, '&#124;');

    // 2. Replace bare { and } outside code blocks with HTML entities
    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    for (const line of lines) {
      if (line.trimStart().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        result.push(line);
        continue;
      }
      if (inCodeBlock) {
        result.push(line);
        continue;
      }
      // Process line: replace { and } that are outside inline code
      let out = '';
      let inBacktick = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '`') { inBacktick = !inBacktick; out += ch; continue; }
        if (inBacktick) { out += ch; continue; }
        if (ch === '{') { out += '&#123;'; continue; }
        if (ch === '}') { out += '&#125;'; continue; }
        out += ch;
      }
      result.push(out);
    }
    content = result.join('\n');

    if (content !== original) writeFileSync(path, content);
  }
}
