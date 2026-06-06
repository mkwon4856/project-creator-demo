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
      className="flex items-center justify-center px-8 py-5 border-b border-white/[0.06] bg-bg-elevated"
    >
      <ol className="flex items-center gap-0">
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
                  'flex items-center gap-2.5 px-2 py-1 rounded-md transition-colors duration-150 ease-out',
                  interactive ? 'cursor-pointer hover:bg-bg-hover' : 'cursor-default',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={[
                    'inline-flex w-7 h-7 items-center justify-center rounded-full text-[11px] font-medium leading-none',
                    done && 'bg-ube text-white',
                    active && 'bg-ube text-white shadow-[0_0_0_3px_var(--ube-tint)]',
                    !done && !active && 'border border-white/10 bg-bg-card text-text-secondary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? <Check size={14} aria-hidden /> : step}
                </span>
                <span
                  className={[
                    'text-sm leading-tight whitespace-nowrap',
                    done && 'text-text-primary',
                    active && 'text-ube-bright font-medium',
                    !done && !active && 'text-text-secondary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step}. {STEP_LABELS[step]}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={['mx-3 inline-block w-12 h-px', step < current ? 'bg-ube' : 'bg-white/10'].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
