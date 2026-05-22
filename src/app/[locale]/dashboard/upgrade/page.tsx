import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === 'de'
        ? 'Pro freischalten - NebenkostenCheck'
        : 'Unlock Pro - NebenkostenCheck',
  };
}

export default async function UpgradePage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('tariff')
    .eq('user_id', user.id)
    .single();

  const t = await getTranslations({ locale, namespace: 'upgrade' });
  const isPro = profile?.tariff === 'pro';

  return (
    <div className="min-h-screen bg-[var(--muted)] dark:bg-zinc-950 py-12 px-4">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* Already Pro */}
        {isPro && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">{t('already_pro')}</h1>
            <p className="text-green-700 dark:text-green-300 text-sm mb-5">{t('already_pro_desc')}</p>
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              {t('back_to_dashboard')}
            </Link>
          </div>
        )}

        {/* Upgrade CTA */}
        {!isPro && (
          <>
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900 px-4 py-1.5 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                {t('pro_label')}
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{t('title')}</h1>
              <p className="text-zinc-500 max-w-lg mx-auto">{t('subtitle')}</p>
            </div>

            {/* Pricing Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-[var(--primary)] shadow-lg p-8 text-center space-y-6">
              {/* Price */}
              <div>
                <div className="text-5xl font-black text-[var(--primary)] mb-1">9 €</div>
                <p className="text-zinc-500 text-sm">{t('per_check')}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-left">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Stripe Placeholder Button */}
              <button
                disabled
                className="w-full rounded-xl bg-zinc-200 dark:bg-zinc-700 px-6 py-3.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              >
                {t('payment_coming_soon')}
              </button>
              <p className="text-xs text-zinc-400">{t('payment_hint')}</p>
            </div>

            {/* Compare table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{t('compare_title')}</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {COMPARE.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 px-6 py-3 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{row.feature}</span>
                    <span className={`text-center ${row.free ? 'text-green-600' : 'text-zinc-400'}`}>
                      {row.free ? '✓' : '—'}
                    </span>
                    <span className="text-center text-[var(--primary)]">✓</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4 px-6 py-3 text-xs font-semibold text-zinc-500">
                  <span />
                  <span className="text-center">Free</span>
                  <span className="text-center text-[var(--primary)]">Pro</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm text-zinc-500 hover:text-[var(--primary)] transition-colors"
              >
                ← {t('back_to_dashboard')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const FEATURES = [
  'Vollständige rechtliche Begründungen für alle beanstandeten Positionen',
  'Automatisch generiertes Widerspruchsschreiben (DIN 5008, druckfertig)',
  'Gesetzesreferenzen (BetrKV, HKVO, §556 BGB) für jede Position',
  'PDF-Export des Widerspruchsschreibens per Browser-Druck',
  'Einmalige Zahlung - keine Abo-Verpflichtung',
];

const COMPARE = [
  { feature: 'Ampel-Ergebnis (rot/gelb/grün)', free: true },
  { feature: 'Anzahl beanstandeter Positionen', free: true },
  { feature: 'Beanstandeter Betrag (gesamt)', free: true },
  { feature: 'Fristberechnung (§556 BGB)', free: true },
  { feature: 'Detailbegründungen pro Position', free: false },
  { feature: 'Gesetzesreferenzen', free: false },
  { feature: 'Widerspruchsschreiben generieren', free: false },
  { feature: 'PDF-Export', free: false },
];
