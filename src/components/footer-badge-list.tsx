import { DEFAULT_FOOTER_BADGES } from '@/features/footer-badges/defaults';
import { parseStoredFooterBadges } from '@/features/footer-badges/validation';

import { cn } from '@/lib/utils';
import { usePublicConfig } from '@/hooks/use-public-config';

export function FooterBadgeList({ className }: { className?: string }) {
  const { data } = usePublicConfig();
  const badges =
    data?.footer_badges === undefined
      ? DEFAULT_FOOTER_BADGES
      : parseStoredFooterBadges(data.footer_badges);

  if (badges.length === 0) return null;

  // The list is rendered twice side by side; the track scrolls by exactly one
  // copy's width (-50% → 0), so the loop is seamless.
  const renderCopy = (copy: number) => (
    <ul
      aria-hidden={copy > 0 || undefined}
      className="flex shrink-0 items-center gap-4 pr-4"
    >
      {badges.map((badge) => (
        <li key={`${copy}:${badge.href}:${badge.src}`} className="shrink-0">
          <a
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={copy > 0 ? -1 : undefined}
            className="flex h-12 items-center transition-opacity hover:opacity-80"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              loading="lazy"
              className="h-full w-auto max-w-[260px] object-contain"
            />
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn(
        'group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]',
        className
      )}
    >
      <div
        className="animate-badge-marquee flex w-max group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${Math.max(badges.length * 4, 20)}s` }}
      >
        {renderCopy(0)}
        {renderCopy(1)}
      </div>
    </div>
  );
}
