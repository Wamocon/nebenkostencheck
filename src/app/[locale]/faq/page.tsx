import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === 'de'
        ? 'FAQ - Häufige Fragen | NebenkostenCheck'
        : 'FAQ - Frequently Asked Questions | NebenkostenCheck',
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return (
    <div className="min-h-screen bg-[var(--surface)] py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--on-surface)] mb-3">{t('title')}</h1>
          <p className="text-[var(--on-surface-variant)] max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQ_DE.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] p-6 text-center">
          <p className="text-[var(--on-surface-variant)] text-sm mb-3">{t('still_questions')}</p>
          <a
            href="mailto:info@nebenkostencheck.eu"
            className="inline-flex rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 transition-colors"
          >
            {t('contact_us')}
          </a>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] shadow-sm overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
        <span className="font-medium text-[var(--on-surface)] text-sm">{question}</span>
        <svg
          className="w-4 h-4 text-[var(--on-surface-variant)] flex-shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-5 text-sm text-[var(--on-surface-variant)] leading-relaxed border-t border-[var(--outline-variant)] pt-4">
        {answer}
      </div>
    </details>
  );
}

const FAQ_DE = [
  {
    q: 'Was prüft NebenkostenCheck genau?',
    a: 'NebenkostenCheck prüft Ihre Nebenkostenabrechnung auf drei Ebenen: (1) Zulässigkeit der abgerechneten Positionen gemäß Betriebskostenverordnung (BetrKV), (2) korrekte Heizkostenverteilung nach der Heizkostenverordnung (HKVO) und (3) ob die gesetzliche Einwendungsfrist nach §556 Abs. 3 BGB eingehalten wurde.',
  },
  {
    q: 'Welche Positionen darf der Vermieter abrechnen?',
    a: 'Nach der Betriebskostenverordnung (BetrKV) sind nur bestimmte Kostenarten umlagefähig, darunter Wasser, Heizung, Müllentsorgung, Hausreinigung, Gebäudeversicherung und weitere. Nicht umlagefähig sind z. B. Verwaltungskosten, Instandhaltungskosten oder Reparaturen. NebenkostenCheck prüft jede Position automatisch.',
  },
  {
    q: 'Was ist die Einwendungsfrist nach §556 BGB?',
    a: 'Gemäß §556 Abs. 3 BGB haben Sie als Mieter 12 Monate ab Zugang der Abrechnung Zeit, Einwendungen zu erheben. Nach Ablauf dieser Frist sind Ihre Ansprüche ausgeschlossen - unabhängig davon, ob die Abrechnung fehlerhaft ist. NebenkostenCheck berechnet diese Frist automatisch und warnt Sie rechtzeitig.',
  },
  {
    q: 'Was ist die Heizkostenverordnung (HKVO)?',
    a: 'Die Heizkostenverordnung schreibt vor, dass Heizkosten in Mehrfamilienhäusern mindestens zu 50 % und maximal zu 70 % nach dem individuellen Verbrauch (Messung am Heizkörper) abgerechnet werden müssen. Der Rest darf nach Wohnfläche verteilt werden. Bei Unterschreitung der 50 %-Grenze können Sie die Abrechnung um 15 % kürzen.',
  },
  {
    q: 'Kann ich eine PDF-Abrechnung hochladen?',
    a: 'Ja. NebenkostenCheck kann digitale Nebenkostenabrechnungen als PDF automatisch auslesen (OCR-Funktion). Das System erkennt typische Felder wie Abrechnungsjahr, Vermieter, Wohnfläche und Einzelpositionen. Sie können die erkannten Daten vor der Prüfung noch einmal überprüfen und korrigieren.',
  },
  {
    q: 'Was ist der Unterschied zwischen Free und Pro?',
    a: 'Mit dem kostenlosen Free-Tarif erhalten Sie das Ampel-Ergebnis (grün/gelb/rot) mit einer Zusammenfassung. Der Pro-Tarif (einmalig 9 € pro Abrechnung) schaltet die vollständigen rechtlichen Begründungen für jede beanstandete Position sowie das automatisch generierte Widerspruchsschreiben als PDF frei.',
  },
  {
    q: 'Was ist ein Widerspruchsschreiben und wie verwende ich es?',
    a: 'Das Widerspruchsschreiben ist ein formales Schreiben an Ihren Vermieter, das NebenkostenCheck automatisch auf Basis Ihrer Prüfergebnisse generiert. Es enthält alle beanstandeten Positionen mit rechtlichen Begründungen und Gesetzesreferenzen. Sie können es ausdrucken und per Einschreiben an Ihren Vermieter senden. Wichtig: Das Schreiben ersetzt keine Rechtsberatung.',
  },
  {
    q: 'Ist NebenkostenCheck eine Rechtsberatung?',
    a: 'Nein. NebenkostenCheck ist eine automatisierte Prüfsoftware und ersetzt keine Rechtsberatung. Gemäß Rechtsdienstleistungsgesetz (RDG) ist eine individuelle Rechtsberatung nur durch zugelassene Rechtsanwälte zulässig. Für verbindliche rechtliche Einschätzungen empfehlen wir einen Fachanwalt für Mietrecht oder den Mieterverein in Ihrer Stadt.',
  },
  {
    q: 'Wie sicher sind meine Daten?',
    a: 'Ihre Daten werden verschlüsselt auf Servern der Supabase Inc. im EU-Rechenzentrum Frankfurt (AWS eu-central-1) gespeichert. Wir verwenden Row Level Security (RLS) in der Datenbank - Ihre Daten sind ausschließlich für Ihr Konto zugänglich. Wir geben keine Daten an Dritte weiter. Details finden Sie in unserer Datenschutzerklärung.',
  },
  {
    q: 'Für welche Abrechnungsjahre kann ich prüfen?',
    a: 'Sie können Abrechnungen aus beliebigen Jahren eingeben. Beachten Sie jedoch die gesetzliche Einwendungsfrist: Liegt die Abrechnung mehr als 12 Monate zurück, sind Ihre Einwendungsrechte bereits abgelaufen. NebenkostenCheck weist Sie in diesem Fall darauf hin.',
  },
];
