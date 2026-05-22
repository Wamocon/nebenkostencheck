'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { parsePdfAction } from '@/app/[locale]/dashboard/abrechnung/actions';
import type { ParsedPdfData } from '@/types';

type Props = {
  onParsed: (data: ParsedPdfData) => void;
  onSkip: () => void;
};

export function PdfUpload({ onParsed, onSkip }: Props) {
  const t = useTranslations('abrechnung.pdf_upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedPdfData | null>(null);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error(t('error_not_pdf'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('error_too_large'));
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await parsePdfAction(fd);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setResult(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Drag & Drop -----------------------------------------------------------

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // --- Success state ---------------------------------------------------------

  if (result) {
    const { fields_found, positions_count } = result.confidence;
    const total = fields_found + positions_count;

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                {t('fields_found', { count: total })}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('positions_found', { count: positions_count })}
              </p>
            </div>
          </div>

          {/* Preview of recognized data */}
          <div className="mt-4 space-y-1 text-xs text-green-700 dark:text-green-300">
            {result.step1.jahr && <div>✓ Abrechnungsjahr: <strong>{result.step1.jahr}</strong></div>}
            {result.step1.vermieter_name && <div>✓ Vermieter: <strong>{result.step1.vermieter_name}</strong></div>}
            {result.step1.wohnflaeche_qm && <div>✓ Wohnfläche: <strong>{result.step1.wohnflaeche_qm} m²</strong></div>}
            {result.step1.saldo != null && (
              <div>
                ✓ {result.step1.saldo >= 0 ? 'Nachzahlung' : 'Guthaben'}: <strong>
                  {Math.abs(result.step1.saldo).toFixed(2)} €
                </strong>
              </div>
            )}
            {positions_count > 0 && (
              <div>✓ Positionen: <strong>{result.positions.map((p) => p.recognized_name).join(', ')}</strong></div>
            )}
          </div>
        </div>

        <p className="text-sm text-[var(--on-surface-variant)]">{t('check_fields')}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-lg border border-[var(--outline-variant)] px-4 py-2.5 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50 transition-colors"
          >
            Andere PDF wählen
          </button>
          <button
            type="button"
            onClick={() => onParsed(result)}
            className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            {t('continue')} →
          </button>
        </div>
      </div>
    );
  }

  // --- Upload state ----------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* Hint */}
      <div className="rounded-xl bg-[var(--secondary-container)]/30 border border-[var(--secondary)]/30 p-3 flex gap-2.5">
        <svg className="w-4 h-4 text-[var(--secondary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-[var(--on-surface-variant)]">{t('hint')}</p>
      </div>

      {/* Drop Zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={isLoading}
        className={`w-full rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
            : 'border-[var(--outline-variant)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium text-[var(--on-surface-variant)]">{t('uploading')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--on-surface)]">{t('drag_drop')}</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">{t('accepted')}</p>
            </div>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Skip button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
        >
          {t('skip')} →
        </button>
      </div>
    </div>
  );
}
