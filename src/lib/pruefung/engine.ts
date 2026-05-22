import { createClient } from '@/lib/supabase/server';
import type { ActionResult, AmpelStatus } from '@/types';

// =============================================================================
// Prüf-Engine - Orchestriert alle Prüfungen und schreibt Ergebnisse in DB
// =============================================================================

export async function runPruefung(
  abrechnungId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Abrechnung laden
  const { data: abr, error: abrError } = await supabase
    .from('abrechnungen')
    .select('*')
    .eq('id', abrechnungId)
    .single();

  if (abrError || !abr) {
    return { success: false, error: 'Abrechnung nicht gefunden' };
  }

  // 2. Positionen laden
  const { data: positionen } = await supabase
    .from('positionen')
    .select('*, betrkv_categories(*)')
    .eq('abrechnung_id', abrechnungId)
    .order('sort_order');

  // 3. Heizkosten laden
  const { data: heizkosten } = await supabase
    .from('heizkosten')
    .select('*')
    .eq('abrechnung_id', abrechnungId)
    .maybeSingle();

  // 4. HKVO-Parameter laden
  const { data: hkvoParams } = await supabase
    .from('hkvo_parameters')
    .select('*')
    .limit(1)
    .single();

  // Alte Prüfergebnisse löschen (Neuberechnung)
  await supabase
    .from('pruefergebnisse')
    .delete()
    .eq('abrechnung_id', abrechnungId);

  const ergebnisse: Array<Record<string, unknown>> = [];

  // 5. Fristprüfung (K-09)
  const fristErgebnis = pruefeFrist(abr.zugangsdatum, abr.jahr);
  ergebnisse.push({
    abrechnung_id: abrechnungId,
    pruef_typ: 'frist',
    status: fristErgebnis.status,
    begruendung_de: fristErgebnis.begruendung_de,
    begruendung_en: fristErgebnis.begruendung_en,
    gesetzesreferenz: '§556 Abs. 3 BGB',
    beanstandeter_betrag: null,
  });

  // 6. BetrKV-Prüfung pro Position (K-08)
  for (const pos of positionen ?? []) {
    const posErgebnis = pruefePosition(pos);
    ergebnisse.push({
      abrechnung_id: abrechnungId,
      position_id: pos.id,
      pruef_typ: 'betrkv',
      status: posErgebnis.status,
      begruendung_de: posErgebnis.begruendung_de,
      begruendung_en: posErgebnis.begruendung_en,
      gesetzesreferenz: posErgebnis.gesetzesreferenz,
      beanstandeter_betrag:
        posErgebnis.status === 'nicht_zulaessig' ? pos.mieter_anteil : null,
    });
  }

  // 7. HKVO-Prüfung (K-10)
  if (heizkosten) {
    const hkvoMin = hkvoParams?.min_verbrauchsanteil ?? 50;
    const hkvoMax = hkvoParams?.max_verbrauchsanteil ?? 70;
    const hkvoErgebnis = pruefeHkvo(
      heizkosten.verbrauchsanteil_prozent,
      hkvoMin,
      hkvoMax
    );
    ergebnisse.push({
      abrechnung_id: abrechnungId,
      pruef_typ: 'hkvo',
      status: hkvoErgebnis.status,
      begruendung_de: hkvoErgebnis.begruendung_de,
      begruendung_en: hkvoErgebnis.begruendung_en,
      gesetzesreferenz: '§7 HKVO',
      beanstandeter_betrag:
        hkvoErgebnis.status === 'fehler' ? heizkosten.gesamtkosten : null,
    });
  }

  // 8. Vollständigkeitsprüfung (K-11)
  for (const pos of positionen ?? []) {
    if (!pos.umlageschluessel || pos.gesamtbetrag == null) {
      ergebnisse.push({
        abrechnung_id: abrechnungId,
        position_id: pos.id,
        pruef_typ: 'vollstaendigkeit',
        status: 'pruefungswuerdig',
        begruendung_de: `Position "${pos.freitext_kategorie ?? pos.betrkv_categories?.name_de ?? 'Unbekannt'}": Umlageschlüssel oder Gesamtbetrag fehlt.`,
        begruendung_en: `Line item "${pos.freitext_kategorie ?? pos.betrkv_categories?.name_en ?? 'Unknown'}": Distribution key or total amount missing.`,
        gesetzesreferenz: '§556 Abs. 3 BGB',
        beanstandeter_betrag: null,
      });
    }
  }

  // 9. Ergebnisse in DB schreiben
  if (ergebnisse.length > 0) {
    const { error: insertError } = await supabase
      .from('pruefergebnisse')
      .insert(ergebnisse);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  // 10. Status der Abrechnung auf 'geprueft' setzen
  await supabase
    .from('abrechnungen')
    .update({ status: 'geprueft', updated_at: new Date().toISOString() })
    .eq('id', abrechnungId);

  return { success: true, data: undefined };
}

// =============================================================================
// Einzelne Prüffunktionen
// =============================================================================

interface PruefResultat {
  status: string;
  begruendung_de: string;
  begruendung_en: string;
  gesetzesreferenz: string;
}

// --- Fristprüfung -----------------------------------------------------------

function pruefeFrist(zugangsdatum: string, jahr: number): PruefResultat {
  // Frist: Abrechnung muss innerhalb von 12 Monaten nach Abrechnungsjahresende zugegangen sein
  const jahresende = new Date(`${jahr}-12-31`);
  const fristende = new Date(jahresende);
  fristende.setFullYear(fristende.getFullYear() + 1);

  const zugang = new Date(zugangsdatum);

  if (zugang > fristende) {
    return {
      status: 'fehler',
      begruendung_de: `Die Abrechnung ist nach dem ${fristende.toLocaleDateString('de-DE')} zugegangen. Laut §556 Abs. 3 BGB ist eine nach dem Ablauf der 12-Monats-Frist zugegangene Abrechnung für den Mieter nicht mehr verbindlich.`,
      begruendung_en: `The bill was received after ${fristende.toLocaleDateString('en-GB')}. Under §556 para. 3 BGB, a bill received after the 12-month deadline is no longer binding on the tenant.`,
      gesetzesreferenz: '§556 Abs. 3 BGB',
    };
  }

  return {
    status: 'ok',
    begruendung_de: 'Die Abrechnung wurde fristgerecht übermittelt.',
    begruendung_en: 'The bill was delivered within the statutory deadline.',
    gesetzesreferenz: '§556 Abs. 3 BGB',
  };
}

// --- BetrKV-Positionsprüfung ------------------------------------------------

function pruefePosition(pos: Record<string, unknown>): PruefResultat {
  // Freitext-Kategorie: prüfungswürdig
  if (!pos.betrkv_category_id && pos.freitext_kategorie) {
    return {
      status: 'pruefungswuerdig',
      begruendung_de: `Die Position "${String(pos.freitext_kategorie)}" konnte keiner BetrKV-Kategorie zugeordnet werden. Bitte prüfen Sie, ob diese Position nach §2 BetrKV zulässig ist.`,
      begruendung_en: `The item "${String(pos.freitext_kategorie)}" could not be matched to a BetrKV category. Please verify whether this item is permissible under §2 BetrKV.`,
      gesetzesreferenz: '§2 BetrKV',
    };
  }

  // Kategorie vorhanden - aus der geladenen Relation lesen
  const cat = pos.betrkv_categories as Record<string, unknown> | null;
  if (!cat) {
    return {
      status: 'pruefungswuerdig',
      begruendung_de: 'Kategorie nicht gefunden.',
      begruendung_en: 'Category not found.',
      gesetzesreferenz: '§2 BetrKV',
    };
  }

  if (!cat.zulaessig) {
    return {
      status: 'nicht_zulaessig',
      begruendung_de: String(cat.begruendung_de ?? `"${String(cat.name_de)}" ist nach ${String(cat.paragraph_ref ?? 'BetrKV')} nicht umlagefähig.`),
      begruendung_en: String(cat.begruendung_en ?? `"${String(cat.name_en)}" is not a permissible operating cost under ${String(cat.paragraph_ref ?? 'BetrKV')}.`),
      gesetzesreferenz: String(cat.paragraph_ref ?? 'BetrKV'),
    };
  }

  return {
    status: 'zulaessig',
    begruendung_de: String(cat.begruendung_de ?? `${String(cat.name_de)} ist nach ${String(cat.paragraph_ref ?? '§2 BetrKV')} umlagefähig.`),
    begruendung_en: String(cat.begruendung_en ?? `${String(cat.name_en)} is permissible under ${String(cat.paragraph_ref ?? '§2 BetrKV')}.`),
    gesetzesreferenz: String(cat.paragraph_ref ?? '§2 BetrKV'),
  };
}

// --- HKVO-Prüfung -----------------------------------------------------------

function pruefeHkvo(
  verbrauchsanteil: number,
  min: number,
  max: number
): PruefResultat {
  if (verbrauchsanteil < min || verbrauchsanteil > max) {
    return {
      status: 'fehler',
      begruendung_de: `Der verbrauchsabhängige Anteil der Heizkostenabrechnung beträgt ${verbrauchsanteil}%. Gemäß §7 HKVO muss dieser Anteil zwischen ${min}% und ${max}% liegen. Dies stellt einen formalen Verstoß gegen die Heizkostenverordnung dar.`,
      begruendung_en: `The consumption-based share of the heating cost statement is ${verbrauchsanteil}%. Under §7 HKVO, this share must be between ${min}% and ${max}%. This constitutes a formal violation of the Heating Cost Ordinance.`,
      gesetzesreferenz: '§7 HKVO',
    };
  }

  return {
    status: 'ok',
    begruendung_de: `Der verbrauchsabhängige Anteil von ${verbrauchsanteil}% liegt im zulässigen Bereich (${min}%-${max}% nach §7 HKVO).`,
    begruendung_en: `The consumption-based share of ${verbrauchsanteil}% is within the permissible range (${min}%-${max}% under §7 HKVO).`,
    gesetzesreferenz: '§7 HKVO',
  };
}

// =============================================================================
// Zusammenfassung berechnen (für Ergebnisseite)
// =============================================================================

export function berechnePruefzusammenfassung(
  ergebnisse: Array<{
    pruef_typ: string;
    status: string;
    beanstandeter_betrag: number | null;
  }>,
  fristEnde: string
): {
  ampel: AmpelStatus;
  anzahl_nicht_zulaessig: number;
  anzahl_pruefungswuerdig: number;
  kumulierter_beanstandeter_betrag: number;
  hkvo_fehler: boolean;
  frist_fehler: boolean;
  tage_bis_frist: number;
} {
  const betrkv = ergebnisse.filter((e) => e.pruef_typ === 'betrkv');
  const hkvo = ergebnisse.find((e) => e.pruef_typ === 'hkvo');
  const frist = ergebnisse.find((e) => e.pruef_typ === 'frist');

  const anzahl_nicht_zulaessig = betrkv.filter(
    (e) => e.status === 'nicht_zulaessig'
  ).length;
  const anzahl_pruefungswuerdig = betrkv.filter(
    (e) => e.status === 'pruefungswuerdig'
  ).length;
  const kumulierter_beanstandeter_betrag = ergebnisse
    .filter((e) => e.beanstandeter_betrag != null)
    .reduce((sum, e) => sum + (e.beanstandeter_betrag ?? 0), 0);

  const hkvo_fehler = hkvo?.status === 'fehler';
  const frist_fehler = frist?.status === 'fehler';

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const fristDate = new Date(fristEnde);
  fristDate.setHours(0, 0, 0, 0);
  const tage_bis_frist = Math.ceil(
    (fristDate.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24)
  );

  let ampel: AmpelStatus = 'gruen';
  if (anzahl_nicht_zulaessig > 0 || hkvo_fehler || frist_fehler) {
    ampel = 'rot';
  } else if (anzahl_pruefungswuerdig > 0) {
    ampel = 'gelb';
  }

  return {
    ampel,
    anzahl_nicht_zulaessig,
    anzahl_pruefungswuerdig,
    kumulierter_beanstandeter_betrag,
    hkvo_fehler,
    frist_fehler,
    tage_bis_frist,
  };
}
