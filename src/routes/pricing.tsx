import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { QwenHeader } from '@/blocks/qwen-home';
import { QwenPricing } from '@/blocks/qwen-pricing';

import '@/styles/qwen-site.css';
import '@/styles/qwen-refined.css';

function PricingPage() {
  return (
    <div className="qw-site">
      <QwenHeader />
      <main id="main">
        <QwenPricing />
      </main>
      <footer className="qw-play-footer qw-wrap">
        <span>
          © {new Date().getFullYear()} {envConfigs.app_name}
        </span>
        <span className="qw-pricing-footer-links">
          <Link href="/privacy-policy">{m['qwen.footer.privacy']()}</Link>
          <Link href="/terms-of-service">{m['qwen.footer.terms']()}</Link>
          <Link href="/refund-policy">{m['qwen.footer.refund']()}</Link>
        </span>
      </footer>
    </div>
  );
}

export const Route = createFileRoute('/pricing')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['qwen.pricing.meta_title']({}, { locale });
    const description = m['qwen.pricing.meta_description']({}, { locale });
    const urlFor = (loc: (typeof locales)[number]) =>
      localizeUrl(`${envConfigs.app_url}/pricing`, { locale: loc }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: PricingPage,
});
