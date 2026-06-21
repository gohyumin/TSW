const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src';

// Regex to match tailwind-like colors ending in values that are not standard (standards are 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
// We specifically target classes matching: text-XXX-YYY, bg-XXX-YYY, border-XXX-YYY, etc. where YYY is not one of standard numbers.
const colorRegex = /(?:text|bg|border|from|to|via|decoration|outline|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+)/g;

const standardShades = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      let found = [];
      
      // Let's also check for exact values like font-extrabold! or hover:to-orange-655 manually
      // We can scan lines
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Match color classes
        let m;
        colorRegex.lastIndex = 0;
        while ((m = colorRegex.exec(line)) !== null) {
          const color = m[1];
          const shade = m[2];
          if (!standardShades.has(shade)) {
            found.push({ lineNum: idx + 1, text: m[0], type: 'invalid shade' });
          }
        }
        
        // Match font-extrabold!
        if (line.includes('font-extrabold!')) {
          found.push({ lineNum: idx + 1, text: 'font-extrabold!', type: 'typo !' });
        }
      });
      
      if (found.length > 0) {
        console.log(`\nFile: ${fullPath}`);
        found.forEach(f => {
          console.log(`  Line ${f.lineNum}: Found "${f.text}" (${f.type})`);
        });
      }
    }
  }
}

scanDirectory(srcDir);
console.log('\nScan completed.');
