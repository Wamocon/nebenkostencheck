-- =============================================================================
-- NebenkostenCheck - Datenbankschema V1
-- Ausführen im Supabase SQL Editor (Project > SQL Editor > New query)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES (erweitertes Nutzerprofil zu auth.users)
-- =============================================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT,
  tariff       TEXT NOT NULL DEFAULT 'free' CHECK (tariff IN ('free', 'pro')),
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Automatisch Profil anlegen, wenn ein neuer Nutzer sich registriert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. BETRKV_CATEGORIES (konfigurierbar, ohne Code-Deployment änderbar)
-- =============================================================================
CREATE TABLE public.betrkv_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,  -- z.B. 'grundsteuer', 'wasser', 'heizung'
  name_de         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  paragraph_ref   TEXT,                  -- z.B. '§2 Nr. 1 BetrKV'
  zulaessig       BOOLEAN NOT NULL DEFAULT true,
  begruendung_de  TEXT,
  begruendung_en  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. HKVO_PARAMETERS (konfigurierbar)
-- =============================================================================
CREATE TABLE public.hkvo_parameters (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_verbrauchsanteil    NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  max_verbrauchsanteil    NUMERIC(5,2) NOT NULL DEFAULT 70.00,
  paragraph_ref           TEXT NOT NULL DEFAULT '§7 HKVO',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialdaten
INSERT INTO public.hkvo_parameters (min_verbrauchsanteil, max_verbrauchsanteil)
VALUES (50.00, 70.00);

-- =============================================================================
-- 4. ABRECHNUNGEN (Nebenkostenabrechnungen pro Nutzer)
-- =============================================================================
CREATE TABLE public.abrechnungen (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jahr                  INTEGER NOT NULL CHECK (jahr >= 2000 AND jahr <= 2100),
  zugangsdatum          DATE NOT NULL,
  frist_ende            DATE GENERATED ALWAYS AS (zugangsdatum + INTERVAL '12 months') STORED,
  vermieter_name        TEXT NOT NULL,
  vermieter_adresse     TEXT,
  wohnflaeche_qm        NUMERIC(8,2) NOT NULL CHECK (wohnflaeche_qm > 0),
  vorauszahlung_monatlich NUMERIC(10,2),
  saldo                 NUMERIC(10,2),     -- positiv = Nachzahlung, negativ = Guthaben
  status                TEXT NOT NULL DEFAULT 'in_pruefung'
    CHECK (status IN ('in_pruefung', 'geprueft', 'widerspruch_erstellt', 'frist_abgelaufen')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. POSITIONEN (Betriebskosten-Positionen pro Abrechnung)
-- =============================================================================
CREATE TABLE public.positionen (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abrechnung_id         UUID NOT NULL REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  betrkv_category_id    UUID REFERENCES public.betrkv_categories(id),
  freitext_kategorie    TEXT,              -- falls Kategorie nicht in Liste
  gesamtbetrag          NUMERIC(10,2) NOT NULL CHECK (gesamtbetrag >= 0),
  umlageschluessel      TEXT,              -- z.B. 'Wohnfläche', 'Wohneinheiten', 'Verbrauch'
  mieter_anteil         NUMERIC(10,2) NOT NULL CHECK (mieter_anteil >= 0),
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. HEIZKOSTEN (Heizkostenabrechnung pro Abrechnung)
-- =============================================================================
CREATE TABLE public.heizkosten (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abrechnung_id             UUID NOT NULL REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  gesamtkosten              NUMERIC(10,2) NOT NULL CHECK (gesamtkosten >= 0),
  verbrauchsanteil_prozent  NUMERIC(5,2) NOT NULL CHECK (verbrauchsanteil_prozent >= 0 AND verbrauchsanteil_prozent <= 100),
  grundkostenanteil_prozent NUMERIC(5,2) NOT NULL CHECK (grundkostenanteil_prozent >= 0 AND grundkostenanteil_prozent <= 100),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(abrechnung_id)
);

-- =============================================================================
-- 7. PRUEFERGEBNISSE (Ergebnisse der automatischen Prüfung)
-- =============================================================================
CREATE TABLE public.pruefergebnisse (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abrechnung_id     UUID NOT NULL REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  position_id       UUID REFERENCES public.positionen(id) ON DELETE CASCADE,
  pruef_typ         TEXT NOT NULL CHECK (pruef_typ IN ('betrkv', 'hkvo', 'frist', 'vollstaendigkeit')),
  status            TEXT NOT NULL CHECK (status IN ('zulaessig', 'nicht_zulaessig', 'pruefungswuerdig', 'ok', 'fehler')),
  begruendung_de    TEXT,
  begruendung_en    TEXT,
  gesetzesreferenz  TEXT,
  beanstandeter_betrag NUMERIC(10,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. WIDERSPRUCHSSCHREIBEN (Pro-Funktion)
-- =============================================================================
CREATE TABLE public.widerspruchsschreiben (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abrechnung_id   UUID NOT NULL REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  inhalt_text     TEXT NOT NULL,
  pdf_storage_path TEXT,               -- Supabase Storage Pfad
  erstellt_am     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(abrechnung_id)
);

-- =============================================================================
-- 9. NOTIFICATIONS (In-App Benachrichtigungen)
-- =============================================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  abrechnung_id   UUID REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  typ             TEXT NOT NULL CHECK (typ IN ('frist_60', 'frist_30', 'frist_7', 'frist_abgelaufen', 'system')),
  titel_de        TEXT NOT NULL,
  titel_en        TEXT NOT NULL,
  nachricht_de    TEXT,
  nachricht_en    TEXT,
  gelesen         BOOLEAN NOT NULL DEFAULT false,
  erstellt_am     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Alle Tabellen aktivieren
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betrkv_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hkvo_parameters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abrechnungen          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positionen            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heizkosten            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pruefergebnisse       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widerspruchsschreiben ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;

-- Profiles: Nutzer sieht nur eigenes Profil
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (user_id = auth.uid());

-- BetrKV-Kategorien: Alle eingeloggten Nutzer können lesen, nur Service Role schreibt
CREATE POLICY "betrkv_read" ON public.betrkv_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- HKVO-Parameter: Alle eingeloggten Nutzer können lesen
CREATE POLICY "hkvo_read" ON public.hkvo_parameters
  FOR SELECT USING (auth.role() = 'authenticated');

-- Abrechnungen: Nutzer sieht nur eigene
CREATE POLICY "abrechnungen_own" ON public.abrechnungen
  FOR ALL USING (user_id = auth.uid());

-- Positionen: Nutzer sieht nur Positionen seiner eigenen Abrechnungen
CREATE POLICY "positionen_own" ON public.positionen
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.abrechnungen a
      WHERE a.id = abrechnung_id AND a.user_id = auth.uid()
    )
  );

-- Heizkosten: Nutzer sieht nur Heizkosten seiner eigenen Abrechnungen
CREATE POLICY "heizkosten_own" ON public.heizkosten
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.abrechnungen a
      WHERE a.id = abrechnung_id AND a.user_id = auth.uid()
    )
  );

-- Prüfergebnisse: wie Positionen
CREATE POLICY "pruefergebnisse_own" ON public.pruefergebnisse
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.abrechnungen a
      WHERE a.id = abrechnung_id AND a.user_id = auth.uid()
    )
  );

-- Widerspruchsschreiben: wie Positionen
CREATE POLICY "schreiben_own" ON public.widerspruchsschreiben
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.abrechnungen a
      WHERE a.id = abrechnung_id AND a.user_id = auth.uid()
    )
  );

-- Notifications: Nutzer sieht nur eigene
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- INDEXES (Performance)
-- =============================================================================
CREATE INDEX idx_abrechnungen_user_id ON public.abrechnungen(user_id);
CREATE INDEX idx_abrechnungen_frist_ende ON public.abrechnungen(frist_ende);
CREATE INDEX idx_positionen_abrechnung_id ON public.positionen(abrechnung_id);
CREATE INDEX idx_pruefergebnisse_abrechnung_id ON public.pruefergebnisse(abrechnung_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, gelesen);
