import { baseLocale, locales, type Locale } from '@/paraglide/runtime.js';

/**
 * Locale for an API response. `/api/*` URLs carry no locale prefix, so the
 * client passes its active locale explicitly (`?locale=` or a body field).
 */
export function pickLocale(value: unknown): Locale {
  return (locales as readonly string[]).includes(value as string)
    ? (value as Locale)
    : baseLocale;
}
