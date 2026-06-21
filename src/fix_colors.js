const fs = require('fs');
const path = require('path');

const filesToFix = [
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/cart/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/courses/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/login/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/profile/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/wishlist/page.tsx'
];

const replacements = [
  // Slate fixes
  { from: /slate-955/g, to: 'slate-950' },
  { from: /slate-850/g, to: 'slate-800' },
  { from: /slate-750/g, to: 'slate-700' },
  { from: /slate-655/g, to: 'slate-600' },
  { from: /slate-605/g, to: 'slate-600' },
  { from: /slate-555/g, to: 'slate-500' },
  { from: /slate-550/g, to: 'slate-500' },
  { from: /slate-455/g, to: 'slate-400' },
  { from: /slate-450/g, to: 'slate-400' },
  { from: /slate-405/g, to: 'slate-400' },
  { from: /slate-355/g, to: 'slate-300' },
  { from: /slate-350/g, to: 'slate-300' },
  { from: /slate-305/g, to: 'slate-300' },
  { from: /slate-250/g, to: 'slate-200' },
  { from: /slate-150/g, to: 'slate-200' },
  // Indigo fixes
  { from: /indigo-650/g, to: 'indigo-600' },
  { from: /indigo-550/g, to: 'indigo-500' },
  { from: /indigo-455/g, to: 'indigo-400' },
  { from: /indigo-255/g, to: 'indigo-200' },
  { from: /indigo-150/g, to: 'indigo-200' },
  // Rose & others
  { from: /rose-405/g, to: 'rose-400' },
  { from: /rose-250/g, to: 'rose-200' },
  { from: /orange-655/g, to: 'orange-600' },
  { from: /amber-450/g, to: 'amber-400' }
];

for (const filepath of filesToFix) {
  if (fs.existsSync(filepath)) {
    console.log(`Processing file: ${filepath}`);
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    
    for (const r of replacements) {
      content = content.replace(r.from, r.to);
    }
    
    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`  ✓ Successfully updated file.`);
    } else {
      console.log(`  No replacements needed.`);
    }
  } else {
    console.log(`File does not exist: ${filepath}`);
  }
}

console.log('Replacements completed.');
