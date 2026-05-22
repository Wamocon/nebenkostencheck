'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BetrkvCategory, WizardPositionInput } from '@/types';

type Props = {
  kategorien: BetrkvCategory[];
  initialData?: WizardPositionInput[];
  onNext: (data: WizardPositionInput[]) => void;
  onBack: () => void;
  isLoading: boolean;
};

const EMPTY_POSITION: WizardPositionInput = {
  betrkv_category_id: null,
  freitext_kategorie: '',
  gesamtbetrag: 0,
  umlageschluessel: 'wohnflaeche',
  mieter_anteil: 0,
};

export function Step2Positionen({
  kategorien,
  initialData,
  onNext,
  onBack,
  isLoading,
}: Props) {
  const t = useTranslations('abrechnung');
  const [positionen, setPositionen] = useState<WizardPositionInput[]>(
    initialData?.length ? initialData : [{ ...EMPTY_POSITION }]
  );
  const [error, setError] = useState<string | null>(null);

  const addPosition = () => {
    setPositionen((prev) => [...prev, { ...EMPTY_POSITION }]);
  };

  const removePosition = (index: number) => {
    setPositionen((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePosition = (
    index: number,
    field: keyof WizardPositionInput,
    value: string | number | null
  ) => {
    setPositionen((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSubmit = () => {
    if (positionen.length === 0) {
      setError(t('validation.min_1'));
      return;
    }
    setError(null);
    onNext(positionen);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--on-surface-variant)]">
        {t('heizkosten.hint')}
      </p>

      {/* Positions-Liste */}
      <div className="space-y-4">
        {positionen.map((pos, i) => {
          const showFreitext = !pos.betrkv_category_id;
          return (
            <div
              key={i}
              className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--on-surface)]">
                  Position {i + 1}
                </span>
                {positionen.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePosition(i)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('positionen.remove')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kategorie-Auswahl */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('positionen.kategorie')}
                  </label>
                  <select
                    value={pos.betrkv_category_id ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePosition(i, 'betrkv_category_id', val || null);
                      if (val) updatePosition(i, 'freitext_kategorie', '');
                    }}
                    className="field-input text-sm"
                  >
                    <option value="">{t('positionen.freitext')}...</option>
                    {kategorien.map((kat) => (
                      <option key={kat.id} value={kat.id}>
                        {kat.name_de} ({kat.paragraph_ref ?? 'BetrKV'})
                        {!kat.zulaessig ? ' ⚠' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Freitext */}
                {showFreitext && (
                  <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">
                      {t('positionen.freitext')}
                    </label>
                    <input
                      type="text"
                      value={pos.freitext_kategorie}
                      onChange={(e) => updatePosition(i, 'freitext_kategorie', e.target.value)}
                      className="field-input text-sm"
                      placeholder="z.B. Dachrinnenreinigung"
                    />
                  </div>
                )}

                {/* Gesamtbetrag */}
                <div>
                  <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('positionen.gesamtbetrag')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={pos.gesamtbetrag || ''}
                      onChange={(e) =>
                        updatePosition(i, 'gesamtbetrag', parseFloat(e.target.value) || 0)
                      }
                      className="field-input text-sm pr-8"
                      placeholder="0,00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--on-surface-variant)]">€</span>
                  </div>
                </div>

                {/* Mieteranteil */}
                <div>
                  <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('positionen.mieter_anteil')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={pos.mieter_anteil || ''}
                      onChange={(e) =>
                        updatePosition(i, 'mieter_anteil', parseFloat(e.target.value) || 0)
                      }
                      className="field-input text-sm pr-8"
                      placeholder="0,00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--on-surface-variant)]">€</span>
                  </div>
                </div>

                {/* Umlageschlüssel */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('positionen.umlageschluessel')}
                  </label>
                  <select
                    value={pos.umlageschluessel}
                    onChange={(e) => updatePosition(i, 'umlageschluessel', e.target.value)}
                    className="field-input text-sm"
                  >
                    <option value="wohnflaeche">{t('umlageschluessel_options.wohnflaeche')}</option>
                    <option value="wohneinheiten">{t('umlageschluessel_options.wohneinheiten')}</option>
                    <option value="verbrauch">{t('umlageschluessel_options.verbrauch')}</option>
                    <option value="personen">{t('umlageschluessel_options.personen')}</option>
                    <option value="sonstige">{t('umlageschluessel_options.sonstige')}</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Position hinzufügen */}
      <button
        type="button"
        onClick={addPosition}
        className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t('positionen.add')}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--outline-variant)] px-5 py-2.5 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50 transition-colors"
        >
          ← {t('wizard.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '...' : t('wizard.next')} →
        </button>
      </div>
    </div>
  );
}
