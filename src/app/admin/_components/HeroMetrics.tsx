'use client';

import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatCompactKRW, PLATFORM_METRICS } from '@/lib/mockAdmin';

export interface HeroMetricsProps {
  /** GMV in KRW (won). If undefined, falls back to mock. */
  gmv?: number;
  /** Platform fee in KRW (won). If undefined, falls back to mock. */
  platformFee?: number;
  /** GMV growth vs previous month, percent (e.g. 24.8 → "+24.8%"). */
  gmvGrowthPercent?: number;
  /** Platform fee growth vs previous month, percent. */
  feeGrowthPercent?: number;
  /** Active campaigns count. */
  activeCampaigns?: number;
  /** Verified creators count (all creators on platform). */
  verifiedCreators?: number;
  /** When true, every value is treated as authoritative — no "+N this week" mock copy. */
  fromDb?: boolean;
}

interface MetricSpec {
  label: string;
  value: string;
  delta: ReactNode;
  highlight?: 'gradient' | 'ube';
}

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

function formatPercent(n: number | undefined, fallback: number): string {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

export function HeroMetrics({
  gmv,
  platformFee,
  gmvGrowthPercent,
  feeGrowthPercent,
  activeCampaigns,
  verifiedCreators,
  fromDb = false,
}: HeroMetricsProps = {}) {
  const displayGmv = gmv ?? PLATFORM_METRICS.gmv;
  const displayFee = platformFee ?? PLATFORM_METRICS.platformFee;
  const displayActive = activeCampaigns ?? PLATFORM_METRICS.activeCampaigns;
  const displayCreators = verifiedCreators ?? PLATFORM_METRICS.verifiedCreators;

  const metrics: MetricSpec[] = [
    {
      label: '총 거래액 (GMV)',
      value: formatCompactKRW(displayGmv),
      delta: `전월 대비 ${formatPercent(gmvGrowthPercent, PLATFORM_METRICS.gmvGrowthPercent)}`,
      highlight: 'gradient',
    },
    {
      label: '플랫폼 수수료 (15%)',
      value: formatCompactKRW(displayFee),
      delta: formatPercent(feeGrowthPercent, PLATFORM_METRICS.feeGrowthPercent),
      highlight: 'ube',
    },
    {
      label: '활성 캠페인',
      value: displayActive.toLocaleString(),
      delta: fromDb ? '현재 진행중' : PLATFORM_METRICS.campaignsGrowth,
    },
    {
      label: '인증 크리에이터',
      value: displayCreators.toLocaleString(),
      delta: fromDb ? '플랫폼 전체' : PLATFORM_METRICS.creatorsGrowth,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map((m) => (
        <MetricCard key={m.label} spec={m} />
      ))}
    </div>
  );
}
