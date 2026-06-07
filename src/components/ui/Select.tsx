'use client';

import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';

const FIELD_SHELL = [
  'flex items-center rounded-lg bg-bg border border-border transition-all duration-150 ease-out',
  'focus-within:border-primary focus-within:ring-2 focus-within:ring-[rgba(167,139,250,0.25)]',
].join(' ');

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  containerClassName?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    label,
    helper,
    error,
    containerClassName = '',
    className = '',
    disabled,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? `ui-select-${generatedId}`;
  const helperId = helper ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['flex flex-col gap-1.5', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div
        className={[
          FIELD_SHELL,
          error ? 'border-danger focus-within:border-danger focus-within:ring-danger/25' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={[
            'w-full min-w-0 bg-transparent border-none outline-none appearance-none',
            'px-3.5 py-2.5 text-sm text-text-primary',
            'disabled:cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p id={errorId} className="text-[11px] text-danger">
          {error}
        </p>
      ) : (
        helper && (
          <p id={helperId} className="text-[11px] text-text-secondary">
            {helper}
          </p>
        )
      )}
    </div>
  );
});

Select.displayName = 'Select';
