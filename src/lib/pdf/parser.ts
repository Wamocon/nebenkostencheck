import type { WizardStep1Data, WizardStep3Data } from '@/types';

// =============================================================================
// German Nebenkostenabrechnung - Regex-based text parser
// Works with digitally created PDFs (not scanned). Extracts common fields
// from German utility bill text. Returns partial data; user must review.
// =============================================================================

// --- Helpers -----------------------------------------------------------------

/** Parse German monetary format "1.234,56" or "234,56" → number */
function parseDeMoney(s: string): number | null {
  const cleaned = s.replace(/[€EUReur\s]/g, '').trim();
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) || num < 0 ? null : num;
}

/** Find all German monetary amounts in a string, sorted ascending by position */
function findAmounts(text: string): number[] {
  const matches = text.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g) ?? [];
  return matches
    .map((m) => parseDeMoney(m))
    .filter((n): n is number => n !== null && n > 0);
}

// --- BetrKV Category Keyword Mapping -----------------------------------------

/** Maps German cost type keywords to display names and flags */
const CATEGORY_KEYWORDS: Array<{
  patterns: RegExp[];
  name: string;
  is_heizkosten?: boolean;
}> = [
  { patterns: [/grundsteuer/i], name: 'Grundsteuer' },
  { patterns: [/kaltwasser|wasserversorgung|trinkwasser|(\bwasser\b(?!.*warm))/i], name: 'Wasserversorgung' },
  { patterns: [/abwasser|entwässer|kanalgebühr/i], name: 'Entwässerung' },
  { patterns: [/fahrstuhl|aufzug/i], name: 'Fahrstuhl' },
  { patterns: [/straßenreinig|gehwegreinig/i], name: 'Straßenreinigung' },
  { patterns: [/müll|abfallentsorg|müllabfuhr|abfallbeseitig/i], name: 'Müllbeseitigung' },
  { patterns: [/gebäudereinig|treppenreinig|hausreinig/i], name: 'Gebäudereinigung' },
  { patterns: [/gartenpflege|grünpflege/i], name: 'Gartenpflege' },
  { patterns: [/beleuchtung|allgemeinstrom|hausbeleuchtung/i], name: 'Beleuchtung' },
  { patterns: [/schornstein|kaminfeger/i], name: 'Schornsteinreinigung' },
  { patterns: [/versicherung(?!.*unfall)|gebäudeversicherung|haftpflicht/i], name: 'Versicherungen' },
  { patterns: [/hausmeister|hauswart/i], name: 'Hausmeisterdienst' },
  { patterns: [/kabelanschluss|kabelfernsehen|gemeinschaftsantenne/i], name: 'Kabelanschluss' },
  { patterns: [/waschraum|wäschepflege/i], name: 'Wäschepflegeeinrichtungen' },
  { patterns: [/heizkost|heizung\b|fernwärme|wärmeversorgung/i], name: 'Heizkosten', is_heizkosten: true },
  { patterns: [/warmwasser/i], name: 'Warmwasser', is_heizkosten: true },
];

function matchCategory(text: string) {
  for (const cat of CATEGORY_KEYWORDS) {
    if (cat.patterns.some((p) => p.test(text))) {
      return { name: cat.name, is_heizkosten: cat.is_heizkosten ?? false };
    }
  }
  return null;
}

// --- Types -------------------------------------------------------------------

export interface ParsedPosition {
  original_text: string;
  recognized_name: string;
  recognized_category_name: string | null;
  gesamtbetrag: number;
  mieter_anteil: number;
  is_heizkosten: boolean;
}

export interface ParsedPdfData {
  step1: Partial<WizardStep1Data>;
  positions: ParsedPosition[];
  step3: Partial<WizardStep3Data>;
  confidence: {
    fields_found: number;
    positions_count: number;
  };
}

// --- Main Parser -------------------------------------------------------------

