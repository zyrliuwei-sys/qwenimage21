import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['qwen.nav.gallery'](),
      links: [
        { label: m['qwen.nav.gallery'](), href: '/#gallery' },
        { label: m['qwen.nav.create'](), href: '/playground' },
      ],
    },
    {
      title: m['qwen.nav.sources'](),
      links: [{ label: m['qwen.nav.sources'](), href: '/#sources' }],
    },
    {
      title: m['qwen.footer.terms'](),
      links: [
        { label: m['qwen.footer.privacy'](), href: '/privacy-policy' },
        { label: m['qwen.footer.terms'](), href: '/terms-of-service' },
        { label: m['qwen.footer.refund'](), href: '/refund-policy' },
      ],
    },
  ];
  return <SiteFooter tagline={m['qwen.footer.note']()} columns={columns} />;
}
