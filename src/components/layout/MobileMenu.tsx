'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
};

export function MobileMenu({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]/50 transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-16 right-0 bottom-0 z-50 w-72 bg-[var(--surface-container)] border-l border-[var(--outline-variant)] shadow-xl transform transition-transform duration-200 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-6 gap-2">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--on-surface-variant)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t('dashboard')}
          </Link>
          <Link
            href={`/${locale}/faq`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--on-surface-variant)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('faq')}
          </Link>

          <hr className="my-3 border-[var(--outline-variant)]" />

          <Link
            href={`/${locale}/auth/login`}
            className="flex items-center justify-center rounded-xl border border-[var(--primary)] px-4 py-3 text-base font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
          >
            {t('login')}
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-medium text-[var(--on-primary)] hover:opacity-90 transition-opacity"
          >
            {t('register')}
          </Link>
        </nav>
      </div>
    </>
  );
}
