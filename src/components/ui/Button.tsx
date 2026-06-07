'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'launch';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-bg font-bold hover:bg-primary-hover',
  secondary:
    'bg-surface border border-border text-text-primary hover:bg-surface-hover',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary',
  danger:
    'bg-danger/12 text-danger border border-danger/30 hover:bg-danger/20',
  launch:
    'bg-primary text-bg font-bold hover:bg-primary-hover',
};

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  return (
    <span
      aria-hidden
      className="inline-block rounded-full border-2 border-bg/30 border-t-bg"
      style={{
        width: dim,
        height: dim,
        animation: 'ui-spin 0.8s linear infinite',
      }}
    />
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    full,
    loading,
    disabled,
    icon,
    iconPosition = 'left',
    children,
    className = '',
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-lg leading-tight',
        'transition-all duration-150 ease-out cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        full ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
