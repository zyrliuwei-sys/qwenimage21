import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';

export const Route = createFileRoute('/(auth)')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] }),
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="qw-auth-shell">
      <aside className="qw-auth-art">
        <Link href="/" className="qw-auth-brand">
          <img
            src={envConfigs.app_logo}
            width="34"
            height="34"
            alt={m['qwen.logo_alt']({ name: envConfigs.app_name })}
          />
          <span>{envConfigs.app_name}</span>
        </Link>
        <div
          className="qw-auth-artwork"
          role="img"
          aria-label={m['qwen.art.auth_atmosphere']()}
        />
        <div className="qw-auth-copy">
          <p>{m['qwen.auth.eyebrow']()}</p>
          <h1>{m['qwen.auth.heading']()}</h1>
          <span>{m['qwen.auth.description']()}</span>
        </div>
      </aside>
      <main className="qw-auth-main">
        <Outlet />
      </main>
    </div>
  );
}
