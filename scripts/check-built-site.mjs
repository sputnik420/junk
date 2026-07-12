import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

const requiredFiles = [
  'index.html',
  'services/index.html',
  'contact/index.html',
  'privacy/index.html',
  'terms/index.html',
  'es/index.html',
  'es/servicios/index.html',
  'es/contacto/index.html',
  'es/privacidad/index.html',
  'es/terminos/index.html',
  'api/submit.php',
  'robots.txt',
  'sitemap-index.xml',
  '404.html'
];

const disallowedPatternsGlobal = [
  'XXXXXXXXXX',
  '>Placeholder<',
  'href="#"',
  'GTM-XXXXXXX',
  'Carlos M.',
  'Sarah T.',
  'Miguel R.',
  'based on 0 reviews',
  'GMAPAPI'
];

const disallowedPatternsSpanish = [
  /\\s+lang=["']en["']/ // Looking for lang="en" in es/ pages
];

let failed = false;

console.log('Validating built site...');

// 1. Check required files
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Required file missing: ${file}`);
    failed = true;
  }
}

// Helper to walk directory
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

// 2. Content validation
walkDir(distDir, (filePath) => {
  if (!filePath.endsWith('.html') && !filePath.endsWith('.js')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Global disallow checks
  for (const pattern of disallowedPatternsGlobal) {
    if (content.includes(pattern)) {
      console.error(`FAIL: Found disallowed pattern "${pattern}" in ${filePath}`);
      failed = true;
    }
  }

  // Specific spanish checks
  if (filePath.includes(`${path.sep}es${path.sep}`) && filePath.endsWith('.html')) {
    for (const pattern of disallowedPatternsSpanish) {
      if (pattern.test(content)) {
        console.error(`FAIL: Found disallowed pattern "${pattern}" in Spanish page ${filePath}`);
        failed = true;
      }
    }
  }
});

if (failed) {
  console.error('\nBuild validation FAILED.');
  process.exit(1);
} else {
  console.log('\nBuild validation PASSED.');
}
