'use client';

import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { WizardStep1Data } from '@/types';

const schema = z.object({
  jahr: z.coerce.number().min(2000).max(2100),
  zugangsdatum: z.string().min(1),
  vermieter_name: z.string().min(1),
  vermieter_adresse: z.string(),
  wohnflaeche_qm: z.coerce.number().positive(),
  vorauszahlung_monatlich: z.coerce.number().nullable(),
  saldo: z.coerce.number().nullable(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  initialData?: Partial<WizardStep1Data>;
  onNext: (data: WizardStep1Data) => void;
  isLoading: boolean;
};

export function Step1Grunddaten({ initialData, onNext, isLoading }: Props) {
  const t = useTranslations('abrechnung');
  const tVal = useTranslations('abrechnung.validation');

  const currentYear = new Date().getFullYear();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      jahr: initialData?.jahr ?? currentYear - 1,
      zugangsdatum: initialData?.zugangsdatum ?? '',
      vermieter_name: initialData?.vermieter_name ?? '',
      vermieter_adresse: initialData?.vermieter_adresse ?? '',
      wohnflaeche_qm: initialData?.wohnflaeche_qm ?? undefined,
      vorauszahlung_monatlich: initialData?.vorauszahlung_monatlich ?? null,
      saldo: initialData?.saldo ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => onNext(data as unknown as WizardStep1Data))} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Abrechnungsjahr */}
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
            {t('fields.jahr')} *
          </label>
          <input
            type="number"
            {...register('jahr')}
            className="field-input"
            min={2000}
            max={currentYear}
          />
          {errors.jahr && <p className="field-error">{tVal('invalid_number')}</p>}
        </div>

        {/* Zugangsdatum */}
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
            {t('fields.zugangsdatum')} *
          </label>
          <input type="date" {...register('zugangsdatum')} className="field-input" />
          <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{t('fields.zugangsdatum_hint')}</p>
          {errors.zugangsdatum && <p className="field-error">{tVal('required')}</p>}
        </div>
      </div>

      {/* Vermieter Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
          {t('fields.vermieter_name')} *
        </label>
        <input type="text" {...register('vermieter_name')} className="field-input" />
        {errors.vermieter_name && <p className="field-error">{tVal('required')}</p>}
      </div>

      {/* Vermieter Adresse */}
      <div>
        <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
          {t('fields.vermieter_adresse')}
        </label>
        <textarea
          {...register('vermieter_adresse')}
          rows={2}
          className="field-input resize-none"
          placeholder="Musterstraße 1, 12345 Musterstadt"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Wohnfläche */}
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
            {t('fields.wohnflaeche')} *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('wohnflaeche_qm')}
              className="field-input pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--on-surface-variant)]">m²</span>
          </div>
          {errors.wohnflaeche_qm && <p className="field-error">{tVal('positive_number')}</p>}
        </div>

        {/* Vorauszahlung */}
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
            {t('fields.vorauszahlung')}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('vorauszahlung_monatlich')}
              className="field-input pr-8"
              placeholder="0,00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--on-surface-variant)]">€</span>
          </div>
        </div>

        {/* Saldo */}
        <div>
          <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
            {t('fields.saldo')}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('saldo')}
              className="field-input pr-8"
              placeholder="0,00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--on-surface-variant)]">€</span>
          </div>
          <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{t('fields.saldo_hint')}</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? '...' : t('wizard.next')} →
        </button>
      </div>
    </form>
  );
}
