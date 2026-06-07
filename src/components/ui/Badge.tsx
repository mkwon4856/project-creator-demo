'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type BadgeVariant =
  | 'primary'
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
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-primary-dim text-primary',
  ube: 'bg-primary-dim text-primary',
  'ube-glow': 'bg-primary-dim text-primary',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  neutral: 'bg-surface-hover text-text-secondary',
};

/** 상태 문자열 → Badge variant (active/approved/completed → success 등) */
export function statusToBadgeVariant(
  status: string,
): Extract<BadgeVariant, 'success' | 'warning' | 'danger' | 'neutral'> {
  const key = status.toLowerCase();
  if (
    key === 'active' ||
    key === 'approved' ||
    key === 'completed' ||
    key === 'live' ||
    key === 'paid'
  ) {
    return 'success';
  }
  if (
    key === 'pending' ||
    key === 'draft' ||
    key === 'processing' ||
    key === 'review' ||
    key === 'recruiting'
  ) {
    return 'warning';
  }
  if (key === 'rejected' || key === 'closed') {
    return 'danger';
  }
  return 'neutral';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', size = 'sm', icon, children, className = '', ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';
