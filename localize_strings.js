const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\src\\marungko\\Fuller-Reading-Application\\src';

const replacements = [
  { old: "'Email is required'", new: "'Kinakailangan'" },
  { old: "'Password is required'", new: "'Kinakailangan'" },
  { old: "'Email Required'", new: "'Kinakailangan ang Email'" },
  { r: /'Password Required'/g, new: "'Kinakailangan ang Password'" },
  { old: "'Please fill out all required fields.'", new: "'Pakisagutan ang lahat ng kinakailangang field.'" },
  { old: "'Please fill out all required fields for student registration.'", new: "'Pakisagutan ang lahat ng kinakailangang impormasyon para sa pagrerehistro.'" },
  { old: "Microphone permission required", new: "Kinakailangan ang pahintulot sa mikropono" }
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
         if (r.r) {
            if (r.r.test(content)) {
                content = content.replace(r.r, r.new);
                changed = true;
            }
         } else if (content.includes(r.old)) {
          content = content.split(r.old).join(r.new);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Localized strings in ${file}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Done!');
