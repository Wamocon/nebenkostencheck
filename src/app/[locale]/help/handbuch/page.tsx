'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';

// --- Handbook Data -----------------------------------------------------------

interface Section {
  id: string;
  titleKey: string;
  subsections: { titleKey: string; contentKey: string }[];
}

const SECTIONS: Section[] = [
  {
    id: 'erste-schritte',
    titleKey: 'sections.getting_started.title',
    subsections: [
      { titleKey: 'sections.getting_started.register.title', contentKey: 'sections.getting_started.register.content' },
      { titleKey: 'sections.getting_started.login.title', contentKey: 'sections.getting_started.login.content' },
      { titleKey: 'sections.getting_started.dashboard.title', contentKey: 'sections.getting_started.dashboard.content' },
    ],
  },
  {
    id: 'abrechnung-pruefen',
    titleKey: 'sections.check_bill.title',
    subsections: [
      { titleKey: 'sections.check_bill.start.title', contentKey: 'sections.check_bill.start.content' },
      { titleKey: 'sections.check_bill.grunddaten.title', contentKey: 'sections.check_bill.grunddaten.content' },
      { titleKey: 'sections.check_bill.positionen.title', contentKey: 'sections.check_bill.positionen.content' },
      { titleKey: 'sections.check_bill.heizkosten.title', contentKey: 'sections.check_bill.heizkosten.content' },
      { titleKey: 'sections.check_bill.zusammenfassung.title', contentKey: 'sections.check_bill.zusammenfassung.content' },
    ],
  },
  {
    id: 'ergebnisse',
    titleKey: 'sections.results.title',
    subsections: [
      { titleKey: 'sections.results.ampel.title', contentKey: 'sections.results.ampel.content' },
      { titleKey: 'sections.results.beanstandungen.title', contentKey: 'sections.results.beanstandungen.content' },
      { titleKey: 'sections.results.gesetze.title', contentKey: 'sections.results.gesetze.content' },
    ],
  },
  {
    id: 'widerspruch',
    titleKey: 'sections.objection.title',
    subsections: [
      { titleKey: 'sections.objection.what.title', contentKey: 'sections.objection.what.content' },
      { titleKey: 'sections.objection.how.title', contentKey: 'sections.objection.how.content' },
    ],
  },
  {
    id: 'fristen',
    titleKey: 'sections.deadlines.title',
    subsections: [
      { titleKey: 'sections.deadlines.twelve_months.title', contentKey: 'sections.deadlines.twelve_months.content' },
      { titleKey: 'sections.deadlines.notifications.title', contentKey: 'sections.deadlines.notifications.content' },
    ],
  },
  {
    id: 'tarife',
    titleKey: 'sections.plans.title',
    subsections: [
      { titleKey: 'sections.plans.free.title', contentKey: 'sections.plans.free.content' },
      { titleKey: 'sections.plans.pro.title', contentKey: 'sections.plans.pro.content' },
    ],
  },
  {
    id: 'einstellungen',
    titleKey: 'sections.settings.title',
    subsections: [
      { titleKey: 'sections.settings.theme.title', contentKey: 'sections.settings.theme.content' },
      { titleKey: 'sections.settings.language.title', contentKey: 'sections.settings.language.content' },
    ],
  },
  {
    id: 'datenschutz',
    titleKey: 'sections.privacy.title',
    subsections: [
      { titleKey: 'sections.privacy.data.title', contentKey: 'sections.privacy.data.content' },
      { titleKey: 'sections.privacy.rls.title', contentKey: 'sections.privacy.rls.content' },
      { titleKey: 'sections.privacy.legal.title', contentKey: 'sections.privacy.legal.content' },
    ],
  },
];

// --- Component ---------------------------------------------------------------

export default function HandbuchPage() {
  const t = useTranslations('handbook');
  const [search, setSearch] = useState('');
  const [tocOpen, setTocOpen] = useState(false);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.map(section => {
      const filteredSubs = section.subsections.filter(sub => {
        const title = t(sub.titleKey).toLowerCase();
        const content = t(sub.contentKey).toLowerCase();
        return title.includes(q) || content.includes(q);
      });
      if (filteredSubs.length > 0) return { ...section, subsections: filteredSubs };
      const sectionTitle = t(section.titleKey).toLowerCase();
      if (sectionTitle.includes(q)) return section;
      return null;
    }).filter(Boolean) as Section[];
  }, [search, t]);

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <div className="bg-[var(--surface-container)] border-b border-[var(--outline-variant)] print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <Logo className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--on-surface)] mb-2">
            {t('title')}
          </h1>
          <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="sticky top-16 z-40 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--outline-variant)] print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-3 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setTocOpen(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--outline-variant)] text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              {t('toc')}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--outline-variant)] text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('download_pdf')}
            </button>
          </div>
        </div>
      </div>

      {/* Table of Contents (collapsible) */}
      {tocOpen && (
        <div className="mx-auto max-w-4xl px-4 py-4 print:hidden">
          <nav className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
            <h2 className="text-sm font-semibold text-[var(--on-surface)] mb-3">{t('toc')}</h2>
            <ol className="space-y-1.5 text-sm">
              {SECTIONS.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setTocOpen(false)}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {i + 1}. {t(section.titleKey)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-12">
        {filteredSections.length === 0 && (
          <p className="text-center text-[var(--on-surface-variant)] py-12">
            {t('no_results')}
          </p>
        )}

        {filteredSections.map((section, sIdx) => (
          <section key={section.id} id={section.id} className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-6 flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-sm font-bold">
                {SECTIONS.indexOf(section) + 1}
              </span>
              {t(section.titleKey)}
            </h2>

            <div className="space-y-6 pl-11">
              {section.subsections.map((sub, subIdx) => (
                <div key={subIdx} className="border-l-2 border-[var(--outline-variant)] pl-5">
                  <h3 className="text-lg font-semibold text-[var(--on-surface)] mb-2">
                    {t(sub.titleKey)}
                  </h3>
                  <p className="text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
                    {t(sub.contentKey)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Footer */}
        <footer className="border-t border-[var(--outline-variant)] pt-8 text-center text-sm text-[var(--on-surface-variant)]">
          <p>{t('version')}</p>
          <p className="mt-2">
            {t('questions')}{' '}
            <a href="mailto:info@nebenkostencheck.eu" className="text-[var(--primary)] hover:underline">
              info@nebenkostencheck.eu
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
