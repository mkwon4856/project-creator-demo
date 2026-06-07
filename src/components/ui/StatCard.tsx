'use client';

import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string;
  /** Optional change indicator, e.g. "+12%" or "-3건" */
  delta?: string;
  deltaVariant?: 'success' | 'danger';
  /** Optional secondary line below the value */
  sub?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaVariant = 'success',
  sub,
}: StatCardProps) {
  return (
    <Card variant="default" padding="lg">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold tabular-nums leading-tight text-text-primary">
            {value}
          </span>
          {delta && (
            <span
              className={[
                'text-xs font-medium tabular-nums',
                deltaVariant === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {delta}
            </span>
          )}
        </div>
        {sub && <span className="text-xs text-text-secondary">{sub}</span>}
      </div>
    </Card>
  );
}
