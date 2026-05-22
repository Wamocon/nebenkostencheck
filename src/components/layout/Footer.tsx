import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';

type Props = {
  locale: string;
};

export function Footer({ locale }: Props) {
  const t = useTranslations('legal');
  const tNav = useTranslations('nav');

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)] dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marke & Company Stamp */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Logo className="w-7 h-7" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                <span className="text-[var(--primary)]">Nebenkosten</span>Check
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ein Produkt der<br />
              <strong className="text-zinc-700 dark:text-zinc-300">WAMOCON GmbH</strong><br />
              Mergenthalerallee 79-81<br />
              65760 Eschborn, Deutschland
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Navigation
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href={`/${locale}`} className="hover:text-[var(--primary)] transition-colors">
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-[var(--primary)] transition-colors">
                  {tNav('faq')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/auth/register`} className="hover:text-[var(--primary)] transition-colors">
                  {tNav('register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Rechtliches
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href={`/${locale}/legal/impressum`} className="hover:text-[var(--primary)] transition-colors">
                  {t('impressum')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/datenschutz`} className="hover:text-[var(--primary)] transition-colors">
                  {t('datenschutz')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/agb`} className="hover:text-[var(--primary)] transition-colors">
                  {t('agb')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright + RDG-Hinweis */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} WAMOCON GmbH. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-zinc-400 max-w-xl text-right">
            NebenkostenCheck erbringt keine Rechtsberatung im Sinne des §2 RDG
            und ersetzt keinen Rechtsanwalt.
          </p>
        </div>
      </div>
    </footer>
  );
}
