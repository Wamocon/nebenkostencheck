import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

type Props = {
  locale: string;
};

export function Header({ locale }: Props) {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Markenname */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-8 h-8" />
            <span className="text-lg">
              <span className="text-[var(--primary)]">Nebenkosten</span>
              <span>Check</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href={`/${locale}/dashboard`} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              {t('dashboard')}
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              {t('faq')}
            </Link>
          </nav>

          {/* Rechte Seite: Auth, Sprache, Theme */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
            <Link
              href={`/${locale}/auth/login`}
              className="hidden sm:inline-flex rounded-lg border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="hidden sm:inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
