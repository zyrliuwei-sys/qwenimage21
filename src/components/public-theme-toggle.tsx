import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function PublicThemeToggle({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className={`qw-public-theme-toggle ${className}`.trim()}
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Moon aria-hidden="true" className="dark:hidden" size={18} />
      <Sun aria-hidden="true" className="hidden dark:block" size={18} />
    </button>
  );
}
