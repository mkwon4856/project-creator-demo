'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'launch';
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
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-ube text-white hover:bg-ube-dark shadow-sm shadow-black/30',
  ghost:
    'bg-transparent border border-white/10 text-text-primary hover:bg-bg-hover hover:border-white/20',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  launch:
    'text-white border border-ube/40',
};

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  return (
    <span
      aria-hidden
      className="inline-block rounded-full border-2 border-white/30 border-t-white"
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
    style,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const launchStyle =
    variant === 'launch'
      ? {
          background:
            'linear-gradient(135deg, var(--ube-bright), var(--ube))',
          boxShadow: '0 4px 16px rgba(155,126,200,0.45)',
        }
      : undefined;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium leading-tight',
        'transition-all duration-150 ease-out cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ube/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        full ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...launchStyle, ...style }}
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
