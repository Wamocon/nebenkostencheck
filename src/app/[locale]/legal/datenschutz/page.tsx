import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === 'de'
        ? 'Datenschutzerklärung - NebenkostenCheck'
        : 'Privacy Policy - NebenkostenCheck',
  };
}

export default async function DatenschutzPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-[var(--muted)] dark:bg-zinc-950 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('datenschutz_title')}</h1>
          <p className="text-sm text-zinc-400">{t('stand')}: Mai 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">1. Verantwortlicher</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-7">
              WAMOCON GmbH<br />
              Mergenthalerallee 79 - 81<br />
              65760 Eschborn<br />
              E-Mail: <a href="mailto:info@wamocon.com" className="text-[var(--primary)] hover:underline">info@wamocon.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">2. Erhobene Daten</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Wir verarbeiten folgende personenbezogene Daten: E-Mail-Adresse und Passwort (Registrierung),
              Abrechnungsdaten die Sie eingeben oder per PDF hochladen, technische Zugriffsdaten (IP-Adresse,
              Browser, Zeitstempel) sowie Zahlungsdaten (über Stripe, verarbeitet von Stripe Inc.).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">3. Zweck der Verarbeitung</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Die Verarbeitung erfolgt zur Bereitstellung und Verbesserung des Dienstes NebenkostenCheck,
              zur Prüfung von Nebenkostenabrechnungen sowie zur Abwicklung von Zahlungsvorgängen.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">4. Speicherdauer</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Nach Kündigung werden Daten
              innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">5. Datenübermittlung</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Ihre Daten werden auf Servern von Supabase (EU-Rechenzentrum Frankfurt) gespeichert.
              Zahlungsdaten werden ausschließlich von Stripe verarbeitet.
              Eine Übermittlung in Drittländer erfolgt nur mit geeigneten Garantien (EU-Standardvertragsklauseln).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">6. Ihre Rechte</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-2">
              Sie haben folgende Rechte gemäß DSGVO:
            </p>
            <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 text-sm space-y-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              <li>Beschwerderecht bei der zuständigen Aufsichtsbehörde</li>
            </ul>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
              Zur Ausübung Ihrer Rechte wenden Sie sich an:{' '}
              <a href="mailto:info@nebenkostencheck.eu" className="text-[var(--primary)] hover:underline">
                info@nebenkostencheck.eu
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">7. Cookies</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Wir verwenden ausschließlich technisch notwendige Cookies zur Verwaltung der Nutzersitzung.
              Marketing-Cookies oder Tracking-Cookies werden nicht eingesetzt.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
