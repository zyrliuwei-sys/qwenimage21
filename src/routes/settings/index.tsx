import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight, Coins, CreditCard, KeyRound } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

type Subscription = {
  status: string;
  planName?: string | null;
  productName?: string | null;
};

function DashboardPage() {
  const { data: session } = useSession();
  const { data: creditsData } = useQuery({
    queryKey: ['user-credits'],
    queryFn: () => apiGet<{ balance: number }>('/api/credits'),
  });
  const { data: apiKeysData } = useQuery({
    queryKey: ['user-apikeys'],
    queryFn: () => apiGet<unknown[]>('/api/apikeys'),
  });
  const { data: subscriptionData } = useQuery({
    queryKey: ['user-subscription-current'],
    queryFn: () =>
      apiGet<Subscription | null>('/api/user/subscriptions/current'),
  });
  const planLabel =
    subscriptionData?.planName ||
    subscriptionData?.productName ||
    m['settings.overview.plan_free']();

  return (
    <div className="qw-dashboard">
      <section className="qw-dashboard-hero">
        <div className="qw-dashboard-intro">
          <p className="qw-dashboard-eyebrow">
            {m['qwen.dashboard.eyebrow']()}
          </p>
          <h1>{m['qwen.dashboard.heading']()}</h1>
          <p>{m['qwen.dashboard.description']()}</p>
          <Link href="/playground" className="qw-dashboard-primary">
            {m['qwen.dashboard.action']()} <ArrowUpRight size={18} />
          </Link>
        </div>
        <div
          className="qw-dashboard-art"
          role="img"
          aria-label={m['qwen.art.paper']()}
        />
      </section>

      <div className="qw-dashboard-section-heading">
        <div>
          <h2>{m['qwen.dashboard.account']()}</h2>
          <p>{m['qwen.dashboard.account_note']()}</p>
        </div>
        <span>{session?.user?.name || session?.user?.email || ''}</span>
      </div>

      <div className="qw-dashboard-stats">
        <Link href="/settings/billing" className="qw-dashboard-stat">
          <CreditCard size={20} />
          <span>{m['settings.overview.plan']()}</span>
          <strong>{planLabel}</strong>
          <ArrowUpRight size={17} className="qw-dashboard-arrow" />
        </Link>
        <Link href="/settings/credits" className="qw-dashboard-stat">
          <Coins size={20} />
          <span>{m['settings.credits.title']()}</span>
          <strong>{creditsData?.balance ?? '…'}</strong>
          <ArrowUpRight size={17} className="qw-dashboard-arrow" />
        </Link>
        <Link href="/settings/apikeys" className="qw-dashboard-stat">
          <KeyRound size={20} />
          <span>{m['settings.apikeys.title']()}</span>
          <strong>{apiKeysData?.length ?? '…'}</strong>
          <ArrowUpRight size={17} className="qw-dashboard-arrow" />
        </Link>
      </div>

      <section className="qw-dashboard-next">
        <div>
          <h2>{m['qwen.dashboard.next']()}</h2>
          <p>{m['qwen.dashboard.next_note']()}</p>
        </div>
        <Link href="/playground">
          {m['qwen.dashboard.action']()} <ArrowUpRight size={18} />
        </Link>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: DashboardPage,
});
