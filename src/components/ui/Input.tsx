'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

const FIELD_SHELL = [
  'flex items-center gap-2 px-3.5 py-2.5 rounded-lg',
  'bg-bg border border-border transition-all duration-150 ease-out',
  'focus-within:border-primary focus-within:ring-2 focus-within:ring-[rgba(167,139,250,0.25)]',
].join(' ');

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  /** 단위 (₩, 만, % 등) — 입력 우측 표시 */
  suffix?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    helper,
    error,
    icon,
    iconPosition = 'left',
    suffix,
    containerClassName = '',
    className = '',
    disabled,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `ui-input-${generatedId}`;
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['flex flex-col gap-1.5', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
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
        {icon && iconPosition === 'left' && (
          <span className="inline-flex shrink-0 text-text-muted">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={[
            'flex-1 min-w-0 bg-transparent border-none outline-none',
            'text-sm text-text-primary placeholder:text-text-muted',
            'disabled:cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {suffix && <span className="shrink-0 text-xs text-text-muted">{suffix}</span>}
        {icon && iconPosition === 'right' && (
          <span className="inline-flex shrink-0 text-text-muted">{icon}</span>
        )}
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

Input.displayName = 'Input';
