'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import type { CardPadding } from './Card';

export interface SelectableCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  selected?: boolean;
  padding?: CardPadding;
  children: ReactNode;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const SelectableCard = forwardRef<HTMLDivElement, SelectableCardProps>(
  function SelectableCard(
    { selected = false, padding = 'md', onClick, children, className = '', ...rest },
    ref,
  ) {
    const interactive = Boolean(onClick);

    return (
      <div
        ref={ref}
        onClick={onClick}
        role={rest.role ?? (interactive ? 'button' : undefined)}
        tabIndex={rest.tabIndex ?? (interactive ? 0 : undefined)}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        className={[
          'rounded-xl transition-colors duration-150 ease-out',
          selected
            ? 'bg-primary-dim border border-primary ring-1 ring-primary'
            : 'bg-surface border border-border',
          interactive
            ? 'cursor-pointer hover:bg-surface-hover hover:border-text-muted'
            : '',
          PADDING_CLASSES[padding],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

SelectableCard.displayName = 'SelectableCard';
