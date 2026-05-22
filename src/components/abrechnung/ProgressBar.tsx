'use client';

type Props = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export function ProgressBar({ currentStep, totalSteps, labels }: Props) {
  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Mobile: Step counter + progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[var(--on-surface)]">
            {labels[currentStep - 1]}
          </p>
          <p className="text-xs text-[var(--on-surface-variant)]">
            {currentStep}/{totalSteps}
          </p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--surface-container-high)]">
          <div
            className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Schritt-Labels */}
      <div className="hidden sm:flex items-center gap-0">
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isDone
                      ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                      : isActive
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] ring-4 ring-[var(--primary)]/20'
                      : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : isDone
                      ? 'text-[var(--on-surface-variant)]'
                      : 'text-[var(--on-surface-variant)] opacity-50'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Verbindungslinie */}
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mt-[-12px] transition-colors ${
                    isDone ? 'bg-[var(--primary)]' : 'bg-[var(--outline-variant)]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
