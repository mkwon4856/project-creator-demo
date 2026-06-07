'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'aria-label'> {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  'aria-label': string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, disabled, className = '', 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={[
        'relative inline-flex w-10 h-5 shrink-0 rounded-full transition-colors duration-150 ease-out',
        'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-primary' : 'bg-surface-hover border border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span
        aria-hidden
        className={[
          'absolute top-0.5 inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-150 ease-out',
          checked ? 'left-[20px]' : 'left-0.5',
        ].join(' ')}
      />
    </button>
  );
});

Switch.displayName = 'Switch';
