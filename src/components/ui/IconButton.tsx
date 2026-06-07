'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  'aria-label': string;
  size?: IconButtonSize;
  children: ReactNode;
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    size = 'sm',
    children,
    className = '',
    type = 'button',
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={[
        'inline-flex items-center justify-center rounded-md',
        'bg-transparent text-text-secondary',
        'hover:bg-surface-hover hover:text-text-primary',
        'transition-colors duration-150 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';
