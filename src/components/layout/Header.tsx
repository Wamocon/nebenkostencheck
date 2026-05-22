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
    <header className="sticky top-0 z-50 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Markenname */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 font-semibold text-[var(--on-surface)] hover:opacity-80 transition-opacity"
          >
            <Logo className="w-8 h-8" />
            <span className="text-lg">
              <span className="text-[var(--primary)]">Nebenkosten</span>
              <span>Check</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--on-surface-variant)]">
            <Link href={`/${locale}/dashboard`} className="hover:text-[var(--on-surface)] transition-colors">
              {t('dashboard')}
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-[var(--on-surface)] transition-colors">
              {t('faq')}
            </Link>
          </nav>

          {/* Rechte Seite: Auth, Sprache, Theme */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
            <Link
              href={`/${locale}/auth/login`}
              className="hidden sm:inline-flex rounded-lg border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="hidden sm:inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--on-primary)] hover:opacity-90 transition-opacity"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
