'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
};

export function BottomNav({ locale }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const tabs = [
    {
      key: 'home',
      label: t('home'),
      href: `/${locale}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      isActive: pathname === `/${locale}`,
    },
    {
      key: 'bills',
      label: t('bills'),
      href: `/${locale}/dashboard`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      isActive: pathname.startsWith(`/${locale}/dashboard`),
    },
    {
      key: 'faq',
      label: 'FAQ',
      href: `/${locale}/faq`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      isActive: pathname.startsWith(`/${locale}/faq`),
    },
    {
      key: 'profile',
      label: t('profil'),
      href: `/${locale}/auth/login`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      isActive: pathname.startsWith(`/${locale}/auth`),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-colors ${
              tab.isActive
                ? 'text-[var(--primary)]'
                : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            <span
              className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors ${
                tab.isActive ? 'bg-[var(--primary)]/12' : ''
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-medium leading-tight">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
