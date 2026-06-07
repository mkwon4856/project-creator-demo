'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { statusToBadgeVariant } from './Badge';

export type PillVariant = 'default' | 'active' | 'status';
export type PillStatus = 'live' | 'recruiting' | 'completed' | 'review' | 'paid';
export type PillSize = 'sm' | 'md';

export interface PillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: PillVariant;
  status?: PillStatus;
  size?: PillSize;
  icon?: ReactNode;
  children: ReactNode;
}

const SIZE_CLASSES: Record<PillSize, string> = {
  sm: 'px-2.5 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

const STATUS_VARIANT_CLASS: Record<
  ReturnType<typeof statusToBadgeVariant>,
  string
> = {
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  neutral: 'bg-surface-hover text-text-secondary',
};

const STATUS_CLASSES: Record<PillStatus, string> = {
  live: STATUS_VARIANT_CLASS[statusToBadgeVariant('live')],
  recruiting: STATUS_VARIANT_CLASS[statusToBadgeVariant('recruiting')],
  completed: STATUS_VARIANT_CLASS[statusToBadgeVariant('completed')],
  review: STATUS_VARIANT_CLASS[statusToBadgeVariant('review')],
  paid: STATUS_VARIANT_CLASS[statusToBadgeVariant('paid')],
};

const VARIANT_DEFAULT =
  'bg-transparent border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary';
const VARIANT_ACTIVE =
  'bg-primary text-bg font-bold border border-primary hover:bg-primary-hover';

export const Pill = forwardRef<HTMLSpanElement, PillProps>(function Pill(
  {
    variant = 'default',
    status,
    size = 'md',
    icon,
    onClick,
    children,
    className = '',
    role,
    tabIndex,
    ...rest
  },
  ref,
) {
  const variantClass =
    variant === 'active'
      ? VARIANT_ACTIVE
      : variant === 'status' && status
        ? STATUS_CLASSES[status]
        : VARIANT_DEFAULT;

  const interactive = Boolean(onClick);

  return (
    <span
      ref={ref}
      onClick={onClick}
      role={role ?? (interactive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      }}
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap',
        'transition-all duration-150 ease-out',
        interactive ? 'cursor-pointer' : '',
        SIZE_CLASSES[size],
        variantClass,
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

Pill.displayName = 'Pill';
