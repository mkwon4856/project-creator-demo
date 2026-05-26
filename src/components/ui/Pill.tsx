'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

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
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

const STATUS_CLASSES: Record<PillStatus, string> = {
  live:
    'bg-green-500/15 text-green-400 border border-green-500/30',
  recruiting:
    'bg-ube/20 text-ube-bright border border-ube/40',
  completed:
    'bg-bg-hover text-text-secondary border border-white/10',
  review:
    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  paid:
    'bg-green-500/15 text-green-400 border border-green-500/30',
};

const VARIANT_DEFAULT =
  'bg-transparent border border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary';
const VARIANT_ACTIVE =
  'bg-ube text-white border border-ube';

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
        'transition-colors duration-150 ease-out',
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
