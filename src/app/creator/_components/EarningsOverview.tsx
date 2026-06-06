'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui';
import {
  computeEarningsFromActivities,
  fetchMyActivities,
  storeActivitiesToDisplay,
  type DisplayActivity,
  type EarningsStats,
} from '@/lib/api/submissions';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { useAppStore } from '@/lib/store';

function formatMoney(won: number): string {
  if (won >= 100_000_000) return `₩${(won / 100_000_000).toFixed(1)}억`;
  if (won >= 10_000_000) return `₩${(won / 10_000_000).toFixed(1)}M`;
  if (won >= 1_000_000) return `₩${(won / 1_000_000).toFixed(1)}M`;
  if (won >= 1_000) return `₩${Math.round(won / 1_000)}K`;
  return `₩${won.toLocaleString()}`;
}

export function EarningsOverview() {
  const storeActivities = useAppStore((s) => s.activities);
  const [dbActivities, setDbActivities] = useState<DisplayActivity[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMyActivities().then((rows) => {
      if (cancelled) return;
      setDbActivities(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const list: DisplayActivity[] =
    dbActivities && dbActivities.length > 0
      ? dbActivities
      : storeActivitiesToDisplay(storeActivities);
  const stats: EarningsStats = computeEarningsFromActivities(list);

  const totalCampaigns = stats.paidCount + CURRENT_CREATOR.completedCampaigns;

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    variant: 'featured' | 'default';
    valueClass: string;
  }> = [
    {
      label: '이번 달',
      value: formatMoney(stats.thisMonth),
      sub: `${stats.thisMonthPaidCount}건 지급 · ${stats.thisMonthReviewCount}건 검토중`,
      variant: 'featured',
      valueClass: 'text-ube-bright',
    },
    {
      label: '정산 대기',
      value: formatMoney(stats.pending),
      sub: stats.pending > 0 ? '승인 대기 중' : '대기 항목 없음',
      variant: 'default',
      valueClass: 'text-text-primary',
    },
    {
      label: '전체 기간',
      value: formatMoney(stats.allTime),
      sub: `${totalCampaigns}개 캠페인`,
      variant: 'default',
      valueClass: 'text-green-400',
    },
    {
      label: '캠페인당 평균',
      value: formatMoney(stats.avg),
      sub: '지급 건당',
      variant: 'default',
      valueClass: 'text-text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} variant={c.variant} padding="lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">{c.label}</span>
            <span
              className={`text-2xl font-medium tracking-tight tabular-nums leading-tight ${c.valueClass}`}
            >
              {c.value}
            </span>
            <span className="text-xs text-text-secondary">{c.sub}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
