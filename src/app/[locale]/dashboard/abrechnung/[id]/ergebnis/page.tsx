import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { berechnePruefzusammenfassung } from '@/lib/pruefung/engine';
import { Ampel } from '@/components/ui/Ampel';
import type { AmpelStatus } from '@/types';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  zulaessig: {
    label: 'Zulässig',
    classes: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  nicht_zulaessig: {
    label: 'Nicht zulässig',
    classes: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  pruefungswuerdig: {
    label: 'Prüfungswürdig',
    classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  },
  ok: {
    label: 'OK',
    classes: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  fehler: {
    label: 'Fehler',
    classes: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
};

export default async function ErgebnisPage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale, namespace: 'ergebnis' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });

  // Abrechnung laden
  const { data: abr } = await supabase
    .from('abrechnungen')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!abr) notFound();

  // Prüfergebnisse laden
  const { data: ergebnisse } = await supabase
    .from('pruefergebnisse')
    .select('*, positionen(freitext_kategorie, betrkv_category_id, mieter_anteil, betrkv_categories(name_de, name_en))')
    .eq('abrechnung_id', id);

  // Profil für Tarif laden
  const { data: profile } = await supabase
    .from('profiles')
    .select('tariff')
    .eq('user_id', user.id)
    .single();

  const isPro = profile?.tariff === 'pro';

  // Zusammenfassung berechnen
  const zusammenfassung = berechnePruefzusammenfassung(
    (ergebnisse ?? []).map((e) => ({
      pruef_typ: e.pruef_typ,
      status: e.status,
      beanstandeter_betrag: e.beanstandeter_betrag,
    })),
    abr.frist_ende
  );

  // BetrKV-Ergebnisse (pro Position)
  const betrkv = (ergebnisse ?? []).filter((e) => e.pruef_typ === 'betrkv');
  // HKVO
  const hkvo = (ergebnisse ?? []).find((e) => e.pruef_typ === 'hkvo');
  // Frist
  const fristErg = (ergebnisse ?? []).find((e) => e.pruef_typ === 'frist');

  const ampelLabelMap: Record<AmpelStatus, string> = {
    gruen: t('ampel_gruen'),
    gelb: t('ampel_gelb'),
    rot: t('ampel_rot'),
  };

  const fristDate = new Date(abr.frist_ende);
  const isFristCritical = zusammenfassung.tage_bis_frist <= 30 && zusammenfassung.tage_bis_frist > 0;
  const isFristExpired = zusammenfassung.tage_bis_frist <= 0;

  return (
    <div className="min-h-screen bg-[var(--muted)] dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-500 flex items-center gap-2">
          <Link href={`/${locale}/dashboard`} className="hover:text-[var(--primary)] transition-colors">
            {tDashboard('title')}
          </Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </nav>

        {/* Ampel + Zusammenfassung */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                {t('title')} {abr.jahr}
              </h1>
              <p className="text-sm text-zinc-500">{abr.vermieter_name}</p>
            </div>
            <Ampel status={zusammenfassung.ampel} label={ampelLabelMap[zusammenfassung.ampel]} />
          </div>

          {/* Kennzahlen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              label="Nicht zulässig"
              value={String(zusammenfassung.anzahl_nicht_zulaessig)}
              variant={zusammenfassung.anzahl_nicht_zulaessig > 0 ? 'danger' : 'neutral'}
            />
            <MetricCard
              label="Prüfungswürdig"
              value={String(zusammenfassung.anzahl_pruefungswuerdig)}
              variant={zusammenfassung.anzahl_pruefungswuerdig > 0 ? 'warning' : 'neutral'}
            />
            <MetricCard
              label={t('summary_beanstandet')}
              value={`${zusammenfassung.kumulierter_beanstandeter_betrag.toFixed(2)} €`}
              variant={zusammenfassung.kumulierter_beanstandeter_betrag > 0 ? 'danger' : 'neutral'}
            />
            <MetricCard
              label={t('frist_label')}
              value={
                isFristExpired
                  ? tDashboard('frist_expired')
                  : tDashboard('frist_days', { days: zusammenfassung.tage_bis_frist })
              }
              variant={isFristExpired ? 'danger' : isFristCritical ? 'warning' : 'neutral'}
              sub={fristDate.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB')}
            />
          </div>
        </div>

        {/* Frist-Warnung */}
        {isFristCritical && (
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Achtung:</strong> Noch {zusammenfassung.tage_bis_frist} Tage bis zum Ablauf der Einwendungsfrist am {fristDate.toLocaleDateString('de-DE')}. Handeln Sie jetzt.
            </p>
          </div>
        )}

        {/* BetrKV-Ergebnisse */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Betriebskosten-Prüfung (BetrKV)</h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {betrkv.length === 0 && (
              <p className="px-6 py-4 text-sm text-zinc-500">Keine Positionen erfasst.</p>
            )}
            {betrkv.map((erg) => {
              const pos = erg.positionen as Record<string, unknown> | null;
              const katName = pos
                ? ((pos.betrkv_categories as Record<string, unknown> | null)?.name_de as string | undefined)
                  ?? (pos.freitext_kategorie as string | null)
                  ?? 'Unbekannt'
                : 'Unbekannt';
              const badge = STATUS_BADGE[erg.status] ?? STATUS_BADGE.pruefungswuerdig;
              const mieterAnteil = pos?.mieter_anteil as number | null;

              return (
                <div key={erg.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                          {badge.label}
                        </span>
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50 truncate">
                          {katName}
                        </span>
                      </div>

                      {/* Begründung: nur für Pro oder wenn zulässig */}
                      {(isPro || erg.status === 'zulaessig') ? (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {locale === 'de' ? erg.begruendung_de : erg.begruendung_en}
                          {erg.gesetzesreferenz && (
                            <span className="ml-1 text-[var(--primary)]">({erg.gesetzesreferenz})</span>
                          )}
                        </p>
                      ) : erg.status !== 'zulaessig' ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m-6 6h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-zinc-400">
                            {t('upgrade_cta')}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {mieterAnteil != null && (
                      <span className={`text-sm font-semibold flex-shrink-0 ${erg.status === 'nicht_zulaessig' ? 'text-red-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {(mieterAnteil as number).toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HKVO */}
        {hkvo && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Heizkostenprüfung (HKVO §7)</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[hkvo.status]?.classes ?? ''}`}>
                  {STATUS_BADGE[hkvo.status]?.label ?? hkvo.status}
                </span>
              </div>
              {(isPro || hkvo.status === 'ok') && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {locale === 'de' ? hkvo.begruendung_de : hkvo.begruendung_en}
                </p>
              )}
              {!isPro && hkvo.status === 'fehler' && (
                <p className="text-xs text-zinc-400 mt-1">{t('upgrade_cta')}</p>
              )}
            </div>
          </div>
        )}

        {/* Fristprüfung */}
        {fristErg && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Fristprüfung (§556 Abs. 3 BGB)</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[fristErg.status]?.classes ?? ''}`}>
                  {STATUS_BADGE[fristErg.status]?.label ?? fristErg.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {locale === 'de' ? fristErg.begruendung_de : fristErg.begruendung_en}
              </p>
            </div>
          </div>
        )}

        {/* Widerspruchsschreiben CTA */}
        {zusammenfassung.anzahl_nicht_zulaessig > 0 && (
          <div className={`rounded-2xl p-6 text-white ${isPro ? 'bg-[var(--primary)]' : 'bg-amber-500'}`}>
            <h3 className="font-bold text-lg mb-1">
              {isPro ? t('schreiben_cta_pro') : t('schreiben_cta_free')}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              {isPro
                ? t('schreiben_desc_pro', { count: zusammenfassung.anzahl_nicht_zulaessig })
                : t('schreiben_desc_free')}
            </p>
            <Link
              href={`/${locale}/dashboard/abrechnung/${id}/widerspruch`}
              className={`inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                isPro
                  ? 'bg-white text-[var(--primary)] hover:bg-zinc-100'
                  : 'bg-white text-amber-600 hover:bg-zinc-100'
              }`}
            >
              {isPro ? t('schreiben_btn_pro') : t('schreiben_btn_free')}
            </Link>
          </div>
        )}

        {/* RDG Disclaimer */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-[var(--border)] p-4">
          <p className="text-xs text-zinc-400 leading-relaxed">{t('rdg_disclaimer')}</p>
        </div>

        {/* Zurück zum Dashboard */}
        <div className="flex justify-start">
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-zinc-500 hover:text-[var(--primary)] transition-colors flex items-center gap-1"
          >
            ← Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  variant,
  sub,
}: {
  label: string;
  value: string;
  variant: 'neutral' | 'warning' | 'danger';
  sub?: string;
}) {
  const valueClass =
    variant === 'danger'
      ? 'text-red-600 dark:text-red-400'
      : variant === 'warning'
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-zinc-900 dark:text-zinc-50';

  return (
    <div className="text-center py-3 px-2 rounded-xl bg-[var(--muted)] dark:bg-zinc-800">
      <p className="text-xs text-zinc-500 mb-1 leading-tight">{label}</p>
      <p className={`font-bold text-lg leading-tight ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}
