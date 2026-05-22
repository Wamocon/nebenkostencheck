import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'de' ? 'Impressum - NebenkostenCheck' : 'Legal Notice - NebenkostenCheck',
  };
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-[var(--surface)] py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">{t('impressum_title')}</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('stand')}: Mai 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">WAMOCON GmbH</h2>
            <p className="text-[var(--on-surface-variant)] text-sm leading-7">
              Mergenthalerallee 79 - 81<br />
              65760 Eschborn<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{t('kontakt')}</h2>
            <p className="text-[var(--on-surface-variant)] text-sm leading-7">
              Telefon: +49 6196 5838311<br />
              E-Mail: <a href="mailto:info@wamocon.com" className="text-[var(--primary)] hover:underline">info@wamocon.com</a><br />
              Projektkontakt: <a href="mailto:info@nebenkostencheck.eu" className="text-[var(--primary)] hover:underline">info@nebenkostencheck.eu</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{t('geschaeftsfuehrer')}</h2>
            <p className="text-[var(--on-surface-variant)] text-sm">Dipl.-Ing. Waleri Moretz</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{t('registereintrag')}</h2>
            <p className="text-[var(--on-surface-variant)] text-sm leading-7">
              Sitz der Gesellschaft: Eschborn<br />
              Handelsregister: Eschborn HRB 123666<br />
              Umsatzsteuer-ID: DE344930486
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-2">{t('angebot_title')}</h2>
            <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
              NebenkostenCheck ist eine webbasierte Software-as-a-Service-Plattform
              für die automatische Prüfung von Nebenkostenabrechnungen gemäß BetrKV, HKVO und §556 BGB.
              Das Angebot richtet sich primär an Privatpersonen als Mieter sowie gewerbliche Nutzer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
