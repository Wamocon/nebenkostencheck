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
import { PdfUpload } from './PdfUpload';
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
  ParsedPdfData,
} from '@/types';

type Phase = 'upload' | 'wizard';

type Props = {
  locale: string;
  kategorien: BetrkvCategory[];
};

export function WizardContainer({ locale, kategorien }: Props) {
  const t = useTranslations('abrechnung');
  const tPdf = useTranslations('abrechnung.pdf_upload');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('upload');
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

  // --- PDF parsed: pre-fill wizard data ------------------------------------

  const handlePdfParsed = (data: ParsedPdfData) => {
    // Pre-fill Step1
    if (Object.keys(data.step1).length > 0) {
      setStep1Data({
        jahr: data.step1.jahr ?? new Date().getFullYear() - 1,
        zugangsdatum: data.step1.zugangsdatum ?? '',
        vermieter_name: data.step1.vermieter_name ?? '',
        vermieter_adresse: data.step1.vermieter_adresse ?? '',
        wohnflaeche_qm: data.step1.wohnflaeche_qm ?? 0,
        vorauszahlung_monatlich: data.step1.vorauszahlung_monatlich ?? null,
        saldo: data.step1.saldo ?? null,
      });
    }

    // Pre-fill Step2 from recognized positions
    if (data.positions.length > 0) {
      const positionen: WizardPositionInput[] = data.positions.map((p) => ({
        betrkv_category_id: null, // user selects from dropdown
        freitext_kategorie: p.recognized_name,
        gesamtbetrag: p.gesamtbetrag,
        umlageschluessel: '',
        mieter_anteil: p.mieter_anteil,
      }));
      setStep2Data(positionen);
    }

    // Pre-fill Step3
    if (data.step3.gesamtkosten) {
      setStep3Data({
        gesamtkosten: data.step3.gesamtkosten,
        verbrauchsanteil_prozent: data.step3.verbrauchsanteil_prozent ?? 70,
        grundkostenanteil_prozent: data.step3.grundkostenanteil_prozent ?? 30,
      });
    }

    setPhase('wizard');
  };

  // --- Step 1: Grunddaten ---------------------------------------------------

  const handleStep1Submit = (data: WizardStep1Data) => {
    startTransition(async () => {
      setStep1Data(data);

      const result = await createAbrechnung(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setAbrechnungId(result.data.id);
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

  // --- Upload Phase ---------------------------------------------------------

  if (phase === 'upload') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--on-surface)] mb-1">
            {t('wizard.title_new')}
          </h1>
          <p className="text-sm text-[var(--on-surface-variant)]">{tPdf('subtitle')}</p>
        </div>

        <div className="elevation-1 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--on-surface)] mb-4 sm:mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {tPdf('title')}
          </h2>

          <PdfUpload onParsed={handlePdfParsed} onSkip={() => setPhase('wizard')} />
        </div>
      </div>
    );
  }

  // --- Wizard Phase ---------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--on-surface)] mb-1">
          {t('wizard.title_new')}
        </h1>
        <p className="text-sm text-[var(--on-surface-variant)]">{t('wizard.step_of', { current: currentStep, total: 4 })}</p>
      </div>

      {/* Progress */}
      <ProgressBar currentStep={currentStep} totalSteps={4} labels={stepLabels} />

      {/* Step Content */}
      <div className="elevation-1 rounded-2xl p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--on-surface)] mb-4 sm:mb-5">
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
