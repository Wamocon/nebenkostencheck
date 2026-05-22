'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  ActionResult,
  WizardStep1Data,
  WizardPositionInput,
  WizardStep3Data,
  ParsedPdfData,
} from '@/types';
import { runPruefung } from '@/lib/pruefung/engine';
import { parseNebenkostenText } from '@/lib/pdf/parser';

// --- Hilfsfunktion: aktuell eingeloggten Nutzer holen ----------------------

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/de/auth/login');
  }
  return { user, supabase };
}

// --- Schritt 1: Abrechnung anlegen -----------------------------------------

export async function createAbrechnung(
  data: WizardStep1Data
): Promise<ActionResult<{ id: string }>> {
  const { user, supabase } = await getAuthenticatedUser();

  const { data: abrechnung, error } = await supabase
    .from('abrechnungen')
    .insert({
      user_id: user.id,
      jahr: data.jahr,
      zugangsdatum: data.zugangsdatum,
      vermieter_name: data.vermieter_name,
      vermieter_adresse: data.vermieter_adresse || null,
      wohnflaeche_qm: data.wohnflaeche_qm,
      vorauszahlung_monatlich: data.vorauszahlung_monatlich ?? null,
      saldo: data.saldo ?? null,
      status: 'in_pruefung',
    })
    .select('id')
    .single();

  if (error || !abrechnung) {
    return { success: false, error: error?.message ?? 'Unbekannter Fehler' };
  }

  return { success: true, data: { id: abrechnung.id } };
}

// --- Schritt 1 aktualisieren (falls Nutzer zurückgeht) ----------------------

export async function updateAbrechnungGrunddaten(
  abrechnungId: string,
  data: WizardStep1Data
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();

  const { error } = await supabase
    .from('abrechnungen')
    .update({
      jahr: data.jahr,
      zugangsdatum: data.zugangsdatum,
      vermieter_name: data.vermieter_name,
      vermieter_adresse: data.vermieter_adresse || null,
      wohnflaeche_qm: data.wohnflaeche_qm,
      vorauszahlung_monatlich: data.vorauszahlung_monatlich ?? null,
      saldo: data.saldo ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', abrechnungId)
    .eq('user_id', user.id); // RLS-Doppelabsicherung

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

// --- Schritt 2: Positionen speichern ----------------------------------------

export async function savePositionen(
  abrechnungId: string,
  positionen: WizardPositionInput[]
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();

  // Eigentümerschaft prüfen
  const { data: abr } = await supabase
    .from('abrechnungen')
    .select('id')
    .eq('id', abrechnungId)
    .eq('user_id', user.id)
    .single();

  if (!abr) {
    return { success: false, error: 'Abrechnung nicht gefunden' };
  }

  // Alte Positionen löschen und neu schreiben (einfachste Strategie für MVP)
  await supabase.from('positionen').delete().eq('abrechnung_id', abrechnungId);

  const rows = positionen.map((p, i) => ({
    abrechnung_id: abrechnungId,
    betrkv_category_id: p.betrkv_category_id || null,
    freitext_kategorie: p.freitext_kategorie || null,
    gesamtbetrag: p.gesamtbetrag,
    umlageschluessel: p.umlageschluessel || null,
    mieter_anteil: p.mieter_anteil,
    sort_order: i,
  }));

  const { error } = await supabase.from('positionen').insert(rows);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

// --- Schritt 3: Heizkosten speichern ----------------------------------------

export async function saveHeizkosten(
  abrechnungId: string,
  data: WizardStep3Data
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();

  // Eigentümerschaft prüfen
  const { data: abr } = await supabase
    .from('abrechnungen')
    .select('id')
    .eq('id', abrechnungId)
    .eq('user_id', user.id)
    .single();

  if (!abr) {
    return { success: false, error: 'Abrechnung nicht gefunden' };
  }

  // Upsert (überschreiben falls schon vorhanden)
  const { error } = await supabase.from('heizkosten').upsert(
    {
      abrechnung_id: abrechnungId,
      gesamtkosten: data.gesamtkosten,
      verbrauchsanteil_prozent: data.verbrauchsanteil_prozent,
      grundkostenanteil_prozent: data.grundkostenanteil_prozent,
    },
    { onConflict: 'abrechnung_id' }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

// --- Schritt 4: Prüfung starten ---------------------------------------------

export async function startPruefungAction(
  abrechnungId: string,
  locale: string
): Promise<ActionResult<{ redirectUrl: string }>> {
  const { user, supabase } = await getAuthenticatedUser();

  // Eigentümerschaft prüfen
  const { data: abr } = await supabase
    .from('abrechnungen')
    .select('id')
    .eq('id', abrechnungId)
    .eq('user_id', user.id)
    .single();

  if (!abr) {
    return { success: false, error: 'Abrechnung nicht gefunden' };
  }

  // Prüf-Engine starten
  const pruefResult = await runPruefung(abrechnungId);
  if (!pruefResult.success) {
    return { success: false, error: pruefResult.error };
  }

  return {
    success: true,
    data: { redirectUrl: `/${locale}/dashboard/abrechnung/${abrechnungId}/ergebnis` },
  };
}

// --- PDF: Hochladen und Text extrahieren + parsen ---------------------------

export async function parsePdfAction(
  formData: FormData
): Promise<ActionResult<ParsedPdfData>> {
  await getAuthenticatedUser(); // auth guard

  const file = formData.get('pdf');
  if (!(file instanceof File)) {
    return { success: false, error: 'Keine Datei gefunden' };
  }

  if (file.type !== 'application/pdf') {
    return { success: false, error: 'Nur PDF-Dateien werden akzeptiert' };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'Datei zu groß (maximal 10 MB)' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse is CJS and excluded from bundling via serverExternalPackages
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (
      buf: Buffer,
      options?: { max?: number }
    ) => Promise<{ text: string; numpages: number }>;

    const pdfData = await pdfParse(buffer, { max: 0 });

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      return {
        success: false,
        error:
          'Die PDF enthält keinen lesbaren Text (evtl. gescannt). Bitte gib die Daten manuell ein.',
      };
    }

    const parsed = parseNebenkostenText(pdfData.text);
    return { success: true, data: parsed };
  } catch (err) {
    console.error('PDF parse error:', err);
    return { success: false, error: 'Fehler beim Verarbeiten der PDF.' };
  }
}
