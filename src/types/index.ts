// =============================================================================
// NebenkostenCheck - Domain Types
// =============================================================================

// --- Tariff -------------------------------------------------------------------

export type Tariff = 'free' | 'pro';

// --- BetrKV ------------------------------------------------------------------

export interface BetrkvCategory {
  id: string;
  code: string;
  name_de: string;
  name_en: string;
  paragraph_ref: string | null;
  zulaessig: boolean;
  begruendung_de: string | null;
  begruendung_en: string | null;
  sort_order: number;
}

// --- Abrechnung --------------------------------------------------------------

export type AbrechnungStatus =
  | 'in_pruefung'
  | 'geprueft'
  | 'widerspruch_erstellt'
  | 'frist_abgelaufen';

export interface Abrechnung {
  id: string;
  user_id: string;
  jahr: number;
  zugangsdatum: string;        // ISO date string
  frist_ende: string;          // ISO date string (generated column)
  vermieter_name: string;
  vermieter_adresse: string | null;
  wohnflaeche_qm: number;
  vorauszahlung_monatlich: number | null;
  saldo: number | null;
  status: AbrechnungStatus;
  created_at: string;
  updated_at: string;
}

// --- Positionen --------------------------------------------------------------

export interface Position {
  id: string;
  abrechnung_id: string;
  betrkv_category_id: string | null;
  freitext_kategorie: string | null;
  gesamtbetrag: number;
  umlageschluessel: string | null;
  mieter_anteil: number;
  sort_order: number;
}

// --- Heizkosten --------------------------------------------------------------

export interface Heizkosten {
  id: string;
  abrechnung_id: string;
  gesamtkosten: number;
  verbrauchsanteil_prozent: number;
  grundkostenanteil_prozent: number;
}

// --- Prüfergebnisse ----------------------------------------------------------

export type PruefTyp = 'betrkv' | 'hkvo' | 'frist' | 'vollstaendigkeit';
export type PruefStatus = 'zulaessig' | 'nicht_zulaessig' | 'pruefungswuerdig' | 'ok' | 'fehler';

export interface Pruefergebnis {
  id: string;
  abrechnung_id: string;
  position_id: string | null;
  pruef_typ: PruefTyp;
  status: PruefStatus;
  begruendung_de: string | null;
  begruendung_en: string | null;
  gesetzesreferenz: string | null;
  beanstandeter_betrag: number | null;
}

// --- Ampel -------------------------------------------------------------------

export type AmpelStatus = 'gruen' | 'gelb' | 'rot';

export interface PruefzusammenfassungData {
  ampel: AmpelStatus;
  anzahl_nicht_zulaessig: number;
  anzahl_pruefungswuerdig: number;
  kumulierter_beanstandeter_betrag: number;
  hkvo_fehler: boolean;
  frist_fehler: boolean;
  frist_ende: string;
  tage_bis_frist: number;
}

// --- Wizard Form Data --------------------------------------------------------

export interface WizardStep1Data {
  jahr: number;
  zugangsdatum: string;
  vermieter_name: string;
  vermieter_adresse: string;
  wohnflaeche_qm: number;
  vorauszahlung_monatlich: number | null;
  saldo: number | null;
}

export interface WizardPositionInput {
  betrkv_category_id: string | null;
  freitext_kategorie: string;
  gesamtbetrag: number;
  umlageschluessel: string;
  mieter_anteil: number;
}

export interface WizardStep2Data {
  positionen: WizardPositionInput[];
}

export interface WizardStep3Data {
  gesamtkosten: number;
  verbrauchsanteil_prozent: number;
  grundkostenanteil_prozent: number;
}

// --- Server Action Results ---------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
