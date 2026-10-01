import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { getLocalPosts } from '@/content/posts';

const STATIC_PATHS = [
  '',
  '/playground',
  '/pricing',
  '/qwen-image-edit',
  '/qwen-image-generator',
  '/qwen-image',
  '/blog',
  '/privacy-policy',
  '/terms-of-service',
];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

function urlFor(path: string, locale: string): string {
  return localizeUrl(`${envConfigs.app_url}${path || '/'}`, {
    locale: locale as (typeof locales)[number],
  }).href;
}

function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[char];
  });
}

function entryXml(e: Entry): string {
  const alternates = locales
    .map(
      (loc) =>
        `    <xhtml:link rel="alternate" hreflang="${loc}" href="${xmlEscape(urlFor(e.path, loc))}"/>`
    )
    .join('\n');
  return [
    '  <url>',
    `    <loc>${xmlEscape(urlFor(e.path, baseLocale))}</loc>`,
    alternates,
    e.lastModified
      ? `    <lastmod>${xmlEscape(e.lastModified)}</lastmod>`
      : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = STATIC_PATHS.map((path) => ({
          path,
          changeFrequency: path === '/blog' ? 'weekly' : 'monthly',
          priority: path === '' ? 1 : path === '/playground' ? 0.9 : 0.7,
        }));

        const posts = new Map<
          string,
          { slug: string; createdAt: Date | string }
        >(
          getLocalPosts(baseLocale).map((post) => [
            post.slug,
            { slug: post.slug, createdAt: post.createdAt },
          ])
        );
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          for (const post of rows) {
            posts.set(post.slug, {
              slug: post.slug,
              createdAt: post.createdAt,
            });
          }
        } catch {
          // Database unreachable — keep the local project articles.
        }
        for (const post of posts.values()) {
          entries.push({
            path: `/blog/${post.slug}`,
            lastModified: new Date(post.createdAt).toISOString(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.map(entryXml),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml' },
        });
      },
    },
  },
});
