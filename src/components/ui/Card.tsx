'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'featured';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default:
    'bg-bg-card border border-white/[0.06] rounded-lg',
  elevated:
    'bg-bg-elevated border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
  featured:
    'border border-ube/40 rounded-lg',
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 'md',
    hover = false,
    onClick,
    children,
    className = '',
    style,
    role,
    tabIndex,
    ...rest
  },
  ref,
) {
  const featuredStyle =
    variant === 'featured'
      ? {
          background:
            'linear-gradient(135deg, var(--ube-tint), var(--ube-tint-strong))',
        }
      : undefined;

  const isInteractive = Boolean(onClick) || hover;

  return (
    <div
      ref={ref}
      onClick={onClick}
      role={role ?? (onClick ? 'button' : undefined)}
      tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className={[
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        isInteractive
          ? 'transition-colors duration-150 ease-out cursor-pointer hover:border-ube/60'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...featuredStyle, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
