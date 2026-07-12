import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

const expectedPages = {
  'index.html': {
    lang: 'en',
    title: 'Junk Removal Houston, TX | ANSEB Junk Removal',
    description: 'Fast, reliable junk removal in Houston and nearby areas. Furniture, appliances, garage cleanouts, yard waste and light construction debris. Call or text photos for a free estimate.',
    canonical: 'https://ansebjunk.com/',
    alternateEn: 'https://ansebjunk.com/',
    alternateEs: 'https://ansebjunk.com/es/'
  },
  'services/index.html': {
    lang: 'en',
    title: 'Junk Removal Services in Houston | ANSEB',
    description: 'Furniture removal, appliance removal, garage cleanouts, property cleanouts, yard waste and light construction debris removal in the Houston area.',
    canonical: 'https://ansebjunk.com/services/',
    alternateEn: 'https://ansebjunk.com/services/',
    alternateEs: 'https://ansebjunk.com/es/servicios/'
  },
  'contact/index.html': {
    lang: 'en',
    title: 'Free Junk Removal Estimate in Houston | ANSEB',
    description: 'Request a free junk removal estimate from ANSEB in Houston. Call, text photos or complete the online estimate form.',
    canonical: 'https://ansebjunk.com/contact/',
    alternateEn: 'https://ansebjunk.com/contact/',
    alternateEs: 'https://ansebjunk.com/es/contacto/'
  },
  'privacy/index.html': {
    lang: 'en',
    title: 'Privacy Policy | ANSEB Junk Removal',
    description: 'Privacy policy for ANSEB Junk Removal. Learn how we collect, use, and protect your information when you request a junk removal estimate in Houston, TX.',
    canonical: 'https://ansebjunk.com/privacy/',
    alternateEn: 'https://ansebjunk.com/privacy/',
    alternateEs: 'https://ansebjunk.com/es/privacidad/'
  },
  'terms/index.html': {
    lang: 'en',
    title: 'Terms of Service | ANSEB Junk Removal',
    description: 'Terms of service for ANSEB Junk Removal in Houston, TX. Read about our service conditions, pricing, and responsibilities.',
    canonical: 'https://ansebjunk.com/terms/',
    alternateEn: 'https://ansebjunk.com/terms/',
    alternateEs: 'https://ansebjunk.com/es/terminos/'
  },
  'es/index.html': {
    lang: 'es',
    title: 'Retiro de Basura en Houston, TX | ANSEB',
    description: 'Retiro de muebles, electrodomésticos, basura de garaje, desechos de jardín y escombros ligeros en Houston. Envíe fotos para solicitar un estimado gratis.',
    canonical: 'https://ansebjunk.com/es/',
    alternateEn: 'https://ansebjunk.com/',
    alternateEs: 'https://ansebjunk.com/es/'
  },
  'es/servicios/index.html': {
    lang: 'es',
    title: 'Servicios de Retiro en Houston | ANSEB',
    description: 'Retiro de muebles, electrodomésticos, basura de garaje, artículos no deseados, desechos de jardín y escombros ligeros en el área de Houston.',
    canonical: 'https://ansebjunk.com/es/servicios/',
    alternateEn: 'https://ansebjunk.com/services/',
    alternateEs: 'https://ansebjunk.com/es/servicios/'
  },
  'es/contacto/index.html': {
    lang: 'es',
    title: 'Estimado Gratis de Junk Removal en Houston | ANSEB',
    description: 'Solicite un estimado gratis para retiro de muebles, basura y artículos no deseados en Houston. Llame, envíe fotos o complete el formulario.',
    canonical: 'https://ansebjunk.com/es/contacto/',
    alternateEn: 'https://ansebjunk.com/contact/',
    alternateEs: 'https://ansebjunk.com/es/contacto/'
  },
  'es/privacidad/index.html': {
    lang: 'es',
    title: 'Política de Privacidad | ANSEB Junk Removal',
    description: 'Política de privacidad de ANSEB Junk Removal. Conozca cómo recopilamos, utilizamos y protegemos su información al solicitar un estimado en Houston, TX.',
    canonical: 'https://ansebjunk.com/es/privacidad/',
    alternateEn: 'https://ansebjunk.com/privacy/',
    alternateEs: 'https://ansebjunk.com/es/privacidad/'
  },
  'es/terminos/index.html': {
    lang: 'es',
    title: 'Términos de Servicio | ANSEB Junk Removal',
    description: 'Términos de servicio para ANSEB Junk Removal en Houston, TX. Lea sobre nuestras condiciones de servicio, precios y responsabilidades.',
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
  /\s+lang=["']en["']/,
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

// Helper to decode HTML entities for title and description matching
function decodeHtml(html) {
  return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// 2. Validate Metadata
for (const [relPath, expected] of Object.entries(expectedPages)) {
  const filePath = path.join(distDir, relPath);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes(`<html lang="${expected.lang}">`)) error(`Incorrect <html lang> in ${relPath}`);
  
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (!titleMatch) {
    error(`Missing <title> in ${relPath}`);
  } else if (decodeHtml(titleMatch[1]) !== expected.title) {
    error(`Title mismatch in ${relPath}. Expected: "${expected.title}", Got: "${decodeHtml(titleMatch[1])}"`);
  }
  
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/);
  if (!descMatch) {
    error(`Missing meta description in ${relPath}`);
  } else if (decodeHtml(descMatch[1]) !== expected.description) {
    error(`Description mismatch in ${relPath}. Expected: "${expected.description}", Got: "${decodeHtml(descMatch[1])}"`);
  }

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
  if (!content.includes('<link rel="canonical" href="https://ansebjunk.com/404/"')) error(`404.html canonical is not https://ansebjunk.com/404/`);
}

// Strict Sitemap validation
const sitemapPath = path.join(distDir, 'sitemap-index.xml');
let actualSitemapName = '';
if (!fs.existsSync(sitemapPath)) {
  error('sitemap-index.xml does not exist');
} else {
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const actualSitemapMatch = content.match(/<loc>(.*?)<\/loc>/);
  if (!actualSitemapMatch) {
    error('sitemap-index.xml does not contain any <loc>');
  } else {
    const locUrl = actualSitemapMatch[1];
    if (!locUrl.startsWith('https://ansebjunk.com/')) {
        error(`sitemap-index.xml points to invalid domain: ${locUrl}`);
    }
    actualSitemapName = locUrl.split('/').pop();
    const sitemap0Path = path.join(distDir, actualSitemapName);
    
    if (!fs.existsSync(sitemap0Path)) {
      error(`Secondary sitemap ${actualSitemapName} does not exist`);
    } else {
      try {
        const sitemap0 = fs.readFileSync(sitemap0Path, 'utf-8');
        if (!sitemap0.includes('<urlset')) error(`Secondary sitemap missing <urlset>`);
        if (sitemap0.includes('/404')) error('Sitemap contains /404 URL');
        if (sitemap0.includes('github.io')) error('Sitemap contains github.io URL');
        if (sitemap0.includes('localhost')) error('Sitemap contains localhost URL');
        
        // Extract all locs
        const locRegex = /<loc>(.*?)<\/loc>/g;
        const allLocs = [];
        let m;
        while ((m = locRegex.exec(sitemap0)) !== null) {
            allLocs.push(m[1]);
        }
        
        // Check for duplicates
        const uniqueLocs = new Set(allLocs);
        if (uniqueLocs.size !== allLocs.length) error('Sitemap contains duplicate <loc> entries');
        
        // Verify all expected pages are in sitemap exactly
        for (const [relPath, expected] of Object.entries(expectedPages)) {
          if (!allLocs.includes(expected.canonical)) {
              error(`Sitemap missing canonical URL exactly for ${relPath}: ${expected.canonical}`);
          }
        }
        
        // Verify 10 exactly?
        if (allLocs.length !== Object.keys(expectedPages).length) {
            error(`Sitemap contains ${allLocs.length} URLs, expected ${Object.keys(expectedPages).length}`);
        }
        
      } catch(e) {
          error(`Secondary sitemap unreadable`);
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
  const srcsetRegex = /srcset=["'](.*?)["']/g;
  const posterRegex = /poster=["'](.*?)["']/g;
  
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
  while ((match = posterRegex.exec(content)) !== null) validatePath(match[1]);
  
  while ((match = srcsetRegex.exec(content)) !== null) {
      const parts = match[1].split(',');
      for (const part of parts) {
          const urlStr = part.trim().split(' ')[0];
          if (urlStr) validatePath(urlStr);
      }
  }
});

if (failed) {
  console.error('\nBuild validation FAILED.');
  process.exit(1);
} else {
  console.log('\nBuild validation PASSED.');
}
