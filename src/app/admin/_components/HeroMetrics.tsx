'use client';



import { TrendingUp } from 'lucide-react';

import type { ReactNode } from 'react';



import { Card } from '@/components/ui';

import { formatCompactKRW } from '@/lib/formatCurrency';



export interface HeroMetricsProps {

  /** GMV in KRW (won). */

  gmv?: number;

  /** Platform fee in KRW (won). */

  platformFee?: number;

  /** GMV growth vs previous month, percent (e.g. 24.8 → "+24.8%"). */

  gmvGrowthPercent?: number;

  /** Platform fee growth vs previous month, percent. */

  feeGrowthPercent?: number;

  /** Active campaigns count. */

  activeCampaigns?: number;

  /** Verified creators count (all creators on platform). */

  verifiedCreators?: number;

  /** When true, metrics are sourced from Supabase. */

  fromDb?: boolean;

}



interface MetricSpec {

  label: string;

  value: string;

  delta: ReactNode;

  highlight?: 'featured' | 'primary';

}



function MetricCard({ spec }: { spec: MetricSpec }) {

  const isFeatured = spec.highlight === 'featured';



  return (

    <Card variant={isFeatured ? 'featured' : 'default'} padding="md" className="flex flex-col gap-2">

      <span

        className={[

          'text-[11px] font-semibold uppercase tracking-wider',

          isFeatured ? 'text-primary' : 'text-text-secondary',

        ].join(' ')}

      >

        {spec.label}

      </span>

      <span

        className={[

          'text-3xl font-medium tracking-tight tabular-nums leading-tight',

          spec.highlight === 'primary' ? 'text-primary' : 'text-text-primary',

        ].join(' ')}

      >

        {spec.value}

      </span>

      <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-text-secondary">

        <TrendingUp

          size={12}

          aria-hidden

          className={isFeatured ? 'text-primary' : 'text-success'}

        />

        <span>{spec.delta}</span>

      </span>

    </Card>

  );

}



function formatPercent(n: number | undefined): string {

  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';

  const sign = n >= 0 ? '+' : '';

  return `${sign}${n.toFixed(1)}%`;

}



export function HeroMetrics({

  gmv = 0,

  platformFee = 0,

  gmvGrowthPercent,

  feeGrowthPercent,

  activeCampaigns = 0,

  verifiedCreators = 0,

  fromDb = false,

}: HeroMetricsProps = {}) {

  const metrics: MetricSpec[] = [

    {

      label: '총 거래액 (GMV)',

      value: formatCompactKRW(gmv),

      delta: fromDb

        ? `전월 대비 ${formatPercent(gmvGrowthPercent)}`

        : '정산 완료 기준',

      highlight: 'featured',

    },

    {

      label: '플랫폼 수수료 (15%)',

      value: formatCompactKRW(platformFee),

      delta: fromDb ? formatPercent(feeGrowthPercent) : '정산 완료 기준',

      highlight: 'primary',

    },

    {

      label: '활성 캠페인',

      value: activeCampaigns.toLocaleString(),

      delta: fromDb ? '현재 진행중' : '—',

    },

    {

      label: '인증 크리에이터',

      value: verifiedCreators.toLocaleString(),

      delta: fromDb ? '플랫폼 전체' : '—',

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

