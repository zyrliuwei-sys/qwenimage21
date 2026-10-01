/**
 * Authoritative pricing catalog.
 *
 * The checkout API uses this as the SOURCE OF TRUTH for price/credits/duration.
 * Any price, credits, or plan info sent by the client is IGNORED — only the
 * product_id is honored, and everything else is looked up here.
 *
 * To change pricing, edit this file and redeploy. Admin UI cannot alter prices.
 */

import { PaymentInterval, PaymentType } from '@/core/payment/types';

export type PricingPlanInfo = {
  name: string;
  interval: PaymentInterval;
  intervalCount: number;
};

export type PricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  description: string;
  type: PaymentType;
  priceInCents: number;
  currency: string;
  credits: number;
  creditsValidDays?: number;
  plan?: PricingPlanInfo;
};

export type PricingGroupKey = 'one_time' | 'monthly' | 'yearly';
export type PricingTier = 'basic' | 'pro' | 'max';

/**
 * Qwen Image credit plans. 1 credit = $0.01 of Fal cost × 7 (see
 * config/qwen-image.ts): a 1K image costs 28 credits, a 2K image 53.
 * Subscriptions add a small volume bonus; yearly ≈ 10 months' price for
 * 12 months of credits, granted upfront.
 */
const planRows: Array<{
  group: PricingGroupKey;
  tier: PricingTier;
  name: string;
  priceInCents: number;
  credits: number;
}> = [
  {
    group: 'one_time',
    tier: 'basic',
    name: 'Starter',
    priceInCents: 1000,
    credits: 1000,
  },
  {
    group: 'one_time',
    tier: 'pro',
    name: 'Creator',
    priceInCents: 3000,
    credits: 3000,
  },
  {
    group: 'one_time',
    tier: 'max',
    name: 'Studio',
    priceInCents: 10000,
    credits: 10000,
  },
  {
    group: 'monthly',
    tier: 'basic',
    name: 'Basic',
    priceInCents: 990,
    credits: 1000,
  },
  {
    group: 'monthly',
    tier: 'pro',
    name: 'Pro',
    priceInCents: 2990,
    credits: 3200,
  },
  {
    group: 'monthly',
    tier: 'max',
    name: 'Max',
    priceInCents: 9990,
    credits: 11000,
  },
  {
    group: 'yearly',
    tier: 'basic',
    name: 'Basic',
    priceInCents: 9900,
    credits: 12000,
  },
  {
    group: 'yearly',
    tier: 'pro',
    name: 'Pro',
    priceInCents: 29900,
    credits: 38400,
  },
  {
    group: 'yearly',
    tier: 'max',
    name: 'Max',
    priceInCents: 99900,
    credits: 132000,
  },
];

const groupMeta: Record<
  PricingGroupKey,
  {
    suffix: string;
    label: string;
    validDays: number;
    interval?: PaymentInterval;
  }
> = {
  // One-time credits never expire.
  one_time: { suffix: 'pack', label: 'Credit Pack', validDays: 0 },
  // Subscription credits expire at the end of the billing period.
  monthly: {
    suffix: 'monthly',
    label: 'Monthly',
    validDays: 31,
    interval: PaymentInterval.MONTH,
  },
  yearly: {
    suffix: 'yearly',
    label: 'Yearly',
    validDays: 366,
    interval: PaymentInterval.YEAR,
  },
};

export type PricingProductWithMeta = PricingProduct & {
  group: PricingGroupKey;
  tier: PricingTier;
};

/** Keys MUST match what the pricing UI sends as product_id. */
export const pricingCatalog: Record<string, PricingProductWithMeta> =
  Object.fromEntries(
    planRows.map((row) => {
      const meta = groupMeta[row.group];
      const productId = `${row.tier}_${meta.suffix}`;
      const product: PricingProductWithMeta = {
        productId,
        productName: row.name,
        planName: `${row.name} ${meta.label}`,
        description: `${row.name} ${meta.label} – ${row.credits} credits`,
        type: meta.interval ? PaymentType.SUBSCRIPTION : PaymentType.ONE_TIME,
        priceInCents: row.priceInCents,
        currency: 'usd',
        credits: row.credits,
        creditsValidDays: meta.validDays,
        plan: meta.interval
          ? { name: row.name, interval: meta.interval, intervalCount: 1 }
          : undefined,
        group: row.group,
        tier: row.tier,
      };
      return [productId, product];
    })
  );

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProductWithMeta[] {
  return Object.values(pricingCatalog);
}
