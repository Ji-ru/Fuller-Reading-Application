const fs = require('fs');
const path = require('path');

const dir = 'c:\\src\\marungko\\Fuller-Reading-Application\\src\\UI_Designs';

const colorMap = {
  '#f0faf4': '#ebf5fb',
  '#2ecc71': '#3498db',
  '#27ae60': '#2980b9',
  '#1a7a45': '#154360',
  '#d4f5e2': '#d6eaf8',
  '#a8edce': '#aed6f1',
  '#c8e6d4': '#cde3f5',
  // uppercase variants just in case
  '#F0FAF4': '#ebf5fb',
  '#2ECC71': '#3498db',
  '#27AE60': '#2980b9',
  '#1A7A45': '#154360',
  '#D4F5E2': '#d6eaf8',
  '#A8EDCE': '#aed6f1',
  '#C8E6D4': '#cde3f5',
};

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${file}`);
      }
    }
  }
}

processDir(dir);
console.log('Done!');
