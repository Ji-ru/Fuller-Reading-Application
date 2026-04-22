const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\src\\marungko\\Fuller-Reading-Application\\src';

const replacements = [
  { old: 'cisckids.png', new: 'cisckids copy.png' },
  { old: 'cisc_logo_animated.mp4', new: 'cisc_logo_animated (4).mp4' }
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const r of replacements) {
        if (content.includes(r.old)) {
          content = content.split(r.old).join(r.new);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated assets in ${file}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Done!');
