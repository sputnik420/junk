import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

const expectedPages = {
  'index.html': {
    lang: 'en',
    canonical: 'https://ansebjunk.com/',
    alternateEn: 'https://ansebjunk.com/',
    alternateEs: 'https://ansebjunk.com/es/'
  },
  'services/index.html': {
    lang: 'en',
    canonical: 'https://ansebjunk.com/services/',
    alternateEn: 'https://ansebjunk.com/services/',
    alternateEs: 'https://ansebjunk.com/es/servicios/'
  },
  'contact/index.html': {
    lang: 'en',
    canonical: 'https://ansebjunk.com/contact/',
    alternateEn: 'https://ansebjunk.com/contact/',
    alternateEs: 'https://ansebjunk.com/es/contacto/'
  },
  'privacy/index.html': {
    lang: 'en',
    canonical: 'https://ansebjunk.com/privacy/',
    alternateEn: 'https://ansebjunk.com/privacy/',
    alternateEs: 'https://ansebjunk.com/es/privacidad/'
  },
  'terms/index.html': {
    lang: 'en',
    canonical: 'https://ansebjunk.com/terms/',
    alternateEn: 'https://ansebjunk.com/terms/',
    alternateEs: 'https://ansebjunk.com/es/terminos/'
  },
  'es/index.html': {
    lang: 'es',
    canonical: 'https://ansebjunk.com/es/',
    alternateEn: 'https://ansebjunk.com/',
    alternateEs: 'https://ansebjunk.com/es/'
  },
  'es/servicios/index.html': {
    lang: 'es',
    canonical: 'https://ansebjunk.com/es/servicios/',
    alternateEn: 'https://ansebjunk.com/services/',
    alternateEs: 'https://ansebjunk.com/es/servicios/'
  },
  'es/contacto/index.html': {
    lang: 'es',
    canonical: 'https://ansebjunk.com/es/contacto/',
    alternateEn: 'https://ansebjunk.com/contact/',
    alternateEs: 'https://ansebjunk.com/es/contacto/'
  },
  'es/privacidad/index.html': {
    lang: 'es',
    canonical: 'https://ansebjunk.com/es/privacidad/',
    alternateEn: 'https://ansebjunk.com/privacy/',
    alternateEs: 'https://ansebjunk.com/es/privacidad/'
  },
  'es/terminos/index.html': {
    lang: 'es',
    canonical: 'https://ansebjunk.com/es/terminos/',
    alternateEn: 'https://ansebjunk.com/terms/',
    alternateEs: 'https://ansebjunk.com/es/terminos/'
  }
};

const requiredFiles = [
  ...Object.keys(expectedPages),
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
  /\\s+lang=["']en["']/,
  /Contact Us/i,
  /Get in Touch/i,
  /Call Now/i,
  /Text Photos/i,
  /Privacy Policy/i,
  /Information We Collect/i,
  /Terms of Service/i,
  /based on/i,
  />Customer</,
  /Recently/i
];

let failed = false;

function error(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

console.log('Validating built site...');

// 1. Check required files
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    error(`Required file missing: ${file}`);
  }
}

// 2. Validate Metadata
for (const [relPath, expected] of Object.entries(expectedPages)) {
  const filePath = path.join(distDir, relPath);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes(`<html lang="${expected.lang}">`)) error(`Incorrect <html lang> in ${relPath}`);
  if (!content.match(/<title>.*?<\/title>/)) error(`Missing <title> in ${relPath}`);
  if (!content.includes('<meta name="description"')) error(`Missing meta description in ${relPath}`);
  if (!content.includes(`<link rel="canonical" href="${expected.canonical}"`)) error(`Missing or incorrect canonical in ${relPath}`);
  if (!content.includes(`<link rel="alternate" hreflang="en" href="${expected.alternateEn}"`)) error(`Missing or incorrect hreflang="en" in ${relPath}`);
  if (!content.includes(`<link rel="alternate" hreflang="es" href="${expected.alternateEs}"`)) error(`Missing or incorrect hreflang="es" in ${relPath}`);
  if (!content.includes(`<link rel="alternate" hreflang="x-default" href="${expected.alternateEn}"`)) error(`Missing or incorrect hreflang="x-default" in ${relPath}`);
}

