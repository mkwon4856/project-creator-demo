'use client';

import { Check } from 'lucide-react';

import { STEP_LABELS, type WizardStep } from '../_types';

const STEPS: WizardStep[] = [1, 2, 3, 4, 5];

export interface StepperProps {
  current: WizardStep;
  onJump?: (step: WizardStep) => void;
}

export function Stepper({ current, onJump }: StepperProps) {
  return (
    <nav
      aria-label="작성 진행 상황"
      className="overflow-x-auto border-b border-border bg-bg-elevated"
    >
      <ol className="flex items-center gap-0 min-w-max mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-5">
        {STEPS.map((step, i) => {
          const done = step < current;
          const active = step === current;
          const interactive = Boolean(onJump) && (done || active);

          return (
            <li key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => interactive && onJump?.(step)}
                disabled={!interactive}
                className={[
                  'flex items-center gap-1.5 sm:gap-2.5 px-1 sm:px-2 py-1 rounded-md transition-colors duration-150 ease-out shrink-0',
                  interactive ? 'cursor-pointer hover:bg-bg-hover' : 'cursor-default',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={[
                    'inline-flex w-7 h-7 items-center justify-center rounded-full text-[11px] font-medium leading-none',
                    done && 'bg-primary text-bg',
                    active && 'bg-primary text-bg ring-2 ring-primary-dim',
                    !done && !active && 'border border-border bg-surface text-text-secondary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? <Check size={14} aria-hidden /> : step}
                </span>
                <span
                  className={[
                    'text-xs sm:text-sm leading-tight whitespace-nowrap',
                    done && 'text-text-primary',
                    active && 'text-primary font-medium',
                    !done && !active && 'text-text-secondary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="sm:hidden">{STEP_LABELS[step]}</span>
                  <span className="hidden sm:inline">
                    {step}. {STEP_LABELS[step]}
                  </span>
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={['mx-1.5 sm:mx-3 inline-block w-6 sm:w-12 h-px shrink-0', step < current ? 'bg-primary' : 'bg-border'].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
