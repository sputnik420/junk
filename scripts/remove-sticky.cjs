const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.resolve('src/pages'), function(filePath) {
  if (filePath.endsWith('.astro')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/import StickyMobileCTA[^\n]+\n/g, '');
    content = content.replace(/[ \t]*<StickyMobileCTA[^>]*>\s*\n?/g, '');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

// Also remove from global.css if there is any StickyMobileCTA compensation
const cssPath = path.resolve('src/styles/global.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf-8');
  css = css.replace(/\/\*\s*Sticky Mobile CTA Compensation\s*\*\/[\s\S]*?}/, '');
  fs.writeFileSync(cssPath, css, 'utf-8');
}

console.log('Removed StickyMobileCTA from pages.');
