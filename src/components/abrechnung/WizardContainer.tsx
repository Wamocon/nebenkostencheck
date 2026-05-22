'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ProgressBar } from './ProgressBar';
import { Step1Grunddaten } from './Step1Grunddaten';
import { Step2Positionen } from './Step2Positionen';
import { Step3Heizkosten } from './Step3Heizkosten';
import { Step4Summary } from './Step4Summary';
import {
  createAbrechnung,
  savePositionen,
  saveHeizkosten,
  startPruefungAction,
} from '@/app/[locale]/dashboard/abrechnung/actions';
import type {
  BetrkvCategory,
  WizardStep1Data,
  WizardPositionInput,
  WizardStep3Data,
} from '@/types';

type Props = {
  locale: string;
  kategorien: BetrkvCategory[];
};

export function WizardContainer({ locale, kategorien }: Props) {
  const t = useTranslations('abrechnung');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(1);
  const [abrechnungId, setAbrechnungId] = useState<string | null>(null);

  // Formulardaten zwischen Steps bewahren
  const [step1Data, setStep1Data] = useState<WizardStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<WizardPositionInput[]>([]);
  const [step3Data, setStep3Data] = useState<WizardStep3Data | null>(null);

  const stepLabels = [
    t('wizard.step1'),
    t('wizard.step2'),
    t('wizard.step3'),
    t('wizard.step4'),
  ];

  // --- Step 1: Grunddaten ---------------------------------------------------

  const handleStep1Submit = (data: WizardStep1Data) => {
    startTransition(async () => {
      setStep1Data(data);

      if (abrechnungId) {
        // Update vorhandene Abrechnung
        const result = await createAbrechnung(data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
      } else {
        const result = await createAbrechnung(data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setAbrechnungId(result.data.id);
      }

      setCurrentStep(2);
    });
  };

  // --- Step 2: Positionen ---------------------------------------------------

  const handleStep2Submit = (data: WizardPositionInput[]) => {
    if (!abrechnungId) return;
    startTransition(async () => {
      const result = await savePositionen(abrechnungId, data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setStep2Data(data);
      setCurrentStep(3);
    });
  };

  // --- Step 3: Heizkosten --------------------------------------------------

  const handleStep3Submit = (data: WizardStep3Data) => {
    if (!abrechnungId) return;
    startTransition(async () => {
      const result = await saveHeizkosten(abrechnungId, data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setStep3Data(data);
      setCurrentStep(4);
    });
  };

  // --- Step 4: Prüfung starten ---------------------------------------------

  const handleStartPruefung = () => {
    if (!abrechnungId) return;
    startTransition(async () => {
      const result = await startPruefungAction(abrechnungId, locale);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push(result.data.redirectUrl);
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
          {t('wizard.title_new')}
        </h1>
        <p className="text-sm text-zinc-500">{t('wizard.step_of', { current: currentStep, total: 4 })}</p>
      </div>

      {/* Progress */}
      <ProgressBar currentStep={currentStep} totalSteps={4} labels={stepLabels} />

      {/* Step Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-5">
          {stepLabels[currentStep - 1]}
        </h2>

        {currentStep === 1 && (
          <Step1Grunddaten
            initialData={step1Data ?? undefined}
            onNext={handleStep1Submit}
            isLoading={isPending}
          />
        )}

        {currentStep === 2 && (
          <Step2Positionen
            kategorien={kategorien}
            initialData={step2Data}
            onNext={handleStep2Submit}
            onBack={() => setCurrentStep(1)}
            isLoading={isPending}
          />
        )}

        {currentStep === 3 && step3Data !== undefined && (
          <Step3Heizkosten
            initialData={step3Data ?? undefined}
            onNext={handleStep3Submit}
            onBack={() => setCurrentStep(2)}
            isLoading={isPending}
          />
        )}

        {currentStep === 4 && step1Data && step3Data && (
          <Step4Summary
            step1={step1Data}
            step2={step2Data}
            step3={step3Data}
            kategorien={kategorien}
            onStart={handleStartPruefung}
            onBack={() => setCurrentStep(3)}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}
