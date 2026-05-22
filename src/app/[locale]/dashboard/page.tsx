import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

const STATUS_CLASSES: Record<string, string> = {
  entwurf: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  eingereicht: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  geprueft: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: abrechnungen } = await supabase
    .from('abrechnungen')
    .select('id, jahr, vermieter_name, status, frist_ende')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const list = abrechnungen ?? [];
  const today = new Date();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</h1>
        <Link
          href={`/${locale}/dashboard/abrechnung/neu`}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add_button')}
        </Link>
      </div>

      {list.length === 0 ? (
        /* Leer-Zustand */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{t('empty_title')}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">{t('empty_desc')}</p>
          <Link
            href={`/${locale}/dashboard/abrechnung/neu`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            {t('add_button')}
          </Link>
        </div>
      ) : (
        /* Abrechnungs-Liste */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((abr) => {
            const fristDate = abr.frist_ende ? new Date(abr.frist_ende) : null;
            const tageBisFrist = fristDate
              ? Math.ceil((fristDate.getTime() - today.getTime()) / 86_400_000)
              : null;
            const isCritical = tageBisFrist !== null && tageBisFrist <= 30 && tageBisFrist > 0;
            const isExpired = tageBisFrist !== null && tageBisFrist <= 0;
            const statusClass = STATUS_CLASSES[abr.status] ?? STATUS_CLASSES.entwurf;
            const statusLabel =
              abr.status === 'geprueft' ? t('status_geprueft') :
              abr.status === 'eingereicht' ? t('status_eingereicht') :
              t('status_entwurf');

            return (
              <div key={abr.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">{abr.vermieter_name}</h3>
                    <p className="text-sm text-zinc-500">{t('abrechnung_year', { year: abr.jahr })}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Frist-Anzeige */}
                {tageBisFrist !== null && (
                  <div className={`rounded-lg px-3 py-2 text-xs mb-3 ${
                    isExpired ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' :
                    isCritical ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' :
                    'bg-[var(--muted)] dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {isExpired
                      ? t('frist_expired')
                      : t('frist_days', { days: tageBisFrist })}
                    {fristDate && (
                      <span className="ml-1">({fristDate.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB')})</span>
                    )}
                  </div>
                )}

                {/* Aktionen */}
                {abr.status === 'geprueft' ? (
                  <Link
                    href={`/${locale}/dashboard/abrechnung/${abr.id}/ergebnis`}
                    className="block w-full text-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    {t('view_result')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/dashboard/abrechnung/neu`}
                    className="block w-full text-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {t('continue')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
