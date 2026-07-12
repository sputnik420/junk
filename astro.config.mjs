import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ansebjunk.com',
  trailingSlash: 'always',
  integrations: [react(), sitemap()]
});