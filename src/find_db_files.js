const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/My Personal Computer/Downloads/TSW_Project';

function findFiles(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (item === 'node_modules' || item === '.next' || item === '.git') continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findFiles(fullPath);
      } else {
        if (fullPath.toLowerCase().includes('xml') || fullPath.endsWith('.xml') || fullPath.endsWith('.sql') || fullPath.endsWith('.json')) {
          console.log(`Found file: ${fullPath} (${stat.size} bytes)`);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

findFiles(rootDir);
console.log('Done.');
