'use client';

type Props = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export function ProgressBar({ currentStep, totalSteps, labels }: Props) {
  return (
    <div className="w-full mb-8">
      {/* Mobile: Step X von Y */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:hidden">
        Schritt {currentStep} von {totalSteps}
      </p>

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
                      ? 'bg-[var(--primary)] text-white'
                      : isActive
                      ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
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
                      ? 'text-zinc-600 dark:text-zinc-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Verbindungslinie */}
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mt-[-12px] transition-colors ${
                    isDone ? 'bg-[var(--primary)]' : 'bg-zinc-200 dark:bg-zinc-700'
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
