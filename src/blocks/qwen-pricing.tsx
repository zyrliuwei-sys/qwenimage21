import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import {
  listPricingProducts,
  type PricingGroupKey,
  type PricingProductWithMeta,
} from '@/config/pricing';
import { CREDITS_PER_IMAGE } from '@/config/qwen-image';
import { apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

const GROUPS: PricingGroupKey[] = ['one_time', 'monthly', 'yearly'];

const formatPrice = (cents: number) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
const formatNumber = (n: number) => n.toLocaleString('en-US');

export function QwenPricing() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: configs = {} } = usePublicConfig();
  const [group, setGroup] = useState<PricingGroupKey>('monthly');
  const [pending, setPending] = useState<PricingProductWithMeta | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );
  const products = listPricingProducts().filter((p) => p.group === group);

  const groupLabels: Record<PricingGroupKey, string> = {
    one_time: m['qwen.pricing.tab_one_time'](),
    monthly: m['qwen.pricing.tab_monthly'](),
    yearly: m['qwen.pricing.tab_yearly'](),
  };
  const intervalLabel: Record<PricingGroupKey, string> = {
    one_time: m['qwen.pricing.per_one_time'](),
    monthly: m['qwen.pricing.per_month'](),
    // Yearly plans show the per-month price; the yearly charge is noted below.
    yearly: m['qwen.pricing.per_month'](),
  };

  const checkout = useMutation({
    mutationFn: (vars: {
      product: PricingProductWithMeta;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: vars.product.productId,
        payment_provider: vars.provider,
        redirect: '/playground',
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error(m['qwen.pricing.checkout_error']());
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: Error) => {
      toast.error(err.message || m['qwen.pricing.checkout_error']());
      setLoadingProvider(null);
    },
  });

  const start = (
    product: PricingProductWithMeta,
    provider: PaymentProvider
  ) => {
    setPending(product);
    setLoadingProvider(provider);
    checkout.mutate({ product, provider });
  };

  const onBuy = (product: PricingProductWithMeta) => {
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent('/pricing')}`);
      return;
    }
    if (
      configs.select_payment_enabled === 'true' &&
      enabledProviders.length > 1
    ) {
      setPending(product);
      setModalOpen(true);
      return;
    }
    start(
      product,
      (configs.default_payment_provider ||
        enabledProviders[0] ||
        'stripe') as PaymentProvider
    );
  };

  return (
    <section id="pricing" className="qw-pricing qw-wrap">
      <div className="qw-section-head">
        <p className="qw-eyebrow">{m['qwen.pricing.eyebrow']()}</p>
        <h2>{m['qwen.pricing.heading']()}</h2>
        <p>
          {m['qwen.pricing.description']({
            credits1k: String(CREDITS_PER_IMAGE['1k']),
            credits2k: String(CREDITS_PER_IMAGE['2k']),
          })}
        </p>
      </div>

      <div
        className="qw-mode-switch qw-pricing-tabs"
        role="group"
        aria-label={m['qwen.pricing.tabs_label']()}
      >
        {GROUPS.map((key) => (
          <button
            type="button"
            key={key}
            className={group === key ? 'is-active' : ''}
            aria-pressed={group === key}
            onClick={() => setGroup(key)}
          >
            {groupLabels[key]}
            {key === 'yearly' && (
              <span className="qw-pricing-save">
                {m['qwen.pricing.yearly_save']()}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="qw-pricing-grid">
        {products.map((product) => {
          const featured = product.tier === 'pro';
          const busy =
            checkout.isPending && pending?.productId === product.productId;
          const features = [
            m['qwen.pricing.feature_images_1k']({
              count: formatNumber(
                Math.floor(product.credits / CREDITS_PER_IMAGE['1k'])
              ),
            }),
            m['qwen.pricing.feature_images_2k']({
              count: formatNumber(
                Math.floor(product.credits / CREDITS_PER_IMAGE['2k'])
              ),
            }),
            m['qwen.pricing.feature_generate_edit'](),
            group === 'one_time'
              ? m['qwen.pricing.feature_never_expire']()
              : group === 'monthly'
                ? m['qwen.pricing.feature_monthly_refresh']()
                : m['qwen.pricing.feature_yearly_upfront'](),
          ];
          return (
            <article
              key={product.productId}
              className={
                featured ? 'qw-price-card is-featured' : 'qw-price-card'
              }
            >
              <div className="qw-price-card-top">
                <h3>{product.productName}</h3>
                {featured && (
                  <span className="qw-price-badge">
                    {m['qwen.pricing.popular']()}
                  </span>
                )}
              </div>
              <p className="qw-price">
                <strong>
                  {group === 'yearly'
                    ? `$${Math.round(product.priceInCents / 1200)}`
                    : formatPrice(product.priceInCents)}
                </strong>
                <span>{intervalLabel[group]}</span>
              </p>
              {group === 'yearly' && (
                <p className="qw-price-note">
                  {m['qwen.pricing.billed_yearly']({
                    price: formatPrice(product.priceInCents),
                  })}
                </p>
              )}
              <p className="qw-price-credits">
                {m['qwen.pricing.credits']({
                  credits: formatNumber(product.credits),
                })}
              </p>
              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={
                  featured
                    ? 'qw-button qw-button-dark'
                    : 'qw-button qw-button-light'
                }
                disabled={checkout.isPending}
                onClick={() => onBuy(product)}
              >
                {busy && <LoaderCircle size={16} className="qw-spinner" />}
                {group === 'one_time'
                  ? m['qwen.pricing.buy']()
                  : m['qwen.pricing.subscribe']()}
              </button>
            </article>
          );
        })}
      </div>
      <p className="qw-pricing-footnote">{m['qwen.pricing.footnote']()}</p>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setLoadingProvider(null);
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={(provider) => pending && start(pending, provider)}
        planName={pending?.planName}
        price={pending ? formatPrice(pending.priceInCents) : undefined}
      />
    </section>
  );
}
