'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from './Button';

export interface EmptyStateAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  /** Optional icon — omitted for dashboard-style empty states. */
  icon?: ReactNode;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  /** Optional helper hint shown below actions. Will be prefixed with 💡. */
  tip?: string;
  /** Optional extra wrapper class. */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tip,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        'text-center py-16 px-8',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div
          aria-hidden
          className="w-14 h-14 rounded-full bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-4 text-text-muted"
        >
          {icon}
        </div>
      )}

      <h3 className="text-sm font-medium text-text-primary mb-2">{title}</h3>

      <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col items-center gap-2.5">
          {primaryAction && (
            <Link href={primaryAction.href} className="inline-flex">
              <Button variant="primary" size="md">
                {primaryAction.label}
              </Button>
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="text-xs text-primary hover:underline transition-colors duration-150 ease-out"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}

      {tip && (
        <div className="mt-6 max-w-sm mx-auto rounded-lg bg-bg-elevated border border-border p-3 text-xs text-text-secondary leading-relaxed text-left">
          <span aria-hidden className="mr-1.5">💡</span>
          {tip}
        </div>
      )}
    </div>
  );
}
