'use client';

import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { WizardStep3Data } from '@/types';

const schema = z.object({
  gesamtkosten: z.coerce.number().min(0),
  verbrauchsanteil_prozent: z.coerce.number().min(0).max(100),
  grundkostenanteil_prozent: z.coerce.number().min(0).max(100),
}).refine(
  (d) => Math.abs(d.verbrauchsanteil_prozent + d.grundkostenanteil_prozent - 100) < 0.01,
  { message: 'sum_100', path: ['grundkostenanteil_prozent'] }
);

type FormData = z.infer<typeof schema>;

type Props = {
  initialData?: Partial<WizardStep3Data>;
  onNext: (data: WizardStep3Data) => void;
  onBack: () => void;
  isLoading: boolean;
};

export function Step3Heizkosten({ initialData, onNext, onBack, isLoading }: Props) {
  const t = useTranslations('abrechnung');
  const tVal = useTranslations('abrechnung.validation');

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as unknown as Resolver<FormData>,
      defaultValues: {
        gesamtkosten: initialData?.gesamtkosten ?? 0,
        verbrauchsanteil_prozent: initialData?.verbrauchsanteil_prozent ?? 70,
        grundkostenanteil_prozent: initialData?.grundkostenanteil_prozent ?? 30,
      },
    });

  const verbrauch = watch('verbrauchsanteil_prozent') as number;

  // Grundkostenanteil automatisch berechnen
  const handleVerbrauchChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setValue('verbrauchsanteil_prozent', num);
    setValue('grundkostenanteil_prozent', Math.max(0, 100 - num));
  };

  return (
    <form onSubmit={handleSubmit((data) => onNext(data as unknown as WizardStep3Data))} className="space-y-6">
      {/* HKVO Hinweis */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-700 dark:text-blue-300">{t('heizkosten.hint')}</p>
        </div>
      </div>

      {/* Gesamtheizkosten */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {t('heizkosten.gesamtkosten')} *
        </label>
        <div className="relative max-w-xs">
          <input
            type="number"
            step="0.01"
            {...register('gesamtkosten')}
            className="field-input pr-8"
            placeholder="0,00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">€</span>
        </div>
        {errors.gesamtkosten && <p className="field-error">{tVal('positive_number')}</p>}
      </div>

      {/* Verbrauchsanteil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {t('heizkosten.verbrauchsanteil')} *
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              min={0}
              max={100}
              value={verbrauch}
              {...register('verbrauchsanteil_prozent')}
              onChange={(e) => handleVerbrauchChange(e.target.value)}
              className="field-input pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
          </div>
          {/* HKVO Indikator */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {verbrauch >= 50 && verbrauch <= 70 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-600 dark:text-green-400">HKVO-konform (50-70%)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-600 dark:text-red-400">HKVO-Verstoß: muss 50-70% sein</span>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {t('heizkosten.grundkostenanteil')} *
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              min={0}
              max={100}
              {...register('grundkostenanteil_prozent')}
              className="field-input pr-8 bg-[var(--muted)]"
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Wird automatisch berechnet</p>
        </div>
      </div>

      {errors.grundkostenanteil_prozent && (
        <p className="field-error">{tVal('verbrauch_sum')}</p>
      )}

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
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors"
        >
          {isLoading ? '...' : t('wizard.next')} →
        </button>
      </div>
    </form>
  );
}
