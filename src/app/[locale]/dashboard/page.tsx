import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

const STATUS_CLASSES: Record<string, string> = {
  entwurf: 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
  eingereicht: 'bg-[var(--secondary-container)]/50 text-[var(--secondary)]',
  geprueft: 'bg-[var(--primary)]/15 text-[var(--primary)]',
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--on-surface)]">{t('title')}</h1>
        <Link
          href={`/${locale}/dashboard/abrechnung/neu`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 transition-colors w-full sm:w-auto"
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
          <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{t('empty_title')}</h2>
          <p className="text-sm text-[var(--on-surface-variant)] max-w-sm mb-6">{t('empty_desc')}</p>
          <Link
            href={`/${locale}/dashboard/abrechnung/neu`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 transition-colors"
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
              <div key={abr.id} className="bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--on-surface)] truncate">{abr.vermieter_name}</h3>
                    <p className="text-sm text-[var(--on-surface-variant)]">{t('abrechnung_year', { year: abr.jahr })}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Frist-Anzeige */}
                {tageBisFrist !== null && (
                  <div className={`rounded-lg px-3 py-2 text-xs mb-3 ${
                    isExpired ? 'bg-[var(--error-container)] text-[var(--error)]' :
                    isCritical ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' :
                    'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
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
                    className="block w-full text-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 transition-colors"
                  >
                    {t('view_result')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/dashboard/abrechnung/neu`}
                    className="block w-full text-center rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50 transition-colors"
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
