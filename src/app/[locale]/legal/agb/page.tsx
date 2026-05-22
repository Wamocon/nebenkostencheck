import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'de' ? 'AGB - NebenkostenCheck' : 'Terms of Service - NebenkostenCheck',
  };
}

const PARAGRAPHS = [
  {
    id: '§ 1',
    title: 'Geltungsbereich',
    content: [
      'Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") der WAMOCON GmbH, Mergenthalerallee 79 - 81, 65760 Eschborn (nachfolgend „Anbieter"), gelten für alle Verträge über die Nutzung der Software-as-a-Service-Plattform NebenkostenCheck (nachfolgend „Plattform"), die über die Website nebenkostencheck.eu bereitgestellt wird.',
      'Die Plattform richtet sich an Privatpersonen als Mieter sowie an Unternehmen und gewerbliche Nutzer (nachfolgend „Nutzer").',
      'Abweichende, entgegenstehende oder ergänzende AGB des Nutzers werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt deren Geltung ausdrücklich schriftlich zu.',
    ],
  },
  {
    id: '§ 2',
    title: 'Vertragsschluss',
    content: [
      'Die Darstellung der Plattform und ihrer Funktionen auf der Website stellt kein verbindliches Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots.',
      'Der Nutzer gibt ein verbindliches Angebot zum Abschluss eines Nutzungsvertrages ab, indem er den Registrierungsprozess auf der Plattform abschließt und diese AGB akzeptiert.',
      'Der Vertrag kommt zustande, wenn der Anbieter das Angebot durch Freischaltung des Zugangs annimmt.',
    ],
  },
  {
    id: '§ 3',
    title: 'Leistungsbeschreibung',
    content: [
      'Der Anbieter stellt dem Nutzer die Plattform als Software-as-a-Service (SaaS) über das Internet zur Verfügung.',
      'Der genaue Funktionsumfang ergibt sich aus der jeweils aktuellen Leistungsbeschreibung auf der Website.',
      'Der Anbieter ist berechtigt, die Plattform weiterzuentwickeln, zu erweitern und anzupassen. Wesentliche Einschränkungen des Funktionsumfangs werden dem Nutzer vorab mitgeteilt.',
    ],
  },
  {
    id: '§ 4',
    title: 'Nutzungsrechte',
    content: [
      'Der Anbieter räumt dem Nutzer für die Vertragslaufzeit ein einfaches, nicht übertragbares, nicht unterlizenzierbares Recht zur Nutzung der Plattform ein.',
      'Der Nutzer darf die Plattform nur für eigene Zwecke nutzen.',
    ],
  },
  {
    id: '§ 5',
    title: 'Pflichten des Nutzers',
    content: [
      'Der Nutzer ist verpflichtet, seine Zugangsdaten geheim zu halten und vor dem Zugriff Dritter zu schützen.',
      'Der Nutzer stellt sicher, dass die Nutzung der Plattform im Einklang mit geltendem Recht erfolgt.',
    ],
  },
  {
    id: '§ 6',
    title: 'Verfügbarkeit',
    content: [
      'Der Anbieter bemüht sich um eine Verfügbarkeit der Plattform von 99,5 % im Jahresmittel.',
      'Nicht als Ausfallzeit gelten geplante Wartungsarbeiten, die vorab angekündigt werden.',
    ],
  },
  {
    id: '§ 7',
    title: 'Datenschutz',
    content: [
      'Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung des Anbieters und den Bestimmungen der DSGVO.',
    ],
  },
  {
    id: '§ 8',
    title: 'Haftung',
    content: [
      'Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.',
      'Im Übrigen ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.',
    ],
  },
  {
    id: '§ 9',
    title: 'Vertragslaufzeit und Kündigung',
    content: [
      'Der Vertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Parteien mit einer Frist von einem Monat zum Monatsende gekündigt werden.',
    ],
  },
];

export default async function AgbPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-[var(--muted)] dark:bg-zinc-950 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('agb_title')}</h1>
          <p className="text-sm text-zinc-400">{t('stand')}: Mai 2026</p>

          {PARAGRAPHS.map((para) => (
            <section key={para.id}>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                {para.id} {para.title}
              </h2>
              <ol className="list-decimal list-inside space-y-1.5">
                {para.content.map((text, i) => (
                  <li key={i} className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    {text}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
