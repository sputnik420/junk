import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const images = [
  {
    input: 'public/images/hero-trailer.jpg',
    outputWebp: 'public/images/hero-trailer.webp',
    outputJpg: 'public/images/hero-trailer.jpg',
    width: 1200,
    height: 900,
    webpQuality: 82,
    jpgQuality: 85,
  },
  {
    input: 'public/images/hero-trailer-2.jpg',
    outputWebp: 'public/images/hero-trailer-2.webp',
    outputJpg: 'public/images/hero-trailer-2.jpg',
    width: 1200,
    height: 900,
    webpQuality: 82,
    jpgQuality: 85,
  },
  {
    input: 'public/images/og-share.jpg',
    outputWebp: 'public/images/og-share.webp',   // we'll keep jpg as main for OG
    outputJpg: 'public/images/og-share.jpg',
    width: 1200,
    height: 630,
    webpQuality: 80,
    jpgQuality: 84,
  },
  {
    input: 'public/images/results-before-after.jpg',
    outputWebp: 'public/images/results-before-after.webp',
    outputJpg: 'public/images/results-before-after.jpg',
    width: 960,
    height: 540,
    webpQuality: 85,
    jpgQuality: 88,
  },
];

async function optimize() {
  console.log('Optimizing images for web...\n');

  for (const img of images) {
    const inputBuffer = await fs.readFile(img.input);

    // WebP
    const webpBuffer = await sharp(inputBuffer)
      .resize(img.width, img.height, { fit: 'cover' })
      .webp({ quality: img.webpQuality, effort: 6 })
      .toBuffer();

    await fs.writeFile(img.outputWebp, webpBuffer);
    const webpSize = (webpBuffer.length / 1024).toFixed(1);

    // Optimized JPG
    const jpgBuffer = await sharp(inputBuffer)
      .resize(img.width, img.height, { fit: 'cover' })
      .jpeg({ quality: img.jpgQuality, mozjpeg: true })
      .toBuffer();

    await fs.writeFile(img.outputJpg, jpgBuffer);
    const jpgSize = (jpgBuffer.length / 1024).toFixed(1);

    console.log(`${path.basename(img.input)}`);
    console.log(`  → ${path.basename(img.outputWebp)}: ${webpSize} KB (WebP q${img.webpQuality})`);
    console.log(`  → ${path.basename(img.outputJpg)}:  ${jpgSize} KB (JPG q${img.jpgQuality})`);
    console.log('');
  }

  console.log('✅ Image optimization complete!');
}

optimize().catch(console.error);
