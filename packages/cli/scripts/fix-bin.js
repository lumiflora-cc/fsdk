import fs from 'fs';
import path from 'path';

const distIndex = path.resolve(process.cwd(), '../dist/index.js');

if (fs.existsSync(distIndex)) {
  let content = fs.readFileSync(distIndex, 'utf-8');
  
  if (!content.startsWith('#!/usr/bin/env node')) {
    content = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(distIndex, content);
  }
}

console.log('Bin fix applied');