export function parseNebenkostenText(text: string): ParsedPdfData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // --- Jahr -------------------------------------------------------------------
  let jahr: number | undefined;
  const yearPatterns = [
    /Abrechnungsjahr\s*:?\s*(\d{4})/i,
    /Abrechnungszeitraum\s*:?.*?(\d{4})/i,
    /(?:für\s+(?:das\s+Jahr\s+)?|Abrechnung\s+)(\d{4})\b/i,
    /(?:vom|von)\s+\d{2}\.\d{2}\.(\d{4})\s+bis/i,
    /\b(20\d{2})\b/,
  ];
  for (const p of yearPatterns) {
    const m = text.match(p);
    if (m) {
      const y = parseInt(m[1]);
      if (y >= 2010 && y <= 2100) { jahr = y; break; }
    }
  }

  // --- Zugangsdatum -----------------------------------------------------------
  // Bills rarely contain the receipt date; use billing date as fallback
  let zugangsdatum = '';
  const datePatterns = [
    /(?:Datum|Ausstellungsdatum|erstellt\s+am|Rechnungsdatum)\s*:?\s*(\d{2}\.\d{2}\.\d{4})/i,
    /,\s*(\d{2}\.\d{2}\.\d{4})\s*$/m,
    /(\d{2}\.\d{2}\.\d{4})/,
  ];
  for (const p of datePatterns) {
    const m = text.match(p);
    if (m) {
      const parts = m[1].split('.');
      if (parts.length === 3) {
        zugangsdatum = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        break;
      }
    }
  }

  // --- Vermieter Name ---------------------------------------------------------
  let vermieter_name = '';
  const vermieterPatterns = [
    /(?:Vermieter|Hauseigentümer|Eigentümer|Hausverwaltung|Absender)\s*:?\s*(.+)/i,
    /(?:Ihr\s+)?Vermieter\s*:?\s*(.+)/i,
    /Immobilien(?:verwaltung)?\s+(.+)/i,
  ];
  for (const p of vermieterPatterns) {
    const m = text.match(p);
    if (m) {
      vermieter_name = m[1].trim().replace(/\s+/g, ' ').substring(0, 100);
      break;
    }
  }

  // --- Vermieter Adresse ------------------------------------------------------
  let vermieter_adresse = '';
  if (vermieter_name) {
    const nameIdx = lines.findIndex((l) =>
      l.toLowerCase().includes(vermieter_name.substring(0, 15).toLowerCase())
    );
    if (nameIdx >= 0) {
      const candidates = lines
        .slice(nameIdx + 1, nameIdx + 5)
        .filter((l) => /\d{5}|str\.|straße|weg|platz|allee/i.test(l));
      vermieter_adresse = candidates.slice(0, 2).join(', ').substring(0, 200);
    }
  }

  // --- Wohnfläche -------------------------------------------------------------
  let wohnflaeche_qm: number | undefined;
  const flaechePatterns = [
    /(?:Ihre?\s+)?(?:Wohn|Miet|Nutz)(?:fläche|anteil)\s*:?\s*([\d.,]+)\s*(?:m[²2]|qm)/i,
    /([\d.,]+)\s*(?:m[²2]|qm)\s+(?:Wohn|Miet|Nutz)/i,
    /Fläche(?:nanteil)?\s*:?\s*([\d.,]+)\s*(?:m[²2]|qm)/i,
  ];
  for (const p of flaechePatterns) {
    const m = text.match(p);
    if (m) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v > 5 && v < 1000) { wohnflaeche_qm = v; break; }
    }
  }

  // --- Vorauszahlung ----------------------------------------------------------
  let vorauszahlung_monatlich: number | null = null;
  const vorausPatterns = [
    /(\d+)\s*[×xX]\s*([\d.,]+)\s*(?:EUR|€)\s*(?:monatlich|mtl\.)?/i,
    /monatlich(?:e)?\s+(?:Vorauszahlung|Abschlag)\s*:?\s*([\d.,]+)\s*(?:EUR|€)/i,
    /(?:Vorauszahlungen?|Abschläge)\s*:?\s*([\d.,]+)\s*(?:EUR|€)\s*(?:\/\s*Monat|je\s+Monat|mtl\.)/i,
  ];
  for (const p of vorausPatterns) {
    const m = text.match(p);
    if (m) {
      const amountStr = m[2] ?? m[1];
      const amount = parseDeMoney(amountStr);
      if (amount && amount > 0 && amount < 10000) {
        vorauszahlung_monatlich = amount;
        break;
      }
    }
  }

  // --- Saldo (Nachzahlung / Guthaben) ----------------------------------------
  let saldo: number | null = null;
  const nachzPattern = /(?:Nachzahlung|Nachforderung|Zahlungsbetrag|zu\s*zahlender\s*Betrag)\s*:?\s*([\d.,]+)\s*(?:EUR|€)/i;
  const guthabPattern = /(?:Guthaben|Rückzahlung|Erstattungsbetrag|wir\s+erstatten)\s*:?\s*([\d.,]+)\s*(?:EUR|€)/i;

  const nm = text.match(nachzPattern);
  if (nm) {
    const v = parseDeMoney(nm[1]);
    if (v !== null) saldo = v; // positive = tenant owes
  }
  if (saldo === null) {
    const gm = text.match(guthabPattern);
    if (gm) {
      const v = parseDeMoney(gm[1]);
      if (v !== null) saldo = -v; // negative = landlord owes
    }
  }

  // --- Positions (BetrKV lines) ----------------------------------------------
  const positions: ParsedPosition[] = [];
  let heizkostenGesamt = 0;
  const seenCategories = new Set<string>();

  for (const line of lines) {
    if (line.length < 5 || line.length > 250) continue;
    const cat = matchCategory(line);
    if (!cat) continue;
    const amounts = findAmounts(line);
    if (amounts.length === 0) continue;

    const mieter_anteil = amounts[amounts.length - 1];
    const gesamtbetrag = amounts.length >= 2 ? amounts[0] : 0;

    if (cat.is_heizkosten) {
      const total = gesamtbetrag || mieter_anteil;
      if (total > heizkostenGesamt) heizkostenGesamt = total;
    } else {
      if (!seenCategories.has(cat.name)) {
        seenCategories.add(cat.name);
        positions.push({
          original_text: line.substring(0, 150),
          recognized_name: cat.name,
          recognized_category_name: cat.name,
          gesamtbetrag,
          mieter_anteil,
          is_heizkosten: false,
        });
      }
    }
  }

  // --- HKVO Verbrauchsanteil -------------------------------------------------
  let verbrauchsanteil: number | undefined;
  const hkvoPatterns = [
    /(?:verbrauchsabhängig|verbrauchsanteil|Anteil\s+verbrauch)\s*:?\s*([\d,]+)\s*%/i,
    /([\d,]+)\s*%\s*verbrauchsabhängig/i,
  ];
  for (const p of hkvoPatterns) {
    const m = text.match(p);
    if (m) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v > 0 && v <= 100) { verbrauchsanteil = v; break; }
    }
  }

  // --- Build output ----------------------------------------------------------
  let fields_found = 0;
  if (jahr) fields_found++;
  if (vermieter_name) fields_found++;
  if (wohnflaeche_qm) fields_found++;
  if (vorauszahlung_monatlich !== null) fields_found++;
  if (saldo !== null) fields_found++;

  const step1: Partial<WizardStep1Data> = {};
  if (jahr) step1.jahr = jahr;
  if (zugangsdatum) step1.zugangsdatum = zugangsdatum;
  if (vermieter_name) step1.vermieter_name = vermieter_name;
  if (vermieter_adresse) step1.vermieter_adresse = vermieter_adresse;
  if (wohnflaeche_qm) step1.wohnflaeche_qm = wohnflaeche_qm;
  if (vorauszahlung_monatlich !== null) step1.vorauszahlung_monatlich = vorauszahlung_monatlich;
  if (saldo !== null) step1.saldo = saldo;

  const step3: Partial<WizardStep3Data> = {};
  if (heizkostenGesamt > 0) step3.gesamtkosten = heizkostenGesamt;
  if (verbrauchsanteil !== undefined) {
    step3.verbrauchsanteil_prozent = verbrauchsanteil;
    step3.grundkostenanteil_prozent = Math.round(100 - verbrauchsanteil);
  }

  return {
    step1,
    positions,
    step3,
    confidence: { fields_found, positions_count: positions.length },
  };
}
