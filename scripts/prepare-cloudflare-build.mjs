import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const outputPath = 'wrangler.jsonc';

// Local deploys use the ignored working copy with the real account bindings.
// Workers Builds gets a clean checkout, so materialize its config from the
// committed template and the build variables configured in Cloudflare.
if (!existsSync(outputPath)) {
  const appUrl = process.env.VITE_APP_URL;
  const appName = process.env.VITE_APP_NAME;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  if (!appUrl || !appName || !databaseId) {
    throw new Error(
      'Set VITE_APP_URL, VITE_APP_NAME, and CLOUDFLARE_D1_DATABASE_ID in Workers Builds settings.'
    );
  }

  const source = readFileSync('wrangler.example.jsonc', 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*([}\]])/g, '$1');
  const config = JSON.parse(source);
  const database = config.d1_databases?.[0];
  if (!database) throw new Error('wrangler.example.jsonc has no D1 binding.');

  const siteUrl = new URL(appUrl);
  if (!['http:', 'https:'].includes(siteUrl.protocol)) {
    throw new Error('VITE_APP_URL must use HTTP or HTTPS.');
  }

  config.name = 'qwenimage21-ai';
  config.compatibility_date = '2026-09-29';
  config.vars = {
    ...config.vars,
    VITE_APP_URL: siteUrl.origin,
    VITE_APP_NAME: appName,
    VITE_APP_DESCRIPTION:
      process.env.VITE_APP_DESCRIPTION ||
      'Generate and edit images with Qwen Image 2.1 online.',
    VITE_APP_LOGO: process.env.VITE_APP_LOGO || '/logo.svg',
    VITE_DEFAULT_LOCALE: process.env.VITE_DEFAULT_LOCALE || 'en',
  };
  database.database_name = 'qwenimage21-db';
  database.database_id = databaseId;
  config.routes = [{ pattern: siteUrl.host, custom_domain: true }];

  writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(
    `Prepared Cloudflare config for ${config.name} (${siteUrl.host}).`
  );
} else {
  console.log('Using the existing local wrangler.jsonc configuration.');
}
