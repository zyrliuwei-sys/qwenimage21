import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="qw-editorial-page bg-background min-h-screen">
      <Header />
      <div className="qw-legal-nav mx-auto max-w-3xl px-6 pt-8 md:px-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          {m['common.pages.back_to_home']()}
        </Link>
      </div>
      <div className="qw-legal-article mx-auto max-w-3xl px-6 pt-6 pb-12 md:px-8 md:pt-8 md:pb-16">
        <MDXProvider components={mdxComponents}>
          <Outlet />
        </MDXProvider>
      </div>
      <Footer />
    </div>
  );
}
