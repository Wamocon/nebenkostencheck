'use client';

import { useTranslations } from 'next-intl';
import type { WizardStep1Data, WizardPositionInput, WizardStep3Data, BetrkvCategory } from '@/types';

type Props = {
  step1: WizardStep1Data;
  step2: WizardPositionInput[];
  step3: WizardStep3Data;
  kategorien: BetrkvCategory[];
  onStart: () => void;
  onBack: () => void;
  isLoading: boolean;
};

export function Step4Summary({ step1, step2, step3, kategorien, onStart, onBack, isLoading }: Props) {
  const t = useTranslations('abrechnung');

  const getKatName = (id: string | null, freitext: string) => {
    if (!id) return freitext || 'Sonstige';
    return kategorien.find((k) => k.id === id)?.name_de ?? freitext;
  };

  const gesamtMieterAnteil = step2.reduce((sum, p) => sum + (p.mieter_anteil || 0), 0);

  return (
    <div className="space-y-6">
      {/* Grunddaten */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">1</span>
          {t('wizard.step1')}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm bg-[var(--muted)] dark:bg-zinc-900 rounded-xl p-4">
          <span className="text-zinc-500">{t('fields.jahr')}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{step1.jahr}</span>
          <span className="text-zinc-500">{t('fields.zugangsdatum')}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {new Date(step1.zugangsdatum).toLocaleDateString('de-DE')}
          </span>
          <span className="text-zinc-500">{t('fields.vermieter_name')}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{step1.vermieter_name}</span>
          <span className="text-zinc-500">{t('fields.wohnflaeche')}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{step1.wohnflaeche_qm} m²</span>
          {step1.saldo != null && (
            <>
              <span className="text-zinc-500">{t('fields.saldo')}</span>
              <span className={`font-medium ${step1.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {step1.saldo > 0 ? '+' : ''}{step1.saldo.toFixed(2)} €
              </span>
            </>
          )}
        </div>
      </section>

      {/* Positionen */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">2</span>
          {t('wizard.step2')} ({step2.length} Positionen)
        </h3>
        <div className="bg-[var(--muted)] dark:bg-zinc-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Kostenart</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500">Ihr Anteil</th>
              </tr>
            </thead>
            <tbody>
              {step2.map((pos, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                    {getKatName(pos.betrkv_category_id, pos.freitext_kategorie)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {pos.mieter_anteil.toFixed(2)} €
                  </td>
                </tr>
              ))}
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">Gesamt</td>
                <td className="px-4 py-2.5 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  {gesamtMieterAnteil.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Heizkosten */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">3</span>
          {t('wizard.step3')}
        </h3>
        <div className="grid grid-cols-3 gap-2 text-sm bg-[var(--muted)] dark:bg-zinc-900 rounded-xl p-4">
          <div className="text-center">
            <p className="text-xs text-zinc-500 mb-1">{t('heizkosten.gesamtkosten')}</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{step3.gesamtkosten.toFixed(2)} €</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500 mb-1">Verbrauchsanteil</p>
            <p className={`font-semibold ${step3.verbrauchsanteil_prozent >= 50 && step3.verbrauchsanteil_prozent <= 70 ? 'text-green-600' : 'text-red-600'}`}>
              {step3.verbrauchsanteil_prozent}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500 mb-1">Grundkostenanteil</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{step3.grundkostenanteil_prozent}%</p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          ← {t('wizard.back')}
        </button>
        <button
          type="button"
          onClick={onStart}
          disabled={isLoading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('wizard.checking')}
            </>
          ) : (
            <>
              {t('wizard.start_check')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
