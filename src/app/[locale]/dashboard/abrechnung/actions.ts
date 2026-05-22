'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  ActionResult,
  WizardStep1Data,
  WizardPositionInput,
  WizardStep3Data,
} from '@/types';
import { runPruefung } from '@/lib/pruefung/engine';

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
