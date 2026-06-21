const fs = require('fs');

const files = [
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/courses/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/profile/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/page.tsx',
  'c:/Users/My Personal Computer/Downloads/TSW_Project/learnwise/src/app/my-learning/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes('start study') || line.toLowerCase().includes('startstudying')) {
        console.log(`${file} : Line ${idx + 1} : ${line.trim()}`);
      }
    });
  }
});
