# ANSEB Junk Removal Website

This repository contains the source code for the official ANSEB Junk Removal website, serving the Houston, TX area.

## Technology

- **Framework**: Astro 5 (Static Site Generation)
- **UI Components**: React 19
- **Styling**: Vanilla CSS (global.css)
- **Backend Endpoint**: PHP (For email submission via HostGator)

## Local Development

1. **Install dependencies**: `npm install` (or `npm ci` for exact versions)
2. **Run dev server**: `npm run dev`
3. **Build site**: `npm run build`
4. **Preview build**: `npm run preview`

Note: The PHP endpoint (`public/api/submit.php`) will not function using Astro's built-in dev server. To test the form locally, you must run it on a PHP-enabled local server (e.g., XAMPP, MAMP, or `php -S localhost:8000`).

## Environment Variables

For local development and deployment, you will need the following variables:

- `GMAPAPI`: Your Google Places API Key (v1) used during the build step to fetch reviews.

Do **NOT** commit `.env` files with the real key. It is stored securely in GitHub Secrets.

## Build and Validations

Before pushing or deploying, you must ensure the site builds correctly and passes our custom SEO and functionality checks.

1. `npm run check` (Type-checks Astro files)
2. `npm run build` (Generates the static site in `/dist`)
3. `npm run validate:build` (Verifies presence of sitemaps, robots.txt, accurate hreflangs, and absence of GTM placeholders/fake data)
4. `php -l public/api/submit.php` (Validates PHP syntax)

## HostGator Deployment

Production deployment is fully automated via GitHub Actions to HostGator.
- **Workflow**: `.github/workflows/deploy-ftp.yml`
- **Trigger**: Push to `main` branch.
- **Prerequisites**: The workflow runs `npm run check`, `npm run build`, `npm run validate:build`, and PHP syntax check. If *any* step fails, the FTP deployment is blocked.
- **Secrets Required**: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `GMAPAPI`.

Note: GitHub Pages deployment is intentionally disabled/manual, as GitHub Pages cannot run the PHP backend.

## Google Places API

The site uses the new Google Places API (v1) at `https://places.googleapis.com/v1/places/{PLACE_ID}` to fetch the business' rating and reviews during the build time. The results are baked into the static HTML.

## PHP Form Endpoint

The estimate form posts a `multipart/form-data` payload to `api/submit.php`.
Security features include:
- Strict CORS verification (Allows `https://ansebjunk.com`).
- Rate Limiting (hashed IPs written to the server's temp directory).
- Honeypot anti-spam.
- Strict MIME type verification using `finfo` (JPEG, PNG, WebP only. Max 5MB per file, 12MB total).
- Data sanitization and header injection prevention.

## Spanish Routes

The site is fully bilingual. The Spanish routes are mapped as follows and are completely independent files rather than dynamic translations:
- `/` ↔ `/es/`
- `/services/` ↔ `/es/servicios/`
- `/contact/` ↔ `/es/contacto/`
- `/privacy/` ↔ `/es/privacidad/`
- `/terms/` ↔ `/es/terminos/`

## Troubleshooting

- **Form doesn't send locally**: You need a local PHP server.
- **Fake reviews appearing**: We removed hardcoded reviews. If the Google API fails (e.g., missing API key), the site falls back to a neutral "Find us on Google" block without any fake 5.0 ratings.
- **Deploy failing**: Check the GitHub Actions logs. The `validate:build` script is extremely strict and will fail if it detects `Placeholder`, `GTM-XXXXXXX`, or broken paths.
