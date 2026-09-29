import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { QwenSeoPage, seoPageMeta } from '@/blocks/qwen-seo-page';

const page = seoPageMeta.model;
export const Route = createFileRoute('/qwen-image')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: (typeof locales)[number]) =>
      localizeUrl(`${envConfigs.app_url}${page.path}`, { locale: loc }).href;
    return {
      meta: [
        { title: page.title },
        { name: 'description', content: page.description },
        { property: 'og:title', content: page.title },
        { property: 'og:description', content: page.description },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale as (typeof locales)[number]) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
      ],
    };
  },
  component: () => <QwenSeoPage page="model" />,
});
