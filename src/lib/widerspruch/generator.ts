// =============================================================================
// Widerspruchsschreiben Generator
// Erzeugt einen formellen deutschen Widerspruchsbrief gegen eine
// Nebenkostenabrechnung auf Basis der Prüfergebnisse.
// =============================================================================

export interface WiderspruchInput {
  abrechnung: {
    jahr: number;
    zugangsdatum: string;
    vermieter_name: string;
    vermieter_adresse: string | null;
  };
  tenantName: string | null;
  pruefergebnisse: Array<{
    pruef_typ: string;
    status: string;
    begruendung_de: string | null;
    gesetzesreferenz: string | null;
    beanstandeter_betrag: number | null;
    positionen?: {
      freitext_kategorie: string | null;
      mieter_anteil: number | null;
      betrkv_categories?: { name_de: string } | null;
    } | null;
  }>;
}

export function generateWiderspruchText(input: WiderspruchInput): string {
  const { abrechnung, tenantName, pruefergebnisse } = input;

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const zugangFormatted = new Date(abrechnung.zugangsdatum).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const beanstandete = pruefergebnisse.filter(
    (e) => e.status === 'nicht_zulaessig' || e.status === 'pruefungswuerdig'
  );
  const betrkvList = beanstandete.filter((e) => e.pruef_typ === 'betrkv');
  const hkvoFehler = pruefergebnisse.find((e) => e.pruef_typ === 'hkvo' && e.status === 'fehler');
  const fristFehler = pruefergebnisse.find((e) => e.pruef_typ === 'frist' && e.status === 'fehler');

  const name = tenantName ?? 'Mieter/in';

  const lines: string[] = [];

  // Absender
  lines.push(`${name}`);
  lines.push('');
  lines.push('');
  lines.push(`${today}`);
  lines.push('');

  // Empfänger
  lines.push(abrechnung.vermieter_name);
  if (abrechnung.vermieter_adresse) {
    abrechnung.vermieter_adresse.split(',').forEach((l) => lines.push(l.trim()));
  }
  lines.push('');
  lines.push('');

  // Betreff
  lines.push(`Betreff: Widerspruch gegen Nebenkostenabrechnung ${abrechnung.jahr} vom ${zugangFormatted}`);
  lines.push('');

  // Anrede
  lines.push('Sehr geehrte Damen und Herren,');
  lines.push('');

  // Fristproblem
  if (fristFehler) {
    lines.push(
      `die oben genannte Abrechnung ist gemäß §556 Abs. 3 BGB verspätet zugegangen und daher nach Ablauf ` +
      `der Abrechnungsfrist nicht mehr wirksam. Ich weise bereits an dieser Stelle darauf hin, ` +
      `dass ich zur Nachzahlung insofern nicht verpflichtet bin.`
    );
    lines.push('');
  }

  // Haupttext
  lines.push(
    `hiermit erhebe ich gemäß §556 Abs. 3 BGB fristgemäß Einwendungen gegen die mir am ${zugangFormatted} ` +
    `zugegangene Betriebskostenabrechnung für das Abrechnungsjahr ${abrechnung.jahr}.`
  );
  lines.push('');

  // BetrKV-Positionen
  if (betrkvList.length > 0) {
    lines.push(
      'Folgende Kostenpositionen sind nach der Betriebskostenverordnung (BetrKV) nicht oder nur eingeschränkt umlagefähig:'
    );
    lines.push('');

    for (const erg of betrkvList) {
      const pos = erg.positionen;
      const posName = pos?.betrkv_categories?.name_de ?? pos?.freitext_kategorie ?? 'Unbekannte Position';
      const betragStr = pos?.mieter_anteil != null ? ` (Ihr Anteil: ${(pos.mieter_anteil as number).toFixed(2)} €)` : '';

      lines.push(`- ${posName}${betragStr}:`);
      if (erg.begruendung_de) {
        const ref = erg.gesetzesreferenz ? ` (${erg.gesetzesreferenz})` : '';
        lines.push(`  ${erg.begruendung_de}${ref}`);
      }
      lines.push('');
    }
  }

  // HKVO
  if (hkvoFehler) {
    lines.push(
      'Bezüglich der Heizkostenabrechnung weise ich ferner darauf hin, dass der verbrauchsabhängige ' +
      'Anteil der Heizkosten nicht den Anforderungen des §7 Abs. 1 HKVO entspricht. ' +
      'Dieser Anteil muss zwischen 50 % und 70 % der Gesamtheizkosten betragen. ' +
      'Die Abrechnung ist insoweit fehlerhaft und von mir nicht zu akzeptieren.'
    );
    lines.push('');
  }

  // Forderung
  lines.push(
    'Ich fordere Sie auf, die Abrechnung zu überprüfen und mir bis spätestens vier Wochen nach ' +
    'Zugang dieses Schreibens eine berichtigte Nebenkostenabrechnung zu übersenden. ' +
    'Zu viel gezahlte Beträge sind mir unverzüglich zurückzuerstatten.'
  );
  lines.push('');
  lines.push(
    'Ich behalte mir vor, bei ausbleibender Reaktion weitere rechtliche Schritte einzuleiten.'
  );
  lines.push('');

  // Grußformel
  lines.push('Mit freundlichen Grüßen,');
  lines.push('');
  lines.push('');
  lines.push(name);
  lines.push('');
  lines.push('---');
  lines.push(`Erstellt mit NebenkostenCheck (nebenkostencheck.eu) am ${today}.`);
  lines.push('Dieses Schreiben stellt keine Rechtsberatung im Sinne des §2 RDG dar und ersetzt keinen Rechtsanwalt.');

  return lines.join('\n');
}
