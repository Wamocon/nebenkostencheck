'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

type Props = {
  currentLocale: string;
};

const localeLabels: Record<string, string> = {
  de: 'DE',
  en: 'EN',
};

export function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    // Pfad ohne aktuelles Locale-Prefix neu aufbauen
    const segments = pathname.split('/');
    // Erstes Segment ist leer (''), zweites ist das Locale
    segments[1] = newLocale;
    const newPath = segments.join('/');
    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 p-1">
      {Object.entries(localeLabels).map(([locale, label]) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          disabled={isPending || locale === currentLocale}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === currentLocale
              ? 'bg-[var(--primary)] text-white'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
          aria-label={`Sprache wechseln zu ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
