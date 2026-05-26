'use client';

import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { PLATFORM_METRICS } from '@/lib/mockAdmin';

interface MetricSpec {
  label: string;
  value: string;
  delta: ReactNode;
  highlight?: 'gradient' | 'ube';
}

const METRICS: MetricSpec[] = [
  {
    label: 'Gross merchandise value',
    value: '₩33.5M',
    delta: `+${PLATFORM_METRICS.gmvGrowthPercent.toFixed(1)}% vs last month`,
    highlight: 'gradient',
  },
  {
    label: 'Platform fee (15%)',
    value: '₩5.0M',
    delta: `+${PLATFORM_METRICS.feeGrowthPercent.toFixed(1)}%`,
    highlight: 'ube',
  },
  {
    label: 'Active campaigns',
    value: PLATFORM_METRICS.activeCampaigns.toString(),
    delta: PLATFORM_METRICS.campaignsGrowth,
  },
  {
    label: 'Verified creators',
    value: PLATFORM_METRICS.verifiedCreators.toLocaleString(),
    delta: PLATFORM_METRICS.creatorsGrowth,
  },
];

function MetricCard({ spec }: { spec: MetricSpec }) {
  const isGradient = spec.highlight === 'gradient';

  return (
    <div
      className={[
        'rounded-lg p-5 flex flex-col gap-2 border',
        isGradient
          ? 'border-ube/40 text-white'
          : 'bg-bg-card border-white/[0.06] text-text-primary',
      ].join(' ')}
      style={
        isGradient
          ? {
              background: 'linear-gradient(135deg, var(--ube), var(--ube-dark))',
              boxShadow: '0 8px 24px rgba(123,94,167,0.25)',
            }
          : undefined
      }
    >
      <span
        className={[
          'text-[11px] font-semibold uppercase tracking-wider',
          isGradient ? 'text-white/85' : 'text-text-secondary',
        ].join(' ')}
      >
        {spec.label}
      </span>
      <span
        className={[
          'text-3xl font-medium tracking-tight tabular-nums leading-tight',
          spec.highlight === 'ube' ? 'text-ube-bright' : '',
        ].join(' ')}
      >
        {spec.value}
      </span>
      <span
        className={[
          'inline-flex items-center gap-1 text-[11px] tabular-nums',
          isGradient ? 'text-white/85' : 'text-text-secondary',
        ].join(' ')}
      >
        <TrendingUp
          size={12}
          aria-hidden
          className={isGradient ? 'text-white/85' : 'text-green-400'}
        />
        <span>{spec.delta}</span>
      </span>
    </div>
  );
}

export function HeroMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {METRICS.map((m) => (
        <MetricCard key={m.label} spec={m} />
      ))}
    </div>
  );
}
