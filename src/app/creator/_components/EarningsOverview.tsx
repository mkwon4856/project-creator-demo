'use client';

import { useEffect, useMemo, useState } from 'react';

import { StatCard } from '@/components/ui';
import {
  computeEarningsFromActivities,
  fetchMyActivities,
  storeActivitiesToDisplay,
  type DisplayActivity,
  type EarningsStats,
} from '@/lib/api/submissions';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { useAppStore } from '@/lib/store';

export function formatEarningsMoney(won: number): string {
  if (won >= 100_000_000) return `₩${(won / 100_000_000).toFixed(1)}억`;
  if (won >= 10_000_000) return `₩${(won / 10_000_000).toFixed(1)}M`;
  if (won >= 1_000_000) return `₩${(won / 1_000_000).toFixed(1)}M`;
  if (won >= 1_000) return `₩${Math.round(won / 1_000)}K`;
  return `₩${won.toLocaleString()}`;
}

export function useEarningsStats() {
  const storeActivities = useAppStore((s) => s.activities);
  const [dbActivities, setDbActivities] = useState<DisplayActivity[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyActivities().then((rows) => {
      if (cancelled) return;
      setDbActivities(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const list: DisplayActivity[] = useMemo(() => {
    if (dbActivities && dbActivities.length > 0) return dbActivities;
    return storeActivitiesToDisplay(storeActivities);
  }, [dbActivities, storeActivities]);

  const stats: EarningsStats = useMemo(
    () => computeEarningsFromActivities(list),
    [list],
  );

  const inProgressCount = useMemo(
    () => list.filter((a) => a.status === 'making').length,
    [list],
  );

  return { stats, list, inProgressCount, loading };
}

export function EarningsOverview() {
  const { stats } = useEarningsStats();
  const totalCampaigns = stats.paidCount + CURRENT_CREATOR.completedCampaigns;

  const cards = [
    {
      label: '이번 달',
      value: formatEarningsMoney(stats.thisMonth),
      sub: `${stats.thisMonthPaidCount}건 지급 · ${stats.thisMonthReviewCount}건 검토중`,
    },
    {
      label: '정산 대기',
      value: formatEarningsMoney(stats.pending),
      sub: stats.pending > 0 ? '승인 대기 중' : '대기 항목 없음',
    },
    {
      label: '전체 기간',
      value: formatEarningsMoney(stats.allTime),
      sub: `${totalCampaigns}개 캠페인`,
    },
    {
      label: '캠페인당 평균',
      value: formatEarningsMoney(stats.avg),
      sub: '지급 건당',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
      ))}
    </div>
  );
}
