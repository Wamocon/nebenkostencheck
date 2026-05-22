import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { generateWiderspruchAction } from '@/app/[locale]/dashboard/abrechnung/actions';
import { PrintButton } from '@/components/ui/PrintButton';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function WiderspruchPage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale, namespace: 'widerspruch' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });

  // Abrechnung laden
  const { data: abr } = await supabase
    .from('abrechnungen')
    .select('id, jahr, vermieter_name, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!abr) notFound();

  // Profil und Tarif laden
  const { data: profile } = await supabase
    .from('profiles')
    .select('tariff')
    .eq('user_id', user.id)
    .single();

  const isPro = profile?.tariff === 'pro';

  // Vorhandenes Schreiben laden oder neu generieren
  let letterText = '';
  const { data: existing } = await supabase
    .from('widerspruchsschreiben')
    .select('inhalt_text')
    .eq('abrechnung_id', id)
    .single();

  if (existing) {
    letterText = existing.inhalt_text;
  } else {
    // Auto-generieren beim ersten Aufruf
    const result = await generateWiderspruchAction(id);
    if (result.success) {
      letterText = result.data.inhalt_text;
    }
  }

  // Brieftext in HTML umwandeln (Zeilenumbrüche erhalten)
  const letterHtml = letterText
    .split('\n')
    .map((line) => {
      if (line === '---') return '<hr class="my-4 border-[var(--outline-variant)]" />';
      if (line === '') return '<br />';
      return `<p class="leading-relaxed">${escapeHtml(line)}</p>`;
    })
    .join('');

  return (
    <>
      {/* Print-CSS */}
      <style>{`
        @media print {
          nav, header, footer, .no-print { display: none !important; }
          .print-letter {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
          }
          body { background: white; }
        }
      `}</style>

      <div className="min-h-screen bg-[var(--surface)] py-8 px-4 print:bg-white">
        <div className="mx-auto max-w-3xl space-y-5">

          {/* Breadcrumb - no-print */}
          <nav className="no-print text-sm text-[var(--on-surface-variant)] flex items-center gap-2">
            <Link href={`/${locale}/dashboard`} className="hover:text-[var(--primary)] transition-colors">
              {tDashboard('title')}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/dashboard/abrechnung/${id}/ergebnis`} className="hover:text-[var(--primary)] transition-colors">
              {t('back_to_result')}
            </Link>
            <span>/</span>
            <span className="text-[var(--on-surface)]">{t('title')}</span>
          </nav>

          {/* Header - no-print */}
          <div className="no-print bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--on-surface)] mb-0.5">{t('title')}</h1>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {t('subtitle', { vermieter: abr.vermieter_name, jahr: abr.jahr })}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {isPro ? (
                  <PrintButton label={t('save_pdf')} />
                ) : (
                  <Link
                    href={`/${locale}/dashboard/upgrade`}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('unlock_pro')}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Pro-Gate Overlay for free users */}
          {!isPro && (
            <div className="no-print rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('free_hint_title')}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{t('free_hint_desc')}</p>
              </div>
            </div>
          )}

          {/* Letter */}
          <div className={`bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] p-8 shadow-sm print-letter ${!isPro ? 'select-none pointer-events-none relative overflow-hidden' : ''}`}>
            {!isPro && (
              <div className="absolute inset-0 backdrop-blur-sm bg-[var(--surface)]/60 z-10 flex items-center justify-center">
                <Link
                  href={`/${locale}/dashboard/upgrade`}
                  className="rounded-xl bg-[var(--primary)] px-6 py-3 text-white font-semibold hover:bg-[var(--primary-dark)] transition-colors shadow-lg"
                >
                  {t('upgrade_to_view')}
                </Link>
              </div>
            )}
            <div
              className="prose dark:prose-invert max-w-none text-sm leading-relaxed font-mono"
              dangerouslySetInnerHTML={{ __html: letterHtml }}
            />
          </div>

          {/* RDG Disclaimer */}
          <div className="no-print rounded-xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)] p-4">
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">{t('rdg_disclaimer')}</p>
          </div>

          {/* Back button */}
          <div className="no-print flex justify-start">
            <Link
              href={`/${locale}/dashboard/abrechnung/${id}/ergebnis`}
              className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
            >
              ← {t('back_to_result')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
