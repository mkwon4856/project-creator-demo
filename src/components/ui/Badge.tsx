'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type BadgeVariant =
  | 'ube'
  | 'ube-glow'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export type BadgeSize = 'xs' | 'sm';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  ube:
    'bg-ube/15 text-ube-bright border border-ube/30',
  'ube-glow':
    'bg-ube/20 text-ube-bright border border-ube/50',
  success:
    'bg-green-500/15 text-green-400 border border-green-500/30',
  warning:
    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:
    'bg-red-500/15 text-red-400 border border-red-500/30',
  neutral:
    'bg-bg-hover text-text-secondary border border-white/10',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', size = 'xs', icon, children, className = '', style, ...rest },
  ref,
) {
  const glowStyle =
    variant === 'ube-glow'
      ? { boxShadow: '0 0 12px rgba(155,126,200,0.3)' }
      : undefined;

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-1 rounded font-medium leading-none whitespace-nowrap',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...glowStyle, ...style }}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';
