import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[var(--surface)] pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-[var(--primary)]/20 mb-6">
            <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
            {locale === 'de' ? 'Kostenlos starten' : 'Start for free'}
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--on-surface)] mb-6 leading-tight">
            {t('hero.headline')}
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('hero.subline')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[var(--primary-dark)] transition-colors"
            >
              {t('hero.cta_primary')}
            </Link>
            <Link
              href={`#features`}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--outline)] bg-[var(--surface-container)] px-6 py-3 text-base font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors"
            >
              {t('hero.cta_secondary')}
            </Link>
          </div>

          {/* RDG Disclaimer */}
          <p className="text-xs text-[var(--on-surface-variant)] opacity-60 max-w-lg mx-auto">
            {t('hero.disclaimer')}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[var(--surface-container-low)]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-[var(--on-surface)] mb-12">
            {t('features.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* BetrKV */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title={t('features.betrkv.title')}
              desc={t('features.betrkv.desc')}
            />
            {/* HKVO */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              }
              title={t('features.hkvo.title')}
              desc={t('features.hkvo.desc')}
            />
            {/* Frist */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title={t('features.frist.title')}
              desc={t('features.frist.desc')}
            />
            {/* Schreiben */}
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              title={t('features.schreiben.title')}
              desc={t('features.schreiben.desc')}
            />
          </div>
        </div>
      </section>

      {/* Tariff Section */}
      <section className="py-20 px-4 bg-[var(--surface)]">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-[var(--on-surface)] mb-12">
            {t('tariff.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">
                {t('tariff.free.name')}
              </p>
              <p className="text-3xl font-bold text-[var(--on-surface)] mb-4">
                {t('tariff.free.price')}
              </p>
              <ul className="space-y-2 mb-6 text-sm text-[var(--on-surface-variant)]">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  {t('tariff.free.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  {t('tariff.free.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  {t('tariff.free.feature3')}
                </li>
              </ul>
              <Link
                href={`/${locale}/auth/register`}
                className="block w-full text-center rounded-lg border border-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent)] transition-colors"
              >
                {t('tariff.free.cta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[var(--primary)] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-white/20 rounded-full px-2 py-0.5 text-xs font-medium">
                Pro
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                {t('tariff.pro.name')}
              </p>
              <p className="text-3xl font-bold mb-0.5">{t('tariff.pro.price')}</p>
              <p className="text-sm text-white/70 mb-4">{t('tariff.pro.price_sub')}</p>
              <ul className="space-y-2 mb-6 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <CheckIconWhite />
                  {t('tariff.pro.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconWhite />
                  {t('tariff.pro.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconWhite />
                  {t('tariff.pro.feature3')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconWhite />
                  {t('tariff.pro.feature4')}
                </li>
              </ul>
              <Link
                href={`/${locale}/auth/register`}
                className="block w-full text-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-zinc-100 transition-colors"
              >
                {t('tariff.pro.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RDG Notice */}
      <section className="py-8 px-4 bg-[var(--surface-container-low)]">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-zinc-400 text-center leading-relaxed">
            {t('rdg_notice')}
          </p>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="elevation-1 rounded-2xl p-6 hover:border-[var(--primary)]/50 hover:highlight-glow-sm transition-all">
      <div className="w-11 h-11 bg-[var(--primary)]/15 rounded-xl flex items-center justify-center text-[var(--primary)] mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--on-surface)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">{desc}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckIconWhite() {
  return (
    <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
