const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\src\\marungko\\Fuller-Reading-Application\\src\\Screens\\Student';

const files = fs.readdirSync(srcDir);

files.forEach(file => {
  const fullPath = path.join(srcDir, file);
  if (fs.statSync(fullPath).isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // Reduce multiplier delays: delay={index * 60} -> delay={index * 35}
    const multiplierRegex = /delay=\{index \* (\d+)\}/g;
    content = content.replace(multiplierRegex, (match, p1) => {
      const oldVal = parseInt(p1);
      const newVal = Math.max(15, Math.floor(oldVal * 0.6));
      changed = true;
      return `delay={index * ${newVal}}`;
    });

    // Reduce static delays: delay={180} -> delay={110}
    const staticRegex = /delay=\{(\d+)\}/g;
    content = content.replace(staticRegex, (match, p1) => {
      // Only target delays over 30 to avoid changing tiny/already-fast ones
      const oldVal = parseInt(p1);
      if (oldVal > 30) {
        const newVal = Math.max(20, Math.floor(oldVal * 0.6));
        changed = true;
        return `delay={${newVal}}`;
      }
      return match;
    });

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Optimized delays in ${file}`);
    }
  }
});

// Also check Student_View_Profile in Faculty if needed, but the request was "in student"
console.log('Done!');
