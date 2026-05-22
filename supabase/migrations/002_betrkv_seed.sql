-- =============================================================================
-- NebenkostenCheck - BetrKV Initialdaten
-- Quelle: Betriebskostenverordnung (BetrKV) vom 25.11.2003, BGBl. I S. 2346
-- Ausführen NACH 001_initial_schema.sql
-- WICHTIG: Diese Liste vor dem öffentlichen Launch durch einen Fachanwalt für
-- Mietrecht prüfen lassen (siehe Anforderungsdokument, Abschnitt 6.5).
-- =============================================================================

INSERT INTO public.betrkv_categories
  (code, name_de, name_en, paragraph_ref, zulaessig, begruendung_de, begruendung_en, sort_order)
VALUES
  -- §2 Nr. 1 BetrKV
  ('grundsteuer', 'Grundsteuer', 'Property tax', '§2 Nr. 1 BetrKV', true,
   'Die Grundsteuer ist nach §2 Nr. 1 BetrKV eine umlagefähige Betriebskostenart.',
   'Property tax is a permissible operating cost under §2 No. 1 BetrKV.', 10),

  -- §2 Nr. 2 BetrKV
  ('wasser_entwässerung', 'Wasserversorgung und Entwässerung', 'Water supply and drainage', '§2 Nr. 2 BetrKV', true,
   'Kosten der Wasserversorgung und Entwässerung sind nach §2 Nr. 2 BetrKV umlagefähig.',
   'Water supply and drainage costs are permissible under §2 No. 2 BetrKV.', 20),

  -- §2 Nr. 3 BetrKV
  ('heizung', 'Heizung und Warmwasser', 'Heating and hot water', '§2 Nr. 3 BetrKV', true,
   'Heizkosten sind umlagefähig, unterliegen jedoch der Heizkostenverordnung (HKVO).',
   'Heating costs are permissible but subject to the Heating Cost Ordinance (HKVO).', 30),

  -- §2 Nr. 4 BetrKV
  ('aufzug', 'Aufzug', 'Elevator', '§2 Nr. 4 BetrKV', true,
   'Kosten des Aufzugs sind nach §2 Nr. 4 BetrKV umlagefähig.',
   'Elevator costs are permissible under §2 No. 4 BetrKV.', 40),

  -- §2 Nr. 5 BetrKV
  ('strassenreinigung', 'Straßenreinigung und Müllabfuhr', 'Street cleaning and refuse collection', '§2 Nr. 5 BetrKV', true,
   'Straßenreinigung und Müllabfuhr sind nach §2 Nr. 5 BetrKV umlagefähig.',
   'Street cleaning and refuse collection are permissible under §2 No. 5 BetrKV.', 50),

  -- §2 Nr. 6 BetrKV
  ('gebäudereinigung', 'Gebäudereinigung und Ungezieferbekämpfung', 'Building cleaning and pest control', '§2 Nr. 6 BetrKV', true,
   'Gebäudereinigung und Ungezieferbekämpfung sind nach §2 Nr. 6 BetrKV umlagefähig.',
   'Building cleaning and pest control are permissible under §2 No. 6 BetrKV.', 60),

  -- §2 Nr. 7 BetrKV
  ('gartenpflege', 'Gartenpflege', 'Garden maintenance', '§2 Nr. 7 BetrKV', true,
   'Kosten der Gartenpflege sind nach §2 Nr. 7 BetrKV umlagefähig.',
   'Garden maintenance costs are permissible under §2 No. 7 BetrKV.', 70),

  -- §2 Nr. 8 BetrKV
  ('beleuchtung', 'Beleuchtung', 'Lighting', '§2 Nr. 8 BetrKV', true,
   'Kosten der Beleuchtung sind nach §2 Nr. 8 BetrKV umlagefähig.',
   'Lighting costs are permissible under §2 No. 8 BetrKV.', 80),

  -- §2 Nr. 9 BetrKV
  ('schornsteinreinigung', 'Schornsteinreinigung', 'Chimney cleaning', '§2 Nr. 9 BetrKV', true,
   'Kosten der Schornsteinreinigung sind nach §2 Nr. 9 BetrKV umlagefähig.',
   'Chimney cleaning costs are permissible under §2 No. 9 BetrKV.', 90),

  -- §2 Nr. 10 BetrKV
  ('sach_haftpflichtversicherung', 'Sach- und Haftpflichtversicherung', 'Property and liability insurance', '§2 Nr. 10 BetrKV', true,
   'Kosten der Sach- und Haftpflichtversicherung sind nach §2 Nr. 10 BetrKV umlagefähig.',
   'Property and liability insurance costs are permissible under §2 No. 10 BetrKV.', 100),

  -- §2 Nr. 11 BetrKV
  ('hausmeister', 'Hausmeister', 'Caretaker / janitor', '§2 Nr. 11 BetrKV', true,
   'Kosten des Hausmeisters sind nach §2 Nr. 11 BetrKV umlagefähig (nur Wartung/Pflege, keine Verwaltungskosten).',
   'Caretaker costs are permissible under §2 No. 11 BetrKV (maintenance only, no administrative costs).', 110),

  -- §2 Nr. 12 BetrKV
  ('gemeinschaftsantenne', 'Gemeinschaftsantenne / Kabel-TV', 'Communal antenna / cable TV', '§2 Nr. 12 BetrKV', true,
   'Kosten für Gemeinschaftsantennenanlagen sind nach §2 Nr. 12 BetrKV umlagefähig.',
   'Communal antenna costs are permissible under §2 No. 12 BetrKV.', 120),

  -- §2 Nr. 13 BetrKV
  ('breitbandanschluss', 'Breitbandanschluss', 'Broadband connection', '§2 Nr. 13 BetrKV', true,
   'Kosten des Breitbandanschlusses sind nach §2 Nr. 13 BetrKV umlagefähig.',
   'Broadband connection costs are permissible under §2 No. 13 BetrKV.', 130),

  -- §2 Nr. 14 BetrKV
  ('aufzug_betriebsstrom', 'Einrichtungen für die Wäschepflege', 'Laundry facilities', '§2 Nr. 14 BetrKV', true,
   'Kosten der Einrichtungen für die Wäschepflege sind nach §2 Nr. 14 BetrKV umlagefähig.',
   'Laundry facility costs are permissible under §2 No. 14 BetrKV.', 140),

  -- §2 Nr. 15 BetrKV - "Sonstige Betriebskosten" (prüfungswürdig, da nicht konkret benannt)
  ('sonstige', 'Sonstige Betriebskosten', 'Other operating costs', '§2 Nr. 17 BetrKV', true,
   'Sonstige Betriebskosten können umlagefähig sein, müssen jedoch im Mietvertrag ausdrücklich vereinbart werden. Prüfungswürdig.',
   'Other operating costs may be permissible but must be explicitly agreed upon in the tenancy agreement. Worth reviewing.', 150),

  -- Nicht umlagefähige Positionen (häufig fälschlicherweise abgerechnet)
  ('verwaltungskosten', 'Verwaltungskosten', 'Administrative costs', '§1 Abs. 2 BetrKV', false,
   'Verwaltungskosten sind nach §1 Abs. 2 Nr. 1 BetrKV NICHT umlagefähig und dürfen nicht auf Mieter umgelegt werden.',
   'Administrative costs are NOT permissible under §1 para. 2 No. 1 BetrKV and cannot be charged to tenants.', 200),

  ('instandhaltung', 'Instandhaltung und Instandsetzung', 'Maintenance and repair', '§1 Abs. 2 BetrKV', false,
   'Kosten der Instandhaltung und Instandsetzung sind nach §1 Abs. 2 Nr. 2 BetrKV NICHT umlagefähig.',
   'Maintenance and repair costs are NOT permissible under §1 para. 2 No. 2 BetrKV.', 210),

  ('abschreibungen', 'Abschreibungen', 'Depreciation', '§1 Abs. 2 BetrKV', false,
   'Abschreibungen sind nach §1 Abs. 2 Nr. 3 BetrKV NICHT umlagefähig.',
   'Depreciation is NOT permissible under §1 para. 2 No. 3 BetrKV.', 220);
