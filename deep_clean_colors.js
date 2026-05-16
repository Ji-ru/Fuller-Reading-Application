const fs = require('fs');
const path = require('path');

const dir = 'c:\\src\\marungko\\Fuller-Reading-Application\\src\\UI_Designs';

const colorMap = {
  // General Greens
  '#2ca96a': '#3498db',
  '#2CA96A': '#3498db',
  '#61ae45': '#2980b9',
  '#2ecc71': '#3498db',
  '#27ae60': '#2980b9',
  '#1a7a45': '#154360',
  '#d4f5e2': '#d6eaf8',
  '#a8edce': '#aed6f1',
  '#cde3f5': '#cde3f5', // skyish already
  
  // Dark Green/Sage Blacks
  '#1b2e23': '#1c2833', // Deep navy black
  '#4a6358': '#2c3e50', // Character blue
  '#8fafa0': '#859dab', // Steel blue-grey
  '#c8e6d4': '#d6eaf8', // Light blue
  
  // Teal/Mint
  '#57b8b3': '#5dade2',
  '#a8edce': '#aed6f1',
  '#f0faf4': '#ebf5fb',
  
  // Specific Badge colors if any
  '#4CAF50': '#3498db',
};

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
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
        console.log(`Deep-cleaned colors in ${file}`);
      }
    }
  }
}

processDir(dir);
console.log('Done!');