// 404 validation
const notFoundPath = path.join(distDir, '404.html');
if (fs.existsSync(notFoundPath)) {
  const content = fs.readFileSync(notFoundPath, 'utf-8');
  if (!content.includes('<meta name="robots" content="noindex, nofollow"')) error(`404.html is missing noindex`);
}

// Sitemap validation
const sitemapPath = path.join(distDir, 'sitemap-index.xml');
let actualSitemapName = 'sitemap-index.xml';
if (fs.existsSync(sitemapPath)) {
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const actualSitemapMatch = content.match(/<loc>(.*?sitemap-0\.xml)<\/loc>/);
  if (actualSitemapMatch) {
    actualSitemapName = actualSitemapMatch[1].split('/').pop();
    const sitemap0Path = path.join(distDir, actualSitemapName);
    if (fs.existsSync(sitemap0Path)) {
      const sitemap0 = fs.readFileSync(sitemap0Path, 'utf-8');
      if (sitemap0.includes('/404')) error('Sitemap contains /404 URL');
      if (sitemap0.includes('github.io')) error('Sitemap contains github.io URL');
      // Verify all expected pages are in sitemap
      for (const [relPath, expected] of Object.entries(expectedPages)) {
        if (!sitemap0.includes(expected.canonical)) error(`Sitemap missing canonical URL for ${relPath}`);
      }
    }
  }
}

// Robots.txt validation
const robotsPath = path.join(distDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const content = fs.readFileSync(robotsPath, 'utf-8');
  if (!content.includes(`Sitemap: https://ansebjunk.com/sitemap-index.xml`)) error('robots.txt is missing correct Sitemap directive');
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(distDir, (filePath) => {
  if (!filePath.endsWith('.html')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Global disallow checks
  for (const pattern of disallowedPatternsGlobal) {
    if (content.includes(pattern)) error(`Found disallowed pattern "${pattern}" in ${filePath}`);
  }

  // Specific spanish checks
  if (filePath.includes(`${path.sep}es${path.sep}`)) {
    for (const pattern of disallowedPatternsSpanish) {
      if (pattern.test(content)) error(`Found disallowed pattern "${pattern}" in Spanish page ${filePath}`);
    }
  }

  // JSON-LD validation
  const scriptRegex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      error(`Invalid JSON-LD in ${filePath}`);
    }
  }

  // Internal link and resource checking
  const hrefRegex = /href=["'](.*?)["']/g;
  const srcRegex = /src=["'](.*?)["']/g;
  
  const validatePath = (urlStr) => {
    if (urlStr.startsWith('http') || urlStr.startsWith('tel:') || urlStr.startsWith('mailto:') || urlStr.startsWith('sms:') || urlStr.startsWith('javascript:') || urlStr.startsWith('#') || urlStr.startsWith('data:')) return;
    
    let localPath = urlStr.split('#')[0].split('?')[0]; // remove hash and query
    if (localPath === '' || localPath === '/') return;
    
    if (localPath.startsWith('/')) {
        localPath = localPath.substring(1);
    }
    
    // Auto append index.html for directory paths
    if (!localPath.includes('.') || localPath.endsWith('/')) {
      if (!localPath.endsWith('/')) localPath += '/';
      localPath += 'index.html';
    }

    const absPath = path.join(distDir, localPath);
    if (!fs.existsSync(absPath)) {
        error(`Broken local reference "${urlStr}" in ${filePath}`);
    }
  };

  while ((match = hrefRegex.exec(content)) !== null) validatePath(match[1]);
  while ((match = srcRegex.exec(content)) !== null) validatePath(match[1]);
});

if (failed) {
  console.error('\nBuild validation FAILED.');
  process.exit(1);
} else {
  console.log('\nBuild validation PASSED.');
}
