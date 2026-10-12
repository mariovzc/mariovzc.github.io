import { useEffect, useState } from 'react';
import { THEME_KEY, type Theme } from '../../lib/theme';

interface Props {
  labels: { toLight: string; toDark: string };
}

export default function ThemeToggle({ labels }: Props) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage unavailable (private mode): theme still applies for this page view.
    }
    setTheme(next);
  }

  const label = theme === 'dark' ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="theme-toggle"
      className="rounded-full border border-line px-3 py-1 text-sm text-muted transition-colors hover:text-fg"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
