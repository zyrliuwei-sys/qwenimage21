import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { getQwenImage3Faq, QwenImage3Page } from '@/blocks/qwen-image-3';

export const Route = createFileRoute('/qwen-image-3-0')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['qwen.image3.meta_title']({}, { locale });
    const description = m['qwen.image3.meta_description']({}, { locale });
    const urlFor = (loc: (typeof locales)[number]) =>
      localizeUrl(`${envConfigs.app_url}/qwen-image-3-0`, { locale: loc }).href;
    const url = urlFor(locale);
    const image = `${envConfigs.app_url}/imgs/qwen/sculptural-arch.jpg`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
      ],
      links: [
        { rel: 'canonical', href: url },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            name: title,
            description,
            url,
            inLanguage: locale,
            mainEntity: getQwenImage3Faq(locale).map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }).replace(/</g, '\\u003c'),
        },
      ],
    };
  },
  component: QwenImage3Page,
});
